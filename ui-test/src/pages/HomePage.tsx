import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FeaturedBooksSection from "../components/FeaturedBooksSection";
import Footer from "../components/Footer";
import { FEATURED_BOOKS } from "../data/constants";

interface HomePageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function HomePage({ onLoginClick, onRegisterClick }: HomePageProps) {
  const [query, setQuery] = useState("");

  const filtered = FEATURED_BOOKS.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <main style={{ flex: 1 }}>
        <HeroSection query={query} setQuery={setQuery} />
        <FeaturesSection />
        <FeaturedBooksSection books={query ? filtered : FEATURED_BOOKS} />
      </main>
      <Footer />
    </div>
  );
}