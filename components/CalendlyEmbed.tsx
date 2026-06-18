'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Calendly inline embed. The widget script is loaded lazily only when the embed
 * scrolls into view, so it never blocks initial page load or hurts Lighthouse.
 * Defaults to Sonali's live scheduler; override with NEXT_PUBLIC_CALENDLY_URL.
 */
const DEFAULT_CALENDLY_URL = 'https://calendly.com/connect-sonalibadani/30-min-meeting';

// Where to send the invitee the moment their booking completes. We drive this
// redirect ourselves (see the calendly.event_scheduled listener below) so the
// invitee lands straight on the Thank You page, skipping Calendly's own
// "You are leaving Calendly" interstitial.
const THANK_YOU_PATH = '/thank-you';

export default function CalendlyEmbed() {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL || DEFAULT_CALENDLY_URL;
  const ref = useRef<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!load || !url) return;
    const existing = document.querySelector<HTMLScriptElement>('script[data-calendly]');
    if (existing) return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.dataset.calendly = 'true';
    document.body.appendChild(script);
  }, [load, url]);

  // Calendly posts a message to the parent window when a booking completes.
  // We catch it and redirect to the Thank You page ourselves, which avoids the
  // Calendly link-safety interstitial that appears with its built-in redirect.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== 'https://calendly.com') return;
      const data = e.data as { event?: string };
      if (data?.event === 'calendly.event_scheduled') {
        window.location.assign(THANK_YOU_PATH);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-navy/[0.12] bg-white shadow-soft"
    >
      {url ? (
        <div
          className="calendly-inline-widget"
          data-url={url}
          style={{ minWidth: '320px', height: '720px' }}
        />
      ) : (
        // Graceful placeholder so the layout reserves the right space before
        // the real scheduling URL is configured.
        <div className="grid h-[520px] place-items-center px-6 text-center">
          <div>
            <p className="font-serif text-xl text-navy">Booking calendar loads here</p>
            <p className="lede mt-3 text-[15px]">
              Set <code className="rounded bg-navy/[0.06] px-1.5 py-0.5 text-navy">NEXT_PUBLIC_CALENDLY_URL</code>{' '}
              to embed Sonali&rsquo;s live Calendly scheduler.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
