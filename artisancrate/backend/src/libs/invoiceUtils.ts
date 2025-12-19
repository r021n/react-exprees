import { EntityManager } from "typeorm";
/**
 * Generate nomor invoice unik-ish.
 * Untuk MVP, probabilitas bentrok sangat kecil.
 * Kalau mau lebih aman, bisa ditambah cek DB.
 */

export async function generateInvoiceNumber(
  _manager: EntityManager
): Promise<string> {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000);

  return `INV-${datePart}-${randomPart}`;
}
