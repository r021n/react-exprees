import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { UserAddress } from "../entities/UserAddress";

export class UserAddressRepository {
  private repo: Repository<UserAddress>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserAddress);
  }

  findByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: "DESC" } });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.repo.findOne({ where: { id, userId } });
  }

  async createAndSave(data: Partial<UserAddress>): Promise<UserAddress> {
    const addr = this.repo.create(data);
    return this.repo.save(addr);
  }

  async save(address: UserAddress): Promise<UserAddress> {
    return this.repo.save(address);
  }

  async delete(address: UserAddress): Promise<void> {
    await this.repo.remove(address);
  }
}
