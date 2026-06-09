// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { BorrowRecordPublicDto } from "../../types";
import { bookService } from "../../services/book.service";
import { readerService } from "../../services/reader.service";
import { authorService } from "../../services/author.service";
import { genreService } from "../../services/genre.service";
import { publisherService } from "../../services/publisher.service";
import { borrowRecordService } from "../../services/borrow-record.service";
import { readingCardService } from "../../services/reading-card.service";
import { reviewService } from "../../services/review.service";
import {
  PageHeader, StatCard, Card, DataTable, Badge,
} from "../../components/admin/ui";
import type { AdminSection } from "../../components/admin/AdminSidebar";
import { PALETTE } from "../../data/constants";

const SANS = "'DM Sans', sans-serif";
const fmt = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString() : "—";

const icon = (path: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

interface Counts {
  books: number; readers: number; authors: number; genres: number;
  publishers: number; activeLoans: number; overdue: number; cards: number; reviews: number;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: AdminSection) => void }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<BorrowRecordPublicDto[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      bookService.findAll(),
      readerService.findAllWithUser(),
      authorService.findAll(),
      genreService.findAll(),
      publisherService.findAll(),
      borrowRecordService.findAll(),
      readingCardService.findAll(),
      reviewService.findAll(),
    ]).then(([books, readers, authors, genres, publishers, loans, cards, reviews]) => {
      const val = <T,>(r: PromiseSettledResult<T[]>): T[] => r.status === "fulfilled" ? r.value : [];
      const loanRows = val(loans) as BorrowRecordPublicDto[];
      const active = loanRows.filter(l => !l.actualReturnDate);
      const overdue = active.filter(l => l.dueDate && new Date(l.dueDate) < new Date());
      setCounts({
        books: val(books).length,
        readers: val(readers).length,
        authors: val(authors).length,
        genres: val(genres).length,
        publishers: val(publishers).length,
        activeLoans: active.length,
        overdue: overdue.length,
        cards: val(cards).length,
        reviews: val(reviews).length,
      });
      setRecent([...loanRows].sort((a, b) =>
        new Date(b.borrowDate as string).getTime() - new Date(a.borrowDate as string).getTime()
      ).slice(0, 6));
      setLoadingRecent(false);
    });
  }, []);

  const c = counts;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Library overview at a glance" />

      {/* Primary stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard label="Books" value={c ? c.books : "…"} accent={PALETTE.burntOrange}
          icon={icon(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>)} />
        <StatCard label="Readers" value={c ? c.readers : "…"} accent={PALETTE.darkNavy}
          icon={icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>)} />
        <StatCard label="Active Loans" value={c ? c.activeLoans : "…"} accent={PALETTE.mintTeal}
          icon={icon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)} />
        <StatCard label="Overdue" value={c ? c.overdue : "…"} accent="#c0492f"
          icon={icon(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>)} />
      </div>

      {/* Secondary stats — clickable shortcuts */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <MiniStat label="Authors" value={c?.authors} onClick={() => onNavigate("authors")} />
        <MiniStat label="Genres" value={c?.genres} onClick={() => onNavigate("genres")} />
        <MiniStat label="Publishers" value={c?.publishers} onClick={() => onNavigate("publishers")} />
        <MiniStat label="Reading Cards" value={c?.cards} onClick={() => onNavigate("readingCards")} />
        <MiniStat label="Reviews" value={c?.reviews} onClick={() => onNavigate("reviews")} />
      </div>

      {/* Recent activity */}
      <h2 style={{ margin: "0 0 14px", fontFamily: "'Playfair Display', serif", fontSize: 17, color: PALETTE.darkNavy }}>Recent Loans</h2>
      <DataTable<BorrowRecordPublicDto>
        loading={loadingRecent} rows={recent} rowKey={b => b.borrowRecordId}
        emptyText="No borrow records yet."
        columns={[
          { header: "Book", render: b => <strong>{b.book?.title ?? "—"}</strong> },
          { header: "Reader", render: b => b.reader?.user?.username ?? "—" },
          { header: "Borrowed", render: b => fmt(b.borrowDate) },
          { header: "Due", render: b => fmt(b.dueDate) },
          { header: "Status", render: b => b.actualReturnDate
            ? <Badge label="Returned" color={PALETTE.mintTeal} />
            : (b.dueDate && new Date(b.dueDate) < new Date()
                ? <Badge label="Overdue" color="#c0492f" />
                : <Badge label="Active" color={PALETTE.burntOrange} />) },
        ]}
      />
    </div>
  );
}

function MiniStat({ label, value, onClick }: { label: string; value?: number; onClick: () => void }) {
  return (
    <Card style={{ flex: "1 1 150px", padding: "14px 18px", cursor: "pointer" }}>
      <div onClick={onClick}>
        <p style={{ margin: 0, fontSize: 12, color: PALETTE.slateGrey, fontFamily: SANS }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 700, color: PALETTE.darkNavy, fontFamily: "'Playfair Display', serif" }}>
          {value ?? "…"}
        </p>
      </div>
    </Card>
  );
}
