import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription, AdminInvoice } from "../../types/admin";
import { formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

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
            "/admin/subscriptions?status=active",
          ),
          api.get<ApiResponse<AdminInvoice[]>>("/admin/invoices?status=paid"),
          api.get<ApiResponse<AdminInvoice[]>>(
            "/admin/invoices?status=pending",
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
          err?.response?.data?.message ?? "Gagal memuat data dashboard admin";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="px-4 py-5 shadow-sm border-l-4 border-indigo-500">
            <dt className="truncate text-sm font-medium text-gray-500">
              Active Subscriptions
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.activeSubscriptions}
            </dd>
          </Card>

          <Card className="px-4 py-5 shadow-sm border-l-4 border-green-500">
            <dt className="truncate text-sm font-medium text-gray-500">
              Paid Invoices (Bulan Ini)
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.paidThisMonthCount}
            </dd>
          </Card>

          <Card className="px-4 py-5 shadow-sm border-l-4 border-yellow-500">
            <dt className="truncate text-sm font-medium text-gray-500">
              Unpaid (Pending)
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.pendingCount}
            </dd>
          </Card>

          <Card className="px-4 py-5 shadow-sm border-l-4 border-emerald-600">
            <dt className="truncate text-sm font-medium text-gray-500">
              Revenue (Bulan Ini)
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
              {formatPriceIDR(summary.revenueThisMonth)}
            </dd>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
