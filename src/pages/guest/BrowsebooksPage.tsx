// src/pages/guest/BrowseBooksPage.tsx
import { useState, useRef, useEffect } from "react";
import { PALETTE } from "../../data/constants";
import BorrowModal from "../../components/BorrowModal";
import { bookService } from "../../services/book.service";
import type { BookPublicDto } from "../../types";

interface BrowseBooksPageProps {
  onBack: () => void;
  onViewBook: (book: BookPublicDto) => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const GENRE_COLORS: Record<string, string> = {
  Fiction:    PALETTE.burntOrange,
  Technology: PALETTE.darkNavy,
  Art:        PALETTE.slateGrey,
  Philosophy: PALETTE.mintTeal,
  Science:    "#5b8fa8",
  History:    "#8b6f5e",
};

const NAV_ITEMS = [
  { key: "readerDashboard", label: "Dashboard",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "browseBooks",     label: "Browse Books", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "myRecords",       label: "My Records",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: "readingCard",     label: "Reading Card", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: "profile",         label: "Profile",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

// ── Book card ─────────────────────────────────────────────────────────────────
function BookCard({ book, onView, onBorrow }: {
  book: BookPublicDto; onView: () => void; onBorrow: () => void;
}) {
  const genre = book.genres?.[0]?.label ?? "Unknown";
  const author = book.authors?.map(a => a.name).join(", ") ?? "Unknown";
  const genreColor = GENRE_COLORS[genre] ?? PALETTE.slateGrey;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, overflow: "hidden",
      border: "1.5px solid #ede5e0", display: "flex", flexDirection: "column",
      transition: "transform 0.18s, box-shadow 0.18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(64,78,92,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Cover */}
      <div style={{
        height: 220, display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", background: "linear-gradient(145deg, #5f6f7a, #404E5C)",
      }}>
        {book.previewUrl ? (
          <img src={book.previewUrl} alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        )}
      </div>

      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 15,
          fontWeight: 700, color: PALETTE.darkNavy, lineHeight: 1.3 }}>{book.title}</p>
        <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey }}>{author}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span style={{
            background: genreColor + "22", color: genreColor,
            border: `1px solid ${genreColor}44`,
            fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20,
          }}>{genre}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 12 }}>
          <button onClick={onView} style={{
            flex: 1, padding: "8px 0", border: `1.5px solid ${PALETTE.burntOrange}`,
            background: "transparent", color: PALETTE.burntOrange,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
            borderRadius: 7, cursor: "pointer", transition: "all 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = PALETTE.burntOrange; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = PALETTE.burntOrange; }}
          >View Details</button>
          <button onClick={onBorrow} style={{
            flex: 1, padding: "8px 0", border: "none",
            background: PALETTE.mintTeal, color: PALETTE.darkNavy,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            borderRadius: 7, cursor: "pointer", transition: "opacity 0.18s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >Borrow</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BrowseBooksPage({ onBack, onViewBook, activePage, onNavigate }: BrowseBooksPageProps) {
  const [books, setBooks]               = useState<BookPublicDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState("");
  const [category, setCategory]         = useState("All");
  const [categories, setCategories]     = useState<string[]>(["All"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<BookPublicDto | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch books on mount
  useEffect(() => {
    bookService.findAll().then(data => {
      setBooks(data);
      // Build category list from genres
      const genres = Array.from(new Set(
        data.flatMap(b => b.genres?.map(g => g.label) ?? [])
      ));
      setCategories(["All", ...genres]);
    }).finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = books.filter(b => {
    const author = b.authors?.map(a => a.name).join(" ") ?? "";
    const genre  = b.genres?.[0]?.label ?? "";
    const matchQuery = b.title.toLowerCase().includes(query.toLowerCase()) ||
                       author.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === "All" || genre === category;
    return matchQuery && matchCat;
  });

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
          <span style={{ color: PALETTE.blushCream, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
            Library System
          </span>
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
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, background: "transparent",
          border: "none", color: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, cursor: "pointer", opacity: 0.8, flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>Browse Books</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>
          Discover your next great read
        </p>

        {/* Search + filter */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #ede5e0",
          padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9aacb5"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by title or author..."
              style={{ flex: 1, border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: PALETTE.darkNavy, background: "transparent" }}
            />
          </div>
          <div style={{ width: 1, height: 28, background: "#ede5e0" }} />
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button onClick={() => setDropdownOpen(o => !o)} style={{
              display: "flex", alignItems: "center", gap: 10, background: "transparent",
              border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              color: PALETTE.darkNavy, cursor: "pointer", padding: "4px 8px", minWidth: 120,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>{category}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff",
                border: "1.5px solid #ede5e0", borderRadius: 10, minWidth: 180, zIndex: 200,
                boxShadow: "0 8px 24px rgba(64,78,92,0.12)", overflow: "hidden" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "11px 16px", border: "none",
                      background: category === cat ? PALETTE.mintTeal : "transparent",
                      color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13.5, fontWeight: category === cat ? 600 : 400,
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (category !== cat) e.currentTarget.style.background = "#f5faf8"; }}
                    onMouseLeave={e => { if (category !== cat) e.currentTarget.style.background = "transparent"; }}
                  >
                    {cat}
                    {category === cat && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={PALETTE.darkNavy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <p style={{ margin: "0 0 20px", fontSize: 13, color: PALETTE.slateGrey }}>
          Showing <strong>{filtered.length}</strong> book{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
          {query ? ` for "${query}"` : ""}
        </p>

        {/* Grid */}
        {loading ? (
          <p style={{ color: PALETTE.slateGrey, fontSize: 14 }}>Loading books…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: PALETTE.slateGrey }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
              No books found. Try a different search.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {filtered.map(book => (
              <BookCard
                key={book.bookId}
                book={book}
                onView={() => onViewBook(book)}
                onBorrow={() => setBorrowingBook(book)}
              />
            ))}
          </div>
        )}
      </main>

      {borrowingBook && (
        <BorrowModal
          bookTitle={borrowingBook.title}
          bookId={borrowingBook.bookId}
          onConfirm={() => setBorrowingBook(null)}
          onCancel={() => setBorrowingBook(null)}
          onNavigateToCard={() => {
            setBorrowingBook(null);
            onNavigate("readingCard");
          }}
        />
      )}
    </div>
  );
}