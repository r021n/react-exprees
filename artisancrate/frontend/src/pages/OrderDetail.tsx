import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Order } from "../types/order";
import { formatDate } from "../lib/format";
import { AxiosError } from "axios";

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

  if (loading) return <div>Memuat order...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!order) return <div>Order tidak ditemukan</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>
      <p>Paket: {order.userSubscription?.subscriptionPlan?.name || "-"}</p>
      <p>
        Status: <strong>{order.status}</strong>
      </p>
      <p>Kurir: {order.shippingCourier || "-"}</p>
      <p>Resi: {order.trackingNumber || "-"}</p>
      <p>Dibuat: {formatDate(order.createdAt)}</p>
      <p>Dikirim: {formatDate(order.shippingDate)}</p>
      <p>Diterima: {formatDate(order.deliveredDate)}</p>

      <h3>Alamat Pengiriman</h3>
      {order.shippingAddress ? (
        <div style={{ fontSize: "0.9rem" }}>
          <p>
            {order.shippingAddress.recipientName}({order.shippingAddress.phone})
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
        <p>Tidak ada data alamat</p>
      )}

      {order.invoice && (
        <>
          <h3>Informasi Invoice</h3>
          <p>Nomor: {order.invoice.invoiceNumber}</p>
          <p>Status: {order.invoice.status}</p>
          <p>Jatuh Tempo: {formatDate(order.invoice.dueDate)}</p>
        </>
      )}
    </div>
  );
}

export default OrderDetail;
