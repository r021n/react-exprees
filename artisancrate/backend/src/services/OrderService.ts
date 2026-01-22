import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Order, OrderStatus } from "../entities/Order";
import { Invoice } from "../entities/Invoice";
import { OrderRepository } from "../repositories/OrderRepository";
import { AppError } from "../core/AppError";
import { NotificationService } from "./NotificationService";
import { logger } from "../libs/logger";

const notificationService = new NotificationService();

function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  if (current === next) return true;

  if (current === "pending_fulfillment") {
    return next === "being_prepared" || next === "cancelled";
  }
  if (current === "being_prepared") {
    return next === "shipped" || next === "cancelled";
  }
  if (current === "shipped") {
    return next === "delivered";
  }

  if (current === "delivered" || current === "cancelled") {
    return false;
  }

  return false;
}

export class OrderService {
  private orderRepo: OrderRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
  }

  /**
   * Dipanggil ketika invoice sudah 'paid' untuk membuat order pengiriman.
   * Idempotent: jika sudah ada order untuk invoice tersebut, tidak membuat lagi.
   */

  async createOrderIfNotExistsForInvoice(
    invoice: Invoice,
    manager?: EntityManager,
  ): Promise<Order | null> {
    const repo = manager
      ? manager.getRepository(Order)
      : AppDataSource.getRepository(Order);

    const existing = await repo.findOne({ where: { invoiceId: invoice.id } });

    if (existing) return null;

    const subscription = invoice.userSubscription;
    if (!subscription) {
      throw new AppError(
        "Subscription untuk invoice tidak ditemukan",
        400,
        "SUBSCRIPTION_NOT_FOUND",
      );
    }

    const order = repo.create({
      userSubscriptionId: subscription.id,
      invoiceId: invoice.id,
      userId: subscription.userId,
      shippingAddressId: subscription.shippingAddressId,
      status: "pending_fulfillment",
      shippingCourier: null,
      trackingNumber: null,
      shippingDate: null,
      deliveredDate: null,
      notes: null,
    });

    return repo.save(order);
  }

  // ----- User-facing methods -----
  getUserOrders(userId: number) {
    return this.orderRepo.findByUser(userId);
  }

  async getUserOrderById(userId: number, orderId: number) {
    const order = await this.orderRepo.findByIdAndUser(orderId, userId);
    if (!order) {
      throw new AppError("Order tidak ditemukan", 404, "ORDER_NOT_FOUND");
    }
    return order;
  }

  // ----- Admin-facing methods -----
  getAllOrders(status?: OrderStatus) {
    return this.orderRepo.findAllWithFilter(status);
  }

  async updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    shippingCourier?: string,
    trackingNumber?: string,
  ) {
    const order = await this.orderRepo.findByIdWithRelations(orderId);
    if (!order) {
      throw new AppError("Order tidak ditemukan", 404, "ORDER_NOT_FOUND");
    }

    if (!isValidStatusTransition(order.status, newStatus)) {
      throw new AppError(
        `Perubahan status dari ${order.status} ke ${newStatus} tidak diizinkan`,
        400,
        "INVALID_STATUS_TRANSITION",
      );
    }

    if (shippingCourier !== undefined) {
      order.shippingCourier = shippingCourier || null;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber || null;
    }

    const now = new Date();
    if (order.status !== "shipped" && newStatus === "shipped") {
      order.shippingDate = now;
    }
    if (order.status !== "delivered" && newStatus === "delivered") {
      order.deliveredDate = now;
    }

    order.status = newStatus;

    const saved = await this.orderRepo.save(order);
    try {
      await notificationService.sendOrderStatusUpdate(saved);
    } catch (error) {
      logger.warn("Gagal mengirim email notifikasi status order", error);
    }

    return saved;
  }
}
