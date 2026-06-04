// src/pages/admin/ManageBorrowRecordsPage.tsx
import { useEffect, useState } from "react";
import type {
  BorrowRecordPublicDto, ReaderPublicDto, BookPublicDto,
  CreateBorrowRecordDto, UpdateBorrowRecordInput,
} from "../../types";
import { borrowRecordService } from "../../services/borrow-record.service";
import { readerService } from "../../services/reader.service";
import { bookService } from "../../services/book.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  NumberField, SelectField, DateField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | BorrowRecordPublicDto;

const fmt = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString() : "—";
const toInput = (d?: string | Date | null) => d ? new Date(d).toISOString().split("T")[0] : "";
const today = () => new Date().toISOString().split("T")[0];

function statusBadge(br: BorrowRecordPublicDto) {
  if (br.actualReturnDate) return <Badge label="Returned" color={PALETTE.mintTeal} />;
  const overdue = br.dueDate && new Date(br.dueDate) < new Date();
  return overdue
    ? <Badge label="Overdue" color="#c0492f" />
    : <Badge label="Active" color={PALETTE.burntOrange} />;
}

export default function ManageBorrowRecordsPage() {
  const [rows, setRows] = useState<BorrowRecordPublicDto[]>([]);
  const [readers, setReaders] = useState<ReaderPublicDto[]>([]);
  const [books, setBooks] = useState<BookPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<BorrowRecordPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    borrowRecordService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load borrow records."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    readerService.findAllWithUser().then(setReaders).catch(() => {});
    bookService.findAll().then(setBooks).catch(() => {});
  }, []);

  const markReturned = async (br: BorrowRecordPublicDto) => {
    await borrowRecordService.update(br.borrowRecordId, { actualReturnDate: today() });
    load();
  };

  return (
    <div>
      <PageHeader title="Borrow Records" subtitle={`${rows.length} record${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Loan</Button>} />

      <DataTable<BorrowRecordPublicDto>
        loading={loading} error={error} rows={rows} rowKey={b => b.borrowRecordId}
        emptyText="No borrow records yet."
        columns={[
          { header: "Book", render: b => <strong>{b.book?.title ?? "—"}</strong> },
          { header: "Reader", render: b => b.reader?.user?.username ?? "—" },
          { header: "Qty", render: b => b.quantity },
          { header: "Borrowed", render: b => fmt(b.borrowDate) },
          { header: "Due", render: b => fmt(b.dueDate) },
          { header: "Returned", render: b => fmt(b.actualReturnDate) },
          { header: "Status", render: b => statusBadge(b) },
        ]}
        actions={b => <>
          {!b.actualReturnDate && <Button small variant="secondary" onClick={() => markReturned(b)}>Mark returned</Button>}
          <Button small variant="secondary" onClick={() => setEditing(b)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(b)}>Delete</Button>
        </>}
      />

      {editing && <BorrowModal record={editing === "new" ? null : editing} readers={readers} books={books}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete borrow record"
        message={`Delete this borrow record? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await borrowRecordService.remove(deleting.borrowRecordId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function BorrowModal({ record, readers, books, onClose, onSaved }: {
  record: BorrowRecordPublicDto | null; readers: ReaderPublicDto[]; books: BookPublicDto[];
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!record;
  const [quantity, setQuantity] = useState<number>(record?.quantity ?? 1);
  const [borrowDate, setBorrowDate] = useState(toInput(record?.borrowDate) || today());
  const [dueDate, setDueDate] = useState(toInput(record?.dueDate));
  const [actualReturnDate, setActualReturnDate] = useState(toInput(record?.actualReturnDate));
  const [readerId, setReaderId] = useState(record?.reader?.userId ?? readers[0]?.userId ?? "");
  const [bookId, setBookId] = useState(record?.book?.bookId ?? books[0]?.bookId ?? "");
  const { busy, error, run } = useAsyncAction();

  const readerOpts = readers.map(r => ({ value: r.userId, label: r.user?.username ?? r.userId }));
  const bookOpts = books.map(b => ({ value: b.bookId, label: b.title }));

  const submit = () => run(async () => {
    if (isEdit && record) {
      const payload: UpdateBorrowRecordInput = {
        quantity, borrowDate, dueDate, actualReturnDate: actualReturnDate || null,
      };
      await borrowRecordService.update(record.borrowRecordId, payload);
    } else {
      const payload: CreateBorrowRecordDto = {
        quantity, borrowDate, dueDate,
        actualReturnDate: actualReturnDate || null,
        readerId, bookId,
      };
      await borrowRecordService.create(payload);
    }
    onSaved();
  });

  const canSave = Number.isFinite(quantity) && quantity > 0 && borrowDate && dueDate && (isEdit || (readerId && bookId));

  return (
    <Modal open wide title={isEdit ? "Edit Borrow Record" : "New Loan"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !canSave}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      {isEdit ? (
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}><StaticField label="Book" value={record?.book?.title ?? "—"} /></div>
          <div style={{ flex: 1 }}><StaticField label="Reader" value={record?.reader?.user?.username ?? "—"} /></div>
        </div>
      ) : (
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
      )}
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><NumberField label="Quantity" value={quantity} onChange={setQuantity} min={1} /></div>
        <div style={{ flex: 1 }}><DateField label="Borrow date" value={borrowDate} onChange={setBorrowDate} /></div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><DateField label="Due date" value={dueDate} onChange={setDueDate} /></div>
        <div style={{ flex: 1 }}><DateField label="Actual return date" value={actualReturnDate} onChange={setActualReturnDate} hint="Leave blank if not returned" /></div>
      </div>
      {isEdit && <p style={{ margin: "2px 0 0", fontSize: 11.5, color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif" }}>
        Book and reader can't be changed after a record is created.
      </p>}
    </Modal>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: PALETTE.darkNavy, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>{label}</label>
      <div style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #ede5e0", background: "#f3ece9", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: PALETTE.slateGrey }}>{value}</div>
    </div>
  );
}
