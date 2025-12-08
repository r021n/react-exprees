import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    name: z.string().min(1, "Nama wajib diisi"),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
  }),
});
