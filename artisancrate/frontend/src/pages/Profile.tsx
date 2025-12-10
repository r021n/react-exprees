import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/auth";
import { AxiosError } from "axios";

function Profile() {
  const { user: authUser, setAuth, token } = useAuthStore();

  const [form, setForm] = useState({
    name: authUser?.name ?? "",
    phone: authUser?.phone ?? "",
  });
  const [loading, setLoading] = useState(!authUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<{ success: boolean; data: User }>("/me");
        const user = res.data.data;

        if (token) {
          setAuth(user, token);
        }
        setForm({ name: user.name, phone: user.phone ?? "" });
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err?.response?.data?.message ?? "Gagal memuat profil";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authUser, setAuth, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.put<{ success: boolean; data: User }>("/me", form);
      const updatedUser = res.data.data;
      if (token) {
        setAuth(updatedUser, token);
      }
      setSuccess("Profil berhasil diperbarui");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message ?? "Gagal update profil";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat profil...</div>;

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Profil</h2>
      {error && <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>}
      {success && (
        <p style={{ color: "green", marginBottom: "0.5rem" }}>{success}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Nama</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Telepon</label>
          <input
            type="text"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
