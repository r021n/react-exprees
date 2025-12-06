import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/AppError";
import { logger } from "../libs/logger";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Error) {
    appError = new AppError(err.message, 500);
  } else {
    appError = new AppError("Internal Server Error", 500);
  }

  logger.error(appError.message, {
    path: req.path,
    method: req.method,
    statusCode: appError.statusCode,
  });

  if (env.nodeEnv !== "production" && appError.stack) {
    logger.debug(appError.stack);
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    errorCode: appError.errorCode,
  });
}
