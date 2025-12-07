import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { env } from "./env";
import { User } from "../entities/User";
import { UserAddress } from "../entities/UserAddress";
import { Product } from "../entities/Product";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";
import { SubscriptionPlanItem } from "../entities/SubscriptionPlanItem";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.databaseUrl,
  synchronize: false,
  logging: env.nodeEnv !== "production",
  entities: [
    User,
    UserAddress,
    Product,
    SubscriptionPlan,
    SubscriptionPlanItem,
  ],
  migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
});
