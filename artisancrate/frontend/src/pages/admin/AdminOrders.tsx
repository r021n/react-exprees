import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminOrder } from "../../types/admin";
import { formatDate } from "../../lib/format";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import clsx from "clsx";

const statusOptions = [
  "all",
  "pending_fulfillment",
  "being_prepared",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type StatusFilter = (typeof statusOptions)[number];

const orderStatusOptions = [
  "pending_fulfillment",
  "being_prepared",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof orderStatusOptions)[number];

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>(
    "pending_fulfillment",
  );
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");

  const load = async (status?: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await api.get<ApiResponse<AdminOrder[]>>(
        `/admin/orders${query}`,
      );
      setOrders(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal mendapatkan data order admin";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  const handleStatusChangeClick = (order: AdminOrder, status: OrderStatus) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setCourier(order.shippingCourier || "");
    setTracking(order.trackingNumber || "");
    setIsModalOpen(true);
  };

  const confirmUpdateStatus = async () => {
    if (!selectedOrder) return;

    setUpdatingId(selectedOrder.id);
    setIsModalOpen(false); // Close immediately or wait? Close immediately to show loading in table or modal?
    // Let's keep modal open if we want to show loading there, but current design uses table loading.
    // Actually, let's close modal and show loading state in table row or just reloading.

    try {
      await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        shippingCourier: courier,
        trackingNumber: tracking,
      });

      await load(statusFilter);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal mengubah status order";
      alert(message); // Could be improved but okay for now as error fallback
    } finally {
      setUpdatingId(null);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <select
            className="block w-full rounded-md border-gray-300 py-1.5 text-base leading-6 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
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

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Tidak ada order.</p>
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
                    Kurir & Resi
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Dibuat
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {ord.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">
                        {ord.user?.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ord.userSubscription?.subscriptionPlan?.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          ord.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : ord.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800",
                        )}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div>{ord.shippingCourier || "-"}</div>
                      <div className="text-xs font-mono">
                        {ord.trackingNumber}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <select
                        className="block w-full max-w-[150px] rounded-md border-gray-300 py-1.5 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={updatingId === ord.id}
                        value={ord.status}
                        onChange={(e) => {
                          handleStatusChangeClick(
                            ord,
                            e.target.value as OrderStatus,
                          );
                        }}
                      >
                        {orderStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Info Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Order #${selectedOrder?.id}`}
        footer={
          <>
            <Button
              onClick={confirmUpdateStatus}
              isLoading={updatingId === selectedOrder?.id}
            >
              Simpan & Update Status
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Anda akan mengubah status order menjadi{" "}
            <span className="font-bold text-gray-900">{newStatus}</span>.
            Silahkan lengkapi informasi pengiriman jika ada.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kurir Pengiriman
            </label>
            <Input
              placeholder="Contoh: JNE, J&T, SiCepat"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Resi (Tracking Number)
            </label>
            <Input
              placeholder="Masukkan nomor resi..."
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminOrders;
