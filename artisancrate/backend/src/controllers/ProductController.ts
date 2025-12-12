import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
  static async getProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getActiveProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }
}
