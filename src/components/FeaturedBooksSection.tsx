import type { BookPublicDto } from "../types";
import { PALETTE } from "../data/constants";
import BookCard from "./BookCard";

interface FeaturedBooksSectionProps {
  books: BookPublicDto[];
  isSearching?: boolean;
  emptyMessage?: string;
  onViewBook?: (book: BookPublicDto) => void; 
}

export default function FeaturedBooksSection({ books, isSearching, emptyMessage = "No books match your search.", onViewBook }: FeaturedBooksSectionProps) {
  return (
    <section style={{ padding: "60px 40px 72px", background: PALETTE.blushCream }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 22,
        color: PALETTE.darkNavy, fontWeight: 700, marginBottom: 28, marginTop: 0,
      }}>
        {isSearching ? `Search Results (${books.length})` : "Featured Books"}
      </h2>

      {books.length === 0 ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: PALETTE.slateGrey, fontSize: 14 }}>
          {emptyMessage}
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isSearching
            ? "repeat(auto-fill, minmax(160px, 1fr))"  // flexible when searching
            : "repeat(8, 1fr)",                         // fixed 8 columns when featured
          gap: 16,
        }}>
          {books.map(book => (
            <BookCard key={book.bookId} book={book} onClick={() => onViewBook?.(book)} />
          ))}
        </div>
      )}
    </section>
  );
}