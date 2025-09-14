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

// --- Global middleware ---
const allowed = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true, // during local dev if empty, allow all
    credentials: true,
  })
);

app.use(express.json());

// --- Public routes (mounted under /api) ---
app.use("/api", healthRouter);
app.use("/api", dbCheckRouter);
app.use("/api", favoritesRouter);
app.use("/api", beachesRouter);

// 🔐 Auth routes (public endpoints: /register, /login)
app.use("/api/auth", authRouter);

// 🔒 Example protected endpoints (require a Bearer token)
app.get("/api/protected/ping", requireAuth, (req, res) => {
  res.json({ ok: true, user: (req as any).user });
});

// To protect /api/auth/me this can also be used
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

// Temporary direct test
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

// --- 404 + error handlers ---
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err);
    res.status(500).json({ error: "InternalServerError" });
  }
);

export default app;
