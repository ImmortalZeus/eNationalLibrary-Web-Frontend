import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FeaturedBooksSection from "../components/FeaturedBooksSection";
import Footer from "../components/Footer";
import { bookService } from "../services/book.service";
import type { Book, BookPublicDto } from "../types";

interface HomePageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// Map a backend BookPublicDto into the lightweight card shape used on the landing page.
function toCard(b: BookPublicDto, i: number): Book {
  return {
    id: i,
    title: b.title,
    author: b.authors?.map(a => a.name).join(", ") || "Unknown",
    genre: b.genres?.[0]?.label ?? "—",
    status: "Available",
  };
}

export default function HomePage({ onLoginClick, onRegisterClick }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /books is auth-guarded; guests will get 401 and simply see an empty section.
    bookService.findAll()
      .then(data => setBooks(data.slice(0, 8).map(toCard)))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  const emptyMessage = loading
    ? "Loading…"
    : query
      ? "No books match your search."
      : "Sign in to explore our collection.";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <main style={{ flex: 1 }}>
        <HeroSection query={query} setQuery={setQuery} />
        <FeaturesSection />
        <FeaturedBooksSection books={query ? filtered : books} emptyMessage={emptyMessage} />
      </main>
      <Footer />
    </div>
  );
}
