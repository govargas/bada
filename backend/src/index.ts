console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";
import serverless from "serverless-http";

// Routers
import { healthRouter } from "./routes/health.js";

const app = express();

// CORS — allow only your deployed frontend (you can comma-separate multiple origins)
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

// Body parsing
app.use(express.json());

// Mount routes under /api
app.use("/api", healthRouter);

app.get("/api/health-direct", (_req, res) => {
  res.json({ ok: true, via: "direct" });
}); // for quick testing without router

// Simple not-found handler
app.use((_req, res) => {
  res.status(404).json({ error: "NotFound" });
});

// Centralized error handler (Express 5 catches async errors)
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

// Export serverless handler for Vercel
export default serverless(app);
