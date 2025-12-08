import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useUI } from "../store/ui";
import { useAuth } from "@/store/auth";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchBeaches } from "../api/beaches";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useOutsideClose<HTMLDivElement>(() => setMenuOpen(false));
  const userRef = useOutsideClose<HTMLDivElement>(() => setUserOpen(false));
  const searchRef = useOutsideClose<HTMLDivElement>(() => setSearchOpen(false));
  const { isDark, setIsDark } = useDarkMode();

  const search = useUI((s) => s.search);
  const setSearch = useUI((s) => s.setSearch);

  const { token, clearToken } = useAuth();
  const authed = !!token;
  const qc = useQueryClient();

  // Fetch beaches for search dropdown
  const { data: beaches } = useQuery({
    queryKey: ["beaches"],
    queryFn: fetchBeaches,
    staleTime: 5 * 60 * 1000,
  });

  // Filter beaches based on search
  const filteredBeaches = useMemo(() => {
    if (!search.trim() || !beaches) return [];
    const q = search.trim().toLowerCase();
    return beaches
      .filter((b) => {
        const hay = `${b.name} ${b.municipality ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 10); // Limit to 10 results
  }, [search, beaches]);

  function handleLogout() {
    clearToken();
    qc.clear(); // clear cached queries (favorites, etc.)
    setUserOpen(false);
  }

  // Handle search input change
  function handleSearchChange(value: string) {
    setSearch(value);
    setSearchOpen(!!value); // Show dropdown when there's input
  }

  // Handle beach selection from dropdown
  function handleBeachSelect(beachId: string) {
    setSearch(""); // Clear search
    setSearchOpen(false);
    navigate(`/beach/${beachId}`);
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
      <header className="glass-header sticky top-0 z-50" role="banner">
        <div className="mx-auto max-w-screen-lg px-3 py-2 flex items-center justify-between gap-2">
          {/* Left: Hamburger */}
          <div className="relative" ref={menuRef}>
            <button
              aria-label={t("header.openMenu")}
              className="p-2 rounded-full hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-ink"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon width={30} height={30} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-56 rounded-2xl border border-border/50 bg-surface/90 backdrop-blur-3xl shadow-lg p-2 z-50"
              >
                <div className="px-2 py-1.5 text-xs text-ink-muted">
                  {t("header.menu")}
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between px-2 py-1.5 gap-3">
                  <span className="text-sm text-ink-muted">
                    {t("header.language")}
                  </span>
                  {languageSwitcher ?? (
                    <span className="text-xs text-ink-muted">SV / EN</span>
                  )}
                </div>
                <div className="h-px bg-border my-1" />
                <MenuLink
                  to="/what-is-eu-beach"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.whatIsEUBeach")}
                </MenuLink>
                <MenuLink to="/about" onClick={() => setMenuOpen(false)}>
                  {t("nav.about")}
                </MenuLink>
                <MenuLink to="/terms" onClick={() => setMenuOpen(false)}>
                  {t("nav.terms")}
                </MenuLink>
                <MenuLink to="/contact" onClick={() => setMenuOpen(false)}>
                  {t("nav.contact")}
                </MenuLink>
              </div>
            )}
          </div>

          {/* Center: Brand block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/"
                className="font-title text-4xl leading-none text-ink shrink-0"
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
              className="p-2 rounded-full hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-ink"
              onClick={() => setUserOpen((v) => !v)}
            >
              <UserIcon width={30} height={30} aria-hidden="true" />
            </button>

            {userOpen && (
              <div
                role="menu"
                // Changed bg-[var(--color-glass)] to bg-surface/95 and kept backdrop-blur-xl
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/50 bg-surface/90 backdrop-blur-3xl shadow-lg p-2 z-50"
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

        {/* Search bar with dropdown */}
        <div className="mx-auto max-w-screen-lg px-3 pb-2">
          <div className="relative" ref={searchRef}>
            <div className="flex gap-2 items-center">
              <input
                type="search"
                placeholder={t("header.searchPlaceholder")}
                aria-label={t("header.searchPlaceholder")}
                className="card flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent/50 placeholder:text-ink-muted/70"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => search && setSearchOpen(true)}
              />
              {search && (
                <button
                  className="card px-3 py-2 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  aria-label={t("header.clear")}
                  title={t("header.clear")}
                >
                  {t("header.clear")}
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {searchOpen && search && (
              // Changed bg-[var(--color-glass)] to bg-surface/95 and kept backdrop-blur-xl
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/50 bg-surface/95 backdrop-blur-3xl shadow-lg max-h-96 overflow-y-auto z-50">
                {filteredBeaches.length > 0 ? (
                  <ul className="py-2">
                    {filteredBeaches.map((beach) => (
                      <li key={beach.id}>
                        <button
                          onClick={() => handleBeachSelect(beach.id)}
                          className="w-full text-left px-4 py-2 hover:bg-surface-muted focus:bg-surface-muted focus:outline-none transition-colors"
                        >
                          <div className="font-medium">{beach.name}</div>
                          <div className="text-sm text-ink-muted">
                            {beach.municipality ?? "—"}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-ink-muted">
                    {t("beachesList.noMatches")}
                  </div>
                )}

                {/* View all results link */}
                {filteredBeaches.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <Link
                      to="/"
                      onClick={() => {
                        setSearchOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-accent hover:bg-surface-muted text-center"
                    >
                      {t("header.viewAllResults")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function MenuLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      className="block px-2 py-1.5 rounded-lg hover:bg-surface-muted text-sm"
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
