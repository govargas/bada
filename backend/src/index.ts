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

/** ── TEMP: dump routes after mounting, to spot any '*' entries ─────────────────── */
function dumpRoutes(label: string) {
  try {
    // @ts-ignore internal structure
    const stack = app._router?.stack || [];
    console.log(`[routes dump] ${label}`);
    for (const layer of stack) {
      // layers with .route have concrete methods/paths
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .filter(Boolean)
          .join(",");
        console.log("  →", methods, layer.route.path);
      } else if (layer.name === "router" && layer.handle?.stack) {
        // mounted routers
        for (const s of layer.handle.stack) {
          if (s.route) {
            const methods = Object.keys(s.route.methods)
              .filter(Boolean)
              .join(",");
            console.log("  ↳", methods, s.route.path);
          }
        }
      }
    }
  } catch (e) {
    console.log("[routes dump] failed:", e);
  }
}
/** ──────────────────────────────────────────────────────────────────────────────── */

// --- CORS setup ---
// Prefer CORS_ORIGIN; fallback to ALLOWED_ORIGIN.
// Example env: CORS_ORIGIN="http://localhost:5173,https://your-site.netlify.app"
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.ALLOWED_ORIGIN ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin header (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      // no origins configured → dev mode → allow all
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));

// --- Global middleware ---
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

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

// Temporary direct test
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

dumpRoutes("after mount");

// 404
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));

// Error handler
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
