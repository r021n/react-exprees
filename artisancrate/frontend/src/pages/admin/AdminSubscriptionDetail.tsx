import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription } from "../../types/admin";
import type { Invoice } from "../../types/invoice";
import type { Order } from "../../types/order";
import { formatDate, formatDateOnly, formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import clsx from "clsx";

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
        `/admin/subscriptions/${id}`,
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

  if (loading)
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-5xl py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );

  if (!sub)
    return (
      <div className="text-center py-12">Subscription tidak ditemukan</div>
    );

  const invoices: Invoice[] = sub.invoices || [];
  const orders: Order[] = sub.orders || [];

  return (
    <div className="py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/subscriptions"
            className="text-indigo-600 hover:text-indigo-900"
          >
            &larr; Kembali
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription #{sub.id}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-5">
              Informasi Langganan
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">User</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {sub.user?.name}
                  <div className="text-gray-500 text-xs">{sub.user?.email}</div>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">
                  {sub.subscriptionPlan?.name}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Next Billing
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateOnly(sub.nextBillingDate)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Current Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={clsx(
                      "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                      sub.status === "active"
                        ? "bg-green-100 text-green-800"
                        : sub.status === "paused"
                          ? "bg-yellow-100 text-yellow-800"
                          : sub.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {sub.status}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Update Status
              </h4>
              <form
                onSubmit={handleUpdateStatus}
                className="flex gap-4 items-end"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Status Baru
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="submit"
                  isLoading={savingStatus}
                  disabled={savingStatus}
                >
                  Simpan
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-5">
                Riwayat Invoice
              </h3>
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Belum ada invoice
                </p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 pl-3 pr-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jatuh Tempo
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="whitespace-nowrap py-2 pl-3 pr-2 text-xs font-medium text-gray-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-500">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-500">
                            {formatPriceIDR(inv.amount)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-xs">
                            <span
                              className={clsx(
                                "inline-flex rounded-full px-1.5 text-[10px] font-semibold leading-4",
                                inv.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : inv.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800",
                              )}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-5">
                Riwayat Order
              </h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Belum ada order</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 pl-3 pr-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kurir/Resi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="whitespace-nowrap py-2 pl-3 pr-2 text-xs font-medium text-gray-900">
                            #{ord.id}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-xs">
                            <span
                              className={clsx(
                                "inline-flex rounded-full px-1.5 text-[10px] font-semibold leading-4",
                                ord.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : ord.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-orange-100 text-orange-800",
                              )}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-500">
                            {ord.shippingCourier
                              ? `${ord.shippingCourier}`
                              : "-"}{" "}
                            <br />
                            <span className="font-mono text-[10px]">
                              {ord.trackingNumber}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminSubscriptionDetail;
