import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { AuthResponse } from "../types/auth";
import { AxiosError } from "axios";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

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
        form,
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
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Atau{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              daftar akun baru
            </Link>
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Gagal Masuk">
            {error}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={submitting}
              isLoading={submitting}
              className="w-full"
            >
              Masuk
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;
