import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Degree Fit</div>
        <nav style={{ display: "flex", gap: 14, opacity: 0.85 }}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <div style={{ marginTop: 32, padding: 18, border: "1px solid #22304b", borderRadius: 16, background: "#121a2a" }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Decide if your degree fits you — in 7 minutes.</h1>
        <p style={{ opacity: 0.9, marginTop: 10, fontSize: 16 }}>
          Get a fit score, mismatch signals, and next-step options. This is a reflection tool — not a diagnosis.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <Link to="/app" style={btnPrimary}>Start assessment</Link>
          <a href="#how" style={btnGhost}>How it works</a>
        </div>

        <div id="how" style={{ marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <Feature title="Trait snapshot" text="Shows what you’re optimizing for (people, structure, risk, etc.)." />
          <Feature title="Degree-fit ranking" text="Compares your traits to multiple degree directions." />
          <Feature title="Next actions" text="Gives practical steps to validate before switching." />
        </div>

        <p style={{ opacity: 0.65, marginTop: 14, fontSize: 12 }}>
          We store your results locally in your browser unless you choose to export.
        </p>
      </div>

      <footer style={{ marginTop: 24, opacity: 0.7, fontSize: 12 }}>
        <span>© {new Date().getFullYear()} Degree Fit</span>
      </footer>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 14, border: "1px solid #22304b", background: "#0a1020" }}>
      <div style={{ fontWeight: 750 }}>{title}</div>
      <div style={{ opacity: 0.9, marginTop: 6 }}>{text}</div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #2d62a8",
  background: "#5aa2ff",
  color: "#041022",
  fontWeight: 800,
  textDecoration: "none",
};

const btnGhost: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #22304b",
  background: "#0a1020",
  color: "#e8eefc",
  fontWeight: 650,
  textDecoration: "none",
};
