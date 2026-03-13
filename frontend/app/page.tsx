"use client";
import { useState, useRef } from "react";
import { submitFinancialData, predictSavings } from "../utils/api";

type ExpenseKey = "rent" | "food" | "utilities" | "transport" | "entertainment" | "healthcare";

// SVG Line Chart
function SavingsChart({ past, predicted }: { past: number[]; predicted: number[] }) {
  const allValues = [...past, ...predicted];
  const max = Math.max(...allValues) * 1.15 || 1;
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;
  const W = 620; const H = 200;
  const PAD = { top: 20, right: 24, bottom: 36, left: 58 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const total = past.length + predicted.length;
  const xStep = cW / (total - 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) => PAD.top + cH - ((v - min) / range) * cH;
  const pastPts = past.map((v, i) => `${toX(i)},${toY(v)}`);
  const pastPath = `M ${pastPts.join(" L ")}`;
  const predPath = `M ${toX(past.length - 1)},${toY(past[past.length - 1])} ` +
    predicted.map((v, i) => `L ${toX(past.length + i)},${toY(v)}`).join(" ");
  const areaPath = `M ${toX(0)},${toY(min)} L ${pastPts.join(" L ")} L ${toX(past.length - 1)},${toY(min)} Z`;
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + (range * i) / ticks);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date().getMonth();
  const labels = allValues.map((_, i) => months[(now - past.length + 1 + i + 12) % 12]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={toY(tick)} x2={W - PAD.right} y2={toY(tick)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            ${tick >= 1000 ? `${(tick/1000).toFixed(1)}k` : tick.toFixed(0)}
          </text>
        </g>
      ))}
      <line x1={toX(past.length-1)} y1={PAD.top} x2={toX(past.length-1)} y2={PAD.top+cH} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
      <text x={toX(past.length-1)+5} y={PAD.top+12} fontSize="9" fill="#64748b">forecast →</text>
      <path d={areaPath} fill="url(#ag)" />
      <path d={pastPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={predPath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
      {past.map((v, i) => <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />)}
      {predicted.map((v, i) => <circle key={`f${i}`} cx={toX(past.length+i)} cy={toY(v)} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />)}
      {labels.map((label, i) => (
        <text key={i} x={toX(i)} y={H-8} textAnchor="middle" fontSize="10" fill={i >= past.length ? "#0ea5e9" : "#94a3b8"} fontWeight={i >= past.length ? "600" : "400"}>
          {label}
        </text>
      ))}
    </svg>
  );
}

// Bar 
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
    </div>
  );
}

// Score Ring
function ScoreRing({ score }: { score: number }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const dash = (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 70 70)" />
      <text x="70" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>{score}</text>
      <text x="70" y="82" textAnchor="middle" fontSize="11" fill="#94a3b8">/ 100</text>
    </svg>
  );
}

// Save Modal
function SaveModal({
  onClose,
  onSaveJSON,
  onSavePrint,
  saving,
}: {
  onClose: () => void;
  onSaveJSON: () => void;
  onSavePrint: () => void;
  saving: boolean;
}) {
  const C = {
    surface: "#ffffff", border: "#e2e8f0", text: "#0f172a",
    muted: "#64748b", accent: "#2563eb", bg: "#f8fafc",
  };
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "1rem",
    }} onClick={onClose}>
      <div
        style={{
          background: C.surface, borderRadius: "16px",
          border: `1px solid ${C.border}`, padding: "2rem",
          maxWidth: "380px", width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text }}>Save Report</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: C.muted, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* JSON */}
          <button
            onClick={onSaveJSON}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", borderRadius: "10px",
              border: `1.5px solid ${C.border}`, background: C.bg,
              cursor: "pointer", width: "100%", textAlign: "left" as const,
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>📄</span>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "600", color: C.text }}>Download JSON</div>
              <div style={{ fontSize: "0.75rem", color: C.muted }}>Full raw data · importable</div>
            </div>
          </button>

          {/* Print / PDF */}
          <button
            onClick={onSavePrint}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", borderRadius: "10px",
              border: `1.5px solid ${C.accent}`, background: "#eff6ff",
              cursor: "pointer", width: "100%", textAlign: "left" as const,
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🖨️</span>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "600", color: C.accent }}>Print / Save as PDF</div>
              <div style={{ fontSize: "0.75rem", color: C.muted }}>Use browser print → Save as PDF</div>
            </div>
          </button>
        </div>

        <div style={{ fontSize: "0.74rem", color: C.muted, marginTop: "1rem", textAlign: "center" as const }}>
          Your data never leaves this device.
        </div>
      </div>
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [started, setStarted] = useState(false);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<Record<ExpenseKey, number>>({
    rent: 0, food: 0, utilities: 0, transport: 0, entertainment: 0, healthcare: 0
  });
  const [debts, setDebts] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const [savingsHistory, setSavingsHistory] = useState<string[]>(["","","","","",""]);
  const [result, setResult] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [step, setStep] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setLoadingAnalysis(true);
    try {
      const data = { income, expenses, debts, savings, investments: {} };
      const res = await submitFinancialData(userName, data);
      setResult(res);
      const filled = savingsHistory.map(Number).filter(v => v > 0);
      if (filled.length >= 2) {
        try { const pred = await predictSavings(userName, filled); setPrediction(pred); } catch {}
      }
    } catch (err) { console.error(err); }
    finally { setLoadingAnalysis(false); }
  };

  // Save handlers
  const handleSaveJSON = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date().getMonth();
    const payload = {
      generatedAt: new Date().toISOString(),
      user: userName,
      input: { income, expenses, debts, savings },
      analysis: result,
      forecast: prediction
        ? {
            pastMonths: prediction.past_savings.map((v: number, i: number) => ({
              month: months[(now - prediction.past_savings.length + 1 + i + 12) % 12],
              saved: v,
            })),
            projected: prediction.next_6_months_savings.map((v: number, i: number) => ({
              month: months[(now + 1 + i) % 12],
              projected: v,
            })),
          }
        : null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finsight-${userName.toLowerCase().replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveFeedback("JSON downloaded ✓");
    setTimeout(() => { setSaveFeedback(""); setShowSaveModal(false); }, 1800);
  };

  const handleSavePrint = () => {
    setShowSaveModal(false);
    setTimeout(() => window.print(), 200);
  };

  // Derived
  const totalExp = Object.values(expenses).reduce((a, b) => a + b, 0);
  const monthlyCashFlow = income - totalExp;
  const netWorth = savings - debts;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const nowMonth = new Date().getMonth();

  const C = {
    bg: "#f8fafc", surface: "#ffffff", border: "#e2e8f0",
    text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
    accent: "#2563eb", good: "#10b981", warn: "#f59e0b", bad: "#ef4444",
    goodBg: "#f0fdf4", warnBg: "#fffbeb", badBg: "#fef2f2",
  };

  const card: React.CSSProperties = {
    background: C.surface, borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    padding: "clamp(1rem, 3vw, 1.5rem)",
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: `1.5px solid ${C.border}`, background: "#fff",
    fontSize: "0.92rem", fontFamily: "system-ui, sans-serif",
    color: C.text, outline: "none", boxSizing: "border-box",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: "600",
    color: C.muted, marginBottom: "5px",
    letterSpacing: "0.05em", textTransform: "uppercase",
    fontFamily: "system-ui, sans-serif",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "11px 20px", borderRadius: "8px", border: "none",
    background: C.accent, color: "#fff", fontWeight: "600",
    fontSize: "0.88rem", cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
  };

  const btnOutline: React.CSSProperties = {
    padding: "11px 20px", borderRadius: "8px",
    border: `1.5px solid ${C.border}`, background: "#fff",
    color: C.muted, fontWeight: "500", fontSize: "0.88rem",
    cursor: "pointer", fontFamily: "system-ui, sans-serif",
  };

  const scoreColor = (s: number) => s >= 70 ? C.good : s >= 40 ? C.warn : C.bad;
  const scoreLabel = (s: number) => s >= 70 ? "Strong" : s >= 40 ? "Fair" : "Needs Work";

  const expenseCategories: { key: ExpenseKey; label: string; icon: string }[] = [
    { key: "rent", label: "Rent / Housing", icon: "🏠" },
    { key: "food", label: "Food & Groceries", icon: "🛒" },
    { key: "utilities", label: "Utilities", icon: "⚡" },
    { key: "transport", label: "Transport", icon: "🚗" },
    { key: "entertainment", label: "Entertainment", icon: "🎬" },
    { key: "healthcare", label: "Healthcare", icon: "🏥" },
  ];

  // LANDING
  if (!started) return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
        <div style={{ ...card, maxWidth: "440px", width: "100%", padding: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "clamp(1.2rem, 4vw, 1.5rem)", fontWeight: "800", color: C.text, marginBottom: "6px", letterSpacing: "-0.02em" }}>
              FinSight
            </div>
            <div style={{ fontSize: "0.85rem", color: C.muted }}>Personal Financial Intelligence</div>
          </div>
          <div style={{ padding: "1.25rem", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe", marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: "600", color: C.accent, marginBottom: "4px" }}>What you'll get</div>
            {["Financial health score (0–100)", "Expense breakdown & ratios", "Net worth & cash flow analysis", "6-month savings forecast with ML", "Personalised recommendations", "Downloadable JSON + PDF report"].map(f => (
              <div key={f} style={{ fontSize: "0.82rem", color: "#1e40af", display: "flex", gap: "8px", marginTop: "4px" }}>
                <span>→</span>{f}
              </div>
            ))}
          </div>
          <label style={lbl}>Your Name</label>
          <input
            style={{ ...inp, marginBottom: "1rem" }}
            placeholder="e.g. Name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && userName.trim() && setStarted(true)}
          />
          <button
            style={{ ...btnPrimary, width: "100%", opacity: !userName.trim() ? 0.5 : 1, cursor: !userName.trim() ? "not-allowed" : "pointer" }}
            disabled={!userName.trim()}
            onClick={() => setStarted(true)}
          >
            Start Analysis →
          </button>
        </div>
      </div>
    </>
  );

  // STEP FORM + RESULTS
  const stepLabels = ["Income", "Expenses", "Debt & Savings", "History"];

  return (
    <>
      {/* Global styles + print overrides */}
      <style>{`
        * { box-sizing: border-box; }

        /* Responsive grid helpers */
        .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .grid-6col { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
        .result-top { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; }

        @media (max-width: 600px) {
          .grid-2col { grid-template-columns: 1fr !important; }
          .grid-3col { grid-template-columns: 1fr 1fr !important; }
          .grid-6col { grid-template-columns: repeat(3, 1fr) !important; }
          .result-top { grid-template-columns: 1fr !important; }
          .result-top > div:first-child { flex-direction: row !important; gap: 1rem !important; align-items: center !important; justify-content: flex-start !important; }
        }

        @media (max-width: 400px) {
          .grid-3col { grid-template-columns: 1fr !important; }
          .grid-6col { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Print styles */
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          header { position: static !important; box-shadow: none !important; }
          .print-break { page-break-before: always; }
        }

        /* Scroll smooth */
        html { scroll-behavior: smooth; }

        /* Step nav scroll on mobile */
        .step-nav { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .step-nav::-webkit-scrollbar { height: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>

        {/* Header */}
        <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 clamp(1rem, 3vw, 2rem)", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ fontWeight: "800", fontSize: "1rem", color: C.text, letterSpacing: "-0.01em" }}>FinSight</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* # Save button — only shown when result exists */}
            {result && (
              <button
                className="no-print"
                onClick={() => setShowSaveModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  background: C.accent, color: "#fff",
                  border: "none", fontWeight: "600", fontSize: "0.82rem",
                  cursor: "pointer", fontFamily: "system-ui, sans-serif",
                  boxShadow: "0 1px 6px rgba(37,99,235,0.3)",
                  transition: "opacity 0.15s",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>💾</span>
                <span>Save</span>
              </button>
            )}
            <div style={{ fontSize: "0.8rem", color: C.muted, background: C.bg, padding: "5px 12px", borderRadius: "6px", border: `1px solid ${C.border}`, whiteSpace: "nowrap", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </div>
          </div>
        </header>

        {/* Save feedback toast */}
        {saveFeedback && (
          <div style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            background: "#0f172a", color: "#fff", padding: "10px 20px",
            borderRadius: "50px", fontSize: "0.85rem", fontWeight: "600",
            zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}>
            {saveFeedback}
          </div>
        )}

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)" }}>

          {/* INPUT FORM */}
          {!result && (
            <>
              {/* Progress stepper */}
              <div className="step-nav no-print" style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2rem", paddingBottom: "4px" }}>
                {stepLabels.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : undefined, minWidth: 0 }}>
                    <div onClick={() => setStep(i)} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "6px 0", flexShrink: 0 }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: step === i ? C.accent : i < step ? C.good : C.bg,
                        border: `2px solid ${step === i ? C.accent : i < step ? C.good : C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: "700",
                        color: step === i || i < step ? "#fff" : C.subtle,
                        flexShrink: 0,
                      }}>
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: "clamp(0.7rem, 2vw, 0.8rem)", fontWeight: step === i ? "600" : "400", color: step === i ? C.text : C.subtle, whiteSpace: "nowrap" }}>{s}</span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div style={{ flex: 1, height: "2px", background: i < step ? C.good : C.border, margin: "0 6px", minWidth: "8px" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 0: Income */}
              {step === 0 && (
                <div style={card}>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Monthly Income</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted, marginBottom: "1.5rem" }}>Enter your total monthly take-home pay after tax.</div>
                  <label style={lbl}>Monthly Net Income</label>
                  <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.subtle, fontWeight: "600" }}>$</span>
                    <input type="number" placeholder="5,000" value={income || ""} onChange={e => setIncome(Number(e.target.value))} style={{ ...inp, paddingLeft: "26px" }} />
                  </div>
                  {income > 0 && (
                    <div className="grid-2col" style={{ marginBottom: "1.5rem" }}>
                      {[
                        { label: "Annual Income", val: `$${(income * 12).toLocaleString()}` },
                        { label: "20% Savings Target", val: `$${(income * 0.2).toLocaleString()}/mo` },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ padding: "12px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                          <div style={{ fontSize: "0.7rem", color: C.accent, fontWeight: "600", marginBottom: "2px" }}>{label}</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setStep(1)} disabled={!income} style={{ ...btnPrimary, width: "100%", opacity: income ? 1 : 0.4, cursor: income ? "pointer" : "not-allowed" }}>
                    Next: Expenses →
                  </button>
                </div>
              )}

              {/* Step 1: Expenses */}
              {step === 1 && (
                <div style={card}>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Monthly Expenses</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted, marginBottom: "1.5rem" }}>Enter your average monthly spending per category.</div>
                  <div className="grid-2col" style={{ marginBottom: "1rem" }}>
                    {expenseCategories.map(({ key, label, icon }) => (
                      <div key={key}>
                        <label style={lbl}>{icon} {label}</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.subtle, fontWeight: "600" }}>$</span>
                          <input type="number" placeholder="0" value={expenses[key] || ""} onChange={e => setExpenses({ ...expenses, [key]: Number(e.target.value) })} style={{ ...inp, paddingLeft: "26px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalExp > 0 && income > 0 && (
                    <div style={{ padding: "12px 14px", background: totalExp / income > 0.8 ? C.badBg : totalExp / income > 0.6 ? C.warnBg : C.goodBg, borderRadius: "8px", marginBottom: "1rem", border: `1px solid ${totalExp / income > 0.8 ? "#fecaca" : totalExp / income > 0.6 ? "#fde68a" : "#bbf7d0"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", flexWrap: "wrap", gap: "4px" }}>
                        <span style={{ color: C.muted }}>Total expenses</span>
                        <span style={{ fontWeight: "700", color: C.text }}>${totalExp.toLocaleString()} / mo</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginTop: "4px", flexWrap: "wrap", gap: "4px" }}>
                        <span style={{ color: C.muted }}>% of income</span>
                        <span style={{ fontWeight: "700", color: totalExp / income > 0.8 ? C.bad : totalExp / income > 0.6 ? C.warn : C.good }}>
                          {((totalExp / income) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setStep(0)} style={btnOutline}>← Back</button>
                    <button onClick={() => setStep(2)} style={{ ...btnPrimary, flex: 1 }}>Next: Debt & Savings →</button>
                  </div>
                </div>
              )}

              {/* Step 2: Debt & Savings */}
              {step === 2 && (
                <div style={card}>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Debt & Savings</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted, marginBottom: "1.5rem" }}>Your current financial position — all debts and total savings.</div>
                  <div className="grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div>
                      <label style={lbl}>💳 Total Debts</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.subtle, fontWeight: "600" }}>$</span>
                        <input type="number" placeholder="0" value={debts || ""} onChange={e => setDebts(Number(e.target.value))} style={{ ...inp, paddingLeft: "26px" }} />
                      </div>
                      <div style={{ fontSize: "0.75rem", color: C.subtle, marginTop: "4px" }}>Credit cards, loans, etc.</div>
                    </div>
                    <div>
                      <label style={lbl}>🏦 Total Savings</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.subtle, fontWeight: "600" }}>$</span>
                        <input type="number" placeholder="0" value={savings || ""} onChange={e => setSavings(Number(e.target.value))} style={{ ...inp, paddingLeft: "26px" }} />
                      </div>
                      <div style={{ fontSize: "0.75rem", color: C.subtle, marginTop: "4px" }}>Bank accounts, emergency fund</div>
                    </div>
                  </div>

                  <div style={{ padding: "14px", background: netWorth >= 0 ? C.goodBg : C.badBg, borderRadius: "8px", border: `1px solid ${netWorth >= 0 ? "#bbf7d0" : "#fecaca"}`, marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: "600", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "4px" }}>Net Worth Preview</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: netWorth >= 0 ? C.good : C.bad }}>
                      {netWorth >= 0 ? "+" : ""}${netWorth.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: "2px" }}>Savings minus total debts</div>
                  </div>

                  {income > 0 && savings > 0 && (
                    <div style={{ padding: "12px 14px", background: savings >= income * 3 ? C.goodBg : C.warnBg, borderRadius: "8px", border: `1px solid ${savings >= income * 3 ? "#bbf7d0" : "#fde68a"}`, marginBottom: "1.5rem", fontSize: "0.82rem" }}>
                      <span style={{ fontWeight: "600", color: savings >= income * 3 ? C.good : C.warn }}>
                        {savings >= income * 6 ? "✓ Excellent emergency fund" : savings >= income * 3 ? "✓ Adequate emergency fund (3+ months)" : "⚠ Build emergency fund"}
                      </span>
                      <span style={{ color: C.muted }}> — target is 3–6 months of income (${(income * 3).toLocaleString()}–${(income * 6).toLocaleString()})</span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setStep(1)} style={btnOutline}>← Back</button>
                    <button onClick={() => setStep(3)} style={{ ...btnPrimary, flex: 1 }}>Next: Savings History →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Savings History */}
              {step === 3 && (
                <div style={card}>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Savings History</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted, marginBottom: "1.5rem" }}>
                    Enter how much you saved each month. We use linear regression to forecast your next 6 months. Minimum 2 months required.
                  </div>
                  <div className="grid-3col" style={{ marginBottom: "1.25rem" }}>
                    {savingsHistory.map((val, i) => (
                      <div key={i}>
                        <label style={{ ...lbl, color: C.subtle }}>{months[(nowMonth - 5 + i + 12) % 12]}</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: C.subtle, fontSize: "0.85rem" }}>$</span>
                          <input type="number" placeholder="0" value={val}
                            onChange={e => { const u = [...savingsHistory]; u[i] = e.target.value; setSavingsHistory(u); }}
                            style={{ ...inp, paddingLeft: "22px", fontSize: "0.88rem" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: "8px", fontSize: "0.8rem", color: "#1e40af", border: "1px solid #bfdbfe", marginBottom: "1.25rem" }}>
                    ℹ️ Filled {savingsHistory.filter(v => Number(v) > 0).length} of 6 months — {savingsHistory.filter(v => Number(v) > 0).length >= 2 ? "ready to forecast ✓" : "add at least 2 months"}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setStep(2)} style={btnOutline}>← Back</button>
                    <button onClick={handleSubmit} disabled={loadingAnalysis} style={{ ...btnPrimary, flex: 1, opacity: loadingAnalysis ? 0.6 : 1 }}>
                      {loadingAnalysis ? "Running analysis..." : "Run Full Analysis →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* RESULTS */}
          {result && (
            <div ref={resultsRef} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Print header (hidden on screen) */}
              <div style={{ display: "none" }} className="print-header">
                <div style={{ fontWeight: "800", fontSize: "1.4rem", marginBottom: "4px" }}>FinSight Report</div>
                <div style={{ fontSize: "0.9rem", color: C.muted }}>{userName} · Generated {new Date().toLocaleDateString()}</div>
                <hr style={{ margin: "1rem 0", borderColor: C.border }} />
              </div>
              <style>{`.print-header { display: none; } @media print { .print-header { display: block !important; } }`}</style>
{/* 
              Mobile save button (redundant with header but more accessible)
              <div className="no-print" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowSaveModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "9px 16px", borderRadius: "8px",
                    background: "#f0f9ff", color: C.accent,
                    border: `1.5px solid #bfdbfe`, fontWeight: "600",
                    fontSize: "0.85rem", cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <span>💾</span> Save Report
                </button>
              </div> */}

              {/* Score + Summary */}
              <div className="result-top">
                <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 2rem" }}>
                  <ScoreRing score={result.financial_health_score} />
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: scoreColor(result.financial_health_score), marginTop: "8px" }}>
                    {scoreLabel(result.financial_health_score)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: C.muted, marginTop: "2px" }}>Financial Health</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Monthly Cash Flow", val: `${monthlyCashFlow >= 0 ? "+" : ""}$${monthlyCashFlow.toLocaleString()}`, good: monthlyCashFlow >= 0, desc: "Income minus expenses" },
                    { label: "Net Worth", val: `${netWorth >= 0 ? "+" : ""}$${netWorth.toLocaleString()}`, good: netWorth >= 0, desc: "Savings minus debts" },
                    { label: "Savings Rate", val: `${(result.savings_ratio * 100).toFixed(1)}%`, good: result.savings_ratio >= 0.2, desc: "Target: 20%" },
                  ].map(({ label, val, good, desc }) => (
                    <div key={label} style={{ ...card, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: "600", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{label}</div>
                        <div style={{ fontSize: "0.75rem", color: C.subtle, marginTop: "1px" }}>{desc}</div>
                      </div>
                      <div style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: "800", color: good ? C.good : C.bad, whiteSpace: "nowrap" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratios */}
              <div style={card}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Financial Ratios</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { label: "Savings Ratio", val: result.savings_ratio, threshold: 0.2, higherBetter: true, desc: "Target ≥ 20% of income" },
                    { label: "Expense Ratio", val: result.expense_ratio, threshold: 0.6, higherBetter: false, desc: "Target ≤ 60% of income" },
                    { label: "Debt Ratio", val: result.debt_ratio, threshold: 0.4, higherBetter: false, desc: "Target ≤ 40% of income" },
                  ].map(({ label, val, threshold, higherBetter, desc }) => {
                    const good = higherBetter ? val >= threshold : val <= threshold;
                    const color = good ? C.good : val > threshold * 1.5 ? C.bad : C.warn;
                    return (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "4px" }}>
                          <div>
                            <span style={{ fontSize: "0.88rem", fontWeight: "600", color: C.text }}>{label}</span>
                            <span style={{ fontSize: "0.75rem", color: C.subtle, marginLeft: "8px" }}>{desc}</span>
                          </div>
                          <span style={{ fontSize: "0.95rem", fontWeight: "700", color }}>{(val * 100).toFixed(1)}%</span>
                        </div>
                        <Bar pct={val * 100} color={color} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expense breakdown */}
              <div style={card}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Expense Breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {expenseCategories.filter(({ key }) => expenses[key] > 0).map(({ key, label, icon }) => {
                    const pct = income > 0 ? (expenses[key] / income) * 100 : 0;
                    const color = pct > 40 ? C.bad : pct > 20 ? C.warn : C.accent;
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", flexWrap: "wrap", gap: "4px" }}>
                          <span style={{ fontSize: "0.85rem", color: C.text }}>{icon} {label}</span>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.82rem", color: C.muted }}>{pct.toFixed(0)}% of income</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: C.text }}>${expenses[key].toLocaleString()}</span>
                          </div>
                        </div>
                        <Bar pct={pct} color={color} />
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: `1px solid ${C.border}`, fontSize: "0.85rem", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "600", color: C.text }}>Total Expenses</span>
                    <span style={{ fontWeight: "700", color: C.text }}>${totalExp.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              {/* Debt analysis */}
              {debts > 0 && (
                <div style={card}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Debt Analysis</div>
                  <div className="grid-3col">
                    {[
                      { label: "Total Debt", val: `$${debts.toLocaleString()}`, sub: "Outstanding balance" },
                      { label: "Debt-to-Income", val: `${(result.debt_ratio * 100).toFixed(0)}%`, sub: result.debt_ratio <= 0.4 ? "Healthy range" : "Above target" },
                      { label: "Est. Payoff", val: monthlyCashFlow > 0 ? `${Math.ceil(debts / monthlyCashFlow)} mo` : "N/A", sub: "At current cash flow rate" },
                    ].map(({ label, val, sub }) => (
                      <div key={label} style={{ padding: "14px", background: C.bg, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: "0.72rem", color: C.muted, fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</div>
                        <div style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", fontWeight: "800", color: C.text }}>{val}</div>
                        <div style={{ fontSize: "0.72rem", color: C.subtle, marginTop: "2px" }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Savings Forecast */}
              <div style={card}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px" }}>Savings Forecast</div>
                <div style={{ fontSize: "0.8rem", color: C.muted, marginBottom: "1.25rem" }}>ML-powered 6-month projection based on your savings history</div>
                {prediction ? (
                  <>
                    <SavingsChart past={prediction.past_savings} predicted={prediction.next_6_months_savings} />
                    <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "10px", flexWrap: "wrap" }}>
                      {[
                        { color: C.accent, label: "Past savings", dash: false },
                        { color: "#0ea5e9", label: "Projected", dash: true },
                      ].map(({ color, label, dash }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.78rem", color: C.muted }}>
                          <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke={color} strokeWidth="2.5" strokeDasharray={dash ? "5 3" : "none"} /></svg>
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="grid-6col" style={{ marginTop: "1.25rem" }}>
                      {prediction.next_6_months_savings.map((val: number, i: number) => (
                        <div key={i} style={{ padding: "10px 6px", background: "#eff6ff", borderRadius: "8px", textAlign: "center" as const, border: "1px solid #bfdbfe" }}>
                          <div style={{ fontSize: "0.68rem", color: C.accent, fontWeight: "600", marginBottom: "3px" }}>{months[(nowMonth + 1 + i) % 12]}</div>
                          <div style={{ fontSize: "0.82rem", fontWeight: "700", color: C.text }}>${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "2.5rem", textAlign: "center" as const, color: C.subtle, fontSize: "0.85rem", background: C.bg, borderRadius: "8px" }}>
                    No savings history provided — go back to add monthly savings data for a forecast.
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "1rem" }}>Recommendations</div>
                  {result.recommendations.map((rec: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, marginBottom: "8px", fontSize: "0.85rem", color: C.text, alignItems: "flex-start" }}>
                      <span style={{ color: C.accent, fontWeight: "700", flexShrink: 0 }}>{i + 1}.</span>
                      {rec}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer actions */}
              <div className="no-print" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => { setResult(null); setPrediction(null); setStep(0); }} style={{ ...btnOutline, flex: 1, minWidth: "140px" }}>
                  ← New Analysis
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  style={{ ...btnPrimary, flex: 1, minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span>💾</span> Save Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          onClose={() => setShowSaveModal(false)}
          onSaveJSON={handleSaveJSON}
          onSavePrint={handleSavePrint}
          saving={false}
        />
      )}
    </>
  );
}