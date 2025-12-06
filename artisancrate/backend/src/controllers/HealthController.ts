import { timeStamp } from "console";
import { Request, Response, NextFunction } from "express";

export class HealthController {
  static check(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        status: "ok",
        service: "artisancrate-backend",
        timeStamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
