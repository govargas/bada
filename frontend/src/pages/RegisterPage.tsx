import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import { apiFetch } from "@/api/client";

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
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      toast.success(t("auth.registerSuccess"));
      navigate("/login", { replace: true });
    } catch (err: any) {
      const errorMsg = err?.message ?? t("auth.registerFailed");
      setError("root", { message: errorMsg });
      toast.error(errorMsg);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-8">
      <div className="card p-6 space-y-6">
        <h1 className="font-display text-2xl">{t("auth.registerTitle")}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="block text-sm mb-1">{t("auth.email")}</label>
          <input
            id="register-email"
            type="email"
            {...register("email")}
            className="input"
          />
          {errors.email && (
            <p className="text-[var(--color-quality-poor)] text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm mb-1">{t("auth.password")}</label>
          <input
            id="register-password"
            type="password"
            {...register("password")}
            className="input"
          />
          {errors.password && (
            <p className="text-[var(--color-quality-poor)] text-sm">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="block text-sm mb-1">{t("auth.confirmPassword")}</label>
          <input
            id="register-confirm-password"
            type="password"
            {...register("confirmPassword")}
            className="input"
          />
          {errors.confirmPassword && (
            <p className="text-[var(--color-quality-poor)] text-sm">
              {errors.confirmPassword.message}
            </p>
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
          {isSubmitting ? t("auth.registerProgress") : t("auth.register")}
        </button>
        </form>

        <p className="text-sm text-ink-muted">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-accent underline">
            {t("auth.signInHere")}
          </Link>
        </p>
      </div>
    </main>
  );
}
