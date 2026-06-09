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
    bookService.findAll()
      .then(data => setBooks(data))
      .finally(() => setLoading(false));
  }, []);

  // Search filters ALL books
  const filtered = books.filter(b => {
    const author = b.authors?.map(a => a.name).join(" ") ?? "";
    return (
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      author.toLowerCase().includes(query.toLowerCase())
    );
  });

  // When searching — show all matching results
  // When not searching — show only first 8 as featured
  const displayed = query ? filtered : books.slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <main style={{ flex: 1 }}>
        <HeroSection query={query} setQuery={setQuery} />
        <FeaturesSection />
        {loading
          ? <div style={{ padding: "40px", textAlign: "center", color: "#545F66" }}>Loading books…</div>
          : <FeaturedBooksSection books={displayed} isSearching={!!query} />
        }
      </main>
      <Footer />
    </div>
  );
}