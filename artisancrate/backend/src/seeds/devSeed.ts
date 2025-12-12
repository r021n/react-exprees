import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";
import { SubscriptionPlanItem } from "../entities/SubscriptionPlanItem";
import { logger } from "../libs/logger";

async function seed() {
  await AppDataSource.initialize();
  logger.info("Seeding database...");

  const productRepo = AppDataSource.getRepository(Product);
  const planRepo = AppDataSource.getRepository(SubscriptionPlan);
  const planItemRepo = AppDataSource.getRepository(SubscriptionPlanItem);

  const productCount = await productRepo.count();
  if (productCount === 0) {
    logger.info("Seeding product...");

    const products = productRepo.create([
      {
        name: "Kopi Single Origin Aceh Gayo",
        description: "Kopi arabika single origin dari Aceh Gayo, medium roast.",
        type: "coffee",
        variant: "beans",
        isActive: true,
      },
      {
        name: "Kopi Blend House Roast",
        description: "Blend house roast seimbang, cocok untuk daily brew.",
        type: "coffee",
        variant: "ground",
        isActive: true,
      },
      {
        name: "Teh Hijau Jasmine Premium",
        description: "Teh hijau jasmine wangi, cocok diminum pagi hari.",
        type: "tea",
        variant: null,
        isActive: true,
      },
      {
        name: "Teh Hitam English Breakfast",
        description: "Teh hitam klasik untuk sarapan.",
        type: "tea",
        variant: null,
        isActive: true,
      },
    ]);

    await productRepo.save(products);
    logger.info("Products seeded");
  }

  const aceh = await productRepo.findOne({
    where: { name: "Kopi Single Origin Aceh Gayo" },
  });
  const house = await productRepo.findOne({
    where: { name: "Kopi Blend House Roast" },
  });
  const green = await productRepo.findOne({
    where: { name: "Teh Hijau Jasmine Premium" },
  });
  const black = await productRepo.findOne({
    where: { name: "Teh Hitam English Breakfast" },
  });

  const planCount = await planRepo.count();
  if (planCount === 0 && aceh && house && green && black) {
    logger.info("Seeding subscription plans...");

    const coffeePlan = planRepo.create({
      name: "Kopi Single Origin Premium",
      description: "2x 250gr kopi single origin per bulan.",
      billingPeriod: "monthly",
      billingInterval: 1,
      price: 200000,
      currency: "IDR",
      isActive: true,
    });

    const teaPlan = planRepo.create({
      name: "Teh Premium Mix",
      description: "Campuran teh hijau dan teh hitam premium per bulan.",
      billingPeriod: "monthly",
      billingInterval: 1,
      price: 120000,
      currency: "IDR",
      isActive: true,
    });

    await planRepo.save([coffeePlan, teaPlan]);

    const items = planItemRepo.create([
      {
        subscriptionPlanId: coffeePlan.id,
        productId: aceh.id,
        quantity: 1,
      },
      {
        subscriptionPlanId: coffeePlan.id,
        productId: house.id,
        quantity: 1,
      },
      {
        subscriptionPlanId: teaPlan.id,
        productId: green.id,
        quantity: 1,
      },
      {
        subscriptionPlanId: teaPlan.id,
        productId: black.id,
        quantity: 1,
      },
    ]);

    await planItemRepo.save(items);
    logger.info("Subscription plan seeded");
  }

  await AppDataSource.destroy();
  logger.info("Seeding data done");
}

seed().catch((err) => {
  logger.error("Seeding error", err);
  process.exit(1);
});
