// backend/src/index.ts
console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";

import { healthRouter } from "./routes/health.js";
import { dbCheckRouter } from "./routes/dbCheck.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { favoritesRouter } from "./routes/favorites.js";
import { beachesRouter } from "./routes/beaches.js";

const app = express();

/** ── CORS (allow comma-separated origins via CORS_ORIGIN or ALLOWED_ORIGIN) ── */
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.ALLOWED_ORIGIN ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser clients
    if (allowedOrigins.length === 0) return cb(null, true); // dev fallback
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(express.json());

/** ── TEMP DIAG: env presence (put this BEFORE the 404) ───────────────────── */
app.get("/api/debug/env", (_req, res) => {
  res.json({
    HAV_BASE_URL: !!process.env.HAV_BASE_URL,
    HAV_USER_AGENT: !!process.env.HAV_USER_AGENT,
    HAV_V2_BASE: !!process.env.HAV_V2_BASE,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? "",
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "",
    MONGODB_URI_present: !!process.env.MONGODB_URI,
    JWT_SECRET_present: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV ?? "undefined",
    PORT: process.env.PORT ?? "undefined",
  });
});

/** ── Public routers under /api ───────────────────────────────────────────── */
app.use("/api", healthRouter);
app.use("/api", dbCheckRouter);
app.use("/api", favoritesRouter);
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
