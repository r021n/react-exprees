import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminInvoice } from "../../types/admin";
import { formatDate, formatPriceIDR } from "../../lib/format";

const statusOptions = [
  "all",
  "pending",
  "paid",
  "cancelled",
  "failed",
  "expired",
] as const;

type StatusFilter = (typeof statusOptions)[number];

function AdminInvoices() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (status?: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await api.get<ApiResponse<AdminInvoice[]>>(
        `/admin/invoices${query}`
      );
      setInvoices(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal mendapatkan invoices admin";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  return (
    <div>
      <h2>Admin - Invoices</h2>

      <div style={{ margin: "0.5rem 0" }}>
        <label>Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && invoices.length === 0 && <p>Tidak ada invoice</p>}

      {!loading && !error && invoices.length > 0 && (
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
              <th style={{ borderBottom: "1px solid #ddd" }}>User</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Paket</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jumlah</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: "0.5rem 0" }}>{inv.invoiceNumber}</td>
                <td>{inv.user?.email}</td>
                <td>{inv.userSubscription?.subscriptionPlan?.name || "-"}</td>
                <td>{formatPriceIDR(inv.amount)}</td>
                <td>{inv.status}</td>
                <td>{formatDate(inv.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminInvoices;
