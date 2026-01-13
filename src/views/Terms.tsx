import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/" style={{ opacity: 0.85 }}>← Home</Link>
      <h1>Terms</h1>

      <p>
        This tool is provided for educational and reflection purposes only.
        It does not provide professional career, psychological, or medical advice.
      </p>

      <h3>No guarantees</h3>
      <p>
        Results are heuristic-based and depend on your inputs. You are responsible for decisions you make.
      </p>

      <h3>Acceptable use</h3>
      <p>Do not misuse the tool to profile or discriminate against others.</p>

      <p style={{ opacity: 0.7, fontSize: 12 }}>Last updated: {new Date().toISOString().slice(0, 10)}</p>
    </div>
  );
}
