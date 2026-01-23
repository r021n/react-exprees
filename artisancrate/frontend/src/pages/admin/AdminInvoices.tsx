import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminInvoice } from "../../types/admin";
import { formatDate, formatPriceIDR } from "../../lib/format";
import { Alert } from "../../components/ui/Alert";
import clsx from "clsx";

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
        `/admin/invoices${query}`,
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
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <select
            className="block w-full rounded-md border-gray-300 py-1.5 text-base leading-6 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && invoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Tidak ada invoice.</p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Nomor
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Paket
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Jumlah
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Paid At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {inv.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {inv.user?.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {inv.userSubscription?.subscriptionPlan?.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                      {formatPriceIDR(inv.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          inv.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : inv.status === "expired"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {inv.paidAt ? formatDate(inv.paidAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvoices;
