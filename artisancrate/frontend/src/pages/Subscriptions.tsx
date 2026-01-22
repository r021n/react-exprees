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
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import clsx from "clsx";

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

function statusColor(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "expired":
      return "bg-red-100 text-red-800";
    case "pending_initial_payment":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
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
      const res =
        await api.get<ApiResponse<UserSubscription[]>>("/subscriptions");
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
    action: "cancel" | "pause" | "resume",
  ) => {
    if (
      action === "cancel" &&
      !window.confirm("Apakah Anda yakin ingin membatalkan langganan ini?")
    )
      return;

    setActionLoadingId(id);
    try {
      await api.post<ApiResponse<UserSubscription>>(
        `/subscriptions/${id}/${action}`,
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
    <div className="mx-auto max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Langganan Saya</h2>
        <Button onClick={() => navigate("/")} size="sm">
          + Langganan Baru
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && subs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Belum ada subscription aktif.</p>
          <Button onClick={() => navigate("/")}>Lihat Paket Langganan</Button>
        </div>
      )}

      {!loading && !error && subs.length > 0 && (
        <div className="overflow-hidden bg-white shadow sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {subs.map((s) => (
              <li key={s.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center truncate">
                      <p className="truncate font-medium text-indigo-600 text-lg mr-3">
                        {s.subscriptionPlan?.name}
                      </p>
                      <span
                        className={clsx(
                          "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit mt-1 sm:mt-0",
                          statusColor(s.status),
                        )}
                      >
                        {statusLabel(s.status)}
                      </span>
                    </div>
                    <div className="ml-2 flex shrink-0">
                      <p className="inline-flex rounded-full bg-green-50 px-2 text-xs font-semibold leading-5 text-green-800">
                        {s.subscriptionPlan &&
                          formatPriceIDR(s.subscriptionPlan.price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex sm:gap-6">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Next Billing:{" "}
                        {s.nextBillingDate
                          ? formatDateOnly(s.nextBillingDate)
                          : "-"}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                          />
                        </svg>
                        {s.subscriptionPlan?.billingPeriod === "monthly"
                          ? "Bulanan"
                          : "Mingguan"}{" "}
                        (Interval {s.billingInterval})
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 sm:mt-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/subscriptions/${s.id}`)}
                      >
                        Detail
                      </Button>

                      {s.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              doAction(s.id, "pause");
                            }}
                            disabled={actionLoadingId === s.id}
                            className="text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              doAction(s.id, "cancel");
                            }}
                            disabled={actionLoadingId === s.id}
                            className="text-red-700 bg-red-50 border-red-200 hover:bg-red-100"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {s.status === "paused" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            doAction(s.id, "resume");
                          }}
                          disabled={actionLoadingId === s.id}
                        >
                          Resume
                        </Button>
                      )}

                      {s.status === "pending_initial_payment" && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/subscriptions/${s.id}`)}
                        >
                          Bayar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
