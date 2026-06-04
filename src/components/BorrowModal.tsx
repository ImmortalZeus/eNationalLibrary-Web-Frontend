// src/components/BorrowModal.tsx
import { useState, useEffect } from "react";
import { PALETTE } from "../data/constants";
import { borrowRecordService } from "../services/borrow-record.service";
import { useAuth } from "../context/AuthContext";
import { readerService } from "../services/reader.service";
import type { ReaderPublicDto, ReadingCardPublicDto } from "../types";

interface BorrowModalProps {
  bookTitle: string;
  bookId: string;
  onConfirm: () => void;
  onCancel: () => void;
  onNavigateToCard?: () => void;
}
const BORROW_LIMITS: Record<string, number> = {
  Normal: 5,
  VIP:    8,
};

const BORROW_DAYS: Record<string, number> = {
  Normal: 30,
  VIP:    45,
};
const BORROW_RENEWALS: Record<string, number> = {
  Normal: 1,
  VIP:    2,
};

function isExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}

// VIP takes priority over Normal
function getActiveCard(cards: ReadingCardPublicDto[]): ReadingCardPublicDto | null {
  const active = cards.filter(c => !isExpired(c.expiryDate));
  const vip = active.find(c => c.type === "VIP");
  if (vip) return vip;
  return active.find(c => c.type === "Normal") ?? null;
}

export default function BorrowModal({ bookTitle, bookId, onConfirm, onCancel, onNavigateToCard }: BorrowModalProps) {
  const { user } = useAuth();
  const [reader, setReader]     = useState<ReaderPublicDto | null>(null);
  const [checking, setChecking] = useState(true);
  const [borrowed, setBorrowed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [noCard, setNoCard]     = useState(false);
  const [cardType, setCardType] = useState<string>("Normal");
  useEffect(() => {
    if (!user?.sub) return;
    readerService.findByUserId(user.sub).then(r => {
      setReader(r);

      if (!r) {
        setError("Reader profile not found. Please contact support.");
        return;
      }

      const cards = r.readingCards ?? [];
      const activeCard =getActiveCard(cards);

      if (!activeCard) {
        setNoCard(true);
        setError("You don't have an active reading card. Please subscribe to a plan in the Reading Card page before borrowing.");
        return;
      }
      setCardType(activeCard.type);
      const limit = BORROW_LIMITS[activeCard.type] ?? 5;
      const activeBorrows = (r.borrowRecords ?? []).filter(br => !br.actualReturnDate).length;

      if (activeBorrows >= limit) {
        setError(`You've reached your borrow limit of ${limit} books for your ${activeCard.type} card. Please return a book before borrowing another.`);
        return;
      }

      setError(null);
    }).finally(() => setChecking(false));
  }, [user?.sub]);

  const handleConfirm = async () => {
  if (!reader) return;
  setLoading(true);
  setError(null);
  try {
    const today = new Date();
    const due   = new Date();
    due.setDate(today.getDate() + (BORROW_DAYS[cardType] ?? 30));  // use card days
    const toISO = (d: Date) => d.toISOString().split("T")[0];

    await borrowRecordService.create({
      quantity:         1,
      borrowDate:       toISO(today),
      dueDate:          toISO(due),
      actualReturnDate: null,
      readerId:         reader.userId,
      bookId:           bookId,
    });

    setBorrowed(true);
    setTimeout(() => onConfirm(), 1800);
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? "Borrow failed.";
    setError(typeof msg === "string" ? msg : "Borrow failed.");
  } finally {
    setLoading(false);
  }
};

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
        animation: "modalIn 0.22s ease",
      }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes checkPop {
            0%   { transform: scale(0.5); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Checking state */}
        {checking ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%",
              background: PALETTE.blushCream,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke={PALETTE.slateGrey} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey }}>
              Checking your account…
            </p>
          </>

        /* Error state */
        ) : error && !borrowed ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%",
              background: "#fff5f5",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', serif",
              fontSize: 19, fontWeight: 700, color: PALETTE.darkNavy }}>
              Cannot Borrow
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onCancel} style={{
                flex: 1, padding: "12px 0", border: "1.5px solid #ddd",
                borderRadius: 8, background: "transparent", color: PALETTE.slateGrey,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >Close</button>

              {/* Show "Get a Card" only when no active card */}
              {noCard && (
                <button
                  onClick={() => {
                    onCancel();
                    onNavigateToCard?.();
                  }}
                  style={{
                    flex: 1, padding: "12px 0", border: "none",
                    borderRadius: 8, background: PALETTE.burntOrange,
                    color: "#fff", fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Get a Card →
                </button>
              )}
            </div>
          </>

        /* Success state */
        ) : borrowed ? (
          <>
            <div style={{ width: 70, height: 70, borderRadius: "50%",
              background: PALETTE.mintTeal + "33",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", animation: "checkPop 0.4s ease" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700, color: PALETTE.darkNavy }}>
              Successfully Borrowed!
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
              Please return it within <strong>{BORROW_DAYS[cardType] ?? 30} days</strong>.
            </p>
          </>

        /* Confirm state */
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%",
              background: PALETTE.blushCream,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke={PALETTE.burntOrange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700, color: PALETTE.darkNavy }}>
              Borrow this book?
            </h2>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>
              "{bookTitle}"
            </p>
            <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
              Please return it within <strong>{BORROW_DAYS[cardType] ?? 30} days</strong>.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 24,
              background: PALETTE.blushCream, borderRadius: 10,
              padding: "14px 20px", marginBottom: 28 }}>
              {[
                { icon: "📅", label: "Borrow period", value: `${BORROW_DAYS[cardType] ?? 30} days` },
                { icon: "⭐", label: "Card type",     value: cardType },
                { icon: "🔄", label: "Renewals",      value: `${BORROW_RENEWALS[cardType] ?? 1} allowed` },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 18 }}>{item.icon}</p>
                  <p style={{ margin: "4px 0 2px", fontSize: 11, color: PALETTE.slateGrey }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: PALETTE.darkNavy }}>{item.value}</p>
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
              <button onClick={handleConfirm} disabled={loading} style={{
                flex: 1, padding: "12px 0", border: "none",
                borderRadius: 8, background: PALETTE.burntOrange, color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => (e.currentTarget.style.opacity = loading ? "0.7" : "1")}
              >
                {loading ? "Processing…" : "Confirm Borrow"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}