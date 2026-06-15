// src/pages/admin/AdminApp.tsx
// Self-contained admin console: sidebar + section switching.
// Rendered from App.jsx when a user logs in with role === "Admin".
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar, { SIDEBAR_WIDTH } from "../../components/admin/AdminSidebar";
import type { AdminSection } from "../../components/admin/AdminSidebar";
import { PALETTE } from "../../data/constants";

import AdminDashboard from "./AdminDashboard";
import ManageBooksPage from "./ManageBooksPage";
import ManageAuthorsPage from "./ManageAuthorsPage";
import ManagePublishersPage from "./ManagePublishersPage";
import ManageGenresPage from "./ManageGenresPage";
import ManageReadersPage from "./ManageReadersPage";
import ManageBorrowRecordsPage from "./ManageBorrowRecordsPage";
import ManageReadingCardsPage from "./ManageReadingCardsPage";
import ManagePromotionsPage from "./ManagePromotionsPage";
import ManageReviewsPage from "./ManageReviewsPage";
import ManageAdminsPage from "./ManageAdminsPage";

export default function AdminApp({ onLogout }: { onLogout: () => void }) {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");

  const handleLogout = () => { logout(); onLogout(); };

  const render = () => {
    switch (section) {
      case "dashboard":     return <AdminDashboard onNavigate={setSection} />;
      case "books":         return <ManageBooksPage />;
      case "authors":       return <ManageAuthorsPage />;
      case "publishers":    return <ManagePublishersPage />;
      case "genres":        return <ManageGenresPage />;
      case "readers":       return <ManageReadersPage />;
      case "borrowRecords": return <ManageBorrowRecordsPage />;
      case "readingCards":  return <ManageReadingCardsPage />;
      case "promotions":    return <ManagePromotionsPage />;
      case "reviews":       return <ManageReviewsPage />;
      case "admins":        return <ManageAdminsPage />;
      default:              return <AdminDashboard onNavigate={setSection} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.blushCream, fontFamily: "'DM Sans', sans-serif" }}>
      <AdminSidebar active={section} onSelect={setSection} onLogout={handleLogout} username={user?.username} />
      <main style={{ marginLeft: SIDEBAR_WIDTH, padding: "32px 40px", maxWidth: 1300 }}>
        {render()}
      </main>
    </div>
  );
}
