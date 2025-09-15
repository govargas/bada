import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../store/ui";

/** Simple outside-click hook so the menus close on blur */
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

/** Dark mode toggle — flips the `dark` class on <html> */
function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);
  return { isDark, setIsDark };
}

type HeaderProps = {
  /** Optional: render a language switcher control I already have */
  languageSwitcher?: React.ReactNode;
  /** Is the user authenticated? (for conditional user menu) */
  authed?: boolean;
};

export default function Header({ languageSwitcher, authed }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const menuRef = useOutsideClose<HTMLDivElement>(() => setMenuOpen(false));
  const userRef = useOutsideClose<HTMLDivElement>(() => setUserOpen(false));
  const { isDark, setIsDark } = useDarkMode();

  // 🔎 global search state (used by BeachesList to filter)
  const search = useUI((s) => s.search);
  const setSearch = useUI((s) => s.setSearch);

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-border">
      <div className="mx-auto max-w-screen-lg px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Hamburger */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label="Open menu"
            className="p-2 rounded-full hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {/* three wavy lines (replace later with /src/assets/menu_icon.svg) */}
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 6c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M3 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M3 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Flyout menu */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 mt-2 w-56 rounded-2xl border border-border bg-surface shadow p-2"
            >
              <div className="px-2 py-1.5 text-xs text-ink-muted">Menu</div>
              <div className="h-px bg-border my-1" />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">Language</span>
                {languageSwitcher ?? (
                  <span className="text-xs text-ink-muted">SV / EN</span>
                )}
              </div>
              <MenuLink to="/what-is-eu-beach">What is an EU Beach?</MenuLink>
              <MenuLink to="/about">About BADA</MenuLink>
              <MenuLink to="/terms">Terms of Use</MenuLink>
              <MenuLink to="/contact">Contact</MenuLink>
            </div>
          )}
        </div>

        {/* Center: Brand block */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-center">
            {/* Title BADA (Spectral, tight tracking) */}
            <Link
              to="/"
              className="font-spectral text-2xl tracking-[-0.06em] leading-none text-ink"
              aria-label="BADA – home"
            >
              BADA
            </Link>
            {/* Subtitle (Inter, two-line, leading to match height visually) */}
            <div className="text-center text-sm text-ink-muted leading-[1.1]">
              EU Beaches
              <br />
              in Sweden
            </div>
          </div>
        </div>

        {/* Right: User menu */}
        <div className="relative" ref={userRef}>
          <button
            aria-label="User menu"
            className="p-2 rounded-full hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            onClick={() => setUserOpen((v) => !v)}
          >
            {/* swimmer icon (replace with /src/assets/user_icon.svg later */}
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 14c1.5-1 3-1 4.5 0s3 1 4.5 0M4 18c2-1.3 4-1.3 6 0s4 1.3 6 0"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {userOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-surface shadow p-2"
            >
              <div className="px-2 py-1.5 text-xs text-ink-muted">
                {authed ? "KONTO / USER" : "USER"}
              </div>
              <div className="h-px bg-border my-1" />
              {!authed ? (
                <>
                  <MenuLink to="/login">Sign in</MenuLink>
                  <MenuLink to="/register">Register</MenuLink>
                </>
              ) : (
                <>
                  <MenuLink to="/favorites">Favourite beaches</MenuLink>
                  <MenuLink to="/profile">Profile</MenuLink>
                  <MenuLink to="/settings">Settings</MenuLink>
                </>
              )}
              <button
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-muted text-sm"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? "Dark theme: on" : "Dark theme: off"}
              </button>
              {authed && (
                <>
                  <div className="h-px bg-border my-1" />
                  <MenuLink to="/logout">Log out</MenuLink>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search bar (now actually filters via global store) */}
      <div className="mx-auto max-w-screen-lg px-3 pb-2">
        <div className="flex gap-2 items-center">
          <input
            type="search"
            placeholder="Search beaches…"
            className="flex-1 rounded-2xl border border-border bg-surface-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="rounded-2xl border border-border bg-surface px-3 py-2 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              title="Clear"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
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
