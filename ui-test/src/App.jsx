import { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReaderDashboard from "./pages/guest/ReaderDashboard";
import BookDetailPage from "./pages/guest/BookDetailPage";
import BrowseBooksPage from "./pages/guest/Browsebookspage";
import MyRecordsPage from "./pages/guest/MyRecordsPage";
import ReadingCardPage from "./pages/guest/ReadingCardPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedBook, setSelectedBook] = useState(undefined);
  const [prevPage, setPrevPage] = useState("readerDashboard");

  const goToBookDetail = (book, from = "readerDashboard") => {
    setSelectedBook(book);
    setPrevPage(from);
    setPage("bookDetail");
  };

  if (page === "login") {
    return <LoginPage
      onNavigateToRegister={() => setPage("register")}
      onNavigateToHome={() => setPage("home")}
      onLoginSuccess={(role) => setPage(role === "Admin" ? "home" : "readerDashboard")}
    />;
  }

  if (page === "register") {
    return <RegisterPage
      onNavigateToLogin={() => setPage("login")}
      onNavigateToHome={() => setPage("home")}
    />;
  }

  if (page === "readerDashboard") {
    return <ReaderDashboard
      onLogout={() => setPage("home")}
      onViewBook={(book) => goToBookDetail(book, "readerDashboard")}
      onBrowseMore={() => setPage("browseBooks")}
      onViewAll={() => setPage("myRecords")}
      onNavigate={setPage}
    />;
  }

  if (page === "browseBooks") {
    return <BrowseBooksPage
      onBack={() => setPage("home")}
      onViewBook={(book) => goToBookDetail(book, "browseBooks")}
      activePage="browseBooks"
      onNavigate={setPage}
    />;
  }

  if (page === "myRecords") {
    return <MyRecordsPage
      onLogout={() => setPage("home")}
      onNavigate={setPage}
      activePage="myRecords"
    />;
  }

  if (page === "readingCard") {
    return <ReadingCardPage
      onLogout={() => setPage("home")}
      onNavigate={setPage}
      activePage="readingCard"
    />;
  }

  if (page === "bookDetail") {
    return <BookDetailPage
      book={selectedBook}
      onBack={() => setPage(prevPage)}
    />;
  }

  return <HomePage
    onLoginClick={() => setPage("login")}
    onRegisterClick={() => setPage("register")}
  />;
}