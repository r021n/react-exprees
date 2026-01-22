import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Order } from "../types/order";
import { formatDate } from "../lib/format";
import { AxiosError } from "axios";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import clsx from "clsx";

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal memuat detail order";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );

  if (!order)
    return <div className="text-center py-12">Order tidak ditemukan</div>;

  const steps = [
    { status: "pending", label: "Diproses" },
    { status: "shipping", label: "Dikirim" },
    { status: "delivered", label: "Diterima" },
  ];

  const currentStep = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      <Link
        to="/orders"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 block"
      >
        &larr; Kembali ke daftar order
      </Link>

      <div className="bg-white px-4 py-5 sm:px-6 shadow rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
          <span
            className={clsx(
              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "shipped"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800",
            )}
          >
            {order.status.toUpperCase()}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Dibuat pada {formatDate(order.createdAt)} • Paket:{" "}
          {order.userSubscription?.subscriptionPlan?.name}
        </p>
      </div>

      {/* Tracking Progress Mockup */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx <= currentStep;
            return (
              <div key={step.status} className="flex flex-col items-center">
                <div
                  className={clsx(
                    "h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white",
                    isCompleted ? "bg-indigo-600" : "bg-gray-200",
                  )}
                >
                  {isCompleted && (
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={clsx(
                    "mt-2 text-sm font-medium",
                    isCompleted ? "text-indigo-600" : "text-gray-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi Pengiriman
          </h3>
          <div className="space-y-3">
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Kurir
              </span>
              <span className="font-medium text-gray-900 uppercase">
                {order.shippingCourier || "Belum tersedia"}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Nomor Resi
              </span>
              <span className="font-mono text-gray-900">
                {order.trackingNumber || "Belum tersedia"}
              </span>
            </div>
            {order.shippingDate && (
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Tanggal Pengiriman
                </span>
                <span className="text-gray-900">
                  {formatDate(order.shippingDate)}
                </span>
              </div>
            )}
            {order.deliveredDate && (
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Tanggal Diterima
                </span>
                <span className="text-gray-900">
                  {formatDate(order.deliveredDate)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alamat Tujuan
          </h3>
          {order.shippingAddress ? (
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.recipientName} (
                {order.shippingAddress.phone})
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city} {order.shippingAddress.province}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Tidak ada data alamat</p>
          )}
        </Card>

        {order.invoice && (
          <Card className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Tagihan
            </h3>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-gray-900 font-medium">
                  Invoice #{order.invoice.invoiceNumber}
                </p>
                <p className="text-gray-500">Status: {order.invoice.status}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">
                  Jatuh Tempo: {formatDate(order.invoice.dueDate)}
                </p>
                <Link
                  to={`/invoices/${order.invoice.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  Lihat Invoice
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;
