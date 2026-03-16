import { PALETTE } from "../data/constants";

const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Vast Collection",
    description: "Access thousands of books across all categories and genres.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Easy Management",
    description: "Track your borrowing history and manage your reading card.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Reviews & Ratings",
    description: "Share your thoughts and discover what others are reading.",
  },
];

export default function FeaturesSection() {
  return (
    <section style={{ padding: "64px 32px", background: "#fff", textAlign: "center" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 26,
        color: PALETTE.darkNavy,
        fontWeight: 700,
        marginBottom: 40,
      }}>
        Library Features
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              border: "1.5px solid #ede5e0",
              borderRadius: 12,
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(189,99,47,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <span style={{ color: PALETTE.slateGrey }}>{f.icon}</span>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              fontWeight: 600,
              color: PALETTE.darkNavy,
              margin: 0,
            }}>
              {f.title}
            </h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13.5,
              color: PALETTE.slateGrey,
              margin: 0,
              lineHeight: 1.6,
            }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}