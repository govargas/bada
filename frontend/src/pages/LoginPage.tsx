import { Link, useLocation } from "react-router-dom";

export default function LoginPage() {
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <p className="mb-4 text-sm text-neutral-500">
        (Form coming next. You will be redirected back to <code>{from}</code>{" "}
        after login.)
      </p>
      <p className="text-sm">
        No account?{" "}
        <Link to="/register" className="underline">
          Register here
        </Link>
      </p>
    </main>
  );
}
