import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { UserSubscription } from "../types/subscription";
import { formatDateOnly } from "../lib/format";
import { AxiosError } from "axios";

interface DashboardSummary {
  activeCount: number;
  nearestNextBillingDate: string | null;
}

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    activeCount: 0,
    nearestNextBillingDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<ApiResponse<UserSubscription[]>>(
          "/subscriptions"
        );
        const subs = res.data.data;

        const activeSubs = subs.filter((s) => s.status === "active");
        const activeCount = activeSubs.length;

        let nearest: string | null = null;
        for (const s of activeSubs) {
          if (!s.nextBillingDate) continue;
          if (!nearest) {
            nearest = s.nextBillingDate;
          } else if (s.nextBillingDate < nearest) {
            nearest = s.nextBillingDate;
          }
        }

        setSummary({ activeCount, nearestNextBillingDate: nearest });
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
          err?.response?.data?.message ?? "Gagal memuat data dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {loading && <p>Memuat ringkasan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1rem",
              minWidth: 200,
            }}
          >
            <h3>Subscription Aktif</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {summary.activeCount}
            </p>
          </div>

          <div
            style={{
              border: "1px solid, #ddd",
              borderRadius: 8,
              padding: "1rem",
              minWidth: 200,
            }}
          >
            <h3>Tagihan Berikutnya</h3>
            <p>
              {summary.nearestNextBillingDate
                ? formatDateOnly(summary.nearestNextBillingDate)
                : "-"}
            </p>
          </div>
        </div>
      )}

      <p style={{ marginTop: "1rem" }}>
        Gunakan menu di atas untuk melihat detail subscriptions, invoices, dan
        orders
      </p>
    </div>
  );
}

export default Dashboard;
