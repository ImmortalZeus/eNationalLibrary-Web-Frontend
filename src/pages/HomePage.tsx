// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FeaturedBooksSection from "../components/FeaturedBooksSection";
import Footer from "../components/Footer";
import { bookService } from "../services/book.service";
import type { BookPublicDto } from "../types";

interface HomePageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function HomePage({ onLoginClick, onRegisterClick }: HomePageProps) {
  const [query, setQuery]     = useState("");
  const [books, setBooks]     = useState<BookPublicDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /books is auth-guarded; guests get 401 and simply see an empty section.
    bookService.findAll()
      .then(data => setBooks(data))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => {
    const author = b.authors?.map(a => a.name).join(" ") ?? "";
    return (
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      author.toLowerCase().includes(query.toLowerCase())
    );
  });

  const displayed = query ? filtered : books;

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
        <FeaturedBooksSection books={displayed} isSearching={!!query} emptyMessage={emptyMessage} />
      </main>
      <Footer />
    </div>
  );
}