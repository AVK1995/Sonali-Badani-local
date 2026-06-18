/**
 * Funnel tracking contract.
 *
 * The fields below ride along the landing URL (e.g. from a Facebook ad), get
 * cached in localStorage on the landing page, and survive the TagMango checkout
 * hop (which strips custom params) so the Welcome page can forward them to the
 * Pabbly webhook. Kept here as the single source of truth so the 23 field names
 * are never duplicated across the capture (landing) and dispatch (welcome) steps.
 */
export const TRACKING_FIELDS = [
  'lead_id',
  'created_at',
  'first_name',
  'last_name',
  'email',
  'phone',
  'city',
  'country_code',
  'fbc',
  'fbp',
  'client_ip_address',
  'client_user_agent',
  'external_id',
  'event_source_url',
  'amount',
  'is_test',
  'purchase_event_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
] as const;

/** localStorage key holding the captured lead data between funnel steps. */
export const FUNNEL_STORAGE_KEY = 'FUNNEL_LEAD_DATA';

/** Shape of the cached lead: every tracking field mapped to its string value. */
export type FunnelLeadData = Record<(typeof TRACKING_FIELDS)[number], string>;

/**
 * Split a single full name into first/last for the payload (first token is the
 * first name, the remainder is the last name). TagMango does not return contact
 * details in its redirect, so the buyer enters their name on the OTO page.
 */
export function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') };
}

/** Read a cookie value by name (browser only; '' on the server or if absent). */
function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Resolve Meta's click/browser identifiers for high Event Match Quality. These
 * are the biggest EMQ levers and are NOT URL params: the Meta Pixel sets them as
 * first-party cookies (`_fbp` always; `_fbc` when the landing URL has `fbclid`).
 * We read those cookies; if `_fbc` is missing but an fbclid is known, we
 * reconstruct it in Meta's documented `fb.1.<ts>.<fbclid>` format. Never
 * fabricates — returns '' when there is genuinely nothing to send.
 */
export function resolveFbIdentifiers(fbclid?: string): { fbc: string; fbp: string } {
  const fbp = readCookie('_fbp');
  let fbc = readCookie('_fbc');
  if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  return { fbc, fbp };
}
