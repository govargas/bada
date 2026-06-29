import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useDarkModeObserver } from "../hooks/useDarkModeObserver";
import { canUseWebGL } from "../utils/webgl";

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

type BackgroundErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: string;
};

type BackgroundErrorBoundaryState = {
  hasError: boolean;
};

class BackgroundErrorBoundary extends Component<
  BackgroundErrorBoundaryProps,
  BackgroundErrorBoundaryState
> {
  state: BackgroundErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): BackgroundErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: BackgroundErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn("Ambient background failed; using CSS fallback.", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function AmbientBackground() {
  const isDark = useDarkModeObserver();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [renderKey, setRenderKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState<boolean | null>(null);

  // Delay Three.js loading until after first paint to prioritize main content
  useEffect(() => {
    let timerId: number | undefined;

    // Use requestAnimationFrame to wait for first paint
    const rafId = requestAnimationFrame(() => {
      // Then use a small timeout to ensure content is interactive
      timerId = window.setTimeout(() => {
        setSupportsWebGL(canUseWebGL());
        setIsReady(true);
      }, 50);
    });

    return () => {
      cancelAnimationFrame(rafId);

      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  // Force re-render when theme changes to reset WebGL context
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [isDark]);

  // Use static fallback if user prefers reduced motion or not ready yet
  if (prefersReducedMotion || !isReady || supportsWebGL !== true) {
    return <FallbackBackground isDark={isDark} />;
  }

  const fallback = <FallbackBackground isDark={isDark} />;
  const backgroundKey = `${isDark}-${renderKey}`;

  return (
    <BackgroundErrorBoundary fallback={fallback} resetKey={backgroundKey}>
      <Suspense fallback={fallback}>
        {isDark ? (
          <WaterBackground key={`water-${renderKey}`} />
        ) : (
          <SandBackground key={`sand-${renderKey}`} />
        )}
      </Suspense>
    </BackgroundErrorBoundary>
  );
}
