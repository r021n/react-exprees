import axios from "axios";
import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/Invoice";
import { Order } from "../entities/Order";
import { UserSubscription } from "../entities/UserSubscription";
import { AppError } from "../core/AppError";
import {
  getMidtransAuthHeader,
  getMidtransBaseUrl,
  computeMidtransSignature,
} from "../libs/midtrans";
import { MidtransNotificationBody } from "../types/midtrans";
import { addMonths, addWeeks, toDateOnly } from "../libs/dateUtils";
import { logger } from "../libs/logger";
import { OrderService } from "./OrderService";

const orderService = new OrderService();

export class PaymentService {
  /**
   * Membuat transaksi Midtrans Snap untuk sebuah invoice.
   * Menyimpan midtransOrderId & midtransPaymentLink di tabel invoices.
   */
  async createSnapTransactionForInvoice(invoiceId: number): Promise<Invoice> {
    const invoiceRepo = AppDataSource.getRepository(Invoice);

    const invoice = await invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: {
        user: true,
        userSubscription: { subscriptionPlan: true, shippingAddress: true },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice tidak ditemukan", 404, "INVOICE_NOT_FOUND");
    }

    if (invoice.status === "paid") {
      throw new AppError("Invoice sudah dibayar", 400, "INVOICE_ALREADY_PAID");
    }

    if (invoice.status === "cancelled") {
      throw new AppError("Invoice sudah dibatalkan", 400, "INVOICE_CANCELLED");
    }

    const subscription = invoice.userSubscription;
    const plan = subscription.subscriptionPlan;
    const user = invoice.user;
    const address = subscription.shippingAddress;

    if (!plan) {
      throw new AppError(
        "Paket langganan untuk invoice ini tidak ditemukan",
        400,
        "PLAN_NOT_FOUND"
      );
    }

    if (!user) {
      throw new AppError(
        "User untuk invoice ini tidak ditemukan",
        400,
        "USER_NOT_FOUND"
      );
    }

    const orderId = invoice.invoiceNumber;

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: invoice.amount },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || address.phone || undefined,
      },
      item_details: [
        {
          id: `PLAN-${plan.id}`,
          price: plan.price,
          quantity: 1,
          name: plan.name.slice(0, 50),
        },
      ],
    };

    const baseUrl = getMidtransBaseUrl();
    const authHeader = getMidtransAuthHeader();

    try {
      const res = await axios.post(`${baseUrl}/snap/v1/transactions`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
      });

      const { redirect_url } = res.data as {
        token: string;
        redirect_url: string;
      };

      invoice.midtransOrderId = orderId;
      invoice.midtransPaymentLink = redirect_url;

      return await invoiceRepo.save(invoice);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          "Error createMidtransTransaction",
          error?.response?.data || error
        );
      } else {
        logger.error("Error createMidtransTransaction", error);
      }

      throw new AppError(
        "Gagal membuat transaksi pembayaran",
        500,
        "MIDTRANS_ERROR"
      );
    }
  }

  /**
   * Proses notifikasi webhook dari Midtrans.
   * Idempotent: kalau invoice sudah paid & order sudah ada, tidak bikin dobel.
   */
  async handleMidtransNotification(
    body: MidtransNotificationBody
  ): Promise<void> {
    const expectedSignature = computeMidtransSignature(
      body.order_id,
      body.status_code,
      body.gross_amount
    );

    if (expectedSignature !== body.signature_key) {
      logger.warn("Invalid midtrans signature", { orderId: body.order_id });
      throw new AppError(
        "Invalid Midtrans signature",
        403,
        "INVALID_SIGNATURE"
      );
    }

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    await AppDataSource.transaction(async (manager) => {
      const invoiceRepo = manager.getRepository(Invoice);
      const subscriptionRepo = manager.getRepository(UserSubscription);
      const orderRepo = manager.getRepository(Order);

      const invoice = await invoiceRepo.findOne({
        where: { invoiceNumber: orderId },
        relations: {
          userSubscription: { subscriptionPlan: true },
        },
      });

      if (!invoice) {
        logger.warn("Invoice not found for midtrans order", { orderId });
        return;
      }

      const subscription = invoice.userSubscription;

      let newStatus = invoice.status;

      if (
        transactionStatus === "capture" ||
        transactionStatus === "settlement"
      ) {
        if (fraudStatus && fraudStatus !== "accept") {
          newStatus = "pending";
        } else {
          newStatus = "paid";
        }
      } else if (transactionStatus === "deny") {
        newStatus = "failed";
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "expire"
      ) {
        newStatus = "expired";
      } else if (transactionStatus === "pending") {
        newStatus = "pending";
      }

      const wasPaid = invoice.status === "paid";
      const nowPaid = newStatus === "paid";

      invoice.status = newStatus;

      if (nowPaid && !wasPaid) {
        invoice.paidAt = new Date();

        if (subscription) {
          if (subscription.status === "pending_initial_payment") {
            subscription.status = "active";
          }

          const now = new Date();
          const interval = subscription.billingInterval || 1;
          let nextDate = now;

          if (subscription.billingPeriod === "monthly") {
            nextDate = addMonths(now, interval);
          } else if (subscription.billingPeriod === "weekly") {
            nextDate = addWeeks(now, interval);
          }

          subscription.nextBillingDate = toDateOnly(nextDate);

          await subscriptionRepo.save(subscription);
        }

        await orderService.createOrderIfNotExistsForInvoice(invoice, manager);
      }

      await invoiceRepo.save(invoice);
    });

    logger.info("Processed Midtrans notification", {
      orderId,
      transactionStatus,
    });
  }
}
