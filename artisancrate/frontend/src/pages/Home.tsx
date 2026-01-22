import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { SubscriptionPlan } from "../types/subscription";
import { useAuthStore } from "../store/authStore";
import { usePlanSelectionStore } from "../store/planSelectionStore";
import { AxiosError } from "axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

// If formatPriceIDR is not exported from lib/format, I'll keep the local one but better to check or just redefine for now to avoid breaking import if file not read.
// Since I cannot check lib/format easily without reading it, and I see it imported in Dashboard, I'll assume it exists or use local.
// Wait, in previous Home.tsx view, formatPriceIDR was defined locally. I will redefine it locally to be safe or check if generic format exists.
// Logic: Previous file had it local. Dashboard had it imported from ../lib/format (formatDateOnly).
// I will keep local functions to be safe.

function formatPriceIDRLocal(amount: number) {
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

interface ApiListResponse<T> {
  success: boolean;
  data: T;
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
          "/subscription-plans",
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-24">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Nikmati Kopi & Teh Artisan Terbaik
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            Langganan kurasi kopi dan teh pilihan dari artisan lokal langsung ke
            depan pintu Anda. Rasakan pengalaman menyeduh yang berbeda setiap
            bulannya.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document
                  .getElementById("plans")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Lihat Paket
            </Button>
            {!user && (
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-indigo-500 hover:bg-indigo-400 text-white border-transparent"
                >
                  Daftar Sekarang
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 -ml-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="scroll-mt-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pilih Paket Langganan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Temukan paket yang pas dengan gaya hidup Anda
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        )}

        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada paket langganan yang tersedia saat ini.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col h-full hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {formatPriceIDRLocal(plan.price)}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  /{" "}
                  {formatPeriod(
                    plan.billingPeriod,
                    plan.billingInterval,
                  ).replace("per ", "")}
                </span>
              </div>

              <div className="mb-6 flex-1">
                {plan.items.length > 0 ? (
                  <ul className="space-y-3">
                    {plan.items.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {item.quantity}x {item.product.name}
                        </span>
                      </li>
                    ))}
                    {plan.items.length > 3 && (
                      <li className="flex items-start">
                        <svg
                          className="mr-3 h-5 w-5 shrink-0 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">
                          + {plan.items.length - 3} produk lainnya
                        </span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Detail item belum tersedia
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <Button
                  onClick={() => handleSubscribeClick(plan)}
                  className="w-full"
                >
                  Langganan Sekarang
                </Button>
                <Link
                  to={`/plans/${plan.id}`}
                  state={{ plan }}
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full">
                    Detail Paket
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
