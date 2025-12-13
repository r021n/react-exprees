import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { SubscriptionPlan } from "../types/subscription";
import { useAuthStore } from "../store/authStore";
import { usePlanSelectionStore } from "../store/planSelectionStore";
import { AxiosError } from "axios";

interface ApiListResponse<T> {
  success: boolean;
  data: T;
}

function formatPriceIDR(amount: number) {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

function formatPeriod(billingPeriod: string, billingInterval: number) {
  const base =
    billingPeriod === "monthly"
      ? "bulan"
      : billingPeriod === "weekly"
      ? "minggu"
      : billingPeriod;

  if (billingInterval === 1) {
    return `per ${base}`;
  }

  return `setiap ${billingInterval} ${base}`;
}

function Home() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { setSelectedPlan } = usePlanSelectionStore();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiListResponse<SubscriptionPlan[]>>(
          "/subscription-plans"
        );
        setPlans(res.data.data);
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
          err?.response?.data?.message ?? "Gagal memuat paket langganan";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSubscribeClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/subscribe/confirm" } },
      });
    } else {
      navigate("/subscribe/confirm");
    }
  };

  return (
    <div>
      <h1>ArtisanCrate</h1>
      <p>Langganan kopi dan teh artisan dengan mudah</p>

      <h2>Paket Langganan</h2>

      {loading && <p>Sedang memuat paket...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && plans.length === 0 && (
        <p>Belum ada paket langganan yang tersedia</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1rem",
            }}
          >
            <h3>{plan.name}</h3>
            {plan.description && <p>{plan.description}</p>}
            <p>
              <strong>{formatPriceIDR(plan.price)}</strong>{" "}
              <span>
                ({formatPeriod(plan.billingPeriod, plan.billingInterval)})
              </span>
            </p>

            {plan.items.length > 0 && (
              <ul style={{ fontSize: "0.9rem", paddingLeft: "1.2rem" }}>
                {plan.items.slice(0, 2).map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                  </li>
                ))}
                {plan.items.length > 2 && (
                  <li>+ {plan.items.length - 2} produk lainnya</li>
                )}
              </ul>
            )}

            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}
            >
              <Link
                to={`/plans/${plan.id}`}
                state={{ plan }}
                style={{ textDecoration: "underline" }}
              >
                Detail Paket
              </Link>

              <button
                onClick={() => handleSubscribeClick(plan)}
                style={{ marginLeft: "auto" }}
              >
                Langganan Sekarang
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
