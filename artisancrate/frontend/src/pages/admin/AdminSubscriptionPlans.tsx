import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { Product } from "../../types/product";
import type { SubscriptionPlan } from "../../types/subscription";
import { formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import clsx from "clsx";

interface CreatePlanForm {
  name: string;
  description: string;
  billingPeriod: "weekly" | "monthly";
  billingInterval: number;
  price: number;
  currency: string;
  productId: number | "";
  quantity: number;
}

function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [form, setForm] = useState<CreatePlanForm>({
    name: "",
    description: "",
    billingPeriod: "monthly",
    billingInterval: 1,
    price: 0,
    currency: "IDR",
    productId: "",
    quantity: 1,
  });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [planRes, productRes] = await Promise.all([
        api.get<ApiResponse<SubscriptionPlan[]>>("/admin/subscription-plans"),
        api.get<ApiResponse<Product[]>>("/products"),
      ]);
      setPlans(planRes.data.data);
      setProducts(productRes.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ??
        "Gagal memuat data subscription plans / products";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (plan: SubscriptionPlan) => {
    setSavingId(plan.id);
    try {
      await api.put(`/admin/subscription-plans/${plan.id}`, {
        isActive: !plan.isActive,
      });
      await load();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ??
        "Gagal mengubah status subscription plan";
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.productId) {
      alert("Pilih minimal 1 produk untuk isi paket");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/subscription-plans", {
        name: form.name,
        description: form.description || undefined,
        billingPeriod: form.billingPeriod,
        billingInterval: form.billingInterval,
        price: form.price,
        currency: form.currency,
        isActive: true,
        items: [
          {
            productId: form.productId,
            quantity: form.quantity,
          },
        ],
      });

      setForm({
        name: "",
        description: "",
        billingPeriod: "monthly",
        billingInterval: 1,
        price: 0,
        currency: "IDR",
        productId: "",
        quantity: 1,
      });

      await load();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal membuat subscription plan baru";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="py-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Subscription Plans
        </h2>
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        {!loading && plans.length > 0 && (
          <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Nama
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Harga
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Periode
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {plans.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {p.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatPriceIDR(p.price)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {p.billingPeriod === "monthly" ? "Bulanan" : "Mingguan"}{" "}
                        ({p.billingInterval})
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={clsx(
                            "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                            p.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {p.isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button
                          size="sm"
                          variant={p.isActive ? "danger" : "primary"}
                          disabled={savingId === p.id}
                          onClick={() => toggleActive(p)}
                          isLoading={savingId === p.id}
                        >
                          {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200 sm:px-6">
              Endpoint ini menampilkan semua plan (aktif maupun tidak aktif).
              Hanya plan aktif yang dipakai di halaman publik.
            </div>
          </div>
        )}
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-5">
            Buat Plan Baru
          </h3>
          <form onSubmit={handleCreate} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Plan
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Period
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.billingPeriod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      billingPeriod: e.target.value as "weekly" | "monthly",
                    })
                  }
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Interval
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.billingInterval}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      billingInterval: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (IDR)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-t border-gray-200 pt-6">
              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk (Isi Paket)
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.productId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      productId: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                >
                  <option value="">--- Pilih Produk ---</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={creating} disabled={creating}>
                Buat Plan
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default AdminSubscriptionPlans;
