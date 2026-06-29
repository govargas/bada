import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useUI } from "../store/ui";
import { useAuth } from "@/store/auth";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchBeaches } from "../api/beaches";
import MenuIcon from "../assets/menu_icon.svg?react";
import UserIcon from "../assets/user_icon.svg?react";
import { useOutsideClose } from "../hooks/useOutsideClose";
import { useToggleDarkMode } from "../hooks/useToggleDarkMode";

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
  // Index of the keyboard-focused option in the combobox (-1 = none)
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // Refs for trigger buttons to return focus when menu closes
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  
  // Close handlers that return focus to trigger buttons
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);
  
  const closeUser = useCallback(() => {
    setUserOpen(false);
    userButtonRef.current?.focus();
  }, []);
  
  const menuRef = useOutsideClose<HTMLDivElement>(closeMenu);
  const userRef = useOutsideClose<HTMLDivElement>(closeUser);
  const searchRef = useOutsideClose<HTMLDivElement>(() => setSearchOpen(false));
  const { isDark, setIsDark } = useToggleDarkMode();

  const search = useUI((s) => s.search);
  const setSearch = useUI((s) => s.setSearch);

  const status = useAuth((s) => s.status);
  const logout = useAuth((s) => s.logout);
  const authed = status === "authenticated";
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

  async function handleLogout() {
    await logout();
    qc.clear(); // clear cached queries (favorites, etc.)
    setUserOpen(false);
  }

  // Handle search input change
  function handleSearchChange(value: string) {
    setSearch(value);
    setSearchOpen(!!value); // Show dropdown when there's input
    setActiveIndex(-1); // reset keyboard selection on new input
  }

  // Handle beach selection from dropdown
  function handleBeachSelect(beachId: string) {
    setSearch(""); // Clear search
    setSearchOpen(false);
    setActiveIndex(-1);
    navigate(`/beach/${beachId}`);
  }

  // ARIA combobox keyboard interaction (APG combobox-with-listbox pattern)
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const count = filteredBeaches.length;
    switch (e.key) {
      case "ArrowDown":
        if (count === 0) return;
        e.preventDefault();
        setSearchOpen(true);
        setActiveIndex((i) => (i + 1) % count);
        break;
      case "ArrowUp":
        if (count === 0) return;
        e.preventDefault();
        setSearchOpen(true);
        setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case "Enter":
        if (searchOpen && activeIndex >= 0 && activeIndex < count) {
          e.preventDefault();
          handleBeachSelect(filteredBeaches[activeIndex].id);
        }
        break;
      case "Escape":
        if (searchOpen) {
          e.preventDefault();
          setSearchOpen(false);
          setActiveIndex(-1);
        }
        break;
    }
  }

  const listboxId = "beach-search-listbox";
  const activeOptionId =
    searchOpen && activeIndex >= 0 && activeIndex < filteredBeaches.length
      ? `beach-search-option-${filteredBeaches[activeIndex].id}`
      : undefined;

  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-white dark:focus:text-[#07202e] focus:px-4 focus:py-2 focus:rounded-lg focus:underline"
      >
        {t("header.skipToMain")}
      </a>
      <header className="glass-header sticky top-0 z-50" role="banner">
        <div className="mx-auto max-w-screen-lg px-3 py-2 flex items-center justify-between gap-2">
          {/* Left: Hamburger */}
          <div className="relative" ref={menuRef}>
            <button
              ref={menuButtonRef}
              aria-label={t("header.openMenu")}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="p-2 rounded-full hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-ink"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon width={30} height={30} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="glass-overlay absolute left-0 mt-2 w-56 p-2 z-50">
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
                <MenuLink to="/privacy" onClick={() => setMenuOpen(false)}>
                  {t("nav.privacy")}
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
              ref={userButtonRef}
              aria-label={t("header.userMenu")}
              aria-expanded={userOpen}
              aria-haspopup="true"
              className="p-2 rounded-full hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-ink"
              onClick={() => setUserOpen((v) => !v)}
            >
              <UserIcon width={30} height={30} aria-hidden="true" />
            </button>

            {userOpen && (
              <div className="glass-overlay absolute right-0 mt-2 w-56 p-2 z-50">
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
                type="text"
                role="combobox"
                aria-expanded={searchOpen && filteredBeaches.length > 0}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                placeholder={t("header.searchPlaceholder")}
                aria-label={t("header.searchPlaceholder")}
                className="card flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent/50 placeholder:text-ink-muted/70"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => search && setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
              />
              {search && (
                <button
                  className="card card-hover px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              <div className="glass-overlay absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50">
                {/* Screen reader announcement for search results */}
                <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                  {filteredBeaches.length > 0
                    ? `${filteredBeaches.length} ${t("beaches")}`
                    : t("beachesList.noMatches")}
                </div>
                {filteredBeaches.length > 0 ? (
                  <ul
                    id={listboxId}
                    className="py-2"
                    role="listbox"
                    aria-label={t("header.searchPlaceholder")}
                  >
                    {filteredBeaches.map((beach, i) => (
                      <li
                        key={beach.id}
                        id={`beach-search-option-${beach.id}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        onClick={() => handleBeachSelect(beach.id)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`cursor-pointer px-4 py-2 transition-colors ${
                          i === activeIndex ? "bg-surface-muted" : ""
                        }`}
                      >
                        <div className="font-medium">{beach.name}</div>
                        <div className="text-sm text-ink-muted">
                          {beach.municipality || "–"}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-ink-muted">
                    {t("beachesList.noMatches")}
                  </div>
                )}

                {/* View all results link — sits outside the listbox so the
                    listbox contains only options */}
                {filteredBeaches.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <Link
                      to="/"
                      onClick={() => setSearchOpen(false)}
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
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
