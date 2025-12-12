import { Request, Response, NextFunction } from "express";
import { SubscriptionPlanService } from "../services/SubscriptionPlanService";

const planService = new SubscriptionPlanService();

export class SubscriptionPlanController {
  static async getActivePlans(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const plans = await planService.getActivePlansWithItems();
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.createPlan(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const plan = await planService.updatePlan(id, req.body);
      res.json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await planService.deletePlan(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
