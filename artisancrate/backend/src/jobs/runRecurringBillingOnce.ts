import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { logger } from "../libs/logger";
import { runGenerateRecurringInvoicesJob } from "./recurringBillingJob";

async function main() {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected (CLI job)");

    await runGenerateRecurringInvoicesJob();

    await AppDataSource.destroy();
    logger.info("Job selesai, DB connection ditutup");
    process.exit(0);
  } catch (error) {
    logger.error("Error menjalankan job", error);
    process.exit(1);
  }
}

main();
