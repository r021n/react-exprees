import express, { Application } from "express";
import cors from "cors";
import router from "./routes";
import dotenv from "dotenv";

dotenv.config();

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", router);

  app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  return app;
}
