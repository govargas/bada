import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/store/auth";
import { deleteAccount } from "@/api/account";
import { ArrowLeft, Bell, Moon, Sun, Translate, Trash } from "@phosphor-icons/react";
import { useToggleDarkMode } from "@/hooks/useToggleDarkMode";

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearLocal = useAuth((s) => s.clearLocal);
  const queryClient = useQueryClient();
  const { isDark, setIsDark } = useToggleDarkMode();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      clearLocal();
      queryClient.clear();
      toast.success(t("pages.settings.deleteSuccess"));
      navigate("/", { replace: true });
    } catch {
      toast.error(t("pages.settings.deleteError"));
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <main className="content-shell space-y-5">
      <div className="space-y-2">
        <span className="liquid-chip">
          {isDark ? (
            <Moon size={15} weight="bold" aria-hidden="true" />
          ) : (
            <Sun size={15} weight="bold" aria-hidden="true" />
          )}
          {t("pages.settings.appearance")}
        </span>
        <h1 className="font-display text-3xl">{t("pages.settings.title")}</h1>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Translate size={20} weight="bold" aria-hidden="true" />
          {t("pages.settings.language")}
        </h2>
        <p className="text-ink-muted">
          {t("pages.settings.languageDescription")}
        </p>
        <LanguageSwitcher />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl flex items-center gap-2">
          {isDark ? (
            <Moon size={20} weight="bold" aria-hidden="true" />
          ) : (
            <Sun size={20} weight="bold" aria-hidden="true" />
          )}
          {t("pages.settings.theme")}
        </h2>
        <p className="text-ink-muted">
          {t("pages.settings.themeDesc")}
        </p>
        <button
          type="button"
          className="btn"
          aria-pressed={isDark}
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? (
            <Sun size={17} weight="bold" aria-hidden="true" />
          ) : (
            <Moon size={17} weight="bold" aria-hidden="true" />
          )}
          {isDark ? t("pages.settings.useLight") : t("pages.settings.useDark")}
        </button>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Bell size={20} weight="bold" aria-hidden="true" />
          {t("pages.settings.notifications")}
        </h2>
        <p className="text-ink-muted">
          {t("pages.settings.notificationsDesc")}
        </p>
      </section>

      {/* Account deletion (GDPR right to erasure) */}
      <section className="card p-6 space-y-4 border border-[var(--color-quality-poor)]/40">
        <h2 className="font-display text-xl text-[var(--color-quality-poor)]">
          {t("pages.settings.account")}
        </h2>
        <p className="text-ink-muted">{t("pages.settings.deleteAccountDesc")}</p>

        {!confirming ? (
          <button
            type="button"
            className="btn"
            onClick={() => setConfirming(true)}
          >
            <Trash size={17} weight="bold" aria-hidden="true" />
            {t("pages.settings.deleteAccount")}
          </button>
        ) : (
          <div
            role="alertdialog"
            aria-label={t("pages.settings.deleteAccount")}
            className="space-y-3"
          >
            <p className="font-medium">{t("pages.settings.deleteConfirm")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn bg-[var(--color-quality-poor)] text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? t("pages.settings.deleting")
                  : t("pages.settings.deleteConfirmYes")}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                {t("pages.settings.cancel")}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="pt-6">
          <Link to="/" className="btn btn-primary">
          <ArrowLeft size={17} weight="bold" aria-hidden="true" />
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}
