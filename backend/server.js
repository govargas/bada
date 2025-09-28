import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// --- DB connection ---
const mongoUrl =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://localhost/final-project";

mongoose.set("strictQuery", true);
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// --- CORS setup ---
// Example: CORS_ORIGIN="http://localhost:5173,https://netlifylink.app
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);

    // If no env configured, fall back to permissive (useful in early dev)
    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

// Apply CORS + JSON
const app = express();
app.use(cors(corsOptions));
// For preflight requests across all routes
app.options("*", cors(corsOptions));
app.use(express.json());

// --- Routes ---
app.get("/", (_req, res) => {
  res.send("Hello Technigo!");
});

// --- Server ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  if (allowedOrigins.length) {
    console.log("CORS allowed origins:", allowedOrigins);
  } else {
    console.log("CORS: no CORS_ORIGIN set -> permissive (dev mode).");
  }
});
