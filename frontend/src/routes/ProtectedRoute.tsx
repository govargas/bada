import { Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/store/auth";

export default function ProtectedRoute() {
  const location = useLocation();
  const { t } = useTranslation();
  const status = useAuth((s) => s.status);

  // Wait for the initial /auth/me check before deciding, so an authenticated
  // user isn't briefly bounced to /login on a hard refresh.
  if (status === "loading") {
    return (
      <div
        className="p-6 text-center text-ink-muted"
        role="status"
        aria-live="polite"
      >
        {t("loading")}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
