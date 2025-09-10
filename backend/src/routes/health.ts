import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  console.log("Hit /api/health");
  res.json({
    ok: true,
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
