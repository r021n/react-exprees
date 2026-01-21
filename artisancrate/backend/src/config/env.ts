import dotenv from "dotenv";
import { StringValue } from "ms";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN as StringValue) ?? "7d",

  midtransServerKey: process.env.MIDTRANS_SERVER_KEY || "",
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",

  mailHost: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
  mailPort: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 2526,
  mailUser: process.env.MAIL_USER || "",
  mailPass: process.env.MAIL_PASS || "",
  mailFromEmail: process.env.MAIL_FROM_EMAIL || "no-reply@artisancrate.test",
  mailFromName: process.env.MAIL_FROM_NAME || "ArtisanCrate",
};
