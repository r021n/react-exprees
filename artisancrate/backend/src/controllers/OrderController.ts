import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/OrderService";
import { AppError } from "../core/AppError";

const orderService = new OrderService();

export class OrderController {
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const orders = await orderService.getUserOrders(req.user.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrderDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new AppError("ID order tidak valid", 400, "INVALID_ID");
      }

      const order = await orderService.getUserOrderById(req.user.id, id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
