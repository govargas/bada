import { useState, useEffect, lazy, Suspense, useCallback } from "react";

// Lazy load the 3D backgrounds to improve initial load time
const WaterBackground = lazy(() => import("./WaterBackground"));
const SandBackground = lazy(() => import("./SandBackground"));

// Check if user prefers reduced motion
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Watch for dark mode changes with debounce to prevent rapid re-renders
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const observer = new MutationObserver(() => {
      // Debounce to prevent rapid switching
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

// Fallback gradient backgrounds (CSS-only) for reduced motion or loading
function FallbackBackground({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="fixed inset-0 -z-10 transition-colors duration-500"
      style={{
        background: isDark
          ? "linear-gradient(180deg, #2A6F97 0%, #468FAF 50%, #61A5C2 100%)"
          : "linear-gradient(180deg, #f5efe3 0%, #e8dcc8 50%, #dcd0b8 100%)",
      }}
      aria-hidden="true"
    />
  );
}

export default function AmbientBackground() {
  const isDark = useDarkMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when theme changes to reset WebGL context
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [isDark]);

  // Use static fallback if user prefers reduced motion
  if (prefersReducedMotion) {
    return <FallbackBackground isDark={isDark} />;
  }

  return (
    <Suspense fallback={<FallbackBackground isDark={isDark} />}>
      {isDark ? (
        <WaterBackground key={`water-${renderKey}`} />
      ) : (
        <SandBackground key={`sand-${renderKey}`} />
      )}
    </Suspense>
  );
}

