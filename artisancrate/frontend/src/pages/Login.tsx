import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { AuthResponse } from "../types/auth";
import { AxiosError } from "axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname: string } } | undefined;
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = state?.from?.pathname || "/dashboard";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post<{ success: boolean; data: AuthResponse }>(
        "/auth/login",
        form
      );
      const { token, user } = res.data.data;
      setAuth(user, token);
      navigate(from, { replace: true });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Terjadi kesalahan saat Login";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Login</h2>
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
            value={form.password}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Masuk..." : "Masuk"}
        </button>
      </form>
      <p style={{ marginTop: "0.5rem" }}>
        Belum punya akun ? <Link to="/register">Daftar di sini</Link>
      </p>
    </div>
  );
}

export default Login;
