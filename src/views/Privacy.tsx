import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/" style={{ opacity: 0.85 }}>← Home</Link>
      <h1>Privacy Policy</h1>

      <p><b>Summary:</b> By default, this app stores your answers and results <b>only in your browser</b> (localStorage).</p>

      <h3>What we collect</h3>
      <ul>
        <li>Your quiz answers and notes (stored locally on your device)</li>
        <li>If analytics is enabled later: anonymous usage events (e.g., “quiz completed”)</li>
      </ul>

      <h3>What we do not do</h3>
      <ul>
        <li>We do not sell personal data.</li>
        <li>We do not require account creation to use the assessment.</li>
      </ul>

      <h3>How to delete your data</h3>
      <p>Use the in-app “Reset” button. You can also clear site data in your browser settings.</p>

      <p style={{ opacity: 0.7, fontSize: 12 }}>Last updated: {new Date().toISOString().slice(0, 10)}</p>
    </div>
  );
}
