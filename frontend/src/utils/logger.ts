const DEBUG = import.meta.env.VITE_DEBUG_API === "true";

export function logApi(...args: any[]) {
  if (DEBUG) {
    console.log("[API]", ...args);
  }
}
