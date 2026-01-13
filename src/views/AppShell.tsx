import React, { useMemo, useState } from "react";

type DegreeProfileId =
  | "health"
  | "engineering"
  | "business"
  | "law"
  | "arts"
  | "cs"
  | "science"
  | "education";

type TraitKey =
  | "people"
  | "analysis"
  | "creativity"
  | "structure"
  | "riskTolerance"
  | "longTraining"
  | "moneyFocus"
  | "meaningFocus"
  | "handsOn"
  | "screenTolerance";

type Question = {
  id: string;
  prompt: string;
  trait: TraitKey;
  // 1..5 Likert
  weight?: number; // default 1
  reverse?: boolean; // if true, higher answer reduces trait
};

type DegreeProfile = {
  id: DegreeProfileId;
  label: string;
  description: string;
  traitTargets: Partial<Record<TraitKey, number>>; // 0..100
  suggestions: Array<{ title: string; why: string; nextSteps: string[] }>;
};

type AssessmentResult = {
  createdAtISO: string;
  answers: Record<string, number>;
  traitScores: Record<TraitKey, number>;
  degreeFits: Array<{ id: DegreeProfileId; label: string; fit: number }>;
  redFlags: string[];
  notes: string;
};

const STORAGE_KEY = "degreeFit.latest.v1";

const traitLabel: Record<TraitKey, string> = {
  people: "People-oriented work",
  analysis: "Analytical/problem solving",
  creativity: "Creativity/idea generation",
  structure: "Comfort with structure/rules",
  riskTolerance: "Risk tolerance",
  longTraining: "Tolerance for long training",
  moneyFocus: "Money-focused motivation",
  meaningFocus: "Meaning/impact motivation",
  handsOn: "Hands-on preference",
  screenTolerance: "Screen-time tolerance",
};

const questions: Question[] = [
  { id: "q1", prompt: "I enjoy working with people all day.", trait: "people" },
  { id: "q2", prompt: "I like solving abstract problems with logic.", trait: "analysis" },
  { id: "q3", prompt: "I regularly make or design things (writing, art, media, ideas).", trait: "creativity" },
  { id: "q4", prompt: "I’m comfortable with strict rules, compliance, and procedures.", trait: "structure" },
  { id: "q5", prompt: "I’m okay with uncertainty and trying things that might fail.", trait: "riskTolerance" },
  { id: "q6", prompt: "I can tolerate several more years of training/study to qualify.", trait: "longTraining" },
  { id: "q7", prompt: "High income is a top driver for me.", trait: "moneyFocus" },
  { id: "q8", prompt: "Making a meaningful impact is a top driver for me.", trait: "meaningFocus" },
  { id: "q9", prompt: "I prefer hands-on practical work over theory.", trait: "handsOn" },
  { id: "q10", prompt: "I’m comfortable spending many hours a day on a screen.", trait: "screenTolerance" },

  // reverse (higher answer means LESS of the trait)
  { id: "q11", prompt: "I dislike group work and collaboration.", trait: "people", reverse: true, weight: 0.8 },
  { id: "q12", prompt: "I avoid tasks that require careful attention to detail.", trait: "structure", reverse: true, weight: 0.9 },
];

const degreeProfiles: DegreeProfile[] = [
  {
    id: "health",
    label: "Health (e.g., Optometry, Nursing, Allied Health, Medicine)",
    description:
      "People-focused, structured, meaningful work; training can be long; hands-on + communication matter.",
    traitTargets: {
      people: 80,
      structure: 70,
      meaningFocus: 80,
      longTraining: 70,
      handsOn: 65,
      analysis: 55,
      screenTolerance: 45,
      riskTolerance: 40,
      moneyFocus: 45,
      creativity: 35,
    },
    suggestions: [
      {
        title: "Try a clinical shadow / volunteer shift",
        why: "If you can’t tolerate the day-to-day environment, the degree won’t feel worth it even if the content is interesting.",
        nextSteps: ["Email a clinic/practice manager", "Do 2–4 short shifts", "Journal: energy up/down after each shift"],
      },
      {
        title: "If you hate the structure: explore health-adjacent roles",
        why: "You might like impact but not compliance-heavy clinical workflows.",
        nextSteps: ["Look at health tech, product, sales (med devices)", "Speak to 2 people in those roles"],
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    description:
      "Analytical, structured, long projects; can be screen-heavy; collaboration varies by field.",
    traitTargets: {
      analysis: 85,
      structure: 70,
      screenTolerance: 70,
      creativity: 55,
      riskTolerance: 45,
      moneyFocus: 55,
      meaningFocus: 45,
      people: 45,
      handsOn: 45,
      longTraining: 55,
    },
    suggestions: [
      {
        title: "Pick a concrete track early (and test it)",
        why: "‘Engineering’ is too broad. Test a real subfield via a small build/project.",
        nextSteps: ["Do a 2-week mini project", "Join a uni club team", "Talk to a grad engineer about daily tasks"],
      },
    ],
  },
  {
    id: "cs",
    label: "Computer Science / Software",
    description:
      "High screen time, strong analysis; creativity in solutions; fast feedback loops; career options are wide.",
    traitTargets: {
      analysis: 80,
      screenTolerance: 90,
      creativity: 55,
      riskTolerance: 55,
      structure: 55,
      moneyFocus: 60,
      people: 45,
      meaningFocus: 45,
      handsOn: 25,
      longTraining: 40,
    },
    suggestions: [
      {
        title: "Build 1 small shipped thing (not tutorial-only)",
        why: "You’ll learn quickly if you enjoy the real work: debugging, iteration, and user feedback.",
        nextSteps: ["Ship a simple web app", "Get 5 users to try it", "Iterate twice based on feedback"],
      },
    ],
  },
  {
    id: "business",
    label: "Business / Commerce",
    description:
      "Broad; can be people-heavy; good if you like ambiguity and outcomes; ‘meaning’ depends on domain.",
    traitTargets: {
      people: 65,
      riskTolerance: 60,
      moneyFocus: 65,
      structure: 45,
      analysis: 55,
      creativity: 45,
      screenTolerance: 55,
      meaningFocus: 45,
      longTraining: 35,
      handsOn: 40,
    },
    suggestions: [
      {
        title: "Avoid the ‘generic’ trap: choose a lane",
        why: "Business degrees become valuable when paired with a concrete skill (finance, analytics, sales, ops).",
        nextSteps: ["Pick 1 lane for 8 weeks", "Do a portfolio project", "Get feedback from someone in industry"],
      },
    ],
  },
  {
    id: "law",
    label: "Law",
    description:
      "High structure and detail; reading/writing heavy; long pathway; outcomes can be competitive.",
    traitTargets: {
      structure: 85,
      analysis: 75,
      longTraining: 70,
      people: 55,
      screenTolerance: 65,
      moneyFocus: 55,
      meaningFocus: 50,
      creativity: 30,
      riskTolerance: 35,
      handsOn: 20,
    },
    suggestions: [
      {
        title: "Stress-test the reading/writing reality",
        why: "Many people like the idea of law, not the day-to-day work.",
        nextSteps: ["Read 2–3 real case summaries", "Try writing a 1-page argument", "Talk to a junior lawyer"],
      },
    ],
  },
  {
    id: "arts",
    label: "Arts / Design / Media",
    description:
      "Creativity and self-direction; outcomes vary; you need to build a portfolio and network.",
    traitTargets: {
      creativity: 85,
      riskTolerance: 70,
      meaningFocus: 60,
      people: 55,
      structure: 30,
      analysis: 45,
      screenTolerance: 55,
      moneyFocus: 35,
      longTraining: 35,
      handsOn: 55,
    },
    suggestions: [
      {
        title: "Portfolio-first mentality",
        why: "Your work speaks louder than your transcript in many creative fields.",
        nextSteps: ["Define a niche", "Ship 3 portfolio pieces", "Ask for critiques weekly"],
      },
    ],
  },
  {
    id: "science",
    label: "Science (general)",
    description:
      "Curiosity and analysis; pathways can require further study; lab vs computational varies.",
    traitTargets: {
      analysis: 75,
      longTraining: 65,
      structure: 55,
      meaningFocus: 55,
      screenTolerance: 55,
      creativity: 45,
      people: 40,
      riskTolerance: 45,
      moneyFocus: 35,
      handsOn: 50,
    },
    suggestions: [
      {
        title: "Decide: research vs industry",
        why: "The ‘science’ path splits. Each requires different trade-offs.",
        nextSteps: ["Meet a PhD student and an industry scientist", "List trade-offs you accept", "Choose a 6-month plan"],
      },
    ],
  },
  {
    id: "education",
    label: "Education / Teaching",
    description:
      "High people energy and meaning; structure; emotional resilience; daily performance work.",
    traitTargets: {
      people: 90,
      meaningFocus: 80,
      structure: 60,
      creativity: 55,
      riskTolerance: 45,
      screenTolerance: 35,
      moneyFocus: 30,
      longTraining: 45,
      handsOn: 65,
      analysis: 45,
    },
    suggestions: [
      {
        title: "Classroom reality-check",
        why: "If classroom energy drains you, it’ll be brutal long-term.",
        nextSteps: ["Do tutoring/mentoring weekly", "Observe a class", "Reflect on energy after sessions"],
      },
    ],
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function likertToPoints(v: number) {
  // v 1..5 -> 0..100
  return ((v - 1) / 4) * 100;
}

function computeTraitScores(answers: Record<string, number>): Record<TraitKey, number> {
  const sums: Record<TraitKey, number> = {
    people: 0,
    analysis: 0,
    creativity: 0,
    structure: 0,
    riskTolerance: 0,
    longTraining: 0,
    moneyFocus: 0,
    meaningFocus: 0,
    handsOn: 0,
    screenTolerance: 0,
  };

  const weights: Record<TraitKey, number> = { ...sums };

  for (const q of questions) {
    const raw = answers[q.id] ?? 3;
    const weight = q.weight ?? 1;
    const points = likertToPoints(raw);
    const finalPoints = q.reverse ? 100 - points : points;

    sums[q.trait] += finalPoints * weight;
    weights[q.trait] += weight;
  }

  const out = { ...sums };
  (Object.keys(out) as TraitKey[]).forEach((k) => {
    out[k] = weights[k] > 0 ? sums[k] / weights[k] : 50;
  });
  return out;
}

function degreeFitScore(
  traitScores: Record<TraitKey, number>,
  profile: DegreeProfile
): number {
  // Fit = 100 - average absolute error on target traits
  const targets = profile.traitTargets;
  const keys = Object.keys(targets) as TraitKey[];
  if (keys.length === 0) return 50;

  const errors = keys.map((k) => Math.abs((targets[k] ?? 50) - traitScores[k]));
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
  return clamp(100 - avgError, 0, 100);
}

function detectRedFlags(traits: Record<TraitKey, number>): string[] {
  const flags: string[] = [];

  // Simple heuristics (not “truth”; just prompts for reflection)
  if (traits.longTraining < 35) flags.push("Low tolerance for long training: degrees with long pathways may feel painful.");
  if (traits.screenTolerance < 30) flags.push("Low screen tolerance: screen-heavy careers may drain you faster than you expect.");
  if (traits.structure < 30) flags.push("Low structure preference: highly regulated/credentialed paths might frustrate you.");
  if (traits.people < 30) flags.push("Low people preference: people-heavy degrees (clinical/teaching) might exhaust you.");
  if (traits.riskTolerance < 30) flags.push("Low risk tolerance: uncertain pathways (creative/entrepreneurial) may spike anxiety.");
  if (traits.meaningFocus < 30 && traits.moneyFocus < 30)
    flags.push("Low meaning + low money motivation: you may be unclear on what drives you—this is worth fixing first.");

  return flags;
}

function loadLatest(): AssessmentResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentResult;
  } catch {
    return null;
  }
}

function saveLatest(r: AssessmentResult) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

function Card(props: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#121a2a",
        border: "1px solid #22304b",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      {props.children}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = clamp(value, 0, 100);
  return (
    <div style={{ background: "#0a1020", border: "1px solid #22304b", borderRadius: 999, height: 12 }}>
      <div style={{ width: `${v}%`, height: "100%", borderRadius: 999, background: "#5aa2ff" }} />
    </div>
  );
}

export default function App() {
  const saved = useMemo(() => (typeof window !== "undefined" ? loadLatest() : null), []);
  const [stage, setStage] = useState<"intro" | "quiz" | "results">(saved ? "results" : "intro");

  const [answers, setAnswers] = useState<Record<string, number>>(() => saved?.answers ?? {});
  const [notes, setNotes] = useState<string>(() => saved?.notes ?? "");

  const traitScores = useMemo(() => computeTraitScores(answers), [answers]);
  const fits = useMemo(() => {
    const computed = degreeProfiles.map((p) => ({
      id: p.id,
      label: p.label,
      fit: degreeFitScore(traitScores, p),
    }));
    computed.sort((a, b) => b.fit - a.fit);
    return computed;
  }, [traitScores]);

  const redFlags = useMemo(() => detectRedFlags(traitScores), [traitScores]);

  const topProfile = useMemo(() => {
    const top = fits[0];
    return degreeProfiles.find((p) => p.id === top?.id) ?? null;
  }, [fits]);

  const completion = useMemo(() => {
    const total = questions.length;
    const done = questions.filter((q) => typeof answers[q.id] === "number").length;
    return Math.round((done / total) * 100);
  }, [answers]);

  function setAnswer(qid: string, value: number) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function finalize() {
    const result: AssessmentResult = {
      createdAtISO: new Date().toISOString(),
      answers,
      traitScores,
      degreeFits: fits,
      redFlags,
      notes,
    };
    saveLatest(result);
    setStage("results");
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setNotes("");
    setStage("intro");
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Degree Fit (MVP)</h1>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            A decision tool — not a personality test. Use it to expose trade-offs.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setStage("intro")}
            style={btnStyle("ghost")}
          >
            Home
          </button>
          <button
            onClick={resetAll}
            style={btnStyle("danger")}
          >
            Reset
          </button>
        </div>
      </header>

      <div style={{ height: 16 }} />

      {stage === "intro" && (
        <Card>
          <h2 style={{ marginTop: 0 }}>What this does (and what it doesn’t)</h2>
          <ul style={{ marginTop: 8, opacity: 0.9 }}>
            <li>Gives you a structured “fit” snapshot across different degree directions.</li>
            <li>Highlights mismatch signals that people usually ignore until late.</li>
            <li><b>Does not</b> “tell you your destiny.” If your answers are vague, your output will be vague.</li>
          </ul>

          <div style={{ height: 12 }} />

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <Card>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Devil’s advocate check</div>
              <div style={{ opacity: 0.9, fontSize: 14 }}>
                If you’re hoping the app “proves” you should switch degrees, that’s backwards.
                The goal is to identify what you’re optimizing for (money, meaning, lifestyle, status, etc.)
                and whether your current degree matches those constraints.
              </div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Next evolution (later)</div>
              <div style={{ opacity: 0.9, fontSize: 14 }}>
                Once students repeatedly return for better guidance, you can add:
                expert sessions, mentor matching, and industry pathways. Don’t build that until you’ve
                proven retention.
              </div>
            </Card>
          </div>

          <div style={{ height: 14 }} />

          <button onClick={() => setStage("quiz")} style={btnStyle("primary")}>
            Start assessment
          </button>

          {saved && (
            <button onClick={() => setStage("results")} style={{ ...btnStyle("ghost"), marginLeft: 8 }}>
              View saved result
            </button>
          )}
        </Card>
      )}

      {stage === "quiz" && (
        <div style={{ display: "grid", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Assessment</div>
                <div style={{ opacity: 0.85, fontSize: 13 }}>Answer honestly as if you had to live with it for 3 years.</div>
              </div>
              <div style={{ minWidth: 220 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.8 }}>
                  <span>Completion</span>
                  <span>{completion}%</span>
                </div>
                <ProgressBar value={completion} />
              </div>
            </div>
          </Card>

          {questions.map((q, idx) => (
            <Card key={q.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <div style={{ fontWeight: 650 }}>
                  {idx + 1}. {q.prompt}
                </div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  maps to: {traitLabel[q.trait]}
                </div>
              </div>

              <div style={{ height: 10 }} />

              <Likert
                value={answers[q.id] ?? 3}
                onChange={(v) => setAnswer(q.id, v)}
              />

              <div style={{ height: 8 }} />

              <div style={{ opacity: 0.75, fontSize: 12 }}>
                1 = strongly disagree · 3 = neutral · 5 = strongly agree
              </div>
            </Card>
          ))}

          <Card>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any constraints? e.g., 'I can’t move cities', 'I need income quickly', 'I hate night shifts'..."
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #22304b",
                background: "#0a1020",
                color: "#e8eefc",
                resize: "vertical",
              }}
            />
            <div style={{ height: 12 }} />
            <button onClick={finalize} style={btnStyle("primary")}>
              See results
            </button>
          </Card>
        </div>
      )}

      {stage === "results" && (
        <div style={{ display: "grid", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0 }}>Your results</h2>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  The “fit” is only as good as your honesty. If you answered aspirationally, this will mislead you.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStage("quiz")} style={btnStyle("ghost")}>
                  Edit answers
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>Top matches</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {fits.slice(0, 5).map((f) => (
                <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 650 }}>{f.label}</div>
                    <div style={{ opacity: 0.75, fontSize: 12 }}>{Math.round(f.fit)} / 100</div>
                    <ProgressBar value={f.fit} />
                  </div>
                  <div style={{ textAlign: "right", opacity: 0.85, fontSize: 13 }}>
                    Fit: <b>{Math.round(f.fit)}%</b>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>Trait snapshot</h3>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {(Object.keys(traitScores) as TraitKey[]).map((k) => (
                <div key={k} style={{ padding: 12, borderRadius: 12, border: "1px solid #22304b", background: "#0a1020" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.85 }}>
                    <span>{traitLabel[k]}</span>
                    <span><b>{Math.round(traitScores[k])}</b></span>
                  </div>
                  <div style={{ height: 8 }} />
                  <ProgressBar value={traitScores[k]} />
                </div>
              ))}
            </div>
          </Card>

          {redFlags.length > 0 && (
            <Card>
              <h3 style={{ marginTop: 0 }}>Mismatch signals (don’t ignore these)</h3>
              <ul style={{ opacity: 0.9 }}>
                {redFlags.map((f, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{f}</li>
                ))}
              </ul>
              <div style={{ opacity: 0.8, fontSize: 13 }}>
                These are prompts. If one stings, that’s usually the point.
              </div>
            </Card>
          )}

          {topProfile && (
            <Card>
              <h3 style={{ marginTop: 0 }}>If you pursue: {topProfile.label}</h3>
              <div style={{ opacity: 0.9 }}>{topProfile.description}</div>

              <div style={{ height: 12 }} />

              <div style={{ display: "grid", gap: 12 }}>
                {topProfile.suggestions.map((s, idx) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 12, border: "1px solid #22304b", background: "#0a1020" }}>
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div style={{ opacity: 0.9, marginTop: 6 }}>{s.why}</div>
                    <div style={{ marginTop: 8, opacity: 0.85 }}>
                      <div style={{ fontWeight: 650, marginBottom: 6 }}>Next steps</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {s.nextSteps.map((ns, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{ns}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 style={{ marginTop: 0 }}>Export</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                style={btnStyle("ghost")}
                onClick={() => {
                  const payload: AssessmentResult = {
                    createdAtISO: new Date().toISOString(),
                    answers,
                    traitScores,
                    degreeFits: fits,
                    redFlags,
                    notes,
                  };
                  navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                  alert("Copied JSON to clipboard.");
                }}
              >
                Copy JSON
              </button>

              <button
                style={btnStyle("ghost")}
                onClick={() => {
                  const text =
                    `Degree Fit Result\n\nTop matches:\n` +
                    fits
                      .slice(0, 5)
                      .map((f) => `- ${f.label}: ${Math.round(f.fit)}%`)
                      .join("\n") +
                    `\n\nRed flags:\n` +
                    (redFlags.length ? redFlags.map((r) => `- ${r}`).join("\n") : "- None flagged") +
                    `\n\nNotes:\n${notes || "(none)"}`;

                  navigator.clipboard.writeText(text);
                  alert("Copied summary to clipboard.");
                }}
              >
                Copy summary
              </button>
            </div>
          </Card>
        </div>
      )}

      <footer style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
        MVP tip: don’t add “mentor matching” until you can show repeated usage + people asking for follow-up help.
      </footer>
    </div>
  );
}

function Likert(props: { value: number; onChange: (v: number) => void }) {
  const { value, onChange } = props;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            padding: "10px 12px",
            minWidth: 46,
            borderRadius: 12,
            border: "1px solid #22304b",
            background: n === value ? "#5aa2ff" : "#0a1020",
            color: n === value ? "#041022" : "#e8eefc",
            cursor: "pointer",
            fontWeight: 650,
          }}
          aria-label={`Select ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function btnStyle(kind: "primary" | "ghost" | "danger"): React.CSSProperties {
  if (kind === "primary") {
    return {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #2d62a8",
      background: "#5aa2ff",
      color: "#041022",
      fontWeight: 750,
      cursor: "pointer",
    };
  }
  if (kind === "danger") {
    return {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #6b2b2b",
      background: "#2a1212",
      color: "#ffb0b0",
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #22304b",
    background: "#0a1020",
    color: "#e8eefc",
    fontWeight: 650,
    cursor: "pointer",
  };
}
