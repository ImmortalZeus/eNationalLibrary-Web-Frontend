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
  onViewBook?: (book: BookPublicDto) => void;
}

export default function HomePage({
  onLoginClick,
  onRegisterClick,
  onViewBook,
}: HomePageProps) {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookPublicDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    bookService
      .findAll()
      .then((data) => {
        setBooks(data);

        // Build genre list
        const genres = Array.from(
          new Set(
            data.flatMap(
              (book) => book.genres?.map((g) => g.label) ?? []
            )
          )
        );

        setCategories(["All", ...genres]);
      })
      .catch(() => {
        setBooks([]);
        setCategories(["All"]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter((book) => {
    const author =
      book.authors?.map((a) => a.name).join(" ") ?? "";

    const genre =
      book.genres?.[0]?.label ?? "";

    const matchQuery =
      query.trim() === "" ||
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      author.toLowerCase().includes(query.toLowerCase());

    const matchCategory =
      category === "All" || genre === category;

    return matchQuery && matchCategory;
  });

  const displayed = filtered;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      <main style={{ flex: 1 }}>
        <HeroSection
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        <FeaturesSection />

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#545F66",
            }}
          >
            Loading books…
          </div>
        ) : (
          <FeaturedBooksSection
            books={displayed}
            isSearching={
              !!query || category !== "All"
            }
            onViewBook={onViewBook}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}