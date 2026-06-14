// src/pages/guest/BookDetailPage.tsx
import { useState, useEffect } from "react";
import { PALETTE } from "../../data/constants";
import BorrowModal from "../../components/BorrowModal";
import { bookService } from "../../services/book.service";
import { reviewService } from "../../services/review.service";
import { readerService } from "../../services/reader.service";
import { useAuth } from "../../context/AuthContext";
import type { BookPublicDto, ReviewPublicDto } from "../../types";

interface BookDetailPageProps {
  book?: BookPublicDto;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLoginRequired?: () => void;  // add this — called when guest tries to borrow
}

function Stars({ rating, max = 5, size = 16, interactive = false, onRate }: {
  rating: number; max?: number; size?: number;
  interactive?: boolean; onRate?: (r: number) => void;
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewPublicDto }) {
  const name = review.reader?.user?.username ?? "Reader";
  return (
    <div style={{ background: "#f5faf8", border: "1px solid #ddf0e9", borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8f0ed",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={PALETTE.slateGrey} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{name}</p>
            <span style={{ fontSize: 12, color: PALETTE.slateGrey }}>
              {new Date(review.reviewDate).toLocaleDateString("en-US")}
            </span>
          </div>
        </div>
        <Stars rating={review.rating} size={15} />
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: PALETTE.slateGrey, lineHeight: 1.6 }}>{review.comment}</p>
    </div>
  );
}

function WriteReviewForm({ onSubmit, onCancel }: {
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
}) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    onSubmit(rating, comment);
  };

  return (
    <div style={{ background: "#f5faf8", border: "1px solid #ddf0e9", borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
      <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: PALETTE.darkNavy }}>Write Your Review</p>
      {error && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 8,
          padding: "8px 12px", fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
          {error}
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: PALETTE.darkNavy }}>Rating</p>
        <Stars rating={rating} size={26} interactive onRate={r => { setRating(r); setError(null); }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: PALETTE.darkNavy }}>Your Review</p>
        <textarea value={comment} onChange={e => { setComment(e.target.value); setError(null); }}
          placeholder="Share your thoughts about this book..." rows={4}
          style={{ width: "100%", border: "1.5px solid #cce8de", borderRadius: 8,
            padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
            color: PALETTE.darkNavy, resize: "vertical", outline: "none",
            boxSizing: "border-box", background: "#fff" }}
          onFocus={e => (e.target.style.borderColor = PALETTE.mintTeal)}
          onBlur={e  => (e.target.style.borderColor = "#cce8de")}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSubmit} style={{
          background: PALETTE.mintTeal, border: "none", color: PALETTE.darkNavy,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600,
          padding: "9px 22px", borderRadius: 7, cursor: "pointer",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >Submit Review</button>
        <button onClick={onCancel} style={{
          background: "transparent", border: "1.5px solid #ccc", color: PALETTE.slateGrey,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500,
          padding: "9px 22px", borderRadius: 7, cursor: "pointer",
        }}>Cancel</button>
      </div>
    </div>
  );
}

export default function BookDetailPage({ book, onBack, onNavigate, onLoginRequired }: BookDetailPageProps) {
  const { user, readerId } = useAuth();
  const [reviews, setReviews]               = useState<ReviewPublicDto[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [reviewError, setReviewError]       = useState<string | null>(null);
  const [currentReaderId, setCurrentReaderId] = useState<string | null>(null);

  // Load reviews and readerId
  useEffect(() => {
    if (!book) return;

    // Fetch book with reviews
    bookService.findById(book.bookId).then(b => {
      setReviews(b.reviews ?? []);
    });

    // Get readerId for submitting reviews
    if (readerId && readerId !== "null") {
      setCurrentReaderId(readerId);
    } else if (user?.sub) {
      readerService.findByUserId(user.sub).then(r => {
        if (r) setCurrentReaderId(r.userId);
      });
    }
  }, [book?.bookId]);

  useEffect(() => {
  if (!user) {
    setCurrentReaderId(null);
  } else if (readerId && readerId !== "null") {
    setCurrentReaderId(readerId);
  } else if (user.sub) {
    readerService.findByUserId(user.sub).then(r => {
      if (r) setCurrentReaderId(r.userId);
    });
  }
}, [user, readerId]);
  if (!book) {
    return (
      <div style={{ minHeight: "100vh", background: PALETTE.blushCream,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: PALETTE.slateGrey, fontSize: 14 }}>No book selected.</p>
          <button onClick={onBack} style={{ marginTop: 12, background: PALETTE.burntOrange,
            border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: "pointer" }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const author    = book.authors?.map(a => a.name).join(", ") ?? "Unknown";
  const genre     = book.genres?.[0]?.label ?? "Unknown";
  const publisher = book.publishers?.map(p => p.name).join(", ") ?? "Unknown";
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Check if current user already reviewed this book
  const alreadyReviewed = reviews.some(r => r.reader?.userId === currentReaderId);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentReaderId || !book) return;
    setSubmitting(true);
    setReviewError(null);
    try {
      await reviewService.create({
        rating,
        comment,
        reviewDate: new Date().toISOString().split("T")[0],
        bookId:     book.bookId,
        readerId:   currentReaderId,
      });
      // Refresh reviews
      const updated = await bookService.findById(book.bookId);
      setReviews(updated.reviews ?? []);
      setShowReviewForm(false);
    } catch {
      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
      <div style={{ background: PALETTE.darkNavy, padding: "0 32px", height: 50,
        display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8,
          background: "transparent", border: "none", color: PALETTE.blushCream,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20,
        padding: "24px 32px", maxWidth: 1300, margin: "0 auto", alignItems: "start" }}>

        {/* Left: cover */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1.5px solid #ede5e0" }}>
          <div style={{ background: "linear-gradient(145deg, #5f6f7a, #404E5C)", borderRadius: 8,
            height: 380, display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, overflow: "hidden" }}>
            {book.previewUrl ? (
              <img src={book.previewUrl} alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            )}
          </div>

          {/* Rating summary */}
          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={PALETTE.burntOrange}
                stroke={PALETTE.burntOrange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.darkNavy }}>{avgRating}</span>
              <span style={{ fontSize: 13, color: PALETTE.slateGrey }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}

          <button onClick={() => {
            if (!user) {
              onLoginRequired?.();  // redirect to login if not logged in
            } else {
              setShowBorrowModal(true);
            }
          }} style={{
            width: "100%", padding: "13px 0", background: PALETTE.burntOrange,
            border: "none", borderRadius: 8, color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 600,
            cursor: "pointer", display: "block",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >{user ? "Borrow This Book" : "Login to Borrow"}</button>
        </div>

        {/* Right: details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <h1 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 700, color: PALETTE.darkNavy }}>{book.title}</h1>
            <p style={{ margin: 0, fontSize: 14.5, color: PALETTE.slateGrey }}>{author}</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <h2 style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', serif",
              fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>Description</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: PALETTE.slateGrey, lineHeight: 1.7 }}>
              {book.description}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px",
              borderTop: "1px solid #f0e8e4", paddingTop: 20 }}>
              {infoCell("Genre",
                <span style={{ display: "inline-block", background: PALETTE.mintTeal + "33",
                  color: PALETTE.darkNavy, border: `1px solid ${PALETTE.mintTeal}88`,
                  fontSize: 12, fontWeight: 500, padding: "2px 12px", borderRadius: 20 }}>
                  {genre}
                </span>
              )}
              {infoCell("Publisher", publisher)}
              {infoCell("Authors", author)}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1.5px solid #ede5e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0e8e4" }}>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif",
                fontSize: 17, fontWeight: 700, color: PALETTE.darkNavy }}>
                Reader Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {!showReviewForm && !alreadyReviewed && user && (
                <button onClick={() => {
                    if (!user) { onLoginRequired?.(); return; }
                    setShowReviewForm(true);
                  }}  style={{
                  display: "flex", alignItems: "center", gap: 6, background: "transparent",
                  border: `1.5px solid ${PALETTE.burntOrange}`, color: PALETTE.burntOrange,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  padding: "7px 16px", borderRadius: 7, cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = PALETTE.burntOrange; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = PALETTE.burntOrange; }}
                >Write Review</button>
              )}
              {alreadyReviewed && (
                <span style={{ fontSize: 12.5, color: PALETTE.slateGrey, fontStyle: "italic" }}>
                  You've already reviewed this book
                </span>
              )}
            </div>

            {reviewError && (
              <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 8,
                padding: "8px 12px", fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
                {reviewError}
              </div>
            )}

            {showReviewForm && (
              <WriteReviewForm
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {reviews.length === 0 && !showReviewForm ? (
              <p style={{ fontSize: 13.5, color: PALETTE.slateGrey }}>No reviews yet. Be the first!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.map(r => <ReviewCard key={r.reviewId} review={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showBorrowModal && (
        <BorrowModal
          bookTitle={book.title}
          bookId={book.bookId}
          onConfirm={() => setShowBorrowModal(false)}
          onCancel={() => setShowBorrowModal(false)}
          onNavigateToCard={() => { setShowBorrowModal(false); onNavigate?.("readingCard"); }}
        />
      )}
    </div>
  );
}