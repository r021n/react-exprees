import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services/SubscriptionService";
import type { UserSubscriptionStatus } from "../entities/UserSubscription";

const subscriptionService = new SubscriptionService();

export class AdminSubscriptionController {
  static async getAllSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const statusParam = req.query.status as string | undefined;
      const status = statusParam as UserSubscriptionStatus | undefined;

      const subs = await subscriptionService.getAllSubscriptions(status);
      res.json({ success: true, data: subs });
    } catch (error) {
      next(error);
    }
  }

  static async getSubscriptionDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const sub = await subscriptionService.getSubscriptionDetailAdmin(id);
      res.json({ success: true, data: sub });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubscriptionStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const updated = await subscriptionService.updateSubscriptionStatusAdmin(
        id,
        status
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}
