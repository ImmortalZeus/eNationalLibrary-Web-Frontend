// src/pages/admin/ManageAuthorsPage.tsx
import { useEffect, useState } from "react";
import type { AuthorPublicDto } from "../../types";
import { authorService } from "../../services/author.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog,
  TextField, TextAreaField, DateField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";

type Editing = null | "new" | AuthorPublicDto;

const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString() : "—";
const toInputDate = (d?: string | Date | null) =>
  d ? new Date(d).toISOString().split("T")[0] : "";

export default function ManageAuthorsPage() {
  const [rows, setRows] = useState<AuthorPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<AuthorPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    authorService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load authors."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Authors" subtitle={`${rows.length} author${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Author</Button>} />

      <DataTable<AuthorPublicDto>
        loading={loading} error={error} rows={rows} rowKey={a => a.authorId}
        emptyText="No authors yet. Add the first one."
        columns={[
          { header: "Name", render: a => <strong>{a.name}</strong> },
          { header: "Born", render: a => fmtDate(a.dateOfBirth) },
          { header: "Died", render: a => fmtDate(a.dateOfDeath) },
          { header: "Description", render: a => <span style={{ color: "#545F66" }}>{truncate(a.description, 60)}</span> },
        ]}
        actions={a => <>
          <Button small variant="secondary" onClick={() => setEditing(a)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(a)}>Delete</Button>
        </>}
      />

      {editing && <AuthorModal author={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete author"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await authorService.remove(deleting.authorId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function truncate(s: string | undefined, n: number) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function AuthorModal({ author, onClose, onSaved }: {
  author: AuthorPublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(author?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(toInputDate(author?.dateOfBirth));
  const [dateOfDeath, setDateOfDeath] = useState(toInputDate(author?.dateOfDeath));
  const [description, setDescription] = useState(author?.description ?? "");
  const { busy, error, run } = useAsyncAction();

  const submit = () => run(async () => {
    const payload = {
      name,
      dateOfBirth: dateOfBirth || undefined,
      dateOfDeath: dateOfDeath || null,
      description,
    };
    if (author) await authorService.update(author.authorId, payload);
    else await authorService.create(payload);
    onSaved();
  });

  return (
    <Modal open title={author ? "Edit Author" : "New Author"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Jane Austen" />
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><DateField label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} /></div>
        <div style={{ flex: 1 }}><DateField label="Date of death" value={dateOfDeath} onChange={setDateOfDeath} hint="Leave blank if living" /></div>
      </div>
      <TextAreaField label="Description" value={description} onChange={setDescription} />
    </Modal>
  );
}
