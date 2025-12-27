import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type {
  UserSubscription,
  SubscriptionStatus,
} from "../types/subscription";
import { formatDateOnly, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";

function statusLabel(status: SubscriptionStatus) {
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

function Subscriptions() {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<UserSubscription[]>>(
        "/subscriptions"
      );
      setSubs(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal memuat subscription";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (
    id: number,
    action: "cancel" | "pause" | "resume"
  ) => {
    setActionLoadingId(id);
    try {
      await api.post<ApiResponse<UserSubscription>>(
        `/subscriptions/${id}/${action}`
      );
      await load();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ??
        `Gagal melakukan aksi ${action} subscription`;
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h2>Subscription</h2>
      {loading && <p>Memuat subscription...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && subs.length === 0 && (
        <p>Belum ada subscription. Silahkan pilih paket di halaman home</p>
      )}

      {!loading && !error && subs.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                Paket
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                Next Billing
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                Harga
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: "0.5rem 0" }}>
                  <strong>{s.subscriptionPlan?.name}</strong>
                  <div style={{ fontSize: "0.9rem" }}>
                    {s.subscriptionPlan?.billingPeriod === "monthly"
                      ? "Bulanan"
                      : "Mingguan"}{" "}
                    (interval {s.billingInterval})
                  </div>
                </td>
                <td>{statusLabel(s.status)}</td>
                <td>{formatDateOnly(s.nextBillingDate)}</td>
                <td>
                  {s.subscriptionPlan &&
                    formatPriceIDR(s.subscriptionPlan.price)}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => navigate(`/subscriptions/${s.id}`)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Detail
                  </button>

                  {s.status === "active" && (
                    <>
                      <button
                        disabled={actionLoadingId === s.id}
                        onClick={() => doAction(s.id, "pause")}
                        style={{ marginRight: "0.5rem" }}
                      >
                        {actionLoadingId === s.id ? "..." : "Pause"}
                      </button>
                      <button
                        disabled={actionLoadingId === s.id}
                        onClick={() => doAction(s.id, "cancel")}
                      >
                        {actionLoadingId === s.id ? "..." : "Cancel"}
                      </button>
                    </>
                  )}

                  {s.status === "paused" && (
                    <button
                      disabled={actionLoadingId === s.id}
                      onClick={() => doAction(s.id, "resume")}
                    >
                      {actionLoadingId === s.id ? "..." : "Resume"}
                    </button>
                  )}

                  {s.status === "pending_initial_payment" && (
                    <span style={{ fontSize: "0.8rem", color: "#555" }}>
                      Selesaikan pembayaran invoice awal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Subscriptions;
