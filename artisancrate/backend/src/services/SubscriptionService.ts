import { SubscriptionPlanRepository } from "../repositories/SubscriptionPlanRepository";
import { UserAddressRepository } from "../repositories/UserAddressRepository";
import { UserSubscriptionRepository } from "../repositories/UserSubscriptionRepository";
import { AppError } from "../core/AppError";
import { AppDataSource } from "../config/data-source";
import {
  UserSubscription,
  PaymentMethodType,
  UserSubscriptionStatus,
} from "../entities/UserSubscription";
import { Invoice } from "../entities/Invoice";
import { toDateOnly, addDays } from "../libs/dateUtils";
import { generateInvoiceNumber } from "../libs/invoiceUtils";

interface CreateSubscriptionInput {
  userId: number;
  subscriptionPlanId: number;
  shippingAddressId: number;
  paymentMethodType: PaymentMethodType;
}

export class SubscriptionService {
  private planRepo: SubscriptionPlanRepository;
  private addressRepo: UserAddressRepository;
  private subRepo: UserSubscriptionRepository;

  constructor() {
    this.planRepo = new SubscriptionPlanRepository();
    this.addressRepo = new UserAddressRepository();
    this.subRepo = new UserSubscriptionRepository();
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

    const plan = await this.planRepo.findById(subscriptionPlanId);
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

      const invoiceNumber = await generateInvoiceNumber(manager);

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

  getUserSubscriptions(userId: number) {
    return this.subRepo.findByUser(userId);
  }

  async getUserSubscriptionDetail(userId: number, subId: number) {
    const sub = await this.subRepo.findByIdAndUser(subId, userId);
    if (!sub) {
      throw new AppError(
        "Subscriptiontidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    return sub;
  }

  private ensureCancellable(status: UserSubscriptionStatus) {
    if (status === "cancelled" || status === "expired") {
      throw new AppError(
        "Subscription sudah tidak aktif",
        400,
        "SUBSCRIPTION_ALREADY_TERMINATED"
      );
    }
  }

  async cancelSubscription(userId: number, subId: number) {
    const sub = await this.subRepo.findByIdAndUser(subId, userId);
    if (!sub) {
      throw new AppError(
        "Subscription tidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    this.ensureCancellable(sub.status);

    sub.status = "cancelled";
    sub.cancelledAt = new Date();

    return this.subRepo.save(sub);
  }

  async pauseSubscription(userId: number, subId: number) {
    const sub = await this.subRepo.findByIdAndUser(subId, userId);
    if (!sub) {
      throw new AppError(
        "Subscription tidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    if (sub.status !== "active") {
      throw new AppError(
        "Hanya subscription aktif yang bisa dipause",
        400,
        "INVALID_STATUS"
      );
    }

    sub.status = "paused";
    sub.pausedAt = new Date();

    return this.subRepo.save(sub);
  }

  async resumeSubscription(userId: number, subId: number) {
    const sub = await this.subRepo.findByIdAndUser(subId, userId);
    if (!sub) {
      throw new AppError(
        "Subscription tidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    if (sub.status !== "paused") {
      throw new AppError(
        "Hanya subscription dengan status pause yang bisa diresume",
        400,
        "INVALID_STATUS"
      );
    }

    sub.status = "active";
    sub.pausedAt = null;
    sub.nextBillingDate = toDateOnly(new Date());

    return this.subRepo.save(sub);
  }

  // -------- Admin-facing methods --------

  getAllSubscriptions(status?: UserSubscriptionStatus) {
    return this.subRepo.findAllWithFilter(status);
  }

  async getSubscriptionDetailAdmin(id: number) {
    const sub = await this.subRepo.findByIdWithRelations(id);
    if (!sub) {
      throw new AppError(
        "Subscription tidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    return sub;
  }

  async updateSubscriptionStatusAdmin(
    id: number,
    status: UserSubscriptionStatus
  ) {
    const sub = await this.subRepo.findById(id);
    if (!sub) {
      throw new AppError(
        "Subscription tidak ditemukan",
        404,
        "SUBSCRIPTION_NOT_FOUND"
      );
    }

    sub.status = status;

    const now = new Date();
    if (status === "cancelled") sub.cancelledAt = now;
    if (status === "paused") sub.pausedAt = now;
    if (status === "active") sub.pausedAt = null;

    return this.subRepo.save(sub);
  }
}
