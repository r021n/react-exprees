import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama wajib diisi").optional(),
    phone: z.string().optional(),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().min(1, "Label wajib diisi"),
    recipientName: z.string().min(1, "Nama penerima wajib diisi"),
    phone: z.string().min(1, "Nomor telepon wajib diisi"),
    addressLine1: z.string().min(1, "Alamat wajib diisi"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "Kota wajib diisi"),
    province: z.string().min(1, "Provinsi wajib diisi"),
    postalCode: z.string().min(1, "Kode pos wajib diisi"),
    country: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateAddressSchema = z.object({
  body: createAddressSchema.shape.body.partial(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Id harus berupa angka"),
  }),
});
