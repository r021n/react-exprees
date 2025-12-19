import cron from "node-cron";
import { runGenerateRecurringInvoicesJob } from "./recurringBillingJob";
import { logger } from "../libs/logger";
import { env } from "../config/env";

export function scheduleRecurringJobs() {
  if (env.nodeEnv === "test") return;

  cron.schedule("0 1 * * *", async () => {
    logger.info("[Cron] menjalankan GenerateRecurringInvoicesJob");
    try {
      await runGenerateRecurringInvoicesJob();
      logger.info("[Cron] GenerateRecurringInvoicesJob selesai");
    } catch (error) {
      logger.error("[Cron] error di GenerateRecurringInvoicesJob", error);
    }
  });

  logger.info(
    "[Cron] Recurring billing job dijadwalkan (setiap hari jam 01.00)"
  );
}
