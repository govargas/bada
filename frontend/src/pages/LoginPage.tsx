import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "@/store/auth";

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const schema = useMemo(() => z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(8, t("auth.passwordTooShort")),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormData) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? res.statusText;
        setError("root", { message: msg });
        toast.error(msg);
        return;
      }

      const data = await res.json();
      setToken(data.token);
      toast.success(t("auth.signInSuccess"));
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMsg = err.message ?? t("auth.signInFailed");
      setError("root", { message: errorMsg });
      toast.error(errorMsg);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-2xl">{t("auth.signInTitle")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm mb-1">{t("auth.email")}</label>
          <input
            id="login-email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm mb-1">{t("auth.password")}</label>
          <input
            id="login-password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-red-600 text-sm">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-accent text-white py-2 hover:bg-accent/90 disabled:opacity-50"
        >
          {isSubmitting ? t("auth.signInProgress") : t("auth.signIn")}
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="text-accent underline">
          {t("auth.registerHere")}
        </Link>
      </p>
    </main>
  );
}
