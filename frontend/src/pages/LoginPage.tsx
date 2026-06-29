import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "@/store/auth";
import { apiFetch } from "@/api/client";

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const refresh = useAuth((s) => s.refresh);
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
      // The server sets the httpOnly session cookie; we then hydrate auth
      // state from /auth/me. No token is handled in JS anymore.
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      await refresh();
      toast.success(t("auth.signInSuccess"));
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMsg = err?.message ?? t("auth.signInFailed");
      setError("root", { message: errorMsg });
      toast.error(errorMsg);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="font-display text-2xl">{t("auth.signInTitle")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm mb-1">{t("auth.email")}</label>
          <input
            id="login-email"
            type="email"
            {...register("email")}
            className="input"
          />
          {errors.email && (
            <p className="text-[var(--color-quality-poor)] text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm mb-1">{t("auth.password")}</label>
          <input
            id="login-password"
            type="password"
            {...register("password")}
            className="input"
          />
          {errors.password && (
            <p className="text-[var(--color-quality-poor)] text-sm">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-[var(--color-quality-poor)] text-sm">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
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
