// src/pages/admin/ManageReadingCardsPage.tsx
import { useEffect, useState } from "react";
import type {
  ReadingCardPublicDto, ReaderPublicDto, ReadingCardType,
  CreateReadingCardInput, UpdateReadingCardInput,
} from "../../types";
import { readingCardService } from "../../services/reading-card.service";
import { readerService } from "../../services/reader.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  TextField, SelectField, DateField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | ReadingCardPublicDto;

const typeOpts = [
  { value: "Normal" as ReadingCardType, label: "Normal" },
  { value: "VIP" as ReadingCardType, label: "VIP" },
];

const fmt = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString() : "—";
const toInput = (d?: string | Date | null) => d ? new Date(d).toISOString().split("T")[0] : "";

export default function ManageReadingCardsPage() {
  const [rows, setRows] = useState<ReadingCardPublicDto[]>([]);
  const [readers, setReaders] = useState<ReaderPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<ReadingCardPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    readingCardService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load reading cards."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    readerService.findAllWithUser().then(setReaders).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Reading Cards" subtitle={`${rows.length} card${rows.length !== 1 ? "s" : ""} issued`}
        action={<Button onClick={() => setEditing("new")}>+ Issue Card</Button>} />

      <DataTable<ReadingCardPublicDto>
        loading={loading} error={error} rows={rows} rowKey={c => c.readingCardId}
        emptyText="No reading cards issued yet."
        columns={[
          { header: "Label", render: c => <strong>{c.label}</strong> },
          { header: "Type", render: c => <Badge label={c.type} color={c.type === "VIP" ? PALETTE.burntOrange : PALETTE.slateGrey} /> },
          { header: "Reader", render: c => c.reader?.user?.username ?? "—" },
          { header: "Activated", render: c => fmt(c.activationDate) },
          { header: "Expires", render: c => fmt(c.expiryDate) },
        ]}
        actions={c => <>
          <Button small variant="secondary" onClick={() => setEditing(c)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(c)}>Delete</Button>
        </>}
      />

      {editing && <CardModal card={editing === "new" ? null : editing} readers={readers}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete reading card"
        message={`Delete card "${deleting?.label}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await readingCardService.remove(deleting.readingCardId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function CardModal({ card, readers, onClose, onSaved }: {
  card: ReadingCardPublicDto | null; readers: ReaderPublicDto[]; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!card;
  const [label, setLabel] = useState(card?.label ?? "");
  const [type, setType] = useState<ReadingCardType>(card?.type ?? "Normal");
  const [activationDate, setActivationDate] = useState(toInput(card?.activationDate) || toInput(new Date()));
  const [expiryDate, setExpiryDate] = useState(toInput(card?.expiryDate));
  const [readerId, setReaderId] = useState(card?.reader?.userId ?? readers[0]?.userId ?? "");
  const { busy, error, run } = useAsyncAction();

  const readerOpts = readers.map(r => ({ value: r.userId, label: r.user?.username ?? r.userId }));

  const submit = () => run(async () => {
    if (isEdit && card) {
      const payload: UpdateReadingCardInput = {
        label, type, activationDate, expiryDate: expiryDate || null,
      };
      await readingCardService.update(card.readingCardId, payload);
    } else {
      const payload: CreateReadingCardInput = {
        label, type, activationDate, expiryDate: expiryDate || null, readerId,
      };
      await readingCardService.create(payload);
    }
    onSaved();
  });

  return (
    <Modal open title={isEdit ? "Edit Reading Card" : "Issue Reading Card"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !label.trim() || (!isEdit && !readerId)}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Standard 2026" />
      <SelectField label="Type" value={type} onChange={setType} options={typeOpts} />
      {isEdit ? (
        <TextField label="Reader" value={card?.reader?.user?.username ?? "—"} onChange={() => {}}
          hint="Reader cannot be reassigned after a card is issued." />
      ) : (
        <SelectField label="Reader" value={readerId} onChange={setReaderId}
          options={readerOpts.length ? readerOpts : [{ value: "", label: "No readers available" }]} />
      )}
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><DateField label="Activation date" value={activationDate} onChange={setActivationDate} /></div>
        <div style={{ flex: 1 }}><DateField label="Expiry date" value={expiryDate} onChange={setExpiryDate} hint="Optional" /></div>
      </div>
    </Modal>
  );
}
