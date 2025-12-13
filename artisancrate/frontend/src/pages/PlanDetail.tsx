import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import type { SubscriptionPlan } from "../types/subscription";
import { useAuthStore } from "../store/authStore";
import { usePlanSelectionStore } from "../store/planSelectionStore";
import { AxiosError } from "axios";

interface ListResponse<T> {
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

function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setSelectedPlan } = usePlanSelectionStore();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(
    location?.state?.plan ?? null
  );
  const [loading, setLoading] = useState(!plan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) return;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<ListResponse<SubscriptionPlan[]>>(
          "/subscription-plans"
        );
        const plans = res.data.data;
        const found = plans.find((p) => p.id === Number(id));
        if (!found) {
          setError("Paket langganan tidak ditemukan");
        } else {
          setPlan(found);
        }
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
          err?.response?.data?.message ?? "Gagal memuat detail paket";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, plan]);

  const handleSubscribeClick = () => {
    if (!plan) return;
    setSelectedPlan(plan);

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/subscribe/confirm" } },
      });
    } else {
      navigate("/subscribe/confirm");
    }
  };

  if (loading) return <div>Memuat detail paket...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!plan) return <div>Paket tidak tersedia</div>;

  return (
    <div>
      <h2>{plan.name}</h2>
      {plan.description && <p>{plan.description}</p>}

      <p>
        <strong>{formatPriceIDR(plan.price)}</strong>{" "}
        <span>({formatPeriod(plan.billingPeriod, plan.billingInterval)})</span>
      </p>

      <h3>Isi Paket</h3>
      {plan.items.length ? (
        <ul>
          {plan.items.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.product.name}
              {item.product.variant ? `(${item.product.variant})` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada item produk terdaftar</p>
      )}

      <button onClick={handleSubscribeClick}>Langganan Sekarang</button>
    </div>
  );
}

export default PlanDetail;
