import { z } from "zod";

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { error: "ID harus berupa angka" }),
  }),
});

const InvoiceStatusEnum = z.enum(
  ["pending", "paid", "cancelled", "failed", "expired"] as const,
  { error: "status tidak valid" }
);

export const payInvoiceSchema = idParamSchema;

export const invoiceIdParamSchema = idParamSchema;

export const adminListInvoicesSchema = z.object({
  query: z.object({ status: InvoiceStatusEnum.optional() }),
});
