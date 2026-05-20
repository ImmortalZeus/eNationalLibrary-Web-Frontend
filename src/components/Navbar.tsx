import { PALETTE } from "../data/constants";

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  return (
    <nav style={{
      background: PALETTE.darkNavy,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: 56,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, letterSpacing: 0.3 }}>
          eNationalLibrary System
        </span>
      </div>

      {/* Auth buttons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={onLoginClick} style={{
          background: "transparent",
          border: "none",
          color: PALETTE.blushCream,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          cursor: "pointer",
          padding: "6px 4px",
          opacity: 0.85,
        }}>
          Login
        </button>
        <button onClick={onRegisterClick} style={{
          background: PALETTE.burntOrange,
          border: "none",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          padding: "7px 20px",
          borderRadius: 6,
          letterSpacing: 0.2,
        }}>
          Register
        </button>
      </div>
    </nav>
  );
}