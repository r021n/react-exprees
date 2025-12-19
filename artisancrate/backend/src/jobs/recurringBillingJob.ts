import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { UserSubscription } from "../entities/UserSubscription";
import { Invoice } from "../entities/Invoice";
import { addDays, addWeeks, addMonths, toDateOnly } from "../libs/dateUtils";
import { generateInvoiceNumber } from "../libs/invoiceUtils";
import { PaymentService } from "../services/PaymentService";
import { logger } from "../libs/logger";

const paymentService = new PaymentService();

export async function runGenerateRecurringInvoicesJob(): Promise<void> {
  const subRepo = AppDataSource.getRepository(UserSubscription);
  const invoiceRepo = AppDataSource.getRepository(Invoice);

  const todayStr = toDateOnly(new Date());

  const activeSubs = await subRepo.find({
    where: { status: "active", nextBillingDate: LessThanOrEqual(todayStr) },
    relations: { subscriptionPlan: true },
  });

  if (activeSubs.length === 0) {
    logger.info(
      "[RecurringInvoices] Tidak ada subscription yang jatuh tempo hari ini"
    );
    return;
  }

  logger.info(
    `[RecurringInvoices] Memproses ${activeSubs.length} subscription yang jatuh tempo`
  );

  for (const sub of activeSubs) {
    try {
      if (!sub.subscriptionPlan) {
        logger.warn("[RecurringInvoices] Subscription tanpa plan, dilewati", {
          subId: sub.id,
        });
        continue;
      }

      const periodStart = sub.nextBillingDate;
      if (!periodStart) {
        logger.warn(
          "[RecurringInvoices] Subscription tanpa nextBillingDate, dilewati",
          { subId: sub.id }
        );
        continue;
      }

      const existing = await invoiceRepo.findOne({
        where: { userSubscriptionId: sub.id, billingPeriodStart: periodStart },
      });

      if (existing) {
        logger.info(
          "[RecurringInvoices] Invoice untuk periode ini sudah ada, skip",
          { subId: sub.id, invoiceId: existing.id }
        );
        continue;
      }

      const startDateObj = new Date(periodStart);
      const interval = sub.billingInterval || 1;

      let endDateObj: Date;
      if (sub.billingPeriod === "monthly") {
        const temp = addMonths(startDateObj, interval);
        endDateObj = addDays(temp, -1);
      } else {
        const temp = addWeeks(startDateObj, interval);
        endDateObj = addDays(temp, -1);
      }

      const billingPeriodEnd = toDateOnly(endDateObj);

      const invoiceNumber = await generateInvoiceNumber(AppDataSource.manager);

      const newInvoice = invoiceRepo.create({
        userSubscriptionId: sub.id,
        userId: sub.userId,
        invoiceNumber,
        amount: sub.subscriptionPlan.price,
        currency: sub.subscriptionPlan.currency,
        billingPeriodStart: periodStart,
        billingPeriodEnd,
        status: "pending",
        dueDate: addDays(new Date(), 3),
        midtransOrderId: null,
        midtransPaymentLink: null,
        paidAt: null,
      });

      const savedInvoice = await invoiceRepo.save(newInvoice);
      logger.info("[RecurringInvoices] Invoice baru dibuat", {
        invoiceId: savedInvoice.id,
        subscriptionId: sub.id,
      });

      await paymentService.createSnapTransactionForInvoice(savedInvoice.id);
      logger.info("[RecurringInvoices] Snap transaction dibuat", {
        invoiceId: savedInvoice.id,
      });
    } catch (error) {
      logger.error("[RecurringInvoices] Error memproses subscription", {
        subId: sub.id,
        error,
      });
    }
  }
}
