import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type {
  UserSubscription,
  SubscriptionStatus,
} from "../types/subscription";
import type { Invoice } from "../types/invoice";
import type { Order } from "../types/order";
import { formatDateOnly, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import clsx from "clsx";

function statusLabel(status: SubscriptionStatus | undefined) {
  if (!status) return "-";
  switch (status) {
    case "pending_initial_payment":
      return "Menunggu Pembayaran Awal";
    case "active":
      return "Aktif";
    case "paused":
      return "Ditunda";
    case "cancelled":
      return "Dibatalkan";
    case "expired":
      return "Berakhir";
    default:
      return status;
  }
}

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
        `/subscriptions/${id}`,
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
        `/invoices/${invoice.id}/pay`,
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

  if (loading)
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-5xl py-8">
        <Alert variant="error" title="Gagal">
          {error}
        </Alert>
      </div>
    );

  if (!sub)
    return (
      <div className="mx-auto max-w-5xl py-8 text-center">
        <p className="text-gray-500">Subscription tidak ditemukan</p>
      </div>
    );

  const invoices: Invoice[] = sub.invoices || [];
  const orders: Order[] = sub.orders || [];

  return (
    <div className="mx-auto max-w-5xl py-8 space-y-8">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold text-gray-900">
          Detail Subscription #{sub.id}
        </h2>
        <Link
          to="/subscriptions"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Kembali ke daftar
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Main Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Paket
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Nama Paket
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {sub.subscriptionPlan?.name}
                </span>
              </div>
              {sub.subscriptionPlan?.description && (
                <p className="text-gray-600">
                  {sub.subscriptionPlan.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <span
                    className={clsx(
                      "font-medium",
                      sub.status === "active"
                        ? "text-green-600"
                        : "text-gray-900",
                    )}
                  >
                    {statusLabel(sub.status)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Next Billing
                  </span>
                  <span className="font-medium text-gray-900">
                    {sub.nextBillingDate
                      ? formatDateOnly(sub.nextBillingDate)
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Interval Tagihan
                  </span>
                  <span className="font-medium text-gray-900">
                    {sub.subscriptionPlan?.billingPeriod === "monthly"
                      ? "Bulanan"
                      : "Mingguan"}{" "}
                    (Setiap {sub.billingInterval})
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Harga per Tagihan
                  </span>
                  <span className="font-medium text-gray-900">
                    {sub.subscriptionPlan &&
                      formatPriceIDR(sub.subscriptionPlan.price)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Alamat Pengiriman
            </h3>
            {sub.shippingAddress ? (
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-900">
                  {sub.shippingAddress.recipientName} (
                  {sub.shippingAddress.phone})
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
              <p className="text-gray-500 italic">Tidak ada alamat terkait</p>
            )}
          </Card>
        </div>

        {/* History */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Riwayat Invoice
            </h3>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada invoice</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Invoice
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-3 py-2 text-sm text-indigo-600">
                          <Link to={`/invoices/${inv.id}`}>
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-900">
                          {formatPriceIDR(inv.amount)}
                        </td>
                        <td className="px-3 py-2 text-sm text-center">
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
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
                        <td className="px-3 py-2 text-right">
                          {inv.status === "pending" && (
                            <Button
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handlePayInvoice(inv)}
                              disabled={payingInvoiceId === inv.id}
                              isLoading={payingInvoiceId === inv.id}
                            >
                              Bayar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Riwayat Pengiriman
            </h3>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Belum ada order pengiriman
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-3 py-2 text-sm text-indigo-600">
                          <Link to={`/orders/${o.id}`}>#{o.id}</Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {o.status}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500 font-mono">
                          {o.trackingNumber || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionDetail;
