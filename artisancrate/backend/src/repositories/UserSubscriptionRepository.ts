import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { UserSubscription } from "../entities/UserSubscription";

export class UserSubscriptionRepository {
  private repo: Repository<UserSubscription>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserSubscription);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(
    data: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    const sub = this.repo.create(data);
    return this.repo.save(sub);
  }

  async save(sub: UserSubscription): Promise<UserSubscription> {
    return this.repo.save(sub);
  }
}
