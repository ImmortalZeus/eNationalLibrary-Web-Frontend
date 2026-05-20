import { useState } from "react";
import { PALETTE } from "../data/constants";

type Role = "Reader" | "Admin";

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onLoginSuccess: (role: "Reader" | "Admin") => void;
}

export default function LoginPage({ onNavigateToRegister, onNavigateToHome, onLoginSuccess }: LoginPageProps) {
  const [role, setRole] = useState<Role>("Reader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isReader = role === "Reader";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to real auth API
    onLoginSuccess(role);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${PALETTE.blushCream} 0%, #e8f5f1 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "40px 48px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 8px 40px rgba(64,78,92,0.12)",
      }}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: isReader ? PALETTE.burntOrange : PALETTE.slateGrey,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.3s",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: 22, color: PALETTE.darkNavy, margin: "0 0 6px", fontWeight: 700 }}>
          Library System Login
        </h1>
        <p style={{ textAlign: "center", fontSize: 13.5, color: PALETTE.slateGrey, margin: "0 0 28px" }}>
          Sign in to access your account
        </p>

        {/* Role toggle */}
        <div style={{
          display: "flex",
          background: PALETTE.slateGrey,
          borderRadius: 24,
          padding: 3,
          marginBottom: 28,
        }}>
          {(["Reader", "Admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: "9px 0",
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.2s",
                background: role === r ? "#fff" : "transparent",
                color: role === r ? PALETTE.darkNavy : "rgba(255,255,255,0.75)",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: PALETTE.darkNavy, marginBottom: 6 }}>
              {isReader ? "Email" : "Admin Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isReader ? "reader@library.com" : "admin@library.com"}
              required
              style={{
                width: "100%",
                border: "1.5px solid #e0d5d0",
                borderRadius: 8,
                padding: "11px 14px",
                fontSize: 14,
                color: PALETTE.darkNavy,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = isReader ? PALETTE.burntOrange : PALETTE.slateGrey)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: PALETTE.darkNavy, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                border: "1.5px solid #e0d5d0",
                borderRadius: 8,
                padding: "11px 14px",
                fontSize: 14,
                color: PALETTE.darkNavy,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = isReader ? PALETTE.burntOrange : PALETTE.slateGrey)}
              onBlur={(e) => (e.target.style.borderColor = "#e0d5d0")}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px 0",
              border: "none",
              borderRadius: 8,
              background: isReader ? PALETTE.burntOrange : PALETTE.slateGrey,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              transition: "opacity 0.2s",
              marginTop: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Login as {role}
          </button>
        </form>

        {/* Footer links */}
        <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, marginTop: 20, marginBottom: 8 }}>
          Don't have an account?{" "}
          <span
            onClick={onNavigateToRegister}
            style={{ color: PALETTE.burntOrange, cursor: "pointer", fontWeight: 500 }}
          >
            Register here
          </span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, margin: 0 }}>
          <span
            onClick={onNavigateToHome}
            style={{ cursor: "pointer" }}
          >
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
}