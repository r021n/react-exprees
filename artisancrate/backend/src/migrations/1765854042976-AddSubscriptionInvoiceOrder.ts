import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionInvoiceOrder1765854042976 implements MigrationInterface {
    name = 'AddSubscriptionInvoiceOrder1765854042976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_subscription_id" integer NOT NULL, "user_id" integer NOT NULL, "invoice_number" character varying(50) NOT NULL, "amount" integer NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'IDR', "billing_period_start" date, "billing_period_end" date, "status" character varying(20) NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE, "midtrans_order_id" character varying(100), "midtrans_payment_link" text, "paid_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_invoices_midtrans_order_id" ON "invoices" ("midtrans_order_id") `);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_subscription_id" integer NOT NULL, "invoice_id" integer NOT NULL, "user_id" integer NOT NULL, "shipping_address_id" integer NOT NULL, "status" character varying(30) NOT NULL, "shipping_courier" character varying(100), "tracking_number" character varying(100), "shipping_date" TIMESTAMP WITH TIME ZONE, "delivered_date" TIMESTAMP WITH TIME ZONE, "notes" text, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_subscriptions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "subscription_plan_id" integer NOT NULL, "shipping_address_id" integer NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "next_billing_date" date NOT NULL, "billing_period" character varying(20) NOT NULL, "billing_interval" integer NOT NULL DEFAULT '1', "status" character varying(30) NOT NULL, "payment_method_type" character varying(50) NOT NULL, "payment_method_token" character varying(255), "notes" text, "cancelled_at" TIMESTAMP WITH TIME ZONE, "paused_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_user_subscriptions_next_billing_date" ON "user_subscriptions" ("next_billing_date") `);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_4992823e140c45d0c81e0df251d" FOREIGN KEY ("user_subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1b76442d13a1e49b8919aa65f60" FOREIGN KEY ("user_subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_37c4b48e442041eceda6aeb478c" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec" FOREIGN KEY ("shipping_address_id") REFERENCES "user_addresses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_0641da02314913e28f6131310eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_b6e02561ba40a3798a7e1432f2e" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_ee76405033c6020f514bdb8d48a" FOREIGN KEY ("shipping_address_id") REFERENCES "user_addresses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_ee76405033c6020f514bdb8d48a"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_b6e02561ba40a3798a7e1432f2e"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_0641da02314913e28f6131310eb"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_37c4b48e442041eceda6aeb478c"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1b76442d13a1e49b8919aa65f60"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_4992823e140c45d0c81e0df251d"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_subscriptions_next_billing_date"`);
        await queryRunner.query(`DROP TABLE "user_subscriptions"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP INDEX "public"."idx_invoices_midtrans_order_id"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
    }

}
