import type { Response, CookieOptions } from "express";

// Single source of truth for the auth session cookie. The cookie holds the
// signed JWT; it is HttpOnly so JS (and therefore any XSS) can't read it.
//
// Topology A: the browser reaches the backend through the Netlify /api/* proxy,
// so this is a first-party cookie on the app origin. No `domain` is set, which
// keeps it host-only. SameSite=Lax blocks it on cross-site POSTs (CSRF defense)
// while still allowing normal top-level navigations.
export const SESSION_COOKIE = "bada_session";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // matches the JWT's 7d expiry

function baseOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // Secure in prod; relaxed so http://localhost dev works
    sameSite: "lax",
    path: "/",
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, { ...baseOptions(), maxAge: SEVEN_DAYS_MS });
}

export function clearSessionCookie(res: Response): void {
  // Must mirror the path/sameSite/secure used when setting, or the browser
  // won't match and clear it.
  res.clearCookie(SESSION_COOKIE, baseOptions());
}
