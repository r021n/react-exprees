import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { AuthResponse } from "../types/auth";
import { AxiosError } from "axios";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

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
        form,
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
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Buat akun baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Gagal Daftar">
            {error}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
            />
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
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
            />
            <Input
              label="Nomor Telepon (Opsional)"
              type="tel"
              name="phone"
              value={form.phone}
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
              Daftar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Register;
