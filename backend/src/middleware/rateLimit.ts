import type { Request, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import jwt from "jsonwebtoken";

function header(req: Request, name: string): string | undefined {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
}

// Did this request genuinely come through our Netlify proxy? When PROXY_SIGNING_KEY
// is set, Netlify signs every proxied request with it (JWS in the `x-nf-sign`
// header, HS256, iss "netlify") — see netlify.toml's `signed`. A direct caller
// hitting the Vercel backend can't produce a valid signature, so this is how we
// tell trustworthy proxied traffic from spoofable direct traffic.
function isSignedByNetlify(req: Request): boolean {
  const secret = process.env.PROXY_SIGNING_KEY;
  if (!secret) return false;
  const token = header(req, "x-nf-sign");
  if (!token) return false;
  try {
    jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "netlify" });
    return true;
  } catch {
    return false;
  }
}

// Resolve the real client IP to throttle on. Under topology A the browser
// reaches us through the Netlify /api/* proxy, so req.ip / X-Forwarded-For
// collapse to Netlify's egress IP — keying on that would throttle ALL users as
// one. Netlify forwards the true client IP in x-nf-client-connection-ip.
//
// Hardened mode (PROXY_SIGNING_KEY set): trust that forwarded IP only when the
// request carries a valid Netlify signature; otherwise fall back to req.ip (the
// connecting IP, which can't be spoofed) so a direct caller can't forge a
// per-request identity to evade throttling.
//
// Transitional mode (key unset): best-effort — trust the forwarded IP so real
// proxied users aren't lumped under Netlify's egress IP. Forgeable; set
// PROXY_SIGNING_KEY in Netlify + the backend to harden.
export function clientKey(req: Request): string {
  const fallback = req.ip || req.socket.remoteAddress || "unknown";
  const fwd = header(req, "x-nf-client-connection-ip");
  if (!fwd) return fallback;

  if (process.env.PROXY_SIGNING_KEY) {
    return isSignedByNetlify(req) ? fwd : fallback;
  }
  return fwd; // transitional best-effort
}

// Throttle credential endpoints to slow brute-force and signup abuse:
// at most LIMIT attempts per WINDOW from a single client.
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW = "15 m";

// In-memory limiter — used for local dev and tests. It works on a single
// long-running process but NOT across serverless instances, which is why
// production uses the shared Upstash store below.
const memoryLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMIT,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManyRequests" },
  keyGenerator: (req) => clientKey(req),
  // Don't throttle the automated test suite (many auth calls from one IP).
  skip: () => process.env.NODE_ENV === "test",
});

function buildAuthRateLimiter(): RequestHandler {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // No shared store configured → fall back to the in-memory limiter.
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[WARN] UPSTASH_REDIS_REST_URL/TOKEN not set — auth rate limiting is " +
          "in-memory only and not enforced across serverless instances."
      );
    }
    return memoryLimiter;
  }

  // Shared store: the request count lives in Upstash Redis, so it stays
  // consistent no matter which short-lived serverless instance handles a
  // given request.
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
    prefix: "bada-auth",
  });

  return async (req, res, next) => {
    const key = clientKey(req);
    try {
      const { success } = await ratelimit.limit(key);
      if (!success) {
        return res.status(429).json({ error: "TooManyRequests" });
      }
      return next();
    } catch (err) {
      // If the store is unreachable, fail open so a Redis hiccup can't lock
      // every user out of login. Protection is briefly degraded, not the app.
      console.error("RATE_LIMIT_ERR", err);
      return next();
    }
  };
}

export const authRateLimiter: RequestHandler = buildAuthRateLimiter();
