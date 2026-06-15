// src/components/admin/AdminSidebar.tsx
import type { ReactNode } from "react";
import { PALETTE } from "../../data/constants";

export type AdminSection =
  | "dashboard" | "books" | "authors" | "publishers" | "genres"
  | "readers" | "borrowRecords" | "readingCards" | "promotions" | "reviews" | "admins";

const SANS = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

const ic = (path: ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const ICONS: Record<AdminSection, ReactNode> = {
  dashboard:    ic(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>),
  books:        ic(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>),
  authors:      ic(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  publishers:   ic(<><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></>),
  genres:       ic(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
  readers:      ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  borrowRecords:ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
  readingCards: ic(<><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>),
  promotions:   ic(<><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>),
  reviews:      ic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>),
  admins:       ic(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>),
  // logout icon reused below
};

const LOGOUT_ICON = ic(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>);

const NAV: { key: AdminSection; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "books", label: "Books" },
  { key: "authors", label: "Authors" },
  { key: "publishers", label: "Publishers" },
  { key: "genres", label: "Genres" },
  { key: "readers", label: "Readers" },
  { key: "borrowRecords", label: "Borrow Records" },
  { key: "readingCards", label: "Reading Cards" },
  { key: "promotions", label: "Promotions" },
  { key: "reviews", label: "Reviews" },
  { key: "admins", label: "Admin Accounts" },
];

export const SIDEBAR_WIDTH = 232;

export default function AdminSidebar({ active, onSelect, onLogout, username }: {
  active: AdminSection;
  onSelect: (s: AdminSection) => void;
  onLogout: () => void;
  username?: string;
}) {
  return (
    <aside style={{
      width: SIDEBAR_WIDTH, background: PALETTE.darkNavy, color: PALETTE.blushCream,
      position: "fixed", top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column",
      padding: "20px 14px", boxSizing: "border-box", zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 18px" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PALETTE.burntOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, lineHeight: 1.15 }}>eNationalLibrary</div>
          <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", opacity: 0.6 }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }}>
        {NAV.map(item => {
          const on = active === item.key;
          return (
            <button key={item.key} onClick={() => onSelect(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left",
                fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 600 : 400,
                background: on ? PALETTE.burntOrange : "transparent",
                color: on ? "#fff" : PALETTE.blushCream,
                transition: "background 0.16s",
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = "rgba(247,235,232,0.10)"; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "flex", opacity: on ? 1 : 0.85 }}>{ICONS[item.key]}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / logout */}
      <div style={{ borderTop: "1px solid rgba(247,235,232,0.15)", paddingTop: 12, marginTop: 8 }}>
        {username && (
          <div style={{ padding: "0 12px 10px", fontFamily: SANS, fontSize: 12, opacity: 0.7 }}>
            Signed in as <strong style={{ opacity: 0.95 }}>{username}</strong>
          </div>
        )}
        <button onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: SANS, fontSize: 13.5, background: "transparent", color: PALETTE.blushCream, opacity: 0.85 }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(247,235,232,0.10)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          {LOGOUT_ICON} Logout
        </button>
      </div>
    </aside>
  );
}
