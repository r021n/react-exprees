import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";

export class ProductRepository {
  private repo: Repository<Product>;

  constructor() {
    this.repo = AppDataSource.getRepository(Product);
  }

  findActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(data: Partial<Product>): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async save(product: Product): Promise<Product> {
    return this.repo.save(product);
  }
}
