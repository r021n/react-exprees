import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/PaymentService";
import { MidtransNotificationBody } from "../types/midtrans";

const paymentService = new PaymentService();

export class PaymentController {
  static async midtransWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as MidtransNotificationBody;

      await paymentService.handleMidtransNotification(body);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
