// src/pages/admin/ManageGenresPage.tsx
import { useEffect, useState } from "react";
import type { GenrePublicDto } from "../../types";
import { genreService } from "../../services/genre.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog,
  TextField, TextAreaField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";

type Editing = null | "new" | GenrePublicDto;

export default function ManageGenresPage() {
  const [rows, setRows] = useState<GenrePublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<GenrePublicDto | null>(null);

  const load = () => {
    setLoading(true);
    genreService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load genres."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Genres" subtitle={`${rows.length} genre${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Genre</Button>} />

      <DataTable<GenrePublicDto>
        loading={loading} error={error} rows={rows} rowKey={g => g.genreId}
        emptyText="No genres yet. Add the first one."
        columns={[
          { header: "Label", render: g => <strong>{g.label}</strong> },
          { header: "Description", render: g => g.description ?? "—" },
        ]}
        actions={g => <>
          <Button small variant="secondary" onClick={() => setEditing(g)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(g)}>Delete</Button>
        </>}
      />

      {editing && <GenreModal genre={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete genre"
        message={`Delete "${deleting?.label}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await genreService.remove(deleting.genreId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function GenreModal({ genre, onClose, onSaved }: {
  genre: GenrePublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const [label, setLabel] = useState(genre?.label ?? "");
  const [description, setDescription] = useState(genre?.description ?? "");
  const { busy, error, run } = useAsyncAction();

  const submit = () => run(async () => {
    const payload = { label, description };
    if (genre) await genreService.update(genre.genreId, payload);
    else await genreService.create(payload);
    onSaved();
  });

  return (
    <Modal open title={genre ? "Edit Genre" : "New Genre"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !label.trim()}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Fiction" />
      <TextAreaField label="Description" value={description} onChange={setDescription} />
    </Modal>
  );
}
