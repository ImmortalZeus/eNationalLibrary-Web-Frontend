// src/components/admin/ui.tsx
// Shared admin UI primitives — same inline-style / PALETTE language as the rest
// of the frontend. No CSS classes, no UI library.
import { useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { PALETTE } from "../../data/constants";

const SANS = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";
const DANGER = "#c0492f";
const CARD_BORDER = "#ede5e0";

// ── Buttons ───────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  disabled?: boolean;
  small?: boolean;
  style?: CSSProperties;
}

export function Button({
  children, onClick, variant = "primary", type = "button", disabled, small, style,
}: ButtonProps) {
  const base: CSSProperties = {
    fontFamily: SANS,
    fontSize: small ? 12.5 : 13.5,
    fontWeight: 500,
    padding: small ? "6px 13px" : "9px 18px",
    borderRadius: 7,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "background 0.16s, opacity 0.16s",
    whiteSpace: "nowrap",
  };
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary:   { background: PALETTE.burntOrange, border: "none", color: "#fff" },
    secondary: { background: "transparent", border: `1.5px solid ${PALETTE.mintTeal}`, color: PALETTE.darkNavy },
    danger:    { background: "transparent", border: `1.5px solid ${DANGER}`, color: DANGER },
    ghost:     { background: "transparent", border: "none", color: PALETTE.slateGrey },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 24, color: PALETTE.darkNavy, fontWeight: 700 }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: PALETTE.slateGrey, fontFamily: SANS }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${CARD_BORDER}`, padding: "20px 24px", ...style }}>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, accent, icon }: {
  label: string; value: ReactNode; accent: string; icon?: ReactNode;
}) {
  return (
    <div style={{ flex: "1 1 180px", background: "#fff", border: `1.5px solid ${accent}33`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey, fontFamily: SANS }}>{label}</p>
        <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: accent, fontFamily: SERIF }}>{value}</p>
      </div>
      {icon && <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color = PALETTE.slateGrey }: { label: string; color?: string }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: color + "22", color, border: `1px solid ${color}44`, fontFamily: SANS, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── Generic data table ────────────────────────────────────────────────────────
export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  width?: number | string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns, rows, rowKey, loading, error, emptyText = "No records yet.", actions,
}: DataTableProps<T>) {
  if (loading) return <Card><p style={{ margin: 0, color: PALETTE.slateGrey, fontFamily: SANS, fontSize: 13.5 }}>Loading…</p></Card>;
  if (error)   return <ErrorBanner message={error} />;
  if (rows.length === 0) return <EmptyState text={emptyText} />;

  const th: CSSProperties = { textAlign: "left", padding: "12px 16px", fontSize: 11.5, letterSpacing: 0.4, textTransform: "uppercase", color: PALETTE.slateGrey, fontWeight: 600, fontFamily: SANS, borderBottom: `1.5px solid ${CARD_BORDER}` };
  const td: CSSProperties = { padding: "13px 16px", fontSize: 13.5, color: PALETTE.darkNavy, fontFamily: SANS, borderBottom: `1px solid ${CARD_BORDER}`, verticalAlign: "middle" };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${CARD_BORDER}`, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((c, i) => <th key={i} style={{ ...th, width: c.width }}>{c.header}</th>)}
              {actions && <th style={{ ...th, textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={rowKey(row)}>
                {columns.map((c, i) => <td key={i} style={td}>{c.render(row)}</td>)}
                {actions && (
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Empty / error states ──────────────────────────────────────────────────────
export function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1.5px dashed ${CARD_BORDER}`, padding: "40px 24px", textAlign: "center", color: PALETTE.slateGrey, fontFamily: SANS, fontSize: 13.5 }}>
      {text}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ background: "#fdf0ec", border: `1.5px solid ${DANGER}55`, borderRadius: 10, padding: "12px 16px", color: DANGER, fontFamily: SANS, fontSize: 13 }}>
      {message}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, title, onClose, children, footer, wide }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(64,78,92,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px", zIndex: 1000, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: PALETTE.blushCream, borderRadius: 14, width: "100%", maxWidth: wide ? 620 : 480, boxShadow: "0 18px 48px rgba(0,0,0,0.22)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1.5px solid ${CARD_BORDER}` }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: PALETTE.darkNavy, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: PALETTE.slateGrey, fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
        {footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: `1.5px solid ${CARD_BORDER}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel, loading }: {
  open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={<>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>{loading ? "Working…" : confirmLabel}</Button>
      </>}>
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 14, color: PALETTE.slateGrey, lineHeight: 1.5 }}>{message}</p>
    </Modal>
  );
}

// ── Form fields ───────────────────────────────────────────────────────────────
const labelStyle: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: PALETTE.darkNavy, fontFamily: SANS, marginBottom: 6 };
const inputStyle: CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${CARD_BORDER}`, background: "#fff", fontFamily: SANS, fontSize: 13.5, color: PALETTE.darkNavy, outline: "none", boxSizing: "border-box" };

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11.5, color: PALETTE.slateGrey, fontFamily: SANS }}>{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, type = "text", placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} style={inputStyle} />
    </Field>
  );
}

export function NumberField({ label, value, onChange, min, max, hint }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type="number" value={Number.isFinite(value) ? value : ""} min={min} max={max}
        onChange={e => onChange(e.target.value === "" ? NaN : Number(e.target.value))} style={inputStyle} />
    </Field>
  );
}

export function DateField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type="date" value={value ?? ""} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <Field label={label}>
      <textarea value={value} rows={rows} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
    </Field>
  );
}

export function SelectField<V extends string>({ label, value, onChange, options, hint }: {
  label: string; value: V; onChange: (v: V) => void; options: { value: V; label: string }[]; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={e => onChange(e.target.value as V)} style={inputStyle}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

/** Multi-select rendered as toggleable chips (used for book authors/genres/publishers). */
export function ChipMultiSelect({ label, options, selected, onToggle, hint }: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {options.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: PALETTE.slateGrey, fontFamily: SANS }}>None available yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {options.map(o => {
            const on = selected.includes(o.id);
            return (
              <button key={o.id} type="button" onClick={() => onToggle(o.id)}
                style={{
                  fontFamily: SANS, fontSize: 12.5, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                  background: on ? PALETTE.burntOrange : "transparent",
                  color: on ? "#fff" : PALETTE.slateGrey,
                  border: `1.5px solid ${on ? PALETTE.burntOrange : CARD_BORDER}`,
                }}>
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
}

// small hook for async submit state
export function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(null);
    try { await fn(); }
    catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Something went wrong. Please try again."));
      throw e;
    } finally { setBusy(false); }
  }
  return { busy, error, setError, run };
}
