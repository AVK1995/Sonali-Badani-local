import { type NextRequest, NextResponse } from 'next/server';

/**
 * Returns the caller's IP address, read from the proxy headers the host sets
 * (Vercel populates `x-forwarded-for`). The browser cannot read its own public
 * IP, so the Welcome page calls this to fill `client_ip_address` for Meta CAPI.
 * Forced dynamic + no-store so it never serves a cached/edge-shared value.
 */
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    (forwarded ? forwarded.split(',')[0].trim() : '') ||
    request.headers.get('x-real-ip') ||
    '';
  return NextResponse.json({ ip }, { headers: { 'Cache-Control': 'no-store' } });
}
