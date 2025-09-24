import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <p className="mb-4 text-sm text-neutral-500">
        (Form coming next. After registering you’ll be logged in automatically.)
      </p>
      <p className="text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
