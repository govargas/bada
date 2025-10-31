import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import i18n from "./i18n";
import "./index.css";
import "maplibre-gl/dist/maplibre-gl.css";

const queryClient = new QueryClient();

// Set HTML lang attribute based on i18n language
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

// Set initial language on mount
document.documentElement.lang = i18n.language;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-surface-muted)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
            },
            success: {
              iconTheme: {
                primary: "var(--color-accent)",
                secondary: "var(--color-surface-muted)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--color-quality-poor)",
                secondary: "var(--color-surface-muted)",
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
