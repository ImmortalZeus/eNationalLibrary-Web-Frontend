import { useState } from "react";
import { PALETTE } from "../data/constants";

interface BorrowModalProps {
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BorrowModal({ bookTitle, onConfirm, onCancel }: BorrowModalProps) {
  const [borrowed, setBorrowed] = useState(false);

  const handleConfirm = () => {
    setBorrowed(true);
    setTimeout(() => {
      onConfirm();
    }, 1800);
  };

  return (
    // Backdrop
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(64,78,92,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(2px)",
      }}
    >
      {/* Card — stop click from bubbling to backdrop */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "36px 40px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 16px 48px rgba(64,78,92,0.18)",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          animation: "modalIn 0.22s ease",
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(10px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    }
          }
          @keyframes checkPop {
            0%   { transform: scale(0.5); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>

        {!borrowed ? (
          <>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: PALETTE.blushCream,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>

            <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: PALETTE.darkNavy }}>
              Borrow this book?
            </h2>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>
              "{bookTitle}"
            </p>
            <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
              You will have <strong>30 days</strong> to return this book.<br />
              Late returns may incur a small fine.
            </p>

            {/* Info row */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 24,
              background: PALETTE.blushCream, borderRadius: 10,
              padding: "14px 20px", marginBottom: 28,
            }}>
              {[
                { icon: "📅", label: "Borrow period", value: "30 days" },
                { icon: "🔄", label: "Renewals",      value: "1 allowed" },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 18 }}>{item.icon}</p>
                  <p style={{ margin: "4px 0 2px", fontSize: 11, color: PALETTE.slateGrey }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: PALETTE.darkNavy }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: "12px 0", border: "1.5px solid #ddd",
                  borderRadius: 8, background: "transparent",
                  color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: "12px 0", border: "none",
                  borderRadius: 8, background: PALETTE.burntOrange,
                  color: "#fff", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Confirm Borrow
              </button>
            </div>
          </>
        ) : (
          // ── Success state ──
          <>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: PALETTE.mintTeal + "33",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              animation: "checkPop 0.4s ease",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: PALETTE.darkNavy }}>
              Successfully Borrowed!
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>
              Enjoy reading <strong>"{bookTitle}"</strong>.<br />
              Please return it within <strong>30 days</strong>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}