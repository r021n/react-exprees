import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/OrderService";
import { AppError } from "../core/AppError";
import type { OrderStatus } from "../entities/Order";

const orderService = new OrderService();

export class AdminOrderController {
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const statusParam = req.query.status as string | undefined;
      const status = statusParam as OrderStatus | undefined;

      const orders = await orderService.getAllOrders(status);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new AppError("ID order tidak valid", 400, "INVALID_ID");
      }

      const { status, shippingCourier, trackingNumber } = req.body;

      const updated = await orderService.updateOrderStatus(
        id,
        status,
        shippingCourier,
        trackingNumber
      );

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}
