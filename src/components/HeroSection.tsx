import { useState, useRef, useEffect } from "react";
import { PALETTE } from "../data/constants";

interface HeroSectionProps {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
}

export default function HeroSection({
  query,
  setQuery,
  category,
  setCategory,
  categories,
}: HeroSectionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section
      style={{
        background: PALETTE.blushCream,
        textAlign: "center",
        padding: "72px 24px 80px",
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 4vw, 38px)",
          color: PALETTE.darkNavy,
          fontWeight: 700,
          margin: "0 0 12px",
          letterSpacing: "-0.5px",
        }}
      >
        Welcome to the Digital Library
      </h1>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: PALETTE.slateGrey,
          margin: "0 auto 36px",
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        Discover thousands of books, manage your reading journey, and connect
        with knowledge.
      </p>

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          maxWidth: 650,
          margin: "0 auto",
          background: "#fff",
          border: "1.5px solid #e0d5d0",
          borderRadius: 8,
          overflow: "visible",
          boxShadow: "0 2px 12px rgba(64,78,92,0.08)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            color: "#9aacb5",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

        {/* Genre Dropdown */}
        <div
          ref={dropdownRef}
          style={{
            position: "relative",
            borderLeft: "1px solid #e0d5d0",
          }}
        >
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: "100%",
              minWidth: 130,
              padding: "0 14px",
              border: "none",
              background: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: PALETTE.darkNavy,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PALETTE.slateGrey}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>

            <span style={{ flex: 1, textAlign: "left" }}>
              {category}
            </span>

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PALETTE.slateGrey}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: dropdownOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#fff",
                border: "1.5px solid #ede5e0",
                borderRadius: 10,
                minWidth: 180,
                overflow: "hidden",
                zIndex: 200,
                boxShadow: "0 8px 24px rgba(64,78,92,0.12)",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "11px 16px",
                    border: "none",
                    background:
                      category === cat
                        ? PALETTE.mintTeal
                        : "transparent",
                    color: PALETTE.darkNavy,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13.5,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {cat}

                  {category === cat && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={PALETTE.darkNavy}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          style={{
            background: PALETTE.burntOrange,
            border: "none",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            padding: "0 24px",
            cursor: "pointer",
            letterSpacing: 0.2,
          }}
        >
          Search
        </button>
      </div>
    </section>
  );
}