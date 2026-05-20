import { useState } from "react";
import { PALETTE } from "../../data/constants";

interface ReadingCardPageProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
  activePage?: string;
}

const NAV_ITEMS = [
  { key: "readerDashboard", label: "Dashboard",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "browseBooks",     label: "Browse Books", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "myRecords",       label: "My Records",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: "readingCard",     label: "Reading Card", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: "profile",         label: "Profile",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

type Duration = "1" | "3" | "12";

interface Plan {
  label: string;
  color: string;
  bg: string;
  border: string;
  badge: string | null;
  features: string[];
  prices: Record<Duration, { price: number; original: number | null }>;
}

const PLANS: Record<"normal" | "vip", Plan> = {
  normal: {
    label: "Normal",
    color: PALETTE.burntOrange,
    bg: "#fff8f5",
    border: PALETTE.burntOrange,
    badge: null,
    features: ["Access to general collection", "Borrow up to 5 books", "45 days return period", "1 renewal per book", "Standard support"],
    prices: { "1": { price: 2.99, original: 6.99 }, "3": { price: 7.99, original: null }, "12": { price: 24.99, original: null } },
  },
  vip: {
    label: "VIP",
    color: "#b8860b",
    bg: "#fffbf0",
    border: "#d4a017",
    badge: "Most Popular",
    features: ["Access to rare & premium books", "Borrow up to 8 books", "60 days return period", "2 renewals per book", "Priority support", "Early access to new arrivals"],
    prices: { "1": { price: 4.99, original: 9.99 }, "3": { price: 13.99, original: null }, "12": { price: 49.99, original: null } },
  },
};

const DURATION_LABELS: Record<Duration, string> = { "1": "1 Month", "3": "3 Months", "12": "12 Months" };
const DURATION_SAVINGS: Record<Duration, string | null> = { "1": null, "3": "Save 11%", "12": "Save 30%" };

// ── Stat detail item ──────────────────────────────────────────────────────
function DetailItem({ icon, label, value, sub, subColor }: { icon: React.ReactNode; label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: PALETTE.blushCream, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 14.5, fontWeight: 600, color: PALETTE.darkNavy }}>{value}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 12, color: subColor ?? PALETTE.slateGrey }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────
function PlanCard({ type, plan, duration, selected, onSelect }: {
  type: "normal" | "vip";
  plan: typeof PLANS.normal;
  duration: Duration;
  selected: boolean;
  onSelect: () => void;
}) {
  const { price, original } = plan.prices[duration];
  const isVip = type === "vip";

  return (
    <div style={{
      border: `2px solid ${selected ? plan.border : "#ede5e0"}`,
      borderRadius: 16,
      padding: "28px 28px 24px",
      background: selected ? plan.bg : "#fff",
      transition: "all 0.2s",
      position: "relative",
      cursor: "pointer",
      boxShadow: selected ? `0 4px 20px ${plan.color}22` : "none",
    }}
      onClick={onSelect}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#d4a017", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {isVip ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={plan.color} stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            )}
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: PALETTE.darkNavy }}>{plan.label}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey }}>{isVip ? "Premium access for power readers" : "Perfect for casual readers"}</p>
        </div>

        {/* Radio */}
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? plan.border : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          {selected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: plan.border }} />}
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f0e8e4" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: plan.color }}>${price}</span>
          <span style={{ fontSize: 13, color: PALETTE.slateGrey }}>/ {DURATION_LABELS[duration].toLowerCase()}</span>
        </div>
        {original && (
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>
            <span style={{ textDecoration: "line-through" }}>${original}</span>
            <span style={{ color: "#e05a5a", fontWeight: 600, marginLeft: 6 }}>Sale!</span>
          </p>
        )}
      </div>

      {/* Features */}
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: PALETTE.darkNavy }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(); }}
        style={{ marginTop: 24, width: "100%", padding: "12px 0", border: `1.5px solid ${plan.border}`, borderRadius: 9, background: selected ? plan.color : "transparent", color: selected ? "#fff" : plan.color, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}
        onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = plan.color + "15"; } }}
        onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = "transparent"; } }}
      >
        {selected ? "Selected" : `Choose ${plan.label}`}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ReadingCardPage({ onLogout, onNavigate, activePage = "readingCard" }: ReadingCardPageProps) {
  const [duration, setDuration] = useState<Duration>("1");
  const [selectedPlan, setSelectedPlan] = useState<"normal" | "vip">("normal");
  const [renewed, setRenewed] = useState(false);
  const [showUpgradeMsg, setShowUpgradeMsg] = useState(false);

  const handleSubscribe = () => {
    setShowUpgradeMsg(true);
    setTimeout(() => setShowUpgradeMsg(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: PALETTE.darkNavy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 54, position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>Library System</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: activePage === item.key ? 600 : 400, background: activePage === item.key ? PALETTE.burntOrange : "transparent", color: activePage === item.key ? "#fff" : PALETTE.blushCream, transition: "background 0.18s" }}
              onMouseEnter={e => { if (activePage !== item.key) e.currentTarget.style.background = "rgba(247,235,232,0.12)"; }}
              onMouseLeave={e => { if (activePage !== item.key) e.currentTarget.style.background = "transparent"; }}
            >{item.icon} {item.label}</button>
          ))}
        </div>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, cursor: "pointer", opacity: 0.8, flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </nav>

      <main style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>Reading Card</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>View and manage your library card</p>

        {/* ── Current card ── */}
        <div style={{ background: `linear-gradient(135deg, #f9ede8 0%, #fdf6f0 100%)`, border: `1.5px solid ${PALETTE.burntOrange}44`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <div>
                <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>Library Reading Card</p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>City Library System</p>
              </div>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 5, background: PALETTE.mintTeal, color: PALETTE.darkNavy, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Active
            </span>
          </div>

          {/* Card info grid */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px" }}>
            {[
              { label: "Card Number",  value: "RC-2025-0123" },
              { label: "Card Holder",  value: "John Doe"     },
              { label: "Issue Date",   value: "3/1/2025"     },
              { label: "Expiry Date",  value: "3/1/2026"     },
            ].map(f => (
              <div key={f.label}>
                <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey }}>{f.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 14.5, fontWeight: 600, color: PALETTE.darkNavy }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card details ── */}
        <div style={{ background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>Card Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <DetailItem
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
              label="Borrow Limit"
              value="2 / 5 books"
              sub={<div style={{ marginTop: 6, height: 5, background: "#f0e8e4", borderRadius: 4, width: 120 }}><div style={{ width: "40%", height: "100%", background: PALETTE.burntOrange, borderRadius: 4 }} /></div> as any}
            />
            <DetailItem
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Valid Until"
              value="3/1/2026"
              sub="365 days remaining"
              subColor={PALETTE.mintTeal}
            />
            <DetailItem
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              label="Annual Fee"
              value="$25"
              sub="Paid"
              subColor={PALETTE.mintTeal}
            />
            <DetailItem
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Card Status"
              value="Active"
              sub="Good standing"
            />
          </div>
        </div>

        {/* ── Card actions ── */}
        <div style={{ background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 16, padding: "24px 28px", marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>Card Actions</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setRenewed(true)} style={{ padding: "10px 22px", border: "none", borderRadius: 8, background: renewed ? PALETTE.mintTeal : PALETTE.burntOrange, color: renewed ? PALETTE.darkNavy : "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              {renewed ? "✓ Card Renewed" : "Renew Card"}
            </button>
            <button style={{ padding: "10px 22px", border: `1.5px solid ${PALETTE.mintTeal}`, borderRadius: 8, background: "transparent", color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
              Request Replacement
            </button>
            <button style={{ padding: "10px 22px", border: "1.5px solid #ddd", borderRadius: 8, background: "transparent", color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
              View Transaction History
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            UPGRADE / SUBSCRIPTION SECTION
        ══════════════════════════════════════════════════════════ */}
        <div style={{ borderTop: "2px dashed #e0d5d0", paddingTop: 36, marginBottom: 8 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: PALETTE.darkNavy }}>Upgrade Your Reading Experience</h2>
            <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey }}>Choose a plan that fits your reading habits</p>
          </div>

          {/* Duration toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 12, padding: 4, gap: 4 }}>
              {(["1", "3", "12"] as Duration[]).map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{ position: "relative", padding: "9px 22px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: duration === d ? 600 : 400, background: duration === d ? PALETTE.darkNavy : "transparent", color: duration === d ? "#fff" : PALETTE.slateGrey, transition: "all 0.18s" }}
                >
                  {DURATION_LABELS[d]}
                  {DURATION_SAVINGS[d] && (
                    <span style={{ position: "absolute", top: -10, right: -4, background: "#e05a5a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                      {DURATION_SAVINGS[d]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            {(["normal", "vip"] as const).map(type => (
              <PlanCard
                key={type}
                type={type}
                plan={PLANS[type]}
                duration={duration}
                selected={selectedPlan === type}
                onSelect={() => setSelectedPlan(type)}
              />
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: PALETTE.darkNavy }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: PALETTE.blushCream, fontWeight: 600 }}>Feature</th>
                  <th style={{ padding: "14px 20px", textAlign: "center", color: PALETTE.blushCream, fontWeight: 600 }}>Normal</th>
                  <th style={{ padding: "14px 20px", textAlign: "center", color: "#ffd700", fontWeight: 600 }}>⭐ VIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Book Collection",    normal: "General",   vip: "General + Rare" },
                  { feature: "Borrow Limit",        normal: "5 books",   vip: "8 books"        },
                  { feature: "Return Period",        normal: "45 days",   vip: "60 days"        },
                  { feature: "Renewals per Book",   normal: "1",         vip: "2"              },
                  { feature: "Priority Support",    normal: "✗",         vip: "✓"              },
                  { feature: "Early Access",         normal: "✗",         vip: "✓"              },
                ].map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff", borderBottom: "1px solid #f0e8e4" }}>
                    <td style={{ padding: "13px 20px", color: PALETTE.darkNavy, fontWeight: 500 }}>{row.feature}</td>
                    <td style={{ padding: "13px 20px", textAlign: "center", color: row.normal === "✗" ? "#ccc" : PALETTE.slateGrey }}>{row.normal}</td>
                    <td style={{ padding: "13px 20px", textAlign: "center", color: row.vip === "✓" ? PALETTE.mintTeal : PALETTE.darkNavy, fontWeight: row.vip === "✓" ? 700 : 400 }}>{row.vip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subscribe CTA */}
          <div style={{ textAlign: "center" }}>
            {showUpgradeMsg ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: PALETTE.mintTeal + "33", border: `1.5px solid ${PALETTE.mintTeal}`, borderRadius: 10, padding: "14px 28px", color: PALETTE.darkNavy, fontWeight: 600, fontSize: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Successfully subscribed to {PLANS[selectedPlan].label} plan ({DURATION_LABELS[duration]})!
              </div>
            ) : (
              <>
                <button onClick={handleSubscribe}
                  style={{ padding: "14px 48px", border: "none", borderRadius: 10, background: selectedPlan === "vip" ? "#d4a017" : PALETTE.burntOrange, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${selectedPlan === "vip" ? "#d4a01744" : PALETTE.burntOrange + "44"}`, transition: "opacity 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Subscribe to {PLANS[selectedPlan].label} — ${PLANS[selectedPlan].prices[duration].price} / {DURATION_LABELS[duration].toLowerCase()}
                </button>
                <p style={{ margin: "10px 0 0", fontSize: 12, color: PALETTE.slateGrey }}>Cancel anytime. No hidden fees.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}