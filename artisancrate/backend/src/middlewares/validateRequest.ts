import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/AppError";

export function validateRequest(schema: ZodObject<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(", ");
        return next(new AppError(message, 400, "VALIDATION_ERROR"));
      }
      return next(error);
    }
  };
}
