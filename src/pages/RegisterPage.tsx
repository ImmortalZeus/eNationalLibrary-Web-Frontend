// src/pages/RegisterPage.tsx
import { useState } from "react";
import { PALETTE } from "../data/constants";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onNavigateToHome:  () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterPage({
  onNavigateToLogin,
  onNavigateToHome,
  onRegisterSuccess,
}: RegisterPageProps) {
  const { saveToken, setReaderId } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [form, setForm] = useState({
    username:        "",
    email:           "",
    phoneNumber:     "",
    password:        "",
    confirmPassword: "",
    gender:          "Male" as "Male" | "Female",
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        username:    form.username,
        email:       form.email,
        password:    form.password,
        gender:      form.gender,
        phoneNumber: form.phoneNumber || null,
        role:        "Reader",   // readers self-register; admins are created by admin
        status:      "Active",
      });
    const { accessToken } = await authService.login({
      usernameOrEmail: form.username,
      password: form.password,
    });
    saveToken(accessToken);
    const { jwtDecode } = await import("jwt-decode");
    const { sub } = jwtDecode<{ sub: string }>(accessToken);
    const readers = await import("../services/reader.service").then(m => m.readerService.findAll());
    const mine = readers.find(r => r.user?.userId === sub);
    if (mine) setReaderId(mine.userId);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onRegisterSuccess();
      }, 1000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: unknown } } })
          ?.response?.data?.message;
      if (Array.isArray(msg))      setError(msg.join(" "));
      else if (typeof msg === "string") setError(msg);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e0d5d0", borderRadius: 8,
    padding: "11px 14px", fontSize: 14, color: PALETTE.darkNavy,
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s",
    background: "#fff",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13.5, fontWeight: 500,
    color: PALETTE.darkNavy, marginBottom: 6,
  };

  return (
    <>
      {showToast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 12,
          background: "#fff", border: `1.5px solid ${PALETTE.mintTeal}`,
          borderLeft: `4px solid ${PALETTE.mintTeal}`,
          borderRadius: 10, padding: "14px 20px",
          boxShadow: "0 8px 28px rgba(64,78,92,0.14)",
          minWidth: 300, maxWidth: 400,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%",
            background: PALETTE.mintTeal + "22",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: PALETTE.darkNavy }}>
              Account Created!
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>
              Welcome, {form.username}! Please log in to continue.
            </p>
          </div>
        </div>
      )}

      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${PALETTE.blushCream} 0%, #e8f5f1 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", padding: 24,
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px 48px",
          width: "100%", maxWidth: 440,
          boxShadow: "0 8px 40px rgba(64,78,92,0.12)",
        }}>
          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: PALETTE.mintTeal,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          </div>

          <h1 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif",
            fontSize: 22, color: PALETTE.darkNavy, margin: "0 0 6px", fontWeight: 700 }}>
            Create Reader Account
          </h1>
          <p style={{ textAlign: "center", fontSize: 13.5, color: PALETTE.slateGrey, margin: "0 0 28px" }}>
            Register to start borrowing books
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "#fff5f5", border: "1.5px solid #fca5a5",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13.5, color: "#dc2626", marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" value={form.username} onChange={handleChange("username")}
                placeholder="johndoe" required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
                onBlur={e  => (e.target.style.borderColor = "#e0d5d0")}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={handleChange("email")}
                placeholder="john@example.com" required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
                onBlur={e  => (e.target.style.borderColor = "#e0d5d0")}
              />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={handleChange("gender")}
                required style={{ ...inputStyle, appearance: "none" }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Phone Number <span style={{ fontWeight: 400, color: PALETTE.slateGrey }}>(optional)</span></label>
              <input type="tel" value={form.phoneNumber} onChange={handleChange("phoneNumber")}
                placeholder="+84 123 456 789" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
                onBlur={e  => (e.target.style.borderColor = "#e0d5d0")}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={handleChange("password")}
                placeholder="Minimum 8 characters" required minLength={8} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
                onBlur={e  => (e.target.style.borderColor = "#e0d5d0")}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={handleChange("confirmPassword")}
                placeholder="Repeat your password" required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
                onBlur={e  => (e.target.style.borderColor = "#e0d5d0")}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px 0", border: "none", borderRadius: 8,
              background: PALETTE.mintTeal, color: PALETTE.darkNavy,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s", marginTop: 4,
            }}>
              {loading ? "Creating account…" : "Register"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, marginTop: 20, marginBottom: 8 }}>
            Already have an account?{" "}
            <span onClick={onNavigateToLogin}
              style={{ color: PALETTE.burntOrange, cursor: "pointer", fontWeight: 500 }}>
              Login here
            </span>
          </p>
          <p style={{ textAlign: "center", fontSize: 13, color: PALETTE.slateGrey, margin: 0 }}>
            <span onClick={onNavigateToHome} style={{ cursor: "pointer" }}>← Back to Home</span>
          </p>
        </div>
      </div>
    </>
  );
}