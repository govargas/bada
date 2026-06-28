// Only ever log in a local dev server. import.meta.env.DEV is false for any
// `vite build` (Netlify Production, Deploy Previews, Branch deploys), so API
// debug logging — which includes request bodies such as login email/password —
// can never run in a deployed build, regardless of how VITE_DEBUG_API is set
// in the host environment. The flag only takes effect during local `vite dev`.
const DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true";

export function logApi(...args: any[]) {
  if (DEBUG) {
    console.log("[API]", ...args);
  }
}
