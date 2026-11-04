import "@/lib/logger";
import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import "./styles/store.css";
import "./styles/admin.css";
import { TRPCProvider } from "@/providers/trpc";
import App from "./App.tsx";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Global Application Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            background: "#fafafb",
            color: "#18181b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#db6a43" }} />
            <strong style={{ fontSize: "20px", letterSpacing: "-0.02em" }}>oja</strong>
          </div>
          <h1 style={{ fontSize: "22px", margin: "0 0 8px 0" }}>Something unexpected occurred</h1>
          <p style={{ maxWidth: "420px", color: "#71717a", fontSize: "14px", margin: "0 0 20px 0" }}>
            {this.state.error?.message || "The application encountered a runtime issue. Reloading usually resolves it."}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: "#db6a43",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Reload application
            </button>
            <a
              href={import.meta.env.BASE_URL || "/"}
              style={{
                background: "#fff",
                color: "#18181b",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                padding: "10px 18px",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Back to storefront
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Clean basename: remove any trailing slash so that React Router v7 matches both "/Oja" and "/Oja/..." cleanly
const rawBase = import.meta.env.BASE_URL || "/";
const base = rawBase === "/" ? "/" : rawBase.replace(/\/+$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter basename={base}>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);
