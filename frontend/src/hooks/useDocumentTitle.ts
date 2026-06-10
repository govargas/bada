import { useEffect } from "react";

const DEFAULT_TITLE = "BADA – Find Safe Beaches in Sweden";

/**
 * Sets document.title while the calling component is mounted, restoring the
 * default on unmount. Gives each route a meaningful title (browser tabs,
 * history, shared-link text) even without server-side rendering.
 */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} – BADA` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
