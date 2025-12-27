import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { UserSubscription } from "../types/subscription";
import type { Invoice } from "../types/invoice";
import type { Order } from "../types/order";
import { formatDate, formatDateOnly, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";

function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<UserSubscription>>(
        `/subscriptions/${id}`
      );
      setSub(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal memuat detail subscription";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayInvoice = async (invoice: Invoice) => {
    setPayingInvoiceId(invoice.id);
    try {
      const res = await api.post<ApiResponse<Invoice>>(
        `/invoices/${invoice.id}/pay`
      );
      const updated = res.data.data;

      if (updated.midtransPaymentLink) {
        window.location.href = updated.midtransPaymentLink;
      } else {
        alert("Tidak ada payment link yang tersedia");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal memuat transaksi pembayaran";
      setError(message);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  if (loading) return <div>Memuat detail subscription...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!sub) return <div>Subscription tidak ditemukan</div>;

  const invoices: Invoice[] = sub.invoices || [];
  const orders: Order[] = sub.orders || [];

  return (
    <div>
      <h2>Detail Subscription</h2>
      <h3>{sub.subscriptionPlan?.name}</h3>
      {sub.subscriptionPlan?.description && (
        <p>{sub.subscriptionPlan.description}</p>
      )}

      <p>
        Status: <strong>{sub.status}</strong>
      </p>
      <p>
        Next Billing: <strong>{formatDateOnly(sub.nextBillingDate)}</strong>
      </p>
      <p>
        Metode Pembayaran: <strong>{sub.paymentMethodType}</strong>
      </p>

      <h4>Alamat Pengiriman</h4>
      {sub.shippingAddress ? (
        <div style={{ fontSize: "0.9rem" }}>
          <p>
            {sub.shippingAddress.recipientName} ({sub.shippingAddress.phone})
          </p>
          <p>{sub.shippingAddress.addressLine1}</p>
          {sub.shippingAddress.addressLine2 && (
            <p>{sub.shippingAddress.addressLine2}</p>
          )}
          <p>
            {sub.shippingAddress.city}, {sub.shippingAddress.province}{" "}
            {sub.shippingAddress.postalCode}
          </p>
          <p>{sub.shippingAddress.country}</p>
        </div>
      ) : (
        <p>Tidak ada alamat</p>
      )}

      <h4 style={{ marginTop: "1.5rem" }}>Invoice</h4>
      {invoices.length === 0 ? (
        <p>Belum ada invoice untuk subscription ini</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd" }}>Nomor</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jumlah</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Periode</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jatuh Tempo</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: "0.5rem 0" }}>{inv.invoiceNumber}</td>
                <td>{formatPriceIDR(inv.amount)}</td>
                <td>
                  {inv.billingPeriodStart
                    ? `${formatDateOnly(
                        inv.billingPeriodStart
                      )} - ${formatDateOnly(inv.billingPeriodEnd || "")}`
                    : "-"}
                </td>
                <td>{inv.status}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>
                  {inv.status === "pending" && (
                    <button
                      disabled={payingInvoiceId === inv.id}
                      onClick={() => handlePayInvoice(inv)}
                    >
                      {payingInvoiceId === inv.id ? "Memproses..." : "Bayar"}
                    </button>
                  )}
                  {inv.status === "paid" && <p>Sudah dibayar</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 style={{ marginTop: "1.5rem" }}>Riwayat Order Pengiriman</h4>
      {orders.length === 0 ? (
        <p>Belum ada order pengiriman</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Kurir</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Resi</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: "0.5rem 0" }}>{o.id}</td>
                <td>{o.status}</td>
                <td>{o.shippingCourier || "-"}</td>
                <td>{o.trackingNumber || "-"}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SubscriptionDetail;
