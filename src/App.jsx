import { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReaderDashboard from "./pages/guest/ReaderDashboard";
import BookDetailPage from "./pages/guest/BookDetailPage";
import BrowseBooksPage from "./pages/guest/BrowseBooksPage";
import MyRecordsPage from "./pages/guest/MyRecordsPage";
import ReadingCardPage from "./pages/guest/ReadingCardPage";
import ProfilePage from "./pages/guest/ProfilePage";
import AdminApp from "./pages/admin/AdminApp";

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedBook, setSelectedBook] = useState(undefined);
  const [prevPage, setPrevPage] = useState("readerDashboard");

  const goToBookDetail = (book, from = "readerDashboard") => {
  setSelectedBook(book);   // book is now BookPublicDto
  setPrevPage(from);
  setPage("bookDetail");
};

  if (page === "login") {
    return <LoginPage
      onNavigateToRegister={() => setPage("register")}
      onNavigateToHome={() => setPage("home")}
      onLoginSuccess={(role) => setPage(role === "Admin" ? "admin" : "readerDashboard")}
    />;
  }

  if (page === "admin") {
    return <AdminApp onLogout={() => setPage("home")} />;
  }

  if (page === "register") {
    return <RegisterPage
      onNavigateToLogin={() => setPage("login")}
      onNavigateToHome={() => setPage("home")}
      onRegisterSuccess={() => setPage("home")}
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

  if (page === "profile") {
    return <ProfilePage
      onLogout={() => setPage("home")}
      onNavigate={setPage}
      activePage="profile"
    />;
  }

  if (page === "bookDetail") {
    return <BookDetailPage
      book={selectedBook}
      onBack={() => setPage(prevPage)}
      onNavigate={setPage}
    />;
  }

  return <HomePage
    onLoginClick={() => setPage("login")}
    onRegisterClick={() => setPage("register")}
  />;
}