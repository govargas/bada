import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70 border-b border-border">
      <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger */}
        <button
          aria-label="Menu"
          className="p-2 rounded-md hover:bg-badge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <img src="/menu_icon.svg" alt="" className="h-6 w-6" />
        </button>

        {/* Center: Title + subtitle */}
        <div className="flex flex-col items-center">
          <div className="font-spectral tracking-tighter2 text-2xl leading-none">
            BADA
          </div>
          <div className="font-inter text-sm text-ink-muted leading-snugPlus text-center">
            EU beaches
            <br />
            in Sweden
          </div>
        </div>

        {/* Right: User */}
        <button
          aria-label="User"
          className="p-2 rounded-md hover:bg-badge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <img src="/user_icon.svg" alt="" className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

export default Header;
