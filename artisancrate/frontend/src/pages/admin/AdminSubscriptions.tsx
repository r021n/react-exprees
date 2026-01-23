import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription } from "../../types/admin";
import { formatDateOnly } from "../../lib/format";
import { AxiosError } from "axios";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import clsx from "clsx";

const statusOptions = [
  "all",
  "pending_initial_payment",
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;

type FilterStatus = (typeof statusOptions)[number];

function AdminSubscriptions() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const load = async (status?: FilterStatus) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await api.get<ApiResponse<AdminSubscription[]>>(
        `/admin/subscriptions${query}`,
      );
      setSubs(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal memuat subscription admin";
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
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <select
            className="block w-full rounded-md border-gray-300 py-1.5 text-base leading-6 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          >
            {statusOptions.map((o) => (
              <option key={o} value={o}>
                {o}
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

      {!loading && !error && subs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Tidak ada subscription.</p>
        </div>
      )}

      {!loading && !error && subs.length > 0 && (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    ID
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
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Next Billing
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {subs.map((s) => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {s.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">
                        {s.user?.name}
                      </div>
                      <div className="text-gray-500">{s.user?.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {s.subscriptionPlan?.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          s.status === "active"
                            ? "bg-green-100 text-green-800"
                            : s.status === "paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : s.status === "cancelled"
                                ? "bg-gray-100 text-gray-800"
                                : s.status === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : s.status === "pending_initial_payment"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {s.nextBillingDate
                        ? formatDateOnly(s.nextBillingDate)
                        : "-"}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/subscriptions/${s.id}`)}
                      >
                        Detail
                      </Button>
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

export default AdminSubscriptions;
