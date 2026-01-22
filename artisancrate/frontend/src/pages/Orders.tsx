import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Order } from "../types/order";
import { formatDate } from "../lib/format";
import { AxiosError } from "axios";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import clsx from "clsx";

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<Order[]>>("/orders");
        setOrders(res.data.data);
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err?.response?.data?.message ?? "Gagal memuat orders";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Status Pengiriman
      </h2>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Belum ada order pengiriman.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    ID Order
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
                    Kurir & Resi
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Tanggal Dibuat
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Detail</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                      <Link
                        to={`/orders/${o.id}`}
                        className="hover:text-indigo-900"
                      >
                        #{o.id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {o.userSubscription?.subscriptionPlan?.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          o.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : o.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : o.status === "pending_fulfillment"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {o.shippingCourier && (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 uppercase">
                            {o.shippingCourier}
                          </span>
                          <span className="text-xs font-mono">
                            {o.trackingNumber || "-"}
                          </span>
                        </div>
                      )}
                      {!o.shippingCourier && (
                        <span className="text-gray-400 italic">
                          Belum tersedia
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/orders/${o.id}`)}
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

export default Orders;
