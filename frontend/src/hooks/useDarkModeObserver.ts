import { useState, useEffect } from "react";

/**
 * Observes the `.dark` class on `<html>` via MutationObserver (debounced).
 * Use this hook in components that need to *react* to dark mode changes
 * without controlling them — e.g. to swap a 3D background.
 */
export function useDarkModeObserver() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new MutationObserver(() => {
      // Debounce to prevent rapid re-renders during theme transition
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      }, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return isDark;
}
