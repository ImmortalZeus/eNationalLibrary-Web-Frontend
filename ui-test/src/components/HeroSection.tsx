import { PALETTE } from "../data/constants";

interface HeroSectionProps {
  query: string;
  setQuery: (value: string) => void;
}

export default function HeroSection({ query, setQuery }: HeroSectionProps) {
  return (
    <section style={{
      background: PALETTE.blushCream,
      textAlign: "center",
      padding: "72px 24px 80px",
    }}>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(26px, 4vw, 38px)",
        color: PALETTE.darkNavy,
        fontWeight: 700,
        margin: "0 0 12px",
        letterSpacing: "-0.5px",
      }}>
        Welcome to the Digital Library
      </h1>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        color: PALETTE.slateGrey,
        margin: "0 auto 36px",
        maxWidth: 480,
        lineHeight: 1.6,
      }}>
        Discover thousands of books, manage your reading journey, and connect with knowledge.
      </p>

      {/* Search bar */}
      <div style={{
        display: "flex",
        maxWidth: 520,
        margin: "0 auto",
        background: "#fff",
        border: "1.5px solid #e0d5d0",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(64,78,92,0.08)",
      }}>
        <span style={{ display: "flex", alignItems: "center", paddingLeft: 14, color: "#9aacb5" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: PALETTE.darkNavy,
            padding: "11px 12px",
            background: "transparent",
          }}
        />
        <button style={{
          background: PALETTE.burntOrange,
          border: "none",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          padding: "0 24px",
          cursor: "pointer",
          letterSpacing: 0.2,
        }}>
          Search
        </button>
      </div>
    </section>
  );
}