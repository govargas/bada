import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useUI } from "../store/ui";
import { useAuth } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import MenuIcon from "../assets/menu_icon.svg?react";
import UserIcon from "../assets/user_icon.svg?react";

// Close popovers when clicking outside
function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

// Toggle the .dark class on <html>
function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return { isDark, setIsDark };
}

type HeaderProps = {
  languageSwitcher?: React.ReactNode;
};

export default function Header({ languageSwitcher }: HeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const menuRef = useOutsideClose<HTMLDivElement>(() => setMenuOpen(false));
  const userRef = useOutsideClose<HTMLDivElement>(() => setUserOpen(false));
  const { isDark, setIsDark } = useDarkMode();

  const search = useUI((s) => s.search);
  const setSearch = useUI((s) => s.setSearch);

  const { token, clearToken } = useAuth();
  const authed = !!token;
  const qc = useQueryClient();

  function handleLogout() {
    clearToken();
    qc.clear(); // clear cached queries (favorites, etc.)
    setUserOpen(false);
  }

  // Navigate to home page when user starts searching from a non-home page
  function handleSearchChange(value: string) {
    setSearch(value);
    // If user starts typing and not on home page, navigate to home
    if (value && location.pathname !== "/") {
      navigate("/");
    }
  }

  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded focus:underline"
      >
        {t("header.skipToMain")}
      </a>
      <header
        className="bg-surface sticky top-0 z-50 border-b border-border"
        role="banner"
      >
        <div className="mx-auto max-w-screen-lg px-3 py-2 flex items-center justify-between gap-2">
          {/* Left: Hamburger */}
          <div className="relative" ref={menuRef}>
            <button
              aria-label={t("header.openMenu")}
              className="p-2 rounded-full hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 text-ink"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon width={30} height={30} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-56 rounded-2xl border border-border bg-surface shadow p-2"
              >
                <div className="px-2 py-1.5 text-xs text-ink-muted">
                  {t("header.menu")}
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm">{t("header.language")}</span>
                  {languageSwitcher ?? (
                    <span className="text-xs text-ink-muted">SV / EN</span>
                  )}
                </div>
                <MenuLink to="/what-is-eu-beach">
                  {t("nav.whatIsEUBeach")}
                </MenuLink>
                <MenuLink to="/about">{t("nav.about")}</MenuLink>
                <MenuLink to="/terms">{t("nav.terms")}</MenuLink>
                <MenuLink to="/contact">{t("nav.contact")}</MenuLink>
              </div>
            )}
          </div>

          {/* Center: Brand block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/"
                className="font-spectral text-4xl font-bold tracking-[-0.06em] leading-none text-ink shrink-0"
                aria-label="BADA – home"
              >
                BADA
              </Link>
              <div className="text-left text-sm text-ink-muted leading-[1.1] shrink-0">
                {t("header.euBeaches")}
                <br />
                {t("header.inSweden")}
              </div>
            </div>
          </div>

          {/* Right: User menu */}
          <div className="relative" ref={userRef}>
            <button
              aria-label={t("header.userMenu")}
              className="p-2 rounded-full hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 text-ink"
              onClick={() => setUserOpen((v) => !v)}
            >
              <UserIcon width={40} height={40} aria-hidden="true" />
            </button>

            {userOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-surface shadow p-2"
              >
                <div className="px-2 py-1.5 text-xs text-ink-muted">
                  {authed ? t("nav.account") : t("nav.user")}
                </div>
                <div className="h-px bg-border my-1" />
                {!authed ? (
                  <>
                    <MenuLink to="/login">{t("nav.signIn")}</MenuLink>
                    <MenuLink to="/register">{t("nav.register")}</MenuLink>
                  </>
                ) : (
                  <>
                    <MenuLink to="/favorites">
                      {t("nav.favoriteBeaches")}
                    </MenuLink>
                    <MenuLink to="/profile">{t("nav.profile")}</MenuLink>
                    <MenuLink to="/settings">{t("nav.settings")}</MenuLink>
                    <div className="h-px bg-border my-1" />
                    <button
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-muted text-sm"
                      onClick={handleLogout}
                    >
                      {t("nav.logOut")}
                    </button>
                  </>
                )}
                <button
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-muted text-sm"
                  onClick={() => setIsDark(!isDark)}
                >
                  {isDark ? t("theme.darkOn") : t("theme.darkOff")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="mx-auto max-w-screen-lg px-3 pb-2">
          <div className="flex gap-2 items-center">
            <input
              type="search"
              placeholder={t("header.searchPlaceholder")}
              aria-label={t("header.searchPlaceholder")}
              className="flex-1 rounded-2xl border border-border bg-surface-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                className="rounded-2xl border border-border bg-surface px-3 py-2 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                onClick={() => setSearch("")}
                aria-label={t("header.clear")}
                title={t("header.clear")}
              >
                {t("header.clear")}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block px-2 py-1.5 rounded-lg hover:bg-surface-muted text-sm"
      role="menuitem"
    >
      {children}
    </Link>
  );
}
