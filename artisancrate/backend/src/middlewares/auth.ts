import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../core/AppError";
import { AuthUserPayload } from "../core/types";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
  }

  try {
    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as unknown as AuthUserPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
  }
}
