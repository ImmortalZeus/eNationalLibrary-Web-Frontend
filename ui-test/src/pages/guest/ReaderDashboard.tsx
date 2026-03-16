import { useState } from "react";
import { PALETTE } from "../../data/constants";

interface ReaderDashboardProps {
  onLogout: () => void;
  onViewBook?: (book: any) => void;
  onBrowseMore?: () => void;
  onNavigate?: (page: string) => void;
  onViewAll?: () => void;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const BORROWED_BOOKS = [
  { id: 1, title: "The Great Adventure",  dueDate: "2026-03-20" },
  { id: 2, title: "Learning JavaScript",  dueDate: "2026-03-18" },
];

const RECOMMENDED_BOOKS = [
  {
    id: 1, title: "Advanced React Patterns", author: "Sarah Johnson", genre: "Technology",
    description: "A deep dive into advanced React patterns and best practices for building scalable applications.",
    isbn: "978-0-111111-11-1", category: "Technology", publisher: "Tech Press", year: 2024,
    available: 2, total: 4, rating: 4.8,
    reviews: [
      { id: 1, name: "Alice Lee", date: "3/5/2026", rating: 5, comment: "Excellent resource for experienced React developers!" },
    ],
  },
  {
    id: 2, title: "The Art of Design", author: "Mike Chen", genre: "Art",
    description: "An exploration of design principles and visual thinking that transforms the way you see the world.",
    isbn: "978-0-222222-22-2", category: "Art", publisher: "Creative House", year: 2023,
    available: 1, total: 3, rating: 4.3,
    reviews: [
      { id: 1, name: "Sara Kim", date: "3/1/2026", rating: 4, comment: "Beautiful book with stunning visuals and insights." },
    ],
  },
  {
    id: 3, title: "Philosophy 101", author: "Emma Davis", genre: "Philosophy",
    description: "An accessible introduction to the greatest philosophical ideas that have shaped human civilization.",
    isbn: "978-0-333333-33-3", category: "Philosophy", publisher: "Wisdom Books", year: 2022,
    available: 4, total: 5, rating: 4.1,
    reviews: [
      { id: 1, name: "Tom Ray", date: "2/20/2026", rating: 4, comment: "Great starting point for anyone new to philosophy." },
    ],
  },
];

const GENRE_COLORS: Record<string, string> = {
  Technology: PALETTE.darkNavy,
  Art:        PALETTE.slateGrey,
  Philosophy: PALETTE.mintTeal,
  Fiction:    PALETTE.burntOrange,
};

// ── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, accent, icon }: StatCardProps) {
  return (
    <div style={{
      flex: "1 1 180px",
      background: "#fff",
      border: `1.5px solid ${accent}33`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
        <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 700, color: accent, fontFamily: "'Playfair Display', serif" }}>{value}</p>
      </div>
      <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>
    </div>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────
interface NavItemProps {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}

function NavItem({ label, active, icon, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 16px",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13.5,
        fontWeight: active ? 600 : 400,
        background: active ? PALETTE.burntOrange : "transparent",
        color: active ? "#fff" : PALETTE.blushCream,
        transition: "background 0.18s, color 0.18s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(247,235,232,0.12)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  browse:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  records:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  card:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  profile:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  book:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  check:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  star:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

type ActivePage = "dashboard" | "browse" | "records" | "card" | "profile";

// ── Main component ────────────────────────────────────────────────────────────
export default function ReaderDashboard({ onLogout, onViewBook, onBrowseMore, onNavigate, onViewAll }: ReaderDashboardProps) {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: PALETTE.darkNavy,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: 54,
        position: "sticky",
        top: 0,
        zIndex: 100,
        gap: 12,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
            Library System
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavItem label="Dashboard"   icon={icons.dashboard} active={activePage === "dashboard"} onClick={() => { setActivePage("dashboard"); onNavigate?.("readerDashboard"); }} />
          <NavItem label="Browse Books" icon={icons.browse}   active={activePage === "browse"}    onClick={() => { setActivePage("browse"); onNavigate?.("browseBooks"); }}    />
          <NavItem label="My Records"   icon={icons.records}  active={activePage === "records"}   onClick={() => { setActivePage("records"); onNavigate?.("myRecords"); }}   />
          <NavItem label="Reading Card" icon={icons.card}     active={activePage === "card"}      onClick={() => { setActivePage("card"); onNavigate?.("readingCard"); }}      />
          <NavItem label="Profile"      icon={icons.profile}  active={activePage === "profile"}   onClick={() => { setActivePage("profile"); onNavigate?.("profile"); }}   />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent",
            border: "none",
            color: PALETTE.blushCream,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5,
            cursor: "pointer",
            padding: "8px 4px",
            opacity: 0.8,
            flexShrink: 0,
          }}
        >
          {icons.logout} Logout
        </button>
      </nav>

      {/* ── Page content ── */}
      <main style={{ padding: "32px 40px", maxWidth: 1300, margin: "0 auto" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, color: PALETTE.darkNavy, fontWeight: 700 }}>
            Welcome back, Reader!
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: PALETTE.slateGrey }}>
            Here's your reading activity
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard label="Currently Borrowed" value="2 Books"    accent={PALETTE.burntOrange} icon={icons.book}  />
          <StatCard label="Books Read"          value="24 Books"   accent={PALETTE.mintTeal}    icon={icons.check} />
          <StatCard label="Reviews Written"     value="18 Reviews" accent={PALETTE.slateGrey}   icon={icons.star}  />
          <StatCard label="Upcoming Due"        value="2 Days"     accent="#e05a5a"             icon={icons.clock} />
        </div>

        {/* ── Two-column section ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Currently Borrowed */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>Currently Borrowed</h2>
              <span onClick={onViewAll} style={{ fontSize: 13, color: PALETTE.burntOrange, cursor: "pointer", fontWeight: 500 }}>View All</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {BORROWED_BOOKS.map(book => (
                <div key={book.id} style={{
                  background: "#f0faf7",
                  border: "1px solid #d4f0e8",
                  borderRadius: 10,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}>
                  {/* Book icon box */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 8,
                    background: PALETTE.slateGrey,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{book.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: PALETTE.slateGrey }}>Due: {book.dueDate}</p>
                  </div>
                  <button style={{
                    background: PALETTE.burntOrange,
                    border: "none",
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "7px 18px",
                    borderRadius: 7,
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Return
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>Recommended for You</h2>
              <span onClick={onBrowseMore} style={{ fontSize: 13, color: PALETTE.burntOrange, cursor: "pointer", fontWeight: 500 }}>Browse More</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {RECOMMENDED_BOOKS.map(book => (
                <div key={book.id} style={{
                  background: "#f0faf7",
                  border: "1px solid #d4f0e8",
                  borderRadius: 10,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}>
                  {/* Book icon box */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 8,
                    background: PALETTE.slateGrey,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{book.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: PALETTE.slateGrey }}>{book.author}</p>
                    <span style={{
                      display: "inline-block",
                      marginTop: 5,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 10px",
                      borderRadius: 20,
                      background: (GENRE_COLORS[book.genre] ?? PALETTE.slateGrey) + "22",
                      color: GENRE_COLORS[book.genre] ?? PALETTE.slateGrey,
                      border: `1px solid ${(GENRE_COLORS[book.genre] ?? PALETTE.slateGrey)}44`,
                    }}>
                      {book.genre}
                    </span>
                  </div>
                  <button onClick={() => onViewBook?.(book)} style={{
                    background: "transparent",
                    border: `1.5px solid ${PALETTE.mintTeal}`,
                    color: PALETTE.darkNavy,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 16px",
                    borderRadius: 7,
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = PALETTE.mintTeal; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}