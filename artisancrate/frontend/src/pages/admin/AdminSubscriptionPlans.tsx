import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ApiResponse } from "../../types/common";
import type { Product } from "../../types/product";
import type { SubscriptionPlan } from "../../types/subscription";
import { formatPriceIDR } from "../../lib/format";
import { AxiosError } from "axios";

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
    <div>
      <h2>Subscription Plans</h2>
      {loading && <p>Memuat data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && plans.length > 0 && (
        <>
          <h2>Daftar Plan Aktif</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "0.5rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd" }}>Nama</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Harga</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Periode</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "0.5rem 0" }}>{p.name}</td>
                  <td>{formatPriceIDR(p.price)}</td>
                  <td>
                    {p.billingPeriod === "monthly" ? "bulanan" : "mingguan"} (
                    {p.billingInterval})
                  </td>
                  <td>{p.isActive ? "Aktif" : "Tidak Aktif"}</td>
                  <td>
                    <button
                      disabled={savingId === p.id}
                      onClick={() => toggleActive(p)}
                    >
                      {savingId === p.id
                        ? "Menyimpan..."
                        : p.isActive
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Endpoint ini menampilkan semua plan (aktif maupun tidak aktif).
            Hanya plan aktif yang dipakai di halaman publik.
          </p>
        </>
      )}

      <h3 style={{ marginTop: "1.5rem" }}>Buat Plan Baru</h3>
      <form
        onSubmit={handleCreate}
        style={{ maxWidth: 400, display: "grid", gap: "0.5rem" }}
      >
        <div>
          <label>Nama</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
            }}
            required
          />
        </div>
        <div>
          <label>Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Billing Period</label>
          <select
            value={form.billingPeriod}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                billingPeriod: e.target.value as "weekly" | "monthly",
              }))
            }
          >
            <option value="monthly">Bulanan</option>
            <option value="weekly">Mingguan</option>
          </select>
        </div>
        <div>
          <label>Billing Interval</label>
          <input
            type="number"
            min={1}
            value={form.billingInterval}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                billingInterval: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <label>Harge (IDR)</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <label>Produk (Isi)</label>
          <select
            value={form.productId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                productId: e.target.value ? Number(e.target.value) : "",
              }))
            }
          >
            <option>--- pilih produk ---</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="number"
            value={form.quantity}
            min={0}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
            }
          />
        </div>
        <button type="submit" disabled={creating}>
          {creating ? "Membuat..." : "Buat Plan"}
        </button>
      </form>
    </div>
  );
}

export default AdminSubscriptionPlans;
