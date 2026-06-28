import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/store/auth";
import { deleteAccount } from "@/api/account";

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearToken = useAuth((s) => s.clearToken);
  const queryClient = useQueryClient();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      clearToken();
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
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Language</h2>
        <p className="text-ink-muted">
          Choose your preferred language for BADA.
        </p>
        <LanguageSwitcher />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Dark Mode</h2>
        <p className="text-ink-muted">
          Toggle dark mode from the user menu in the header.
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Notifications</h2>
        <p className="text-ink-muted">
          Notification preferences will be available in a future update.
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
          ← Back to map
        </Link>
      </div>
    </main>
  );
}
