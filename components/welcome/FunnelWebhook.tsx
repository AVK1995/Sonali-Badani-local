'use client';

import { useEffect, useRef } from 'react';
import { FUNNEL_STORAGE_KEY, type FunnelLeadData, resolveFbIdentifiers } from '@/lib/tracking';
import { buildHashedFields } from '@/lib/meta-capi';

/** Treat an unresolved merge tag (e.g. literal "{{email}}") as empty. */
const cleanParam = (value: string | null) =>
  value && !/^\{\{.*\}\}$/.test(value) ? value : '';

/** Ask our own API route for the caller's IP (the browser can't read it). */
async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch('/api/ip', { cache: 'no-store' });
    if (!res.ok) return '';
    const data = (await res.json()) as { ip?: string };
    return typeof data.ip === 'string' ? data.ip : '';
  } catch {
    return '';
  }
}

const PABBLY_WEBHOOK_URL = process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL;

/**
 * Invisible welcome-page dispatcher. After the TagMango redirect lands on
 * /welcome, it merges the cached lead with: the transaction ids from the
 * redirect, the SHA-256 versions of Meta's hashed parameters, and the
 * event/environment fields captured live here (no landing-URL dependency).
 * Posts one unified payload to the Pabbly webhook, then clears the cache and
 * scrubs the address bar. Renders nothing.
 */
export default function FunnelWebhook() {
  // Guards a second fire across re-renders (and StrictMode's dev double-mount,
  // backed by the synchronous localStorage claim below).
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !PABBLY_WEBHOOK_URL) return;

    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return;

    // Claim the cache synchronously so no concurrent mount can fire twice;
    // restored below only if the POST does not succeed.
    hasFired.current = true;
    localStorage.removeItem(FUNNEL_STORAGE_KEY);

    let lead: Partial<FunnelLeadData>;
    try {
      lead = JSON.parse(raw) as Partial<FunnelLeadData>;
    } catch {
      return; // corrupt cache already dropped; nothing to send
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = cleanParam(params.get('order_id'));
    const paymentId = cleanParam(params.get('razorpay_payment_id'));
    // Clean URL (no query) used for event_source_url and for the address-bar scrub.
    const cleanUrl = window.location.origin + window.location.pathname;

    const restoreForRetry = () => {
      hasFired.current = false;
      localStorage.setItem(FUNNEL_STORAGE_KEY, raw);
    };

    (async () => {
      try {
        // Hashed Meta fields + the client IP (server-read), in parallel.
        const [hashed, clientIp] = await Promise.all([
          buildHashedFields(lead as Record<string, string>),
          fetchClientIp(),
        ]);

        // Event/environment fields from real live sources (never the ad URL).
        const event = {
          created_at: lead.created_at || new Date().toISOString(),
          client_user_agent: navigator.userAgent,
          event_source_url: cleanUrl,
          client_ip_address: clientIp,
          purchase_event_id: paymentId, // razorpay payment id = CAPI dedup key
        };

        // Meta click/browser ids from the real first-party cookies (the high-EMQ
        // signals). These overwrite the landing-URL values, which are usually
        // empty because _fbc/_fbp are cookies, not query params.
        const { fbc, fbp } = resolveFbIdentifiers(lead.fbclid);

        const payload = {
          ...lead,
          ...event,
          ...hashed,
          fbc: fbc || lead.fbc || '',
          fbp: fbp || lead.fbp || '',
          order_id: orderId,
          razorpay_payment_id: paymentId,
        };

        const res = await fetch(PABBLY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });

        if (res.ok) {
          // Drop razorpay_signature and the rest of the query from the address bar.
          window.history.replaceState({}, '', cleanUrl);
        } else {
          restoreForRetry();
        }
      } catch {
        restoreForRetry();
      }
    })();
  }, []);

  return null;
}
