import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription, AdminInvoice } from "../../types/admin";
import { formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";

interface Summary {
  activeSubscriptions: number;
  paidThisMonthCount: number;
  pendingCount: number;
  revenueThisMonth: number;
}

function AdminDashboard() {
  const [summary, setSummary] = useState<Summary>({
    activeSubscriptions: 0,
    paidThisMonthCount: 0,
    pendingCount: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subRes, paidRes, pendingRes] = await Promise.all([
          api.get<ApiResponse<AdminSubscription[]>>(
            "/admin/subscriptions?status=active"
          ),
          api.get<ApiResponse<AdminInvoice[]>>("/admin/invoices?status=paid"),
          api.get<ApiResponse<AdminInvoice[]>>(
            "/admin/invoices?status=pending"
          ),
        ]);

        const activeSubscriptions = subRes.data.data.length;

        const paidInvoices = paidRes.data.data;
        const pendingInvoices = pendingRes.data.data;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let revenueThisMonth = 0;
        let paidThisMonthCount = 0;

        for (const inv of paidInvoices) {
          if (!inv.paidAt) continue;
          const d = new Date(inv.paidAt);
          if (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          ) {
            revenueThisMonth += inv.amount;
            paidThisMonthCount += 1;
          }
        }

        setSummary({
          activeSubscriptions,
          paidThisMonthCount,
          pendingCount: pendingInvoices.length,
          revenueThisMonth,
        });
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
          err?.response?.data?.message ?? "Gagal memuat data dahsboard admin";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading && <p>Memuat ringkasan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <div style={cardStyle}>
            <h3>Active Subscriptions</h3>
            <p style={valueStyle}>{summary.activeSubscriptions}</p>
          </div>
          <div style={cardStyle}>
            <h3>Paid Invoices (Bulan Ini)</h3>
            <p style={valueStyle}>{summary.paidThisMonthCount}</p>
          </div>
          <div style={cardStyle}>
            <h3>Unpaid (Pending Invoices)</h3>
            <p style={valueStyle}>{summary.pendingCount}</p>
          </div>
          <div style={cardStyle}>
            <h3>Revenue (Bulan Ini)</h3>
            <p style={valueStyle}>{formatPriceIDR(summary.revenueThisMonth)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "1rem",
  minWidth: 220,
};

const valueStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
};

export default AdminDashboard;
