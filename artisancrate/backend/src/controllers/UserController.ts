import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { AppError } from "../core/AppError";

const userService = new UserService();

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }
      const profile = await userService.getProfile(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }
      const profile = await userService.updateProfile(req.user.id, {
        name: req.body.name,
        phone: req.body.phone,
      });
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }
      const addresses = await userService.getAddresses(req.user.id);
      res.json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  }

  static async createMyAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }
      const address = await userService.createAddress(req.user.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const addressId = Number(req.params.id);
      const address = await userService.updateAddress(
        req.user.id,
        addressId,
        req.body
      );
      res.json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMyAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const addressId = Number(req.params.id);
      await userService.deleteAddress(req.user.id, addressId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
