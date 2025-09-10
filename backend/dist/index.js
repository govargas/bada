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
app.use(cors({
    origin: allowed.length ? allowed : true, // during local dev if empty, allow all
    credentials: true,
}));
// Body parsing
app.use(express.json());
// Mount routes under /api
app.use("/api", healthRouter);
// Simple not-found handler
app.use((_req, res) => {
    res.status(404).json({ error: "NotFound" });
});
// Centralized error handler (Express 5 catches async errors)
app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err);
    res.status(500).json({ error: "InternalServerError" });
});
// Export serverless handler for Vercel
export default serverless(app);
//# sourceMappingURL=index.js.map