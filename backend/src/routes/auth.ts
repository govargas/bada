import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { connectDB } from "../lib/db.js";

export const authRouter = Router();

// Throttle credential endpoints to slow brute-force and signup abuse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManyRequests" },
});

authRouter.get("/ping", (_req, res) => res.json({ ok: true, from: "auth" }));

const zCreds = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/auth/register
authRouter.post("/register", authLimiter, async (req, res) => {
  try {
    await connectDB();

    const parsed = zCreds.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "InvalidBody", details: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "EmailInUse" });

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("REGISTER_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

// POST /api/auth/login
authRouter.post("/login", authLimiter, async (req, res) => {
  try {
    await connectDB();

    const parsed = zCreds.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "InvalidBody", details: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "InvalidCredentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "InvalidCredentials" });

    const token = jwt.sign(
      { sub: String(user._id), email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d", algorithm: "HS256" }
    );
    return res.json({ token });
  } catch (err) {
    console.error("LOGIN_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});
