import crypto from "crypto";
import { env } from "../config/env";

export function getMidtransBaseUrl() {
  return env.midtransIsProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function getMidtransAuthHeader() {
  if (!env.midtransServerKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }
  const token = Buffer.from(env.midtransServerKey + ":").toString("base64");
  return `Basic ${token}`;
}

export function computeMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string
) {
  const payload =
    orderId + statusCode + grossAmount + (env.midtransServerKey || "");
  return crypto.createHash("sha512").update(payload).digest("hex");
}
