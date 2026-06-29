// backend/src/index.ts
console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { healthRouter } from "./routes/health.js";
import { dbCheckRouter } from "./routes/dbCheck.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { favoritesRouter } from "./routes/favorites.js";
import { beachesRouter } from "./routes/beaches.js";
import { swaggerRouter } from "./swagger.js";

const isProd = process.env.NODE_ENV === "production";

/** ── Required env validation at boot ─────────────────────────────────────── */
const requiredEnv = ["JWT_SECRET", "MONGODB_URI"];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  const msg = `Missing required environment variables: ${missingEnv.join(", ")}`;
  if (isProd) throw new Error(msg);
  console.warn(`[WARN] ${msg}`);
}

const app = express();

// Behind exactly one proxy in production (Vercel's edge). This makes req.ip
// the real client IP from X-Forwarded-For, which the rate limiter keys on.
app.set("trust proxy", 1);

/** ── Security headers ────────────────────────────────────────────────────── */
app.use(helmet());

/** ── CORS (allow comma-separated origins via CORS_ORIGIN or ALLOWED_ORIGIN) ── */
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.ALLOWED_ORIGIN ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (isProd && allowedOrigins.length === 0) {
  throw new Error(
    "No CORS origins configured. Set CORS_ORIGIN (or ALLOWED_ORIGIN) in production."
  );
}

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser clients
    // Dev fallback: allow all only outside production. In production,
    // allowedOrigins is guaranteed non-empty by the boot check above.
    if (!isProd && allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/** ── API Documentation (Swagger UI) ───────────────────────────────────────── */
app.use("/api", swaggerRouter);

/** ── Public routers under /api ───────────────────────────────────────────── */
app.use("/api", healthRouter);
// Diagnostics endpoint leaks DB/service state; keep it out of production.
if (!isProd) app.use("/api", dbCheckRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api", beachesRouter);

/** ── Auth ───────────────────────────────────────────────────────────────── */
app.use("/api/auth", authRouter);
app.get("/api/protected/ping", requireAuth, (req, res) => {
  res.json({ ok: true, user: (req as any).user });
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

/** ── Quick direct health ping ────────────────────────────────────────────── */
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

/** ── 404 + error handler (MUST be last) ──────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err);
    const message =
      process.env.NODE_ENV !== "production" && err instanceof Error
        ? err.message
        : undefined;
    res.status(500).json({ error: "InternalServerError", message });
  }
);

export default app;
