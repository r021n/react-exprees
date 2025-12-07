import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1765085634292 implements MigrationInterface {
    name = 'InitSchema1765085634292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_addresses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "label" character varying(100) NOT NULL, "recipient_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "address_line1" character varying(255) NOT NULL, "address_line2" character varying(255), "city" character varying(100) NOT NULL, "province" character varying(100) NOT NULL, "postal_code" character varying(20) NOT NULL, "country" character varying(100) NOT NULL DEFAULT 'Indonesia', "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8abbeb5e3239ff7877088ffc25b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7a5100ce0548ef27a6f1533a5c" ON "user_addresses" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "phone" character varying(20), "role" character varying(20) NOT NULL DEFAULT 'user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "description" text, "billing_period" character varying(20) NOT NULL, "billing_interval" integer NOT NULL DEFAULT '1', "price" integer NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'IDR', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_subscription_plans_is_active" ON "subscription_plans" ("is_active") `);
        await queryRunner.query(`CREATE TABLE "subscription_plan_items" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subscription_plan_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_f903d746817c8545e4824af2009" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe5ed113b885bc49dd6d1dcf34" ON "subscription_plan_items" ("subscription_plan_id", "product_id") `);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "description" text, "type" character varying(50) NOT NULL, "variant" character varying(100), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_products_is_active" ON "products" ("is_active") `);
        await queryRunner.query(`ALTER TABLE "user_addresses" ADD CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_plan_items" ADD CONSTRAINT "FK_7e1efa415c603640c973a18622d" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_plan_items" ADD CONSTRAINT "FK_fff092dfcaea047a777783247a3" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plan_items" DROP CONSTRAINT "FK_fff092dfcaea047a777783247a3"`);
        await queryRunner.query(`ALTER TABLE "subscription_plan_items" DROP CONSTRAINT "FK_7e1efa415c603640c973a18622d"`);
        await queryRunner.query(`ALTER TABLE "user_addresses" DROP CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_is_active"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe5ed113b885bc49dd6d1dcf34"`);
        await queryRunner.query(`DROP TABLE "subscription_plan_items"`);
        await queryRunner.query(`DROP INDEX "public"."idx_subscription_plans_is_active"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a5100ce0548ef27a6f1533a5c"`);
        await queryRunner.query(`DROP TABLE "user_addresses"`);
    }

}
