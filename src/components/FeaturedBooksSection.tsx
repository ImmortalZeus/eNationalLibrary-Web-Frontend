import type { Book } from "../types";
import { PALETTE } from "../data/constants";
import BookCard from "./BookCard";

interface FeaturedBooksSectionProps {
  books: Book[];
}

export default function FeaturedBooksSection({ books }: FeaturedBooksSectionProps) {
  return (
    <section style={{ padding: "60px 32px 72px", background: PALETTE.blushCream }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        color: PALETTE.darkNavy,
        fontWeight: 700,
        marginBottom: 28,
        marginTop: 0,
      }}>
        Featured Books
      </h2>

      {books.length === 0 ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: PALETTE.slateGrey, fontSize: 14 }}>
          No books match your search.
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
          gap: 20,
          maxWidth: 900,
        }}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}