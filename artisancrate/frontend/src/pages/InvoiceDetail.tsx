import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Invoice } from "../types/invoice";
import { formatDate, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      setInvoice(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message ?? "Gagal memuat invoice";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const res = await api.post<ApiResponse<Invoice>>(
        `/invoices/${invoice.id}/pay`
      );
      const updated = res.data.data;
      if (updated.midtransPaymentLink) {
        window.location.href = updated.midtransPaymentLink;
      } else {
        alert("Tidak ada payment link untuk invoice ini");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal membuat transaksi pembayaran";
      alert(message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div>Memuat detail invoice...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!invoice) return <div>Invoice tidak ditemukan</div>;

  return (
    <div>
      <h2>Invoice {invoice.invoiceNumber}</h2>
      <p>
        Status: <strong>{invoice.status}</strong>
      </p>
      <p>Jumlah: {formatPriceIDR(invoice.amount)}</p>
      <p>Jatuh tempo: {formatDate(invoice.dueDate)}</p>
      <p>Dibuat: {formatDate(invoice.createdAt)}</p>
      <p>Dibayar: {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}</p>

      {invoice.userSubscription?.subscriptionPlan && (
        <p>Subscriptions: {invoice.userSubscription.subscriptionPlan.name}</p>
      )}

      {invoice.status === "pending" && (
        <button disabled={paying} onClick={handlePay}>
          {paying ? "Memproses..." : "Bayar sekarang"}
        </button>
      )}
    </div>
  );
}

export default InvoiceDetail;
