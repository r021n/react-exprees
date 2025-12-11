import { ProductRepository } from "../repositories/ProductRepository";

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  getActiveProducts() {
    return this.productRepo.findActive();
  }
}
