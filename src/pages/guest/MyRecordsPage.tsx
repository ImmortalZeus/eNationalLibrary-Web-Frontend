// src/pages/guest/MyRecordsPage.tsx
import { useState, useEffect } from "react";
import { PALETTE } from "../../data/constants";
import { useAuth } from "../../context/AuthContext";
import { readerService } from "../../services/reader.service";
import api from "../../services/api";
import type { BorrowRecordPublicDto, ReaderPublicDto } from "../../types";

interface MyRecordsPageProps {
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

// ── Helpers ───────────────────────────────────────────────────────────────
function daysLeft(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "numeric", day: "numeric", year: "numeric",
  });
}

// ── Book thumbnail ────────────────────────────────────────────────────────
function BookThumb({ previewUrl }: { previewUrl?: string }) {
  return (
    <div style={{ width: 64, height: 80, borderRadius: 8,
      background: "linear-gradient(145deg, #5f6f7a, #404E5C)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden" }}>
      {previewUrl ? (
        <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )}
    </div>
  );
}

// ── Active record row ─────────────────────────────────────────────────────
function ActiveRow({ record, onReturn }: {
  record: BorrowRecordPublicDto;
  onReturn: (id: string) => void;
}) {
  const [returning, setReturning] = useState(false);
  const days    = daysLeft(record.dueDate);
  const urgent  = days <= 3;
  const authors = record.book?.authors?.map(a => a.name).join(", ") ?? "Unknown";

  const handleReturn = async () => {
    setReturning(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.put(`/borrow-records/${record.borrowRecordId}`, {
        actualReturnDate: today,
      });
      onReturn(record.borrowRecordId);
    } catch {
      setReturning(false);
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 28px",
      border: "1.5px solid #ede5e0", display: "flex", alignItems: "center", gap: 20 }}>
      <BookThumb previewUrl={record.book?.previewUrl} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontFamily: "'Playfair Display', serif",
          fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy }}>
          {record.book?.title ?? "Unknown Book"}
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: PALETTE.slateGrey }}>{authors}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5 }}>
          <span style={{ color: PALETTE.slateGrey }}>Borrowed: {fmt(record.borrowDate)}</span>
          <span style={{ color: urgent ? "#e05a5a" : PALETTE.slateGrey, fontWeight: urgent ? 600 : 400 }}>
            Due: {fmt(record.dueDate)} ({days} day{days !== 1 ? "s" : ""} left)
          </span>
          {urgent && (
            <span style={{ background: "#fef2f2", color: "#e05a5a", fontSize: 11,
              fontWeight: 600, padding: "2px 10px", borderRadius: 20, border: "1px solid #fca5a5" }}>
              Urgent
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleReturn} disabled={returning} style={{
          padding: "8px 20px", border: "none", borderRadius: 8,
          background: returning ? "#ccc" : PALETTE.burntOrange,
          color: "#fff", fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, fontWeight: 600,
          cursor: returning ? "not-allowed" : "pointer",
        }}
          onMouseEnter={e => { if (!returning) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {returning ? "Returning…" : "Return Book"}
        </button>
      </div>
    </div>
  );
}

// ── History record row ────────────────────────────────────────────────────
function HistoryRow({ record }: { record: BorrowRecordPublicDto }) {
  const authors = record.book?.authors?.map(a => a.name).join(", ") ?? "Unknown";
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 28px",
      border: "1.5px solid #ede5e0", display: "flex", alignItems: "center", gap: 20 }}>
      <BookThumb previewUrl={record.book?.previewUrl} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 700, color: PALETTE.darkNavy }}>
            {record.book?.title ?? "Unknown Book"}
          </p>
          <span style={{ background: PALETTE.mintTeal, color: PALETTE.darkNavy,
            fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
            Returned
          </span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: PALETTE.slateGrey }}>{authors}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: PALETTE.slateGrey }}>
          <span>Borrowed: {fmt(record.borrowDate)}</span>
          {record.actualReturnDate && (
            <span>Returned: {fmt(record.actualReturnDate)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function MyRecordsPage({ onLogout, onNavigate, activePage = "myRecords" }: MyRecordsPageProps) {
  const { user, logout } = useAuth();
  const [reader, setReader]           = useState<ReaderPublicDto | null>(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<"active" | "history">("active");
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecordPublicDto[]>([]);

  useEffect(() => {
    if (!user?.sub) return;
    readerService.findByUserId(user.sub).then(r => {
      if (r) {
        setReader(r);
        setBorrowRecords(r.borrowRecords ?? []);
      }
    }).finally(() => setLoading(false));
  }, [user?.sub]);

  const activeRecords  = borrowRecords.filter(br => !br.actualReturnDate);
  const historyRecords = borrowRecords.filter(br => !!br.actualReturnDate);

  const handleReturn = (returnedId: string) => {
    setBorrowRecords(prev => prev.map(br =>
      br.borrowRecordId === returnedId
        ? { ...br, actualReturnDate: new Date().toISOString().split("T")[0] }
        : br
    ));
  };

  const handleLogout = () => { logout(); onLogout(); };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

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
          <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 600 }}>Library System</span>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </nav>

      {/* Content */}
      <main style={{ padding: "32px 40px", maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif",
          fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>My Borrow Records</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>
          Track your borrowing history
        </p>

        {/* Tab toggle */}
        <div style={{ display: "inline-flex", background: PALETTE.slateGrey,
          borderRadius: 24, padding: 3, marginBottom: 28, gap: 2 }}>
          {([
            { key: "active",  label: `Active (${activeRecords.length})`,  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { key: "history", label: `History (${historyRecords.length})`, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 20px",
              border: "none", borderRadius: 20, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
              fontWeight: tab === t.key ? 600 : 400,
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? PALETTE.darkNavy : "rgba(255,255,255,0.75)",
              transition: "all 0.2s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Records list */}
        {loading ? (
          <p style={{ color: PALETTE.slateGrey, fontSize: 14 }}>Loading records…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
            {tab === "active" ? (
              activeRecords.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 12, padding: "40px 28px",
                  border: "1.5px solid #ede5e0", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey }}>
                    No active borrows. Visit Browse Books to borrow something!
                  </p>
                </div>
              ) : (
                activeRecords.map(r => (
                  <ActiveRow key={r.borrowRecordId} record={r} onReturn={handleReturn} />
                ))
              )
            ) : (
              historyRecords.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 12, padding: "40px 28px",
                  border: "1.5px solid #ede5e0", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 14, color: PALETTE.slateGrey }}>
                    No returned books yet.
                  </p>
                </div>
              ) : (
                historyRecords.map(r => (
                  <HistoryRow key={r.borrowRecordId} record={r} />
                ))
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}