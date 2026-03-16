import { useState } from "react";
import { PALETTE } from "../../data/constants";

interface MyRecordsPageProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
  activePage?: string;
}

interface ActiveRecord {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
  daysLeft: number;
  urgent: boolean;
}

interface HistoryRecord {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  returnedDate: string;
  reviewed: boolean;
}

const ACTIVE_RECORDS: ActiveRecord[] = [
  { id: 1, title: "The Great Adventure",  author: "John Smith", borrowedDate: "3/6/2026",  dueDate: "3/20/2026", daysLeft: 5, urgent: false },
  { id: 2, title: "Learning JavaScript",  author: "Jane Doe",   borrowedDate: "3/4/2026",  dueDate: "3/18/2026", daysLeft: 3, urgent: true  },
];

const HISTORY_RECORDS: HistoryRecord[] = [
  { id: 1, title: "History of Art",    author: "Alice Brown",   borrowedDate: "2/15/2026", returnedDate: "3/1/2026",  reviewed: true  },
  { id: 2, title: "Modern Philosophy", author: "Bob Wilson",    borrowedDate: "2/10/2026", returnedDate: "2/24/2026", reviewed: false },
  { id: 3, title: "Advanced React",    author: "Sarah Johnson", borrowedDate: "1/20/2026", returnedDate: "2/3/2026",  reviewed: true  },
];

const NAV_ITEMS = [
  { key: "readerDashboard", label: "Dashboard",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "browseBooks",     label: "Browse Books", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "myRecords",       label: "My Records",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: "readingCard",     label: "Reading Card", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: "profile",         label: "Profile",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

// ── Book thumbnail ────────────────────────────────────────────────────────
function BookThumb() {
  return (
    <div style={{ width: 64, height: 80, borderRadius: 8, background: "linear-gradient(145deg, #5f6f7a, #404E5C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    </div>
  );
}

// ── Active record row ─────────────────────────────────────────────────────
function ActiveRow({ record }: { record: ActiveRecord }) {
  const [returned, setReturned] = useState(false);
  const [renewed, setRenewed]   = useState(false);

  if (returned) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 28px", border: "1.5px solid #ede5e0", display: "flex", alignItems: "center", gap: 20 }}>
      <BookThumb />
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy }}>{record.title}</p>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: PALETTE.slateGrey }}>{record.author}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5 }}>
          <span style={{ color: PALETTE.slateGrey }}>Borrowed: {record.borrowedDate}</span>
          <span style={{ color: record.urgent ? "#e05a5a" : PALETTE.slateGrey, fontWeight: record.urgent ? 600 : 400 }}>
            Due: {record.dueDate} ({renewed ? record.daysLeft + 14 : record.daysLeft} days left)
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => setRenewed(true)}
          disabled={renewed}
          style={{ padding: "8px 20px", border: `1.5px solid ${renewed ? "#ccc" : PALETTE.mintTeal}`, borderRadius: 8, background: "transparent", color: renewed ? "#aaa" : PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: renewed ? "not-allowed" : "pointer", transition: "all 0.18s" }}
          onMouseEnter={e => { if (!renewed) { e.currentTarget.style.background = PALETTE.mintTeal; } }}
          onMouseLeave={e => { if (!renewed) { e.currentTarget.style.background = "transparent"; } }}
        >
          {renewed ? "Renewed ✓" : "Renew"}
        </button>
        <button
          onClick={() => setReturned(true)}
          style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: PALETTE.burntOrange, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Return Book
        </button>
      </div>
    </div>
  );
}

// ── History record row ────────────────────────────────────────────────────
function HistoryRow({ record }: { record: HistoryRecord }) {
  const [reviewed, setReviewed] = useState(record.reviewed);
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 28px", border: "1.5px solid #ede5e0", display: "flex", alignItems: "center", gap: 20 }}>
      <BookThumb />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy }}>{record.title}</p>
          <span style={{ background: PALETTE.mintTeal, color: PALETTE.darkNavy, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>Returned</span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: PALETTE.slateGrey }}>{record.author}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: PALETTE.slateGrey }}>
          <span>Borrowed: {record.borrowedDate}</span>
          <span>Returned: {record.returnedDate}</span>
        </div>
      </div>
      <button
        onClick={() => !reviewed && setReviewed(true)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", border: `1.5px solid ${reviewed ? "#ccc" : PALETTE.mintTeal}`, borderRadius: 8, background: "transparent", color: reviewed ? "#aaa" : PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: reviewed ? "default" : "pointer", transition: "all 0.18s" }}
        onMouseEnter={e => { if (!reviewed) { e.currentTarget.style.background = PALETTE.mintTeal; } }}
        onMouseLeave={e => { if (!reviewed) { e.currentTarget.style.background = "transparent"; } }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={reviewed ? "#ccc" : "none"} stroke={reviewed ? "#ccc" : PALETTE.mintTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        {reviewed ? "Reviewed" : "Add Review"}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function MyRecordsPage({ onLogout, onNavigate, activePage = "myRecords" }: MyRecordsPageProps) {
  const [tab, setTab] = useState<"active" | "history">("active");

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

      {/* Content */}
      <main style={{ padding: "32px 40px", maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>My Borrow Records</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>Track your borrowing history</p>

        {/* Tab toggle */}
        <div style={{ display: "inline-flex", background: PALETTE.slateGrey, borderRadius: 24, padding: 3, marginBottom: 28, gap: 2 }}>
          {([
            { key: "active",  label: `Active (${ACTIVE_RECORDS.length})`,   icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { key: "history", label: `History (${HISTORY_RECORDS.length})`, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", border: "none", borderRadius: 20, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: tab === t.key ? 600 : 400, background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? PALETTE.darkNavy : "rgba(255,255,255,0.75)", transition: "all 0.2s" }}
            >{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Records list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
          {tab === "active"
            ? ACTIVE_RECORDS.map(r  => <ActiveRow  key={r.id} record={r} />)
            : HISTORY_RECORDS.map(r => <HistoryRow key={r.id} record={r} />)
          }
        </div>
      </main>
    </div>
  );
}