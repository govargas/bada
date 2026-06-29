import type { Request, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Resolve the real client IP to throttle on. Under topology A the browser
// reaches us through the Netlify /api/* proxy, so req.ip / X-Forwarded-For
// collapse to Netlify's egress IP — keying on that would throttle ALL users
// as one. Netlify forwards the true client IP in x-nf-client-connection-ip, so
// prefer it, falling back to req.ip for any direct-to-backend requests.
//
// Caveat: a request sent directly to the backend (bypassing Netlify) could
// forge this header to spread its rate-limit identity. Follow-up: verify the
// signed `x-nf-netlify-proxy` header, or restrict the backend to proxy traffic.
function clientKey(req: Request): string {
  const nf = req.headers["x-nf-client-connection-ip"];
  const fromNetlify = Array.isArray(nf) ? nf[0] : nf;
  return fromNetlify || req.ip || req.socket.remoteAddress || "unknown";
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
