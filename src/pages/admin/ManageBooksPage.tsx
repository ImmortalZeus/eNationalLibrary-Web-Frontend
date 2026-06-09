// src/pages/admin/ManageBooksPage.tsx
import { useEffect, useState } from "react";
import type {
  BookPublicDto, AuthorPublicDto, GenrePublicDto, PublisherPublicDto,
} from "../../types";
import { bookService } from "../../services/book.service";
import { authorService } from "../../services/author.service";
import { genreService } from "../../services/genre.service";
import { publisherService } from "../../services/publisher.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  TextField, TextAreaField, ChipMultiSelect, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | BookPublicDto;

export default function ManageBooksPage() {
  const [rows, setRows] = useState<BookPublicDto[]>([]);
  const [authors, setAuthors] = useState<AuthorPublicDto[]>([]);
  const [genres, setGenres] = useState<GenrePublicDto[]>([]);
  const [publishers, setPublishers] = useState<PublisherPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<BookPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    bookService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load books. (The /books endpoint requires a valid admin token.)"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    authorService.findAll().then(setAuthors).catch(() => {});
    genreService.findAll().then(setGenres).catch(() => {});
    publisherService.findAll().then(setPublishers).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Books" subtitle={`${rows.length} book${rows.length !== 1 ? "s" : ""} in the catalog`}
        action={<Button onClick={() => setEditing("new")}>+ New Book</Button>} />

      <DataTable<BookPublicDto>
        loading={loading} error={error} rows={rows} rowKey={b => b.bookId}
        emptyText="No books yet. Add the first one."
        columns={[
          { header: "Title", render: b => <strong>{b.title}</strong> },
          { header: "Authors", render: b => listNames(b.authors?.map(a => a.name)) },
          { header: "Genres", render: b => (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {b.genres?.length ? b.genres.map(g => <Badge key={g.genreId} label={g.label} color={PALETTE.darkNavy} />) : "—"}
            </div>
          ) },
          { header: "Publishers", render: b => listNames(b.publishers?.map(p => p.name)) },
        ]}
        actions={b => <>
          <Button small variant="secondary" onClick={() => setEditing(b)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(b)}>Delete</Button>
        </>}
      />

      {editing && (
        <BookModal
          book={editing === "new" ? null : editing}
          authors={authors} genres={genres} publishers={publishers}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog open={!!deleting} title="Delete book"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await bookService.remove(deleting.bookId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function listNames(names?: string[]) {
  if (!names || names.length === 0) return "—";
  return names.join(", ");
}

function BookModal({ book, authors, genres, publishers, onClose, onSaved }: {
  book: BookPublicDto | null;
  authors: AuthorPublicDto[]; genres: GenrePublicDto[]; publishers: PublisherPublicDto[];
  onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(book?.title ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [previewUrl, setPreviewUrl] = useState(book?.previewUrl ?? "");
  const [authorIds, setAuthorIds] = useState<string[]>(book?.authors?.map(a => a.authorId) ?? []);
  const [genreIds, setGenreIds] = useState<string[]>(book?.genres?.map(g => g.genreId) ?? []);
  const [publisherIds, setPublisherIds] = useState<string[]>(book?.publishers?.map(p => p.publisherId) ?? []);
  const { busy, error, run } = useAsyncAction();

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
    setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submit = () => run(async () => {
    const payload = { title, description, previewUrl, authorIds, genreIds, publisherIds };
    if (book) await bookService.update(book.bookId, payload);
    else await bookService.create(payload);
    onSaved();
  });

  return (
    <Modal open wide title={book ? "Edit Book" : "New Book"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !title.trim() || !previewUrl.trim()}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <TextField label="Title" value={title} onChange={setTitle} placeholder="Book title" />
      <TextField label="Cover / preview URL" value={previewUrl} onChange={setPreviewUrl} placeholder="https://…" />
      <TextAreaField label="Description" value={description} onChange={setDescription} rows={3} />
      <ChipMultiSelect label="Authors" options={authors.map(a => ({ id: a.authorId, label: a.name }))}
        selected={authorIds} onToggle={toggle(setAuthorIds)} hint="Click to add / remove. Manage the full list under Authors." />
      <ChipMultiSelect label="Genres" options={genres.map(g => ({ id: g.genreId, label: g.label }))}
        selected={genreIds} onToggle={toggle(setGenreIds)} />
      <ChipMultiSelect label="Publishers" options={publishers.map(p => ({ id: p.publisherId, label: p.name }))}
        selected={publisherIds} onToggle={toggle(setPublisherIds)} />
    </Modal>
  );
}
