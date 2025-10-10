import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

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
        return;
      }

      const data = await res.json();
      setToken(data.token); // Save token in Zustand store
      navigate(from, { replace: true });
    } catch (err: any) {
      setError("root", { message: err.message ?? "Login failed" });
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-2xl">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
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
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        No account?{" "}
        <Link to="/register" className="text-accent underline">
          Register here
        </Link>
      </p>
    </main>
  );
}
