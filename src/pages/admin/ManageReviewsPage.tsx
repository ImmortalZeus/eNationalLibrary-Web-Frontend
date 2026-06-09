// src/pages/admin/ManageReviewsPage.tsx
import { useEffect, useState } from "react";
import type {
  ReviewPublicDto, ReaderPublicDto, BookPublicDto,
  CreateReviewInput, UpdateReviewInput,
} from "../../types";
import { reviewService } from "../../services/review.service";
import { readerService } from "../../services/reader.service";
import { bookService } from "../../services/book.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog,
  NumberField, SelectField, DateField, TextAreaField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | ReviewPublicDto;

const fmt = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString() : "—";
const toInput = (d?: string | Date | null) => d ? new Date(d).toISOString().split("T")[0] : "";
const today = () => new Date().toISOString().split("T")[0];
const stars = (n: number) => "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(Math.max(0, 5 - n));

export default function ManageReviewsPage() {
  const [rows, setRows] = useState<ReviewPublicDto[]>([]);
  const [readers, setReaders] = useState<ReaderPublicDto[]>([]);
  const [books, setBooks] = useState<BookPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<ReviewPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    reviewService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load reviews. (The /reviews endpoint requires a valid admin token.)"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    readerService.findAllWithUser().then(setReaders).catch(() => {});
    bookService.findAll().then(setBooks).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${rows.length} review${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Review</Button>} />

      <DataTable<ReviewPublicDto>
        loading={loading} error={error} rows={rows} rowKey={r => r.reviewId}
        emptyText="No reviews yet."
        columns={[
          { header: "Book", render: r => <strong>{r.book?.title ?? "—"}</strong> },
          { header: "Reader", render: r => r.reader?.user?.username ?? "—" },
          { header: "Rating", render: r => <span style={{ color: PALETTE.burntOrange, letterSpacing: 1 }}>{stars(r.rating)}</span> },
          { header: "Comment", render: r => r.comment },
          { header: "Date", render: r => fmt(r.reviewDate) },
        ]}
        actions={r => <>
          <Button small variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(r)}>Delete</Button>
        </>}
      />

      {editing && <ReviewModal review={editing === "new" ? null : editing} readers={readers} books={books}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete review"
        message={`Delete this review? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await reviewService.remove(deleting.reviewId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function ReviewModal({ review, readers, books, onClose, onSaved }: {
  review: ReviewPublicDto | null; readers: ReaderPublicDto[]; books: BookPublicDto[];
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!review;
  const [rating, setRating] = useState<number>(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [reviewDate, setReviewDate] = useState(toInput(review?.reviewDate) || today());
  const [readerId, setReaderId] = useState(review?.reader?.userId ?? readers[0]?.userId ?? "");
  const [bookId, setBookId] = useState(review?.book?.bookId ?? books[0]?.bookId ?? "");
  const { busy, error, run } = useAsyncAction();

  const readerOpts = readers.map(r => ({ value: r.userId, label: r.user?.username ?? r.userId }));
  const bookOpts = books.map(b => ({ value: b.bookId, label: b.title }));

  const submit = () => run(async () => {
    const base = { rating, comment, reviewDate, bookId, readerId };
    if (isEdit && review) await reviewService.update(review.reviewId, base as UpdateReviewInput);
    else await reviewService.create(base as CreateReviewInput);
    onSaved();
  });

  const canSave = rating >= 1 && rating <= 5 && comment.trim() && reviewDate && bookId && readerId;

  return (
    <Modal open wide title={isEdit ? "Edit Review" : "New Review"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !canSave}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <SelectField label="Book" value={bookId} onChange={setBookId}
            options={bookOpts.length ? bookOpts : [{ value: "", label: "No books available" }]} />
        </div>
        <div style={{ flex: 1 }}>
          <SelectField label="Reader" value={readerId} onChange={setReaderId}
            options={readerOpts.length ? readerOpts : [{ value: "", label: "No readers available" }]} />
        </div>
      </div>
      <NumberField label="Rating (1–5)" value={rating} onChange={setRating} min={1} max={5} />
      <TextAreaField label="Comment" value={comment} onChange={setComment} rows={3} />
      <DateField label="Review date" value={reviewDate} onChange={setReviewDate} />
    </Modal>
  );
}
