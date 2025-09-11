import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authRouter = Router();

authRouter.get("/ping", (_req, res) => res.json({ ok: true, from: "auth" }));

const zCreds = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
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
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
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
    { expiresIn: "7d" }
  );
  return res.json({ token });
});

// GET /api/auth/me (protected example)
authRouter.get("/me", async (req, res) => {
  // This endpoint is public by default; we'll mount it behind requireAuth in index.ts
  res.json({
    message: "You reached /api/auth/me but auth middleware decides access.",
  });
});
