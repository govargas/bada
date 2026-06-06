import { useState, useEffect } from "react";

/**
 * Reads and toggles the `.dark` class on `<html>`.
 * Use this hook in components that need to *control* dark mode.
 */
export function useToggleDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return { isDark, setIsDark };
}
