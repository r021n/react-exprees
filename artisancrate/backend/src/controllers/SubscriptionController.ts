import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services/SubscriptionService";
import { PaymentService } from "../services/PaymentService";
import { AppError } from "../core/AppError";

const subscriptionService = new SubscriptionService();
const paymentService = new PaymentService();

export class SubscriptionController {
  static async createSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const { subscription_plan_id, shipping_address_id, payment_method_type } =
        req.body;
      const { subscription, invoice } =
        await subscriptionService.createSubscription({
          userId: req.user.id,
          subscriptionPlanId: subscription_plan_id,
          shippingAddressId: shipping_address_id,
          paymentMethodType: payment_method_type,
        });

      const invoiceWithPayment =
        await paymentService.createSnapTransactionForInvoice(invoice.id);

      res.status(201).json({
        success: true,
        data: { subscription, initialInvoice: invoiceWithPayment },
      });
    } catch (error) {
      next(error);
    }
  }
}
