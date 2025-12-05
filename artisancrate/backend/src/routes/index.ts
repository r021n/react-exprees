import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "artisancrate-backend",
    timestamp: new Date().toISOString(),
  });
});

export default router;
