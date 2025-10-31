import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const schema = useMemo(() => z
    .object({
      email: z.string().email(t("auth.invalidEmail")),
      password: z.string().min(8, t("auth.passwordTooShort")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordsMustMatch"),
      path: ["confirmPassword"],
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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? res.statusText;
        setError("root", { message: msg });
        toast.error(msg);
        return;
      }

      toast.success(t("auth.registerSuccess"));
      navigate("/login", { replace: true });
    } catch (err: any) {
      const errorMsg = err.message ?? t("auth.registerFailed");
      setError("root", { message: errorMsg });
      toast.error(errorMsg);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-2xl">{t("auth.registerTitle")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="block text-sm mb-1">{t("auth.email")}</label>
          <input
            id="register-email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm mb-1">{t("auth.password")}</label>
          <input
            id="register-password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="block text-sm mb-1">{t("auth.confirmPassword")}</label>
          <input
            id="register-confirm-password"
            type="password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">
              {errors.confirmPassword.message}
            </p>
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
          {isSubmitting ? t("auth.registerProgress") : t("auth.register")}
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link to="/login" className="text-accent underline">
          {t("auth.signInHere")}
        </Link>
      </p>
    </main>
  );
}
