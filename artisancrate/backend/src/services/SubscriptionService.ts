import { EntityManager } from "typeorm";
import { SubscriptionPlanRepository } from "../repositories/SubscriptionPlanRepository";
import { UserAddressRepository } from "../repositories/UserAddressRepository";
import { AppError } from "../core/AppError";
import { AppDataSource } from "../config/data-source";
import {
  UserSubscription,
  PaymentMethodType,
} from "../entities/UserSubscription";
import { Invoice } from "../entities/Invoice";
import { toDateOnly, addDays } from "../libs/dateUtils";

interface CreateSubscriptionInput {
  userId: number;
  subscriptionPlanId: number;
  shippingAddressId: number;
  paymentMethodType: PaymentMethodType;
}

export class SubscriptionService {
  private planRepo: SubscriptionPlanRepository;
  private addressRepo: UserAddressRepository;

  constructor() {
    this.planRepo = new SubscriptionPlanRepository();
    this.addressRepo = new UserAddressRepository();
  }

  private async generateInvoiceNumber(manager: EntityManager): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(100000 + Math.random() + 900000);

    const invoiceNumber = `INV-${datePart}-${randomPart}`;
    return invoiceNumber;
  }

  async createSubscription(input: CreateSubscriptionInput) {
    const { userId, subscriptionPlanId, shippingAddressId, paymentMethodType } =
      input;

    if (paymentMethodType === "credit_card_token") {
      throw new AppError(
        "Metode pembayaran credit_card_token belum didukung di tahap ini",
        400,
        "PAYMENT_METHOD_NOT_SUPPORTED"
      );
    }

    const plan = await this.planRepo.findByid(subscriptionPlanId);
    if (!plan || !plan.isActive) {
      throw new AppError(
        "Paket langganan tidak ditemukan atau tidak aktif",
        400,
        "PLAN_NOT_AVAILABLE"
      );
    }

    const address = await this.addressRepo.findByIdAndUser(
      shippingAddressId,
      userId
    );
    if (!address) {
      throw new AppError(
        "Alamat pengiriman tidak ditemukan",
        400,
        "ADDRESS_NOT_FOUND"
      );
    }

    const now = new Date();
    const nextBillingDate = toDateOnly(now);
    const dueDate = addDays(now, 3);

    return AppDataSource.transaction(async (manager) => {
      const subRepo = manager.getRepository(UserSubscription);
      const invoiceRepo = manager.getRepository(Invoice);

      const subscription = subRepo.create({
        userId,
        subscriptionPlanId: plan.id,
        shippingAddressId: address.id,
        startDate: now,
        nextBillingDate,
        billingPeriod: plan.billingPeriod,
        billingInterval: plan.billingInterval,
        status: "pending_initial_payment",
        paymentMethodType,
        paymentMethodToken: null,
        notes: null,
        cancelledAt: null,
        pausedAt: null,
      });

      await subRepo.save(subscription);

      const invoiceNumber = await this.generateInvoiceNumber(manager);

      const invoice = invoiceRepo.create({
        userSubscriptionId: subscription.id,
        userId,
        invoiceNumber,
        amount: plan.price,
        currency: plan.currency,
        billingPeriodStart: null,
        billingPeriodEnd: null,
        status: "pending",
        dueDate,
        midtransOrderId: null,
        midtransPaymentLink: null,
        paidAt: null,
      });

      await invoiceRepo.save(invoice);

      return { subscription, invoice };
    });
  }
}
