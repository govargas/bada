import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* 🔴 TEMP: Tailwind smoke test */}
        <div className="m-4 p-4 bg-red-500 text-white rounded-card">
          Tailwind OK
        </div>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
