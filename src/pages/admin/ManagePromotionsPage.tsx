// src/pages/admin/ManagePromotionsPage.tsx
import { useEffect, useState } from "react";
import type {
  PromotionPublicDto, DiscountType, ReadingCardType,
  CreatePromotionInput, UpdatePromotionInput,
} from "../../types";
import { promotionService } from "../../services/promotion.service";
import {
  PageHeader, Button, DataTable, Modal, ConfirmDialog, Badge,
  TextField, TextAreaField, NumberField, DateField, SelectField, ChipMultiSelect,
  ErrorBanner, useAsyncAction,
} from "../../components/admin/ui";
import { PALETTE } from "../../data/constants";

type Editing = null | "new" | PromotionPublicDto;

const discountTypeOpts = [
  { value: "Percentage" as DiscountType, label: "Percentage (%)" },
  { value: "FixedAmount" as DiscountType, label: "Fixed amount" },
];
const cardTypeOptions = [
  { id: "Normal", label: "Normal" },
  { id: "VIP", label: "VIP" },
];

const fmtDate = (d?: string | Date | null) => (d ? new Date(d).toLocaleDateString() : "—");
const toInput = (d?: string | Date | null) => (d ? new Date(d).toISOString().split("T")[0] : "");
const fmtDiscount = (p: PromotionPublicDto) =>
  p.discountType === "Percentage" ? `${p.discountValue}% off` : `${p.discountValue} off`;

export default function ManagePromotionsPage() {
  const [rows, setRows] = useState<PromotionPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<PromotionPublicDto | null>(null);
  // activate confirmation carries the affected-card count (null = still loading)
  const [activating, setActivating] = useState<{ promo: PromotionPublicDto; count: number | null } | null>(null);
  const [deactivating, setDeactivating] = useState<PromotionPublicDto | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    promotionService.findAll()
      .then(setRows)
      .catch((e: { response?: { status?: number } }) => {
        const status = e?.response?.status;
        if (status === 401) setError("Your session has expired. Please log out and log in again.");
        else if (status === 403) setError("This account doesn't have admin access.");
        else setError(`Could not load promotions${status ? ` (HTTP ${status})` : ""}.`);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const startActivate = (promo: PromotionPublicDto) => {
    setActivating({ promo, count: null });
    promotionService.affectedCards(promo.promotionId)
      .then(count => setActivating(cur => (cur && cur.promo.promotionId === promo.promotionId ? { promo, count } : cur)))
      .catch(() => setActivating(cur => (cur && cur.promo.promotionId === promo.promotionId ? { promo, count: -1 } : cur)));
  };

  const isActiveWindow = (p: PromotionPublicDto) => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  };

  return (
    <div>
      <PageHeader title="Promotions" subtitle={`${rows.length} promotion${rows.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setEditing("new")}>+ New Promotion</Button>} />

      <DataTable<PromotionPublicDto>
        loading={loading} error={error} rows={rows} rowKey={p => p.promotionId}
        emptyText="No promotions yet. Create the first one."
        columns={[
          { header: "Name", render: p => (
            <div>
              <strong>{p.name}</strong>
              {p.description && <div style={{ fontSize: 12, color: PALETTE.slateGrey }}>{p.description}</div>}
            </div>
          ) },
          { header: "Discount", render: p => fmtDiscount(p) },
          { header: "Card types", render: p => (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.applicableCardTypes.map(t => <Badge key={t} label={t} color={t === "VIP" ? PALETTE.burntOrange : PALETTE.slateGrey} />)}
            </div>
          ) },
          { header: "Age", render: p => `${p.applicableAgeMin}–${p.applicableAgeMax}` },
          { header: "Window", render: p => (
            <span style={{ color: isActiveWindow(p) ? PALETTE.darkNavy : "#c0492f" }}>
              {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
            </span>
          ) },
          { header: "Overrides", render: p => {
            const parts: string[] = [];
            if (p.maxBorrowedBooksOverride) parts.push(`${p.maxBorrowedBooksOverride} books`);
            if (p.maxBorrowDurationOverride) parts.push(`${p.maxBorrowDurationOverride} days`);
            return parts.length ? parts.join(", ") : "—";
          } },
          { header: "Status", render: p => (
            <Badge label={p.isActive ? "Active" : "Inactive"} color={p.isActive ? PALETTE.mintTeal : PALETTE.slateGrey} />
          ) },
        ]}
        actions={p => <>
          {p.isActive
            ? <Button small variant="secondary" onClick={() => setDeactivating(p)}>Deactivate</Button>
            : <Button small onClick={() => startActivate(p)}>Activate</Button>}
          <Button small variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
          <Button small variant="danger" onClick={() => setDeleting(p)}>Delete</Button>
        </>}
      />

      {editing && <PromotionModal promo={editing === "new" ? null : editing}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmDialog open={!!deleting} title="Delete promotion"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await promotionService.remove(deleting.promotionId);
          setDeleting(null); load();
        }} />

      {/* Activate — shows how many cards it will touch */}
      <ConfirmDialog open={!!activating} title="Activate promotion" confirmLabel="Activate" loading={busy}
        message={
          activating
            ? `"${activating.promo.name}" will be applied to ${
                activating.count === null ? "…" : activating.count === -1 ? "an unknown number of" : activating.count
              } existing reading card${activating.count === 1 ? "" : "s"}, and to matching new cards going forward. Activate now?`
            : ""
        }
        onCancel={() => setActivating(null)}
        onConfirm={async () => {
          if (!activating) return;
          setBusy(true);
          try { await promotionService.activate(activating.promo.promotionId); setActivating(null); load(); }
          finally { setBusy(false); }
        }} />

      {/* Deactivate — reverts affected cards */}
      <ConfirmDialog open={!!deactivating} title="Deactivate promotion" confirmLabel="Deactivate" loading={busy}
        message={`Deactivate "${deactivating?.name}"? Reading cards that had this promotion will revert to default pricing and limits.`}
        onCancel={() => setDeactivating(null)}
        onConfirm={async () => {
          if (!deactivating) return;
          setBusy(true);
          try { await promotionService.deactivate(deactivating.promotionId); setDeactivating(null); load(); }
          finally { setBusy(false); }
        }} />
    </div>
  );
}

function PromotionModal({ promo, onClose, onSaved }: {
  promo: PromotionPublicDto | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!promo;
  const [name, setName] = useState(promo?.name ?? "");
  const [description, setDescription] = useState(promo?.description ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(promo?.discountType ?? "Percentage");
  const [discountValue, setDiscountValue] = useState<number>(promo?.discountValue ?? 10);
  const [maxBooks, setMaxBooks] = useState<number>(promo?.maxBorrowedBooksOverride ?? NaN);
  const [maxDuration, setMaxDuration] = useState<number>(promo?.maxBorrowDurationOverride ?? NaN);
  const [cardTypes, setCardTypes] = useState<string[]>(promo?.applicableCardTypes ?? ["Normal", "VIP"]);
  const [ageMin, setAgeMin] = useState<number>(promo?.applicableAgeMin ?? 0);
  const [ageMax, setAgeMax] = useState<number>(promo?.applicableAgeMax ?? 120);
  const [startDate, setStartDate] = useState(toInput(promo?.startDate) || toInput(new Date()));
  const [endDate, setEndDate] = useState(toInput(promo?.endDate));
  const { busy, error, run } = useAsyncAction();

  const toggleCardType = (id: string) =>
    setCardTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submit = () => run(async () => {
    const payload: CreatePromotionInput = {
      name: name.trim(),
      discountType,
      discountValue,
      applicableCardTypes: cardTypes as ReadingCardType[],
      applicableAgeMin: ageMin,
      applicableAgeMax: ageMax,
      startDate,
      endDate,
    };
    if (description.trim()) payload.description = description.trim();
    if (Number.isFinite(maxBooks) && maxBooks > 0) payload.maxBorrowedBooksOverride = maxBooks;
    if (Number.isFinite(maxDuration) && maxDuration > 0) payload.maxBorrowDurationOverride = maxDuration;

    if (isEdit && promo) await promotionService.update(promo.promotionId, payload as UpdatePromotionInput);
    else await promotionService.create(payload);
    onSaved();
  });

  const valid =
    name.trim() &&
    Number.isFinite(discountValue) && discountValue >= 0 &&
    (discountType !== "Percentage" || discountValue <= 100) &&
    cardTypes.length > 0 &&
    Number.isFinite(ageMin) && Number.isFinite(ageMax) && ageMin >= 0 && ageMax >= ageMin &&
    startDate && endDate && endDate >= startDate;

  return (
    <Modal open wide title={isEdit ? "Edit Promotion" : "New Promotion"} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !valid}>{busy ? "Saving…" : "Save"}</Button>
      </>}>
      {error && <div style={{ marginBottom: 14 }}><ErrorBanner message={error} /></div>}

      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Summer Student Discount" />
      <TextAreaField label="Description (optional)" value={description} onChange={setDescription} rows={2} />

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <SelectField label="Discount type" value={discountType} onChange={setDiscountType} options={discountTypeOpts} />
        </div>
        <div style={{ flex: 1 }}>
          <NumberField label={discountType === "Percentage" ? "Discount (%)" : "Discount amount"}
            value={discountValue} onChange={setDiscountValue} min={0} max={discountType === "Percentage" ? 100 : undefined}
            hint={discountType === "Percentage" ? "0–100" : "Flat reduction off the card price"} />
        </div>
      </div>

      <ChipMultiSelect label="Applicable card types" options={cardTypeOptions}
        selected={cardTypes} onToggle={toggleCardType} hint="Select at least one." />

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><NumberField label="Min age" value={ageMin} onChange={setAgeMin} min={0} /></div>
        <div style={{ flex: 1 }}><NumberField label="Max age" value={ageMax} onChange={setAgeMax} min={0} /></div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <NumberField label="Max borrowed books override" value={maxBooks} onChange={setMaxBooks} min={1}
            hint="Optional — leave blank to keep the card's default." />
        </div>
        <div style={{ flex: 1 }}>
          <NumberField label="Max borrow duration override (days)" value={maxDuration} onChange={setMaxDuration} min={1}
            hint="Optional — leave blank to keep the default." />
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}><DateField label="Start date" value={startDate} onChange={setStartDate} /></div>
        <div style={{ flex: 1 }}><DateField label="End date" value={endDate} onChange={setEndDate} /></div>
      </div>

      {isEdit && (
        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: PALETTE.slateGrey, fontFamily: "'DM Sans', sans-serif" }}>
          Editing does not change the active state. Use Activate / Deactivate on the list to apply or revert this promotion.
        </p>
      )}
    </Modal>
  );
}
