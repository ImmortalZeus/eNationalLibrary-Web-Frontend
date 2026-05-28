import type { BookPublicDto } from "../types";
import { GENRE_COLORS, PALETTE } from "../data/constants";

interface BookCardProps {
  book: BookPublicDto;
}

export default function BookCard({ book }: BookCardProps) {
  const genre      = book.genres?.[0]?.label ?? "Unknown";
  const author     = book.authors?.map(a => a.name).join(", ") ?? "Unknown";
  const genreColor = GENRE_COLORS[genre] ?? PALETTE.slateGrey;

  return (
    <div style={{
      background: "#fff", borderRadius: 10, overflow: "hidden",
      border: "1.5px solid #ede5e0", display: "flex", flexDirection: "column",
      transition: "transform 0.18s, box-shadow 0.18s", cursor: "pointer",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(64,78,92,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Cover */}
      <div style={{
        background: "linear-gradient(145deg, #545F66, #404E5C)",
        height: 190, display: "flex", alignItems: "center",
        justifyContent: "center", overflow: "hidden",
      }}>
        {book.previewUrl ? (
          <img src={book.previewUrl} alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 14.5, fontWeight: 600, color: PALETTE.darkNavy }}>
          {book.title}
        </p>
        <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif",
          fontSize: 12.5, color: PALETTE.slateGrey }}>
          {author}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginTop: 10 }}>
          <span style={{
            background: genreColor,
            color: genre === "Philosophy" ? PALETTE.darkNavy : "#fff",
            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3,
          }}>
            {genre}
          </span>
        </div>
      </div>
    </div>
  );
}