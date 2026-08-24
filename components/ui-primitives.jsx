"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { STATUS, inputClass, inputStyle } from "./constants";

export function StatusBar({ requirements }) {
  const total = requirements.length || 1;
  const counts = { presente: 0, "in-sviluppo": 0, backlog: 0 };
  requirements.forEach((f) => counts[f.status]++);
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#E7E5DE]">
      {Object.entries(counts).map(([key, count]) =>
        count > 0 ? <div key={key} style={{ width: `${(count / total) * 100}%`, backgroundColor: STATUS[key].color }} /> : null
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${s.color}1A`, color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

export function StatusFilterChips({ value, onChange }) {
  const toggle = (key) => onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Object.entries(STATUS).map(([key, s]) => (
        <button key={key} onClick={() => toggle(key)}
          className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
          style={value.includes(key) ? { backgroundColor: s.color, borderColor: s.color, color: "#fff" } : { borderColor: "#D8D5CC", color: "#6B655A" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: value.includes(key) ? "#fff" : s.color }} />
          {s.label}
        </button>
      ))}
      {value.length > 0 && (
        <button onClick={() => onChange([])} className="text-[11px] font-medium underline underline-offset-2" style={{ color: "#8A8578" }}>Azzera</button>
      )}
    </div>
  );
}

export function Chip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors"
      style={active ? { backgroundColor: color, borderColor: color, color: "#fff" } : { backgroundColor: "transparent", borderColor: "#D8D5CC", color: "#3D3A34" }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium" style={{ color: "#6B655A" }}>{label}</span>
      {children}
    </label>
  );
}

export function ComboAdd({ options, value, onChange, onAddNew, placeholder }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const confirmDraft = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      const id = await onAddNew(draft.trim());
      if (id) onChange(id);
      setAdding(false);
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  if (adding) {
    return (
      <div className="flex gap-1.5">
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className={inputClass} style={inputStyle}
          onKeyDown={(e) => { if (e.key === "Enter") confirmDraft(); }} />
        <button disabled={busy} onClick={confirmDraft} className="shrink-0 rounded-md px-2.5 text-[12.5px] font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#1B2430" }}>OK</button>
        <button onClick={() => setAdding(false)} className="shrink-0 text-[12px]" style={{ color: "#8A8578" }}>Annulla</button>
      </div>
    );
  }
  return (
    <select value={value} onChange={(e) => (e.target.value === "__new__" ? setAdding(true) : onChange(e.target.value))} className={inputClass} style={inputStyle}>
      <option value="" disabled>Seleziona…</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      <option value="__new__">+ Aggiungi nuovo…</option>
    </select>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{title}</h3>
          <button onClick={onClose}><X size={16} style={{ color: "#8A8578" }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Elimina", danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#6B655A" }}>{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border px-3 py-1.5 text-[13px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>Annulla</button>
          <button onClick={onConfirm} className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white" style={{ backgroundColor: danger ? "#B5482B" : "#1B2430" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function BlockedDeleteAlert({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold" style={{ color: "#B5482B", fontFamily: "'IBM Plex Serif', serif" }}>Impossibile eliminare</h3>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#6B655A" }}>{message}</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white" style={{ backgroundColor: "#1B2430" }}>Ho capito</button>
        </div>
      </div>
    </div>
  );
}
