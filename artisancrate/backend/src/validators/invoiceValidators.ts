import { z } from "zod";

export const payInvoiceSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, "ID harus berupa angka") }),
});
