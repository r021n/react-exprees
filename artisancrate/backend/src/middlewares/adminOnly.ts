import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/AppError";

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }
  return next();
}
