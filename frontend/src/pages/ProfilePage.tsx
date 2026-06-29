import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { t } = useTranslation();
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate("/");
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-display text-3xl">{t("pages.profile.title")}</h1>
      
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Account Information</h2>
        <p className="text-ink-muted">
          You are currently signed in. Your account allows you to save favorite beaches and 
          access them from any device.
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Your Favorites</h2>
        <p className="text-ink-muted">
          Manage your saved beaches and keep track of your favorite swimming spots.
        </p>
        <Link 
          to="/favorites" 
          className="btn btn-primary"
        >
          View My Favorites
        </Link>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-[var(--color-quality-poor)]">Sign Out</h2>
        <p className="text-ink-muted">
          Sign out of your account. You'll need to sign in again to access your favorites.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-[var(--color-quality-poor)] text-[var(--color-quality-poor)] hover:bg-red-50 dark:hover:bg-red-950"
        >
          Sign Out
        </button>
      </section>

      <div className="pt-6">
        <Link 
          to="/" 
          className="btn btn-primary"
        >
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}

