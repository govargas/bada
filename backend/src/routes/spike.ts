// ⚠️ TEMPORARY — cookie-topology spike (production-readiness handoff item #2).
// Validates that a host-only HttpOnly cookie set by the backend is stored by
// the browser as first-party to badaweb.netlify.app when the request goes
// through the Netlify /api/* proxy, and reports the proxy/IP chain so we can
// gauge the rate-limiter impact of the extra Netlify hop.
//
// Leaks nothing sensitive (only the caller's own cookie + forwarding headers).
// DELETE this router, its mount in index.ts, and the /api/* rule in
// frontend/public/_redirects once the spike is decided.
import { Router } from "express";

export const spikeRouter = Router();

// Set a host-only (no Domain), HttpOnly, Secure, SameSite=Lax cookie — exactly
// the attributes a real session cookie would use under topology A.
spikeRouter.get("/cookie-set", (req, res) => {
  res.cookie("bada_spike", "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60 * 1000, // 10 minutes
    // no `domain` → host-only, scoped to whichever host served the response
  });
  res.json({
    set: true,
    hostSeenByBackend: req.headers.host,
    note: "Cookie has no Domain attribute (host-only).",
  });
});

// Report whether the spike cookie came back plus the proxy/IP chain. Read the
// raw Cookie header directly so the spike needs no cookie-parser dependency.
spikeRouter.get("/whoami", (req, res) => {
  const rawCookie = req.headers.cookie || "";
  res.json({
    spikeCookiePresent: /(?:^|;\s*)bada_spike=/.test(rawCookie),
    cookieHeader: rawCookie,
    reqIp: req.ip,
    reqIps: req.ips,
    xForwardedFor: req.headers["x-forwarded-for"] ?? null,
    xVercelForwardedFor: req.headers["x-vercel-forwarded-for"] ?? null,
    host: req.headers.host,
    origin: req.headers.origin ?? null,
  });
});
