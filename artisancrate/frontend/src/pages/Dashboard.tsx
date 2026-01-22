import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { UserSubscription } from "../types/subscription";
import { formatDateOnly } from "../lib/format";
import { AxiosError } from "axios";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface DashboardSummary {
  activeCount: number;
  nearestNextBillingDate: string | null;
}

function Dashboard() {
  const { user } = useAuthStore();
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
        const res =
          await api.get<ApiResponse<UserSubscription[]>>("/subscriptions");
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Selamat Datang, {user?.name}
        </h2>
        <p className="mt-2 text-gray-600">
          Pantau langganan dan aktivitas akun Anda di sini.
        </p>
      </div>

      {loading && (
        <div className="flex py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      )}

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-indigo-200 transition-colors">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Subscription Aktif
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-4xl font-bold text-indigo-600">
                {summary.activeCount}
              </p>
              <span className="ml-2 text-sm text-gray-500">paket</span>
            </div>
          </Card>

          <Card className="hover:border-indigo-200 transition-colors">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Tagihan Berikutnya
            </h3>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {summary.nearestNextBillingDate
                ? formatDateOnly(summary.nearestNextBillingDate)
                : "-"}
            </div>
            {summary.nearestNextBillingDate && (
              <p className="mt-1 text-xs text-gray-500">
                Segera lakukan pembayaran sebelum tanggal ini
              </p>
            )}
          </Card>

          <Card className="flex flex-col justify-between sm:col-span-2 lg:col-span-1 bg-linear-to-br from-indigo-50 to-white">
            <div>
              <h3 className="font-semibold text-indigo-900">
                Jelajahi Paket Baru
              </h3>
              <p className="mt-1 text-sm text-indigo-700/80">
                Temukan rasa kopi dan teh artisan lainnya.
              </p>
            </div>
            <Link to="/">
              <Button
                size="sm"
                variant="secondary"
                className="mt-4 w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Lihat Katalog
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Akses Cepat
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/subscriptions">
              <Button variant="secondary" size="sm">
                Kelola Subscriptions
              </Button>
            </Link>
            <Link to="/invoices">
              <Button variant="secondary" size="sm">
                Riwayat Invoices
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="secondary" size="sm">
                Lihat Orders
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                Edit Profil
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
