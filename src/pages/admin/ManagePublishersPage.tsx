// src/pages/admin/ManagePublishersPage.tsx
import { useEffect, useState } from "react";
import type { PublisherPublicDto } from "../../types";
import { publisherService } from "../../services/publisher.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog,
  TextField, TextAreaField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";

type Editing = null | "new" | PublisherPublicDto;

export default function ManagePublishersPage() {
  const [rows, setRows] = useState<PublisherPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<PublisherPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    publisherService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load publishers."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Publishers" subtitle={`${rows.length} publisher${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Publisher</Button>} />

      <DataTable<PublisherPublicDto>
        loading={loading} error={error} rows={rows} rowKey={p => p.publisherId}
        emptyText="No publishers yet. Add the first one."
        columns={[
          { header: "Name", render: p => <strong>{p.name}</strong> },
          { header: "Description", render: p => p.description ?? "—" },
        ]}
        actions={p => <>
          <Button small variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(p)}>Delete</Button>
        </>}
      />

      {editing && <PublisherModal publisher={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete publisher"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await publisherService.remove(deleting.publisherId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function PublisherModal({ publisher, onClose, onSaved }: {
  publisher: PublisherPublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(publisher?.name ?? "");
  const [description, setDescription] = useState(publisher?.description ?? "");
  const { busy, error, run } = useAsyncAction();

  const submit = () => run(async () => {
    const payload = { name, description };
    if (publisher) await publisherService.update(publisher.publisherId, payload);
    else await publisherService.create(payload);
    onSaved();
  });

  return (
    <Modal open title={publisher ? "Edit Publisher" : "New Publisher"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Penguin Books" />
      <TextAreaField label="Description" value={description} onChange={setDescription} />
    </Modal>
  );
}
