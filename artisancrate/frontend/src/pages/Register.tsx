import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { AuthResponse } from "../types/auth";
import { AxiosError } from "axios";

function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post<{ success: boolean; data: AuthResponse }>(
        "/auth/register",
        form
      );
      const { token, user } = res.data.data;
      setAuth(user, token);
      navigate("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Terjadi kesalahan saat register";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
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
          <label>Telepon (Opsional)</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Mendaftar..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}

export default Register;
