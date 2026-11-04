import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: "600px",
            margin: "80px auto",
            padding: "32px 24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <i className="ti ti-alert-triangle" style={{ fontSize: "28px" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            {this.state.error?.message || "An unexpected error occurred while loading this view."}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              <i className="ti ti-refresh" />
              <span>Reload Application</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
