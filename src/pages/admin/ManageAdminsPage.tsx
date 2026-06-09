// src/pages/admin/ManageAdminsPage.tsx
import { useEffect, useState } from "react";
import type {
  AdminPublicDto, UserGender, UserStatus,
  CreateAdminInput, UpdateAdminInput,
} from "../../types";
import { adminService } from "../../services/admin.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  TextField, SelectField, ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | AdminPublicDto;

const genderOpts = [{ value: "Male" as UserGender, label: "Male" }, { value: "Female" as UserGender, label: "Female" }];
const statusOpts = [{ value: "Active" as UserStatus, label: "Active" }, { value: "Inactive" as UserStatus, label: "Inactive" }];

export default function ManageAdminsPage() {
  const [rows, setRows] = useState<AdminPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<AdminPublicDto | null>(null);

  const load = () => {
    setLoading(true);
    adminService.findAll()
      .then(setRows)
      .catch(() => setError("Could not load admins."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Admin Accounts" subtitle={`${rows.length} admin${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Admin</Button>} />

      <DataTable<AdminPublicDto>
        loading={loading} error={error} rows={rows} rowKey={a => a.userId}
        emptyText="No admin accounts found."
        columns={[
          { header: "Username", render: a => <strong>{a.user?.username ?? "—"}</strong> },
          { header: "Email", render: a => a.user?.email ?? "—" },
          { header: "Gender", render: a => a.user?.gender ?? "—" },
          { header: "Phone", render: a => a.user?.phoneNumber ?? "—" },
          { header: "Status", render: a => (
            <Badge label={a.user?.status ?? "—"} color={a.user?.status === "Active" ? PALETTE.mintTeal : PALETTE.slateGrey} />
          ) },
        ]}
        actions={a => <>
          <Button small variant="secondary" onClick={() => setEditing(a)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(a)}>Delete</Button>
        </>}
      />

      {editing && <AdminModal admin={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete admin"
        message={`Delete admin "${deleting?.user?.username ?? ""}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await adminService.remove(deleting.userId);
          setDeleting(null); load();
        }} />
    </div>
  );
}

function AdminModal({ admin, onClose, onSaved }: {
  admin: AdminPublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!admin;
  const [username, setUsername] = useState(admin?.user?.username ?? "");
  const [email, setEmail] = useState(admin?.user?.email ?? "");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<UserGender>(admin?.user?.gender ?? "Male");
  const [status, setStatus] = useState<UserStatus>(admin?.user?.status ?? "Active");
  const [phoneNumber, setPhoneNumber] = useState(admin?.user?.phoneNumber ?? "");
  const { busy, error, run } = useAsyncAction();

  const submit = () => run(async () => {
    if (isEdit && admin) {
      const user: UpdateAdminInput["user"] = {
        username, email, gender, status, phoneNumber: phoneNumber || null,
      };
      if (password.trim()) user!.password = password;
      await adminService.update(admin.userId, { user });
    } else {
      const payload: CreateAdminInput = {
        user: { username, email, password, gender, status, phoneNumber: phoneNumber || null, role: "Admin" },
      };
      await adminService.create(payload);
    }
    onSaved();
  });

  const canSave = username.trim() && email.trim() && (isEdit || password.trim().length >= 8);

  return (
    <Modal open wide title={isEdit ? "Edit Admin" : "New Admin"} onClose={onClose}
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
      <TextField label="Phone (optional)" value={phoneNumber ?? ""} onChange={setPhoneNumber} />
    </Modal>
  );
}
