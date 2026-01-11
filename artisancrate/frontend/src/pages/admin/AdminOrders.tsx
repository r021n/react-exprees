import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminOrder } from "../../types/admin";
import { formatDate } from "../../lib/format";

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

  const load = async (status?: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await api.get<ApiResponse<AdminOrder[]>>(
        `/admin/orders${query}`
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

  const updateStatus = async (order: AdminOrder, newStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const courier = prompt("Kurir pengiriman:", order.shippingCourier || "");
      const tracking = prompt("Nomor resi:", order.trackingNumber || "");

      await api.put(`/admin/orders/${order.id}/status`, {
        status: newStatus,
        shippingCourier: courier ?? "",
        trackingNumber: tracking ?? "",
      });

      await load(statusFilter);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal mengubah status order";
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h2>Admin - Orders</h2>

      <div style={{ margin: "0.5rem 0" }}>
        <label>Status: </label>
        <select
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

      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && <p>Tidak ada order</p>}

      {!loading && !error && orders.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>User</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Paket</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Kurir</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Resi</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Dibuat</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td style={{ padding: "0.5rem 0" }}>{ord.id}</td>
                <td>{ord.user?.email}</td>
                <td>{ord.userSubscription?.subscriptionPlan?.name}</td>
                <td>{ord.status}</td>
                <td>{ord.shippingCourier || "-"}</td>
                <td>{ord.trackingNumber || "-"}</td>
                <td>{formatDate(ord.createdAt)}</td>
                <td>
                  <select
                    disabled={updatingId === ord.id}
                    value={ord.status}
                    onChange={(e) => {
                      updateStatus(ord, e.target.value as OrderStatus);
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
      )}
    </div>
  );
}

export default AdminOrders;
