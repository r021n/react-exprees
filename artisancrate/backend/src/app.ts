import express, { Application } from "express";
import cors from "cors";
import apiRouter from "./routes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./core/AppError";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(requestLogger);

  app.use("/api", apiRouter);

  app.use((req, res, next) => {
    next(new AppError("Not Found", 404, "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}
