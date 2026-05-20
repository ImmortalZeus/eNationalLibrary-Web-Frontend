import { useState } from "react";
import { PALETTE } from "../../data/constants";

interface ProfilePageProps {
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

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// ── Toast notification ────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      background: "#fff",
      border: `1.5px solid ${type === "success" ? PALETTE.mintTeal : "#e05a5a"}`,
      borderLeft: `4px solid ${type === "success" ? PALETTE.mintTeal : "#e05a5a"}`,
      borderRadius: 10,
      padding: "14px 18px",
      boxShadow: "0 8px 28px rgba(64,78,92,0.14)",
      minWidth: 300, maxWidth: 400,
      animation: "toastIn 0.3s ease",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Icon */}
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: type === "success" ? PALETTE.mintTeal + "22" : "#e05a5a22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {type === "success" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PALETTE.mintTeal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e05a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: PALETTE.darkNavy }}>
          {type === "success" ? "Profile Updated!" : "Update Failed"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: PALETTE.slateGrey }}>{message}</p>
      </div>

      {/* Close */}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.slateGrey, padding: 2, flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── Field row (view mode) ─────────────────────────────────────────────────
function FieldView({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ paddingBottom: 20, borderBottom: "1px solid #f5efec" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ color: PALETTE.slateGrey }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: PALETTE.darkNavy }}>{label}</p>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey, paddingLeft: 24 }}>{value}</p>
    </div>
  );
}

// ── Field row (edit mode) ─────────────────────────────────────────────────
function FieldEdit({ icon, label, value, onChange, type = "text" }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div style={{ paddingBottom: 20, borderBottom: "1px solid #f5efec" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ color: PALETTE.slateGrey }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: PALETTE.darkNavy }}>{label}</p>
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          border: "1.5px solid #e0d5d0", borderRadius: 8,
          padding: "10px 14px", marginLeft: 0,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: PALETTE.darkNavy,
          outline: "none", transition: "border-color 0.18s",
        }}
        onFocus={e => (e.target.style.borderColor = PALETTE.burntOrange)}
        onBlur={e => (e.target.style.borderColor = "#e0d5d0")}
      />
    </div>
  );
}

// ── Stat bubble ───────────────────────────────────────────────────────────
function StatBubble({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color }}>{value}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: PALETTE.slateGrey }}>{label}</p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────
const iconUser    = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const iconMail    = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const iconPhone   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const iconAddress = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProfilePage({ onLogout, onNavigate, activePage = "profile" }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "John Doe",
    email:    "john.doe@example.com",
    phone:    "+1 234 567 8900",
    address:  "123 Library Street, Book City, BC 12345",
  });
  const [draft, setDraft] = useState<ProfileData>({ ...profile });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const handleSave = () => {
    // Basic validation
    if (!draft.fullName.trim()) {
      showToast("Full name cannot be empty.", "error");
      return;
    }
    if (!draft.email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setProfile({ ...draft });
    setEditing(false);
    showToast("Your profile information has been saved successfully.", "success");
  };

  const field = (key: keyof ProfileData) => ({
    value: draft[key],
    onChange: (v: string) => setDraft(prev => ({ ...prev, [key]: v })),
  });

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

      {/* Content */}
      <main style={{ padding: "32px 40px", maxWidth: 740, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>My Profile</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>Manage your personal information</p>

        {/* ── Personal information card ── */}
        <div style={{ background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>

          {/* Card header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>
            <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy }}>Personal Information</h2>
            {!editing ? (
              <button onClick={handleEdit}
                style={{ padding: "7px 18px", border: `1.5px solid ${PALETTE.burntOrange}`, borderRadius: 8, background: "transparent", color: PALETTE.burntOrange, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = PALETTE.burntOrange; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = PALETTE.burntOrange; }}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleCancel}
                  style={{ padding: "7px 18px", border: "1.5px solid #ddd", borderRadius: 8, background: "transparent", color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Cancel
                </button>
                <button onClick={handleSave}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 18px", border: "none", borderRadius: 8, background: PALETTE.burntOrange, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: PALETTE.burntOrange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: PALETTE.darkNavy }}>{profile.fullName}</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: PALETTE.slateGrey }}>Member since March 2025</p>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!editing ? (
              <>
                <FieldView icon={iconUser}    label="Full Name"    value={profile.fullName} />
                <FieldView icon={iconMail}    label="Email"        value={profile.email}    />
                <FieldView icon={iconPhone}   label="Phone Number" value={profile.phone}    />
                <FieldView icon={iconAddress} label="Address"      value={profile.address}  />
              </>
            ) : (
              <>
                <FieldEdit icon={iconUser}    label="Full Name"    type="text"  {...field("fullName")} />
                <FieldEdit icon={iconMail}    label="Email"        type="email" {...field("email")}    />
                <FieldEdit icon={iconPhone}   label="Phone Number" type="tel"   {...field("phone")}    />
                <FieldEdit icon={iconAddress} label="Address"      type="text"  {...field("address")}  />
              </>
            )}
          </div>
        </div>

        {/* ── Reading statistics ── */}
        <div style={{ background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 16, padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 20px", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>Reading Statistics</h2>
          <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0" }}>
            <StatBubble value={24} label="Books Read"         color={PALETTE.burntOrange} />
            <StatBubble value={2}  label="Currently Borrowed" color={PALETTE.mintTeal}    />
            <StatBubble value={18} label="Reviews Written"    color={PALETTE.slateGrey}   />
          </div>
        </div>
      </main>
    </div>
  );
}