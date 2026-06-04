// src/pages/admin/ManageReadersPage.tsx
import { useEffect, useState } from "react";
import type {
  ReaderPublicDto, UserGender, UserStatus,
  CreateReaderInput, UpdateReaderInput,
} from "../../types";
import { readerService } from "../../services/reader.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  TextField, SelectField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | ReaderPublicDto;

const genderOpts = [{ value: "Male" as UserGender, label: "Male" }, { value: "Female" as UserGender, label: "Female" }];
const statusOpts = [{ value: "Active" as UserStatus, label: "Active" }, { value: "Inactive" as UserStatus, label: "Inactive" }];

export default function ManageReadersPage() {
  const [rows, setRows] = useState<ReaderPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<ReaderPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    readerService.findAllWithUser()
      .then(setRows)
      .catch(() => setError("Could not load readers."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Readers" subtitle={`${rows.length} reader account${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Reader</Button>} />

      <DataTable<ReaderPublicDto>
        loading={loading} error={error} rows={rows} rowKey={r => r.userId}
        emptyText="No readers yet."
        columns={[
          { header: "Username", render: r => <strong>{r.user?.username ?? "—"}</strong> },
          { header: "Email", render: r => r.user?.email ?? "—" },
          { header: "Gender", render: r => r.user?.gender ?? "—" },
          { header: "Phone", render: r => r.user?.phoneNumber ?? "—" },
          { header: "Address", render: r => r.address ?? "—" },
          { header: "Status", render: r => (
            <Badge label={r.user?.status ?? "—"} color={r.user?.status === "Active" ? PALETTE.mintTeal : PALETTE.slateGrey} />
          ) },
        ]}
        actions={r => <>
          <Button small variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(r)}>Delete</Button>
        </>}
      />

      {editing && <ReaderModal reader={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete reader"
        message={`Delete reader "${deleting?.user?.username ?? ""}" and their user account? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await readerService.remove(deleting.userId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function ReaderModal({ reader, onClose, onSaved }: {
  reader: ReaderPublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!reader;
  const [username, setUsername] = useState(reader?.user?.username ?? "");
  const [email, setEmail] = useState(reader?.user?.email ?? "");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<UserGender>(reader?.user?.gender ?? "Male");
  const [status, setStatus] = useState<UserStatus>(reader?.user?.status ?? "Active");
  const [phoneNumber, setPhoneNumber] = useState(reader?.user?.phoneNumber ?? "");
  const [address, setAddress] = useState(reader?.address ?? "");
  const { busy, error, run } = useAsyncAction();

  const submit = () => run(async () => {
    if (isEdit && reader) {
      const user: UpdateReaderInput["user"] = {
        username, email, gender, status,
        phoneNumber: phoneNumber || null,
      };
      if (password.trim()) user!.password = password;
      const payload: UpdateReaderInput = { address: address || null, user };
      await readerService.update(reader.userId, payload);
    } else {
      const payload: CreateReaderInput = {
        address: address || null,
        user: {
          username, email, password, gender, status,
          phoneNumber: phoneNumber || null,
          role: "Reader",
        },
      };
      await readerService.create(payload);
    }
    onSaved();
  });

  const canSave = username.trim() && email.trim() && (isEdit || password.trim().length >= 8);

  return (
    <Modal open wide title={isEdit ? "Edit Reader" : "New Reader"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !canSave}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><TextField label="Username" value={username} onChange={setUsername} /></div>
        <div style={{ flex: 1 }}><TextField label="Email" type="email" value={email} onChange={setEmail} /></div>
      </div>
      <TextField label={isEdit ? "New password (leave blank to keep current)" : "Password"} type="password"
        value={password} onChange={setPassword} hint="At least 8 characters" />
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><SelectField label="Gender" value={gender} onChange={setGender} options={genderOpts} /></div>
        <div style={{ flex: 1 }}><SelectField label="Status" value={status} onChange={setStatus} options={statusOpts} /></div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><TextField label="Phone (optional)" value={phoneNumber ?? ""} onChange={setPhoneNumber} /></div>
        <div style={{ flex: 1 }}><TextField label="Address (optional)" value={address ?? ""} onChange={setAddress} /></div>
      </div>
    </Modal>
  );
}
