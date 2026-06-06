import { lazy, Suspense, useState, useEffect } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useDarkModeObserver } from "../hooks/useDarkModeObserver";

// Lazy load the 3D backgrounds to improve initial load time
// Use dynamic import with a small delay to prioritize main content rendering
const WaterBackground = lazy(() => 
  new Promise<typeof import("./WaterBackground")>(resolve => {
    // Wait for idle callback or timeout to ensure first paint completes
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => resolve(import("./WaterBackground")), { timeout: 2000 });
    } else {
      setTimeout(() => resolve(import("./WaterBackground")), 100);
    }
  })
);

const SandBackground = lazy(() => 
  new Promise<typeof import("./SandBackground")>(resolve => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => resolve(import("./SandBackground")), { timeout: 2000 });
    } else {
      setTimeout(() => resolve(import("./SandBackground")), 100);
    }
  })
);


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
  const isDark = useDarkModeObserver();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [renderKey, setRenderKey] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Delay Three.js loading until after first paint to prioritize main content
  useEffect(() => {
    // Use requestAnimationFrame to wait for first paint
    const rafId = requestAnimationFrame(() => {
      // Then use a small timeout to ensure content is interactive
      const timerId = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timerId);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Force re-render when theme changes to reset WebGL context
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [isDark]);

  // Use static fallback if user prefers reduced motion or not ready yet
  if (prefersReducedMotion || !isReady) {
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

