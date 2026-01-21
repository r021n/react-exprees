import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

export const mailer =
  env.mailUser && env.mailPass
    ? nodemailer.createTransport({
        host: env.mailHost,
        port: env.mailPort,
        auth: { user: env.mailUser, pass: env.mailPass },
      })
    : null;

if (mailer) {
  mailer
    .verify()
    .then(() => logger.info("Mail transporter ready (Mailtrap"))
    .catch((err) => logger.error("Mail transporter verification failed", err));
} else {
  logger.warn(
    "Mail credentials not configured. Email notifications are disabled",
  );
}
