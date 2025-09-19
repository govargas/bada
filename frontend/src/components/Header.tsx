import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../store/ui";
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
  authed?: boolean;
};

export default function Header({ languageSwitcher, authed }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const menuRef = useOutsideClose<HTMLDivElement>(() => setMenuOpen(false));
  const userRef = useOutsideClose<HTMLDivElement>(() => setUserOpen(false));
  const { isDark, setIsDark } = useDarkMode();

  const search = useUI((s) => s.search);
  const setSearch = useUI((s) => s.setSearch);

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-border">
      <div className="mx-auto max-w-screen-lg px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Hamburger */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label="Open menu"
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
          <div className="flex items-center justify-center gap-2">
            <Link
              to="/"
              className="font-spectral text-4xl font-bold tracking-[-0.06em] leading-none text-ink shrink-0"
              aria-label="BADA – home"
            >
              BADA
            </Link>
            <div className="text-left text-sm text-ink-muted leading-[1.1] shrink-0">
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

      {/* Search bar */}
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
