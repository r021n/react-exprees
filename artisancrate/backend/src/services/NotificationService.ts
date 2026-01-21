import { mailer } from "../libs/mailer";
import { env } from "../config/env";
import { logger } from "../libs/logger";
import { Invoice } from "../entities/Invoice";
import { Order } from "../entities/Order";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

function formatDate(date?: Date | string | null) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";
  return format(d, "dd MM yyyy HH:mm", { locale: idLocale });
}

export class NotificationService {
  private isEnabled() {
    return !!mailer;
  }

  private async send(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    if (!this.isEnabled()) {
      logger.info("[Email] skipped (mailer disabled): ", options.subject);
      return;
    }

    try {
      await mailer?.sendMail({
        from: `"${env.mailFromName}" <${env.mailFromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html ?? `<pre>${options.text}</pre>`,
      });
      logger.info("[Email] Sent:", options.subject, "->", options.to);
    } catch (error) {
      logger.error("[Email] Failed to send:", options.subject, error);
    }
  }

  async sendInvoicePaymentLink(invoice: Invoice) {
    const user = (invoice as any).user;
    const sub = (invoice as any).userSubscription;
    const plan = sub?.subscriptionPlan;

    if (!user || !user.email) {
      logger.warn(
        "[Email] tidak bisa kirim invoice, user/email tidak tersedia",
        { invoiceId: invoice.id },
      );
      return;
    }

    const paymentLink = invoice.midtransPaymentLink;
    if (!paymentLink) {
      logger.warn("[Email] tidak ada payment link untuk invoice", {
        invoiceId: invoice.id,
      });
      return;
    }

    const subject = `Invoices ${invoice.invoiceNumber} - ArtisanCrate`;

    const textLines = [
      `Halo ${user.name || user.email},`,
      "",
      `Berikut invoice langganan Anda:`,
      `Nomor Invoice: ${invoice.invoiceNumber}`,
      `Paket: ${plan?.name ?? "-"}`,
      `Jumlah: Rp ${invoice.amount.toLocaleString("id-ID")}`,
      `Jatuh Tempo: ${formatDate(invoice.dueDate ?? null)}`,
      "",
      `Silakan lakukan pembayaran melalui link berikut:`,
      paymentLink,
      "",
      "Terima kasih.",
      "ArtisanCrate",
    ];

    await this.send({ to: user.email, subject, text: textLines.join("\n") });
  }

  // 2) Payment success
}
