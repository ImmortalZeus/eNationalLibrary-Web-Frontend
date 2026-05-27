// src/pages/guest/ReadingCardPage.tsx
import { useState, useEffect } from "react";
import { PALETTE } from "../../data/constants";
import { useAuth } from "../../context/AuthContext";
import { readerService } from "../../services/reader.service";
import { readingCardService } from "../../services/reading-card.service";
import type { ReadingCardPublicDto, ReaderPublicDto } from "../../types";

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
  months: Record<Duration, number>;
}

const PLANS: Record<"normal" | "vip", Plan> = {
  normal: {
    label: "Normal", color: PALETTE.burntOrange, bg: "#fff8f5",
    border: PALETTE.burntOrange, badge: null,
    features: ["Access to general collection", "Borrow up to 5 books", "30 days return period", "1 renewal per book", "Standard support"],
    prices: { "1": { price: 2.99, original: 6.99 }, "3": { price: 7.99, original: null }, "12": { price: 24.99, original: null } },
    months: { "1": 1, "3": 3, "12": 12 },
  },
  vip: {
    label: "VIP", color: "#b8860b", bg: "#fffbf0",
    border: "#d4a017", badge: "Most Popular",
    features: ["Access to rare & premium books", "Borrow up to 8 books", "45 days return period", "2 renewals per book", "Priority support", "Early access to new arrivals"],
    prices: { "1": { price: 4.99, original: 9.99 }, "3": { price: 13.99, original: null }, "12": { price: 49.99, original: null } },
    months: { "1": 1, "3": 3, "12": 12 },
  },
};

const DURATION_LABELS: Record<Duration, string> = { "1": "1 Month", "3": "3 Months", "12": "12 Months" };
const DURATION_SAVINGS: Record<Duration, string | null> = { "1": null, "3": "Save 11%", "12": "Save 30%" };

// ── Helpers ───────────────────────────────────────────────────────────────
function toISO(d: Date) { return d.toISOString().split("T")[0]; }

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function daysRemaining(expiryDate: string): number {
  const diff = new Date(expiryDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}

// Get the card that should currently be active (VIP takes priority)
function getActiveCard(cards: ReadingCardPublicDto[]): ReadingCardPublicDto | null {
  const active = cards.filter(c => !isExpired(c.expiryDate));
  // VIP takes priority
  const vip = active.find(c => c.type === "VIP");
  if (vip) return vip;
  return active.find(c => c.type === "Normal") ?? null;
}

// Get next card (Normal that will activate after VIP expires)
function getNextCard(cards: ReadingCardPublicDto[], activeCard: ReadingCardPublicDto | null): ReadingCardPublicDto | null {
  if (!activeCard || activeCard.type !== "VIP") return null;
  return cards.find(c => c.type === "Normal" && !isExpired(c.expiryDate) && c.readingCardId !== activeCard.readingCardId) ?? null;
}

// ── Detail item ───────────────────────────────────────────────────────────
function DetailItem({ icon, label, value, sub, subColor }: {
  icon: React.ReactNode; label: string; value: string;
  sub?: React.ReactNode; subColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: PALETTE.blushCream,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 14.5, fontWeight: 600, color: PALETTE.darkNavy }}>{value}</p>
        {sub && <div style={{ marginTop: 4, fontSize: 12, color: subColor ?? PALETTE.slateGrey }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────
function PlanCard({ type, plan, duration, selected, onSelect }: {
  type: "normal" | "vip"; plan: Plan;
  duration: Duration; selected: boolean; onSelect: () => void;
}) {
  const { price, original } = plan.prices[duration];
  const isVip = type === "vip";
  return (
    <div style={{
      border: `2px solid ${selected ? plan.border : "#ede5e0"}`, borderRadius: 16,
      padding: "28px 28px 24px", background: selected ? plan.bg : "#fff",
      transition: "all 0.2s", position: "relative", cursor: "pointer",
      boxShadow: selected ? `0 4px 20px ${plan.color}22` : "none",
    }} onClick={onSelect}>
      {plan.badge && (
        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
          background: "#d4a017", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
          {plan.badge}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {isVip
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill={plan.color} stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            }
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: PALETTE.darkNavy }}>{plan.label}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey }}>
            {isVip ? "Premium access for power readers" : "Perfect for casual readers"}
          </p>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: "50%",
          border: `2px solid ${selected ? plan.border : "#ccc"}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          {selected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: plan.border }} />}
        </div>
      </div>
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
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: PALETTE.darkNavy }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {f}
          </li>
        ))}
      </ul>
      <button onClick={e => { e.stopPropagation(); onSelect(); }} style={{
        marginTop: 24, width: "100%", padding: "12px 0",
        border: `1.5px solid ${plan.border}`, borderRadius: 9,
        background: selected ? plan.color : "transparent",
        color: selected ? "#fff" : plan.color,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = plan.color + "15"; }}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
      >
        {selected ? "Selected" : `Choose ${plan.label}`}
      </button>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ plan, duration, newExpiry, actionLabel, onConfirm, onCancel, subscribing }: {
  plan: Plan;
  duration: Duration;
  newExpiry: string;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  subscribing: boolean;
}) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(64,78,92,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, backdropFilter: "blur(2px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: "36px 40px",
        maxWidth: 420, width: "100%",
        boxShadow: "0 16px 48px rgba(64,78,92,0.18)",
        textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: "50%",
          background: plan.color + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>

        <h2 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 700, color: PALETTE.darkNavy }}>
          Confirm Subscription
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
          {actionLabel}
        </p>

        {/* Summary */}
        <div style={{ background: PALETTE.blushCream, borderRadius: 12,
          padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
          {[
            { label: "Plan",       value: plan.label },
            { label: "Duration",   value: DURATION_LABELS[duration] },
            { label: "Price",      value: `$${plan.prices[duration].price}` },
            { label: "Valid Until", value: new Date(newExpiry).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "6px 0",
              borderBottom: "1px solid #f0e8e4" }}>
              <span style={{ fontSize: 13, color: PALETTE.slateGrey }}>{row.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: PALETTE.darkNavy }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px 0", border: "1.5px solid #ddd",
            borderRadius: 8, background: "transparent", color: PALETTE.slateGrey,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >Cancel</button>
          <button onClick={onConfirm} disabled={subscribing} style={{
            flex: 1, padding: "12px 0", border: "none", borderRadius: 8,
            background: plan.color, color: plan.label === "VIP" ? PALETTE.darkNavy : "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: subscribing ? "not-allowed" : "pointer",
            opacity: subscribing ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!subscribing) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => (e.currentTarget.style.opacity = subscribing ? "0.7" : "1")}
          >
            {subscribing ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ReadingCardPage({ onLogout, onNavigate, activePage = "readingCard" }: ReadingCardPageProps) {
  const { user, logout, readerId } = useAuth();
  const [reader, setReader]           = useState<ReaderPublicDto | null>(null);
  const [loading, setLoading]         = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [duration, setDuration]       = useState<Duration>("1");
  const [selectedPlan, setSelectedPlan] = useState<"normal" | "vip">("normal");

  useEffect(() => {
    if (!user?.sub) return;
    const fetch = async () => {
      setLoading(true);
      try {
        let r: ReaderPublicDto | null = null;
        if (readerId && readerId !== "null") {
          r = await readerService.findById(readerId);
        } else {
          r = await readerService.findByUserId(user.sub);
        }
        if (r) setReader(r);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.sub, readerId]);

  const allCards  = reader?.readingCards ?? [];
  const activeCard = getActiveCard(allCards);
  const nextCard   = getNextCard(allCards, activeCard);
  const days       = activeCard?.expiryDate ? daysRemaining(activeCard.expiryDate) : 0;
  const username   = reader?.user?.username ?? user?.username ?? "Reader";

  // Calculate what the new expiry will be
  const computeNewExpiry = (): string => {
    const plan     = PLANS[selectedPlan];
    const months   = plan.months[duration];
    const typeKey  = selectedPlan === "vip" ? "VIP" : "Normal";

    if (activeCard && activeCard.type === typeKey && !isExpired(activeCard.expiryDate)) {
      // Same type — extend from current expiry
      return toISO(addMonths(new Date(activeCard.expiryDate!), months));
    }
    // New type or no card — start from today
    return toISO(addMonths(new Date(), months));
  };

  // Build the action label for the confirm modal
  const buildActionLabel = (): string => {
    const plan    = PLANS[selectedPlan];
    const typeKey = selectedPlan === "vip" ? "VIP" : "Normal";

    if (activeCard && activeCard.type === typeKey && !isExpired(activeCard.expiryDate)) {
      return `Your ${plan.label} card will be extended by ${DURATION_LABELS[duration]}.`;
    }
    if (activeCard && activeCard.type !== typeKey && !isExpired(activeCard.expiryDate)) {
      if (selectedPlan === "vip") {
        return `VIP card activates immediately. Your Normal card will resume after VIP expires.`;
      }
      return `A new ${plan.label} card will be created starting today.`;
    }
    return `A new ${plan.label} card will be created for ${DURATION_LABELS[duration]}.`;
  };

  const handleSubscribe = async () => {
    if (!reader) return;
    setSubscribing(true);
    setError(null);
    try {
      const plan    = PLANS[selectedPlan];
      const months  = plan.months[duration];
      const typeKey = selectedPlan === "vip" ? "VIP" : "Normal";

      // Find existing active card of same type
      const sameTypeCard = allCards.find(
        c => c.type === typeKey && !isExpired(c.expiryDate)
      );

      if (sameTypeCard && sameTypeCard.expiryDate) {
        // Same type — extend expiry
        const newExpiry = toISO(addMonths(new Date(sameTypeCard.expiryDate), months));
        await readingCardService.update(sameTypeCard.readingCardId, {
          expiryDate: newExpiry,
          label: `${plan.label} — Extended`,
        });
      } else {
        // Different type or no card — create new
        const today  = new Date();
        const expiry = addMonths(today, months);
        await readingCardService.create({
          label:          `${plan.label} — ${DURATION_LABELS[duration]}`,
          type:           typeKey as "Normal" | "VIP",
          activationDate: toISO(today),
          expiryDate:     toISO(expiry),
          readerId:       reader.userId,
        });
      }

      // Refresh reader data
      let updated: ReaderPublicDto | null = null;
      if (readerId && readerId !== "null") {
        updated = await readerService.findById(readerId);
      } else {
        updated = await readerService.findByUserId(user!.sub);
      }
      if (updated) setReader(updated);

      setShowConfirm(false);
      setSuccessMsg(`Successfully subscribed to ${plan.label} plan (${DURATION_LABELS[duration]})!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setError("Failed to subscribe. Please try again.");
      setShowConfirm(false);
    } finally {
      setSubscribing(false);
    }
  };
  const handleSubscribeClick = () => {
  const typeKey = selectedPlan === "vip" ? "VIP" : "Normal";

  // Block buying Normal when VIP is active
  if (typeKey === "Normal" && activeCard?.type === "VIP" && !isExpired(activeCard.expiryDate)) {
    setError(`You cannot buy a Normal card while your VIP card is active. Your Normal card will be available after your VIP card expires on ${new Date(activeCard.expiryDate!).toLocaleDateString()}.`);
    return;
  }

  setError(null);
  setShowConfirm(true);
};
  const handleLogout = () => { logout(); onLogout(); };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          plan={PLANS[selectedPlan]}
          duration={duration}
          newExpiry={computeNewExpiry()}
          actionLabel={buildActionLabel()}
          onConfirm={handleSubscribe}
          onCancel={() => setShowConfirm(false)}
          subscribing={subscribing}
        />
      )}

      {/* Navbar */}
      <nav style={{ background: PALETTE.darkNavy, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 28px", height: 54,
        position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
            Library System
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => onNavigate(item.key)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
              fontWeight: activePage === item.key ? 600 : 400,
              background: activePage === item.key ? PALETTE.burntOrange : "transparent",
              color: activePage === item.key ? "#fff" : PALETTE.blushCream,
              transition: "background 0.18s",
            }}
              onMouseEnter={e => { if (activePage !== item.key) e.currentTarget.style.background = "rgba(247,235,232,0.12)"; }}
              onMouseLeave={e => { if (activePage !== item.key) e.currentTarget.style.background = "transparent"; }}
            >{item.icon} {item.label}</button>
          ))}
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 6, background: "transparent",
          border: "none", color: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, cursor: "pointer", opacity: 0.8, flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </nav>

      <main style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif",
          fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>Reading Card</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>
          View and manage your library card
        </p>

        {loading ? (
          <p style={{ color: PALETTE.slateGrey, fontSize: 14 }}>Loading card…</p>
        ) : (
          <>
            {/* Active card display */}
            {activeCard && !isExpired(activeCard.expiryDate) ? (
              <>
                <div style={{
                  background: activeCard.type === "VIP"
                    ? "linear-gradient(135deg, #fffbf0 0%, #fdf6e3 100%)"
                    : "linear-gradient(135deg, #f9ede8 0%, #fdf6f0 100%)",
                  border: `1.5px solid ${activeCard.type === "VIP" ? "#d4a01744" : PALETTE.burntOrange + "44"}`,
                  borderRadius: 16, padding: "28px 32px", marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke={activeCard.type === "VIP" ? "#b8860b" : PALETTE.burntOrange}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <div>
                        <p style={{ margin: 0, fontFamily: "'Playfair Display', serif",
                          fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>
                          {activeCard.label}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>
                          City Library System
                        </p>
                      </div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 5,
                      background: PALETTE.mintTeal, color: PALETTE.darkNavy,
                      fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Active
                    </span>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px",
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px" }}>
                    {[
                      { label: "Card ID",     value: activeCard.readingCardId.slice(0, 8).toUpperCase() },
                      { label: "Card Holder", value: username },
                      { label: "Type",        value: activeCard.type },
                      { label: "Expiry Date", value: activeCard.expiryDate ? new Date(activeCard.expiryDate).toLocaleDateString() : "—" },
                    ].map(f => (
                      <div key={f.label}>
                        <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey }}>{f.label}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 14.5, fontWeight: 600, color: PALETTE.darkNavy }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card details */}
                <div style={{ background: "#fff", border: "1.5px solid #ede5e0",
                  borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
                  <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display', serif",
                    fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy,
                    paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>Card Details</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <DetailItem
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                      label="Card Type" value={activeCard.type}
                    />
                    <DetailItem
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                      label="Valid Until"
                      value={activeCard.expiryDate ? new Date(activeCard.expiryDate).toLocaleDateString() : "—"}
                      sub={`${days} days remaining`}
                      subColor={days < 30 ? "#e05a5a" : PALETTE.mintTeal}
                    />
                  </div>
                </div>

                {/* Next card (Normal waiting after VIP) */}
                {nextCard && (
                  <div style={{ background: "#fff", border: "1.5px dashed #e0d5d0",
                    borderRadius: 16, padding: "20px 28px", marginBottom: 20,
                    display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10,
                      background: PALETTE.blushCream, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={PALETTE.slateGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: PALETTE.darkNavy }}>
                        Normal card queued
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>
                        {nextCard.label} — activates after VIP expires on {activeCard.expiryDate ? new Date(activeCard.expiryDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No card state */
              <div style={{ background: "#fff", border: "1.5px dashed #e0d5d0",
                borderRadius: 16, padding: "40px 28px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: PALETTE.blushCream,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke={PALETTE.slateGrey} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <p style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif",
                  fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>
                  No active reading card
                </p>
                <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey }}>
                  Subscribe to a plan below to get your library card.
                </p>
              </div>
            )}

            {/* Upgrade section */}
            <div style={{ borderTop: "2px dashed #e0d5d0", paddingTop: 36, marginBottom: 8 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 700, color: PALETTE.darkNavy }}>
                  {activeCard && !isExpired(activeCard.expiryDate) ? "Manage Your Plan" : "Get a Reading Card"}
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey }}>
                  Choose a plan that fits your reading habits
                </p>
              </div>

              {/* Duration toggle */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
                <div style={{ display: "inline-flex", background: "#fff",
                  border: "1.5px solid #ede5e0", borderRadius: 12, padding: 4, gap: 4 }}>
                  {(["1", "3", "12"] as Duration[]).map(d => (
                    <button key={d} onClick={() => setDuration(d)} style={{
                      position: "relative", padding: "9px 22px", border: "none", borderRadius: 8,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
                      fontWeight: duration === d ? 600 : 400,
                      background: duration === d ? PALETTE.darkNavy : "transparent",
                      color: duration === d ? "#fff" : PALETTE.slateGrey, transition: "all 0.18s",
                    }}>
                      {DURATION_LABELS[d]}
                      {DURATION_SAVINGS[d] && (
                        <span style={{ position: "absolute", top: -10, right: -4,
                          background: "#e05a5a", color: "#fff", fontSize: 10, fontWeight: 700,
                          padding: "1px 6px", borderRadius: 10 }}>
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
                  <PlanCard key={type} type={type} plan={PLANS[type]} duration={duration}
                    selected={selectedPlan === type}
                    onSelect={() => { setSelectedPlan(type); setError(null); }} />
                ))}
              </div>

              {/* Comparison table */}
              <div style={{ background: "#fff", border: "1.5px solid #ede5e0",
                borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
                <table style={{ width: "100%", borderCollapse: "collapse",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: PALETTE.darkNavy }}>
                      <th style={{ padding: "14px 20px", textAlign: "left", color: PALETTE.blushCream, fontWeight: 600 }}>Feature</th>
                      <th style={{ padding: "14px 20px", textAlign: "center", color: PALETTE.blushCream, fontWeight: 600 }}>Normal</th>
                      <th style={{ padding: "14px 20px", textAlign: "center", color: "#ffd700", fontWeight: 600 }}>⭐ VIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Book Collection",  normal: "General",    vip: "General + Rare" },
                      { feature: "Borrow Limit",      normal: "5 books",    vip: "8 books"        },
                      { feature: "Return Period",      normal: "30 days",    vip: "45 days"        },
                      { feature: "Renewals per Book", normal: "1",          vip: "2"              },
                      { feature: "Priority Support",  normal: "✗",          vip: "✓"              },
                      { feature: "Early Access",       normal: "✗",          vip: "✓"              },
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

              {/* Error banner */}
              {error && (
                <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5",
                  borderRadius: 8, padding: "10px 14px", fontSize: 13.5,
                  color: "#dc2626", marginBottom: 16, textAlign: "center" }}>
                  {error}
                </div>
              )}

              {/* Subscribe CTA */}
              <div style={{ textAlign: "center" }}>
                {successMsg ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10,
                    background: PALETTE.mintTeal + "33", border: `1.5px solid ${PALETTE.mintTeal}`,
                    borderRadius: 10, padding: "14px 28px", color: PALETTE.darkNavy,
                    fontWeight: 600, fontSize: 14 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {successMsg}
                  </div>
                ) : (
                  <>
                   <button onClick={handleSubscribeClick} style={{
                      padding: "14px 48px", border: "none", borderRadius: 10,
                      background: selectedPlan === "vip" ? "#d4a017" : PALETTE.burntOrange,
                      color: "#fff", fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15, fontWeight: 700, cursor: "pointer",
                      boxShadow: `0 4px 16px ${selectedPlan === "vip" ? "#d4a01744" : PALETTE.burntOrange + "44"}`,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Subscribe to {PLANS[selectedPlan].label} — ${PLANS[selectedPlan].prices[duration].price} / {DURATION_LABELS[duration].toLowerCase()}
                  </button>
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: PALETTE.slateGrey }}>
                      Cancel anytime. No hidden fees.
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}