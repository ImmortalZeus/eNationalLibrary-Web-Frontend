import { useState, useRef, useEffect } from "react";
import { PALETTE } from "../../data/constants";
import BorrowModal from "../../components/Borrowmodal";

// ── Types ─────────────────────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  available: boolean;
  description: string;
  isbn: string;
  publisher: string;
  year: number;
  availableCount: number;
  total: number;
  reviews: { id: number; name: string; date: string; rating: number; comment: string }[];
}

interface BrowseBooksPageProps {
  onBack: () => void;
  onViewBook: (book: Book) => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

// ── Mock data ─────────────────────────────────────────────────────────────
const ALL_BOOKS: Book[] = [
  { id: 1, title: "The Great Adventure",     author: "John Smith",    genre: "Fiction",    rating: 4.5, available: true,  description: "An epic tale of adventure and discovery.", isbn: "978-0-111111-11-1", publisher: "ABC Publishing", year: 2023, availableCount: 3, total: 5, reviews: [{ id: 1, name: "Jane Doe", date: "3/10/2026", rating: 5, comment: "Absolutely loved this book!" }] },
  { id: 2, title: "Learning JavaScript",     author: "Jane Doe",      genre: "Technology", rating: 4.8, available: true,  description: "A comprehensive guide to modern JavaScript.", isbn: "978-0-222222-22-2", publisher: "Tech Press",      year: 2024, availableCount: 2, total: 4, reviews: [] },
  { id: 3, title: "History of Art",          author: "Alice Brown",   genre: "Art",        rating: 4.2, available: false, description: "A journey through the greatest artworks in history.", isbn: "978-0-333333-33-3", publisher: "Art House",       year: 2022, availableCount: 0, total: 3, reviews: [] },
  { id: 4, title: "Modern Philosophy",       author: "Bob Wilson",    genre: "Philosophy", rating: 4.6, available: true,  description: "An introduction to contemporary philosophical thought.", isbn: "978-0-444444-44-4", publisher: "Wisdom Books",    year: 2023, availableCount: 4, total: 5, reviews: [] },
  { id: 5, title: "The Science of Stars",    author: "Carl Sagan Jr", genre: "Science",    rating: 4.9, available: true,  description: "Exploring the cosmos and the science of astronomy.", isbn: "978-0-555555-55-5", publisher: "Cosmos Press",    year: 2024, availableCount: 1, total: 2, reviews: [] },
  { id: 6, title: "World War II Chronicles", author: "Emma Davis",    genre: "History",    rating: 4.3, available: true,  description: "A detailed account of the most defining conflict of the 20th century.", isbn: "978-0-666666-66-6", publisher: "History House",   year: 2021, availableCount: 2, total: 3, reviews: [] },
  { id: 7, title: "Advanced React Patterns", author: "Sarah Johnson", genre: "Technology", rating: 4.8, available: true,  description: "Deep dive into advanced React patterns and best practices.", isbn: "978-0-777777-77-7", publisher: "Tech Press",      year: 2024, availableCount: 2, total: 4, reviews: [] },
  { id: 8, title: "The Art of Design",       author: "Mike Chen",     genre: "Art",        rating: 4.3, available: true,  description: "Design principles and visual thinking for creatives.", isbn: "978-0-888888-88-8", publisher: "Creative House",  year: 2023, availableCount: 1, total: 3, reviews: [] },
];

const CATEGORIES = ["All", "Fiction", "Technology", "Art", "Philosophy", "Science", "History"];

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
  { key: "browseBooks",    label: "Browse Books", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "myRecords",   label: "My Records",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: "readingCard",      label: "Reading Card", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: "profile",   label: "Profile",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

// ── Book card ─────────────────────────────────────────────────────────────
function BookCard({ book, onView, onBorrow }: { book: Book; onView: () => void; onBorrow: () => void }) {
  const genreColor = GENRE_COLORS[book.genre] ?? PALETTE.slateGrey;
  return (
    <div
      style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1.5px solid #ede5e0", display: "flex", flexDirection: "column", transition: "transform 0.18s, box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(64,78,92,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ background: "linear-gradient(145deg, #5f6f7a, #404E5C)", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: PALETTE.darkNavy, lineHeight: 1.3 }}>{book.title}</p>
        <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey }}>{book.author}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span style={{ background: genreColor + "22", color: genreColor, border: `1px solid ${genreColor}44`, fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20 }}>
            {book.genre}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: PALETTE.slateGrey }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill={PALETTE.burntOrange} stroke={PALETTE.burntOrange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {book.rating}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 12 }}>
          <button onClick={onView} style={{ flex: 1, padding: "8px 0", border: `1.5px solid ${PALETTE.burntOrange}`, background: "transparent", color: PALETTE.burntOrange, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, borderRadius: 7, cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = PALETTE.burntOrange; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = PALETTE.burntOrange; }}
          >View Details</button>
          <button onClick={() => book.available && onBorrow()} disabled={!book.available} style={{ flex: 1, padding: "8px 0", border: "none", background: book.available ? PALETTE.mintTeal : "#e0d5d0", color: book.available ? PALETTE.darkNavy : "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, borderRadius: 7, cursor: book.available ? "pointer" : "not-allowed", transition: "opacity 0.18s" }}
            onMouseEnter={e => { if (book.available) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >{book.available ? "Borrow" : "Unavailable"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function BrowseBooksPage({ onBack, onViewBook, activePage, onNavigate }: BrowseBooksPageProps) {
  const [query, setQuery]               = useState("");
  const [category, setCategory]         = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = ALL_BOOKS.filter(b => {
    const matchQuery = b.title.toLowerCase().includes(query.toLowerCase()) ||
                       b.author.toLowerCase().includes(query.toLowerCase()) ||
                       b.isbn.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === "All" || b.genre === category;
    return matchQuery && matchCat;
  });

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
            <button key={item.key} onClick={() => onNavigate(item.key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: activePage === item.key ? 600 : 400, background: activePage === item.key ? PALETTE.burntOrange : "transparent", color: activePage === item.key ? "#fff" : PALETTE.blushCream, transition: "background 0.18s" }}
              onMouseEnter={e => { if (activePage !== item.key) e.currentTarget.style.background = "rgba(247,235,232,0.12)"; }}
              onMouseLeave={e => { if (activePage !== item.key) e.currentTarget.style.background = "transparent"; }}
            >{item.icon} {item.label}</button>
          ))}
        </div>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, cursor: "pointer", opacity: 0.8, flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </nav>

      {/* Content */}
      <main style={{ padding: "32px 40px", maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: PALETTE.darkNavy }}>Browse Books</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: PALETTE.slateGrey }}>Discover your next great read</p>

        {/* Search + filter */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #ede5e0", padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9aacb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, author, or ISBN..."
              style={{ flex: 1, border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: PALETTE.darkNavy, background: "transparent" }}
            />
          </div>
          <div style={{ width: 1, height: 28, background: "#ede5e0" }} />
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button onClick={() => setDropdownOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: PALETTE.darkNavy, cursor: "pointer", padding: "4px 8px", minWidth: 120 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>{category}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", border: "1.5px solid #ede5e0", borderRadius: 10, minWidth: 180, zIndex: 200, boxShadow: "0 8px 24px rgba(64,78,92,0.12)", overflow: "hidden" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 16px", border: "none", background: category === cat ? PALETTE.mintTeal : "transparent", color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: category === cat ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (category !== cat) e.currentTarget.style.background = "#f5faf8"; }}
                    onMouseLeave={e => { if (category !== cat) e.currentTarget.style.background = "transparent"; }}
                  >
                    {cat}
                    {category === cat && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PALETTE.darkNavy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button style={{ background: PALETTE.burntOrange, border: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, padding: "10px 28px", borderRadius: 8, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >Search</button>
        </div>

        {/* Results count */}
        <p style={{ margin: "0 0 20px", fontSize: 13, color: PALETTE.slateGrey }}>
          Showing <strong>{filtered.length}</strong> book{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
          {query ? ` for "${query}"` : ""}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: PALETTE.slateGrey }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>No books found. Try a different search.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onView={() => onViewBook(book)}
                onBorrow={() => setBorrowingBook(book)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Borrow modal */}
      {borrowingBook && (
        <BorrowModal
          bookTitle={borrowingBook.title}
          onConfirm={() => setBorrowingBook(null)}
          onCancel={() => setBorrowingBook(null)}
        />
      )}
    </div>
  );
}