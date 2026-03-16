import { useState } from "react";
import { PALETTE } from "../../data/constants";
import BorrowModal from "../../components/Borrowmodal";

interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  comment: string;
}

interface BookDetail {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  availableCount: number;
  total: number;
  rating: number;
  reviews: Review[];
}

interface BookDetailPageProps {
  book?: BookDetail;
  onBack: () => void;
}

const MOCK_BOOK: BookDetail = {
  id: 1,
  title: "The Great Adventure",
  author: "John Smith",
  description: "An epic tale of adventure and discovery that takes readers on a journey through uncharted territories. This compelling narrative weaves together themes of courage, friendship, and the human spirit's resilience in the face of adversity.",
  isbn: "978-0-123456-78-9",
  category: "Fiction",
  publisher: "ABC Publishing",
  year: 2023,
  availableCount: 3,
  total: 5,
  rating: 4.5,
  reviews: [
    { id: 1, name: "Jane Doe",   date: "3/10/2026", rating: 5, comment: "Absolutely loved this book! The characters are well-developed and the plot is engaging." },
    { id: 2, name: "Bob Wilson", date: "3/8/2026",  rating: 4, comment: "A great read. Highly recommend to anyone who loves adventure stories." },
  ],
};

// ── Stars ────────────────────────────────────────────────────────────────
function Stars({ rating, max = 5, size = 16, interactive = false, onRate }: {
  rating: number; max?: number; size?: number; interactive?: boolean; onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = interactive ? (hovered || rating) > i : rating > i;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? PALETTE.mintTeal : "none"}
            stroke={PALETTE.mintTeal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: interactive ? "pointer" : "default", flexShrink: 0 }}
            onClick={() => interactive && onRate?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ── Review card ──────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div style={{ background: "#f5faf8", border: "1px solid #ddf0e9", borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8f0ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{review.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={PALETTE.slateGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: 12, color: PALETTE.slateGrey }}>{review.date}</span>
            </div>
          </div>
        </div>
        <Stars rating={review.rating} size={15} />
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>{review.comment}</p>
    </div>
  );
}

// ── Write review form ────────────────────────────────────────────────────
function WriteReviewForm({ onSubmit, onCancel }: { onSubmit: (rating: number, comment: string) => void; onCancel: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div style={{ background: "#f5faf8", border: "1px solid #ddf0e9", borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
      <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>Write Your Review</p>
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: PALETTE.darkNavy }}>Rating</p>
        <Stars rating={rating} size={26} interactive onRate={setRating} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: PALETTE.darkNavy }}>Your Review</p>
        <textarea
          value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your thoughts about this book..." rows={4}
          style={{ width: "100%", border: "1.5px solid #cce8de", borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: PALETTE.darkNavy, resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff" }}
          onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
          onBlur={e => (e.target.style.borderColor = "#cce8de")}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { if (rating && comment.trim()) onSubmit(rating, comment); }}
          style={{ background: PALETTE.mintTeal, border: "none", color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, padding: "9px 22px", borderRadius: 7, cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >Submit Review</button>
        <button onClick={onCancel}
          style={{ background: "transparent", border: "1.5px solid #ccc", color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, padding: "9px 22px", borderRadius: 7, cursor: "pointer" }}
        >Cancel</button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function BookDetailPage({ book, onBack }: BookDetailPageProps) {
  const b = book ?? MOCK_BOOK;
  const [reviews, setReviews] = useState<Review[]>(b.reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const handleSubmitReview = (rating: number, comment: string) => {
    setReviews([{ id: reviews.length + 1, name: "You", date: new Date().toLocaleDateString("en-US"), rating, comment }, ...reviews]);
    setShowReviewForm(false);
  };

  const infoCell = (label: string, value: React.ReactNode) => (
    <div>
      <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey }}>{label}</p>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: PALETTE.darkNavy }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: PALETTE.darkNavy, padding: "0 32px", height: 50, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, padding: "24px 32px", maxWidth: 1300, margin: "0 auto", alignItems: "start" }}>

        {/* Left: cover */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1.5px solid #ede5e0" }}>
          <div style={{ background: "linear-gradient(145deg, #5f6f7a, #404E5C)", borderRadius: 8, height: 380, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 12.5, color: PALETTE.slateGrey }}>Availability</p>
          <span style={{ display: "inline-block", background: PALETTE.mintTeal, color: PALETTE.darkNavy, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 20, marginBottom: 16 }}>
            {b.availableCount} of {b.total} Available
          </span>
          <button
            onClick={() => setShowBorrowModal(true)}
            style={{ width: "100%", padding: "13px 0", background: PALETTE.burntOrange, border: "none", borderRadius: 8, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "block" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Borrow This Book
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={PALETTE.burntOrange} stroke={PALETTE.burntOrange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{b.rating}</span>
            <span style={{ fontSize: 13, color: PALETTE.slateGrey }}>({reviews.length} reviews)</span>
          </div>
        </div>

        {/* Right: details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <h1 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: PALETTE.darkNavy }}>{b.title}</h1>
            <p style={{ margin: 0, fontSize: 14.5, color: PALETTE.slateGrey }}>{b.author}</p>
          </div>

          {/* Description + meta */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <h2 style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>Description</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: PALETTE.slateGrey, lineHeight: 1.7 }}>{b.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px", borderTop: "1px solid #f0e8e4", paddingTop: 20 }}>
              {infoCell("ISBN", b.isbn)}
              {infoCell("Category",
                <span style={{ display: "inline-block", background: PALETTE.mintTeal + "33", color: PALETTE.darkNavy, border: `1px solid ${PALETTE.mintTeal}88`, fontSize: 12, fontWeight: 500, padding: "2px 12px", borderRadius: 20 }}>
                  {b.category}
                </span>
              )}
              {infoCell("Publisher", b.publisher)}
              {infoCell("Year", b.year)}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>Reader Reviews</h2>
              {!showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1.5px solid ${PALETTE.burntOrange}`, color: PALETTE.burntOrange, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 7, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = PALETTE.burntOrange; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = PALETTE.burntOrange; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Write Review
                </button>
              )}
            </div>
            {showReviewForm && <WriteReviewForm onSubmit={handleSubmitReview} onCancel={() => setShowReviewForm(false)} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          </div>

        </div>
      </div>

      {/* Borrow modal */}
      {showBorrowModal && (
        <BorrowModal
          bookTitle={b.title}
          onConfirm={() => setShowBorrowModal(false)}
          onCancel={() => setShowBorrowModal(false)}
        />
      )}
    </div>
  );
}