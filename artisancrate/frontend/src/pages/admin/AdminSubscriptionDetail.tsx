import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription } from "../../types/admin";
import type { Invoice } from "../../types/invoice";
import type { Order } from "../../types/order";
import { formatDate, formatDateOnly, formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";

const statuses = [
  "pending_initial_payment",
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;

type Status = (typeof statuses)[number];

function AdminSubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<AdminSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [status, setStatus] = useState<Status>("active");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<AdminSubscription>>(
        `/admin/subscriptions/${id}`
      );
      const data = res.data.data;
      setSub(data);
      setStatus(data.status as Status);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data.message ?? "Gagal memuat detail subscription";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const handleUpdateStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingStatus(true);
    try {
      await api.put(`/admin/subscriptions/${id}/status`, { status });
      await load();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal mengupdate status subscription";
      setError(message);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <div>loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!sub) return <div>Subscription tidak ditemukan</div>;

  const invoices: Invoice[] = sub.invoices || [];
  const orders: Order[] = sub.orders || [];

  return (
    <div>
      <h2>Admin Subscription #{sub.id}</h2>
      <p>
        User: {sub.user?.name} ({sub.user?.email})
      </p>
      <p>Paket: {sub.subscriptionPlan?.name}</p>
      <p>
        Status: <strong>{sub.status}</strong>
      </p>
      <p>Next billing: {formatDateOnly(sub.nextBillingDate)}</p>

      <form onSubmit={handleUpdateStatus} style={{ marginTop: "0.5rem" }}>
        <label>Ubah Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" disabled={savingStatus}>
          {savingStatus ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <h3 style={{ marginTop: "1.5rem" }}>Invoice</h3>
      {invoices.length === 0 ? (
        <p>Belum ada invoice</p>
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
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: "0.5rem 0" }}>{inv.invoiceNumber}</td>
                <td>{formatPriceIDR(inv.amount)}</td>
                <td>{inv.status}</td>
                <td>{formatDate(inv.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: "1.5rem" }}>Orders</h3>
      {orders.length === 0 ? (
        <p>Belum ada order</p>
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
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td style={{ padding: "0.5rem 0" }}>{ord.id}</td>
                <td>{ord.status}</td>
                <td>{ord.shippingCourier || "-"}</td>
                <td>{ord.trackingNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminSubscriptionDetail;
