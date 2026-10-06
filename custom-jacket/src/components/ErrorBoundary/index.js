import React from "react";

// A design that cannot be drawn (damaged or made up: saved designs come from a link) shows this message
// instead of a blank page, with a way to start a fresh jacket of the same kind (index.js wraps the app).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("The builder could not draw this design:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const params = new URLSearchParams(window.location.search);
    const fresh = `${window.location.origin}${window.location.pathname}${params.get("id") ? `?id=${encodeURIComponent(params.get("id"))}` : ""}`;
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "48px 16px", background: "#f4efe6", color: "#14110f", fontFamily: '"Instrument Sans", system-ui, sans-serif', textAlign: "center" }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontFamily: '"Big Shoulders Display", Impact, sans-serif', fontSize: 44, textTransform: "uppercase", margin: 0 }}>This design could not be opened</h1>
          <p style={{ color: "#6b635a", fontSize: 16, lineHeight: 1.6, margin: "16px 0 28px" }}>
            Something in it is damaged. You can start a new jacket, or contact us and we will help with your order.
          </p>
          <a href={fresh} style={{ display: "inline-block", background: "#14110f", color: "#f4efe6", padding: "14px 26px", textDecoration: "none", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Start a new design</a>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
