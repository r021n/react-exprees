import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Order } from "../types/order";
import { formatDate } from "../lib/format";
import { AxiosError } from "axios";

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
    <div>
      <h2>Orders</h2>
      {loading && <p>Memuat orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>Belum ada order pengiriman</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Paket</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Kurir</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Resi</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: "0.5rem 0" }}>
                  <button
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => navigate(`/orders/${o.id}`)}
                  >
                    {o.id}
                  </button>
                </td>
                <td>{o.userSubscription?.subscriptionPlan?.name || "-"}</td>
                <td>{o.status}</td>
                <td>{o.shippingCourier || "-"}</td>
                <td>{o.trackingNumber || "-"}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Orders;
