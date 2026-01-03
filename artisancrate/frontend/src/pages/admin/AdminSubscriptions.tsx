import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { AdminSubscription } from "../../types/admin";
import { formatDateOnly } from "../../lib/format";
import { AxiosError } from "axios";

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
        `/admin/subscriptions${query}`
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
    <div>
      <h2>Admin - Subscriptions</h2>

      <div style={{ margin: "0.5rem 0" }}>
        <label>Status: </label>
        <select
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

      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && subs.length === 0 && <p>Tidak ada subscription</p>}

      {!loading && !error && subs.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.5rem",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid #ddd" }}>ID</td>
              <td style={{ border: "1px solid #ddd" }}>User</td>
              <td style={{ border: "1px solid #ddd" }}>Paket</td>
              <td style={{ border: "1px solid #ddd" }}>Status</td>
              <td style={{ border: "1px solid #ddd" }}>Next Billing</td>
              <td style={{ border: "1px solid #ddd" }}>Aksi</td>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: "0.5rem 0" }}>{s.id}</td>
                <td>
                  {s.user?.email} ({s.user?.name})
                </td>
                <td>{s.subscriptionPlan?.name}</td>
                <td>{s.status}</td>
                <td>{formatDateOnly(s.nextBillingDate)}</td>
                <td>
                  <button
                    onClick={() => navigate(`/admin/subscriptions/${s.id}`)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminSubscriptions;
