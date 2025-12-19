import "reflect-metadata";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";
import { AppDataSource } from "./config/data-source";
import { scheduleRecurringJobs } from "./jobs/scheduler";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info("Database Connected");

    scheduleRecurringJobs();

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`Backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error("Error during data source initialization", error);
    process.exit(1);
  }
}

bootstrap();
