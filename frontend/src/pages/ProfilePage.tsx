import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, SignOut, UserCircle } from "@phosphor-icons/react";

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
    <main className="content-shell space-y-5">
      <div className="space-y-2">
        <span className="liquid-chip">
          <UserCircle size={15} weight="bold" aria-hidden="true" />
          {t("nav.account")}
        </span>
        <h1 className="font-display text-3xl">{t("pages.profile.title")}</h1>
      </div>
      
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">
          {t("pages.profile.accountInfo")}
        </h2>
        <p className="text-ink-muted">
          {t("pages.profile.accountInfoDesc")}
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">{t("pages.profile.favorites")}</h2>
        <p className="text-ink-muted">
          {t("pages.profile.favoritesDesc")}
        </p>
        <Link 
          to="/favorites" 
          className="btn btn-primary"
        >
          <Heart size={17} weight="bold" aria-hidden="true" />
          {t("pages.profile.viewFavorites")}
        </Link>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-[var(--color-quality-poor)]">
          {t("pages.profile.signOut")}
        </h2>
        <p className="text-ink-muted">
          {t("pages.profile.signOutDesc")}
        </p>
        <button
          onClick={handleLogout}
          className="btn text-[var(--color-quality-poor)]"
        >
          <SignOut size={17} weight="bold" aria-hidden="true" />
          {t("pages.profile.signOut")}
        </button>
      </section>

      <div className="pt-6">
        <Link 
          to="/" 
          className="btn btn-primary"
        >
          <ArrowLeft size={17} weight="bold" aria-hidden="true" />
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}
