import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import type { SubscriptionPlan } from "../types/subscription";
import { useAuthStore } from "../store/authStore";
import { usePlanSelectionStore } from "../store/planSelectionStore";
import { AxiosError } from "axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

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
    location?.state?.plan ?? null,
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
          "/subscription-plans",
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

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Alert variant="error" title="Tidak Ditemukan">
          {error}
        </Alert>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>
          &larr; Kembali ke Beranda
        </Button>
      </div>
    );
  }

  if (!plan)
    return <div className="text-center py-12">Paket tidak tersedia</div>;

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
        onClick={() => navigate(-1)}
      >
        &larr; Kembali
      </Button>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-indigo-600">
                {formatPriceIDR(plan.price)}
              </span>
              <span className="text-lg font-medium text-gray-500">
                /{" "}
                {formatPeriod(plan.billingPeriod, plan.billingInterval).replace(
                  "per ",
                  "",
                )}
              </span>
            </div>
          </div>

          <div className="prose prose-indigo max-w-none">
            <h3 className="text-lg font-semibold text-gray-900">Deskripsi</h3>
            <p className="text-gray-600 leading-relaxed">{plan.description}</p>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apa yang Anda dapatkan?
            </h3>
            {plan.items.length ? (
              <ul className="space-y-4">
                {plan.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold mr-4">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      {item.product.variant && (
                        <p className="text-sm text-gray-500">
                          {item.product.variant}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                Tidak ada item produk terdaftar
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar / Action */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 bg-gray-50/50 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan
            </h3>
            <div className="space-y-4 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Harga Paket</span>
                <span className="font-medium">
                  {formatPriceIDR(plan.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Periode</span>
                <span className="font-medium capitalize">
                  {formatPeriod(plan.billingPeriod, plan.billingInterval)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPriceIDR(plan.price)}</span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={handleSubscribeClick}>
              Langganan Sekarang
            </Button>
            <p className="mt-4 text-xs text-center text-gray-500">
              Dapat dibatalkan kapan saja melalui dashboard.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PlanDetail;
