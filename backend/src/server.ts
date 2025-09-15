import "dotenv/config";
import app from "./index.js";

const port = Number(process.env.PORT) || 3000;

// 🔎 TEMP: log each request so we see what's being hit
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.url}`);
  next();
});

// 🔎 TEMP: quick env presence check (no secrets exposed)
app.get("/api/debug/env", (_req, res) => {
  res.json({
    HAV_BASE_URL: !!process.env.HAV_BASE_URL,
    HAV_USER_AGENT: !!process.env.HAV_USER_AGENT,
    HAV_V2_BASE: !!process.env.HAV_V2_BASE,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? "",
    MONGODB_URI_present: !!process.env.MONGODB_URI,
    JWT_SECRET_present: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV ?? "undefined",
    PORT: process.env.PORT ?? "undefined",
  });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
