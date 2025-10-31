import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router";
import i18n from "../i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const t = (key: string) => i18n.t(key);
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            <div className="card p-8 text-center space-y-4">
              <h1 className="font-spectral text-3xl text-red-600">
                {t("errorBoundary.title")}
              </h1>
              <p className="text-ink-muted">
                {t("errorBoundary.message")}
              </p>
              {this.state.error && (
                <details className="text-left bg-surface p-3 rounded-lg overflow-auto">
                  <summary className="cursor-pointer font-medium mb-2">
                    {t("errorBoundary.technicalDetails")}
                  </summary>
                  <pre className="text-xs text-ink-muted whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90"
                >
                  {t("errorBoundary.reloadPage")}
                </button>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-muted"
                >
                  {t("errorBoundary.goHome")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

