"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import { signOut } from "next-auth/react";
import {
  Search, Link2, AlertTriangle, Layers, X, ChevronDown, ArrowLeftRight,
  Network, LayoutGrid, Plus, Trash2, Loader2, Upload, Download, FileSpreadsheet, LogOut, Tag,
} from "lucide-react";

const STATUS = {
  presente: { label: "Presente", color: "#2F7D5C" },
  "in-sviluppo": { label: "In sviluppo", color: "#C97F1E" },
  backlog: { label: "Backlog", color: "#8791A0" },
};
const COLOR_PALETTE = ["#3E5C76", "#6B4E71", "#7A6A3F", "#7A3E3E", "#4B6B4B", "#5B4B7A", "#2F6B6F", "#7A5A3E"];
const TYPE_PALETTE = ["#2F6F76", "#A0522D", "#6A4FA0", "#1F7A4C", "#3A6EA5", "#8A5A44", "#B5482B", "#4B6B4B"];

async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

function sharedOf(req) {
  const map = new Map();
  (req.sharedWith || []).forEach((r) => map.set(r.id, r));
  (req.sharedBy || []).forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
}

function contractLabel(contract) {
  if (!contract) return "Nessun contratto collegato";
  return contract.name;
}

function StatusBar({ requirements }) {
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

function StatusPill({ status }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${s.color}1A`, color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

function Chip({ active, color, onClick, children }) {
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium" style={{ color: "#6B655A" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = { borderColor: "#D8D5CC", color: "#232019" };
const inputClass = "w-full rounded-md border bg-white px-2.5 py-1.5 text-[13.5px] outline-none";

function ComboAdd({ options, value, onChange, onAddNew, placeholder }) {
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

function Modal({ title, onClose, children }) {
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

function NewContractModal({ vendors, onClose, onCreate, onAddVendor }) {
  const [name, setName] = useState("");
  const [vendorId, setVendorId] = useState(vendors[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const canSave = name.trim() && vendorId;
  return (
    <Modal title="Nuovo contratto" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome / codice contratto">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Contratto Gestione Documentale RAS" />
        </Field>
        <Field label="Fornitore / RTI">
          <ComboAdd options={vendors} value={vendorId} onChange={setVendorId} onAddNew={onAddVendor} placeholder="Nome nuovo fornitore o RTI" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Data inizio">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Data fine (vuota se attivo)">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
        </div>
        <button disabled={!canSave} onClick={() => canSave && onCreate({ name: name.trim(), vendorId, startDate: startDate || null, endDate: endDate || null })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          Crea contratto
        </button>
      </div>
    </Modal>
  );
}

function NewAppModal({ domains, contracts, onClose, onCreate, onAddDomain, onOpenNewContract }) {
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState(domains[0]?.id || "");
  const [contractId, setContractId] = useState("");
  const canSave = name.trim() && domainId;
  return (
    <Modal title="Nuovo applicativo" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome applicativo">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Portale istanze online" />
        </Field>
        <Field label="Dominio">
          <ComboAdd options={domains} value={domainId} onChange={setDomainId} onAddNew={onAddDomain} placeholder="Nome nuovo dominio" />
        </Field>
        <Field label="Contratto">
          <div className="flex gap-1.5">
            <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Nessun contratto</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.vendor.name}</option>)}
            </select>
            <button type="button" onClick={onOpenNewContract} className="shrink-0 rounded-md border px-2.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              + Nuovo
            </button>
          </div>
        </Field>
        <button disabled={!canSave} onClick={() => canSave && onCreate({ name: name.trim(), domainId, contractId: contractId || null })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          Crea applicativo
        </button>
      </div>
    </Modal>
  );
}

function NewFeatureModal({ app, apps, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("backlog");
  const [externalId, setExternalId] = useState("");
  const [externalSystem, setExternalSystem] = useState("");
  const [shareWith, setShareWith] = useState("");
  const otherFeatures = apps.filter((a) => a.id !== app.id).flatMap((a) => a.requirements.map((f) => ({ id: f.id, label: `${a.name} — ${f.name}` })));
  return (
    <Modal title={`Nuovo requisito · ${app.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome / intento del requisito">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Notifica automatica scadenza pratica" />
        </Field>
        <Field label="Stato">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Id esterno (opzionale)">
            <input value={externalId} onChange={(e) => setExternalId(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. DOC-123" />
          </Field>
          <Field label="Sistema esterno">
            <input value={externalSystem} onChange={(e) => setExternalSystem(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Jira" />
          </Field>
        </div>
        <Field label="Requisito condiviso con (opzionale)">
          <select value={shareWith} onChange={(e) => setShareWith(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Nessuno</option>
            {otherFeatures.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </Field>
        <button
          disabled={!name.trim()}
          onClick={() => onCreate({ name: name.trim(), status, externalId: externalId.trim() || null, externalSystem: externalSystem.trim() || null, shareWithId: shareWith || null })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          Aggiungi requisito
        </button>
      </div>
    </Modal>
  );
}

function NewIntegrationModal({ app, apps, types, onAddType, onClose, onCreate }) {
  const others = apps.filter((a) => a.id !== app.id);
  const [direction, setDirection] = useState("out");
  const [target, setTarget] = useState(others[0]?.id || "");
  const [typeId, setTypeId] = useState(types[0]?.id || "");
  const [label, setLabel] = useState("");
  return (
    <Modal title={`Nuova integrazione · ${app.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Direzione">
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="out">{app.name} si integra con…</option>
            <option value="in">…è usato da</option>
          </select>
        </Field>
        <Field label="Applicativo">
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} style={inputStyle}>
            {others.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Tipologia di integrazione">
          <ComboAdd options={types} value={typeId} onChange={setTypeId} onAddNew={onAddType} placeholder="Nome nuova tipologia" />
        </Field>
        <Field label="Descrizione della relazione">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Richiama l'API di protocollazione" />
        </Field>
        <button
          disabled={!target || !typeId || !label.trim()}
          onClick={() => onCreate({ fromId: direction === "out" ? app.id : target, toId: direction === "out" ? target : app.id, typeId, label: label.trim() })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          Aggiungi integrazione
        </button>
      </div>
    </Modal>
  );
}

function integrationsFor(integrations, appId) {
  return { outgoing: integrations.filter((i) => i.fromId === appId), incoming: integrations.filter((i) => i.toId === appId) };
}

function AppDetailPanel({ app, apps, integrations, integrationTypes, onJump, onClose, onDeleteApp, onDeleteFeature, onDeleteIntegration, onAddFeature, onAddIntegration, onAddIntegrationType, saving }) {
  const { outgoing, incoming } = integrationsFor(integrations, app.id);
  const hasIntegrations = outgoing.length > 0 || incoming.length > 0;
  const [modal, setModal] = useState(null);

  return (
    <div>
      {hasIntegrations && (
        <div className="mb-4 space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Integrazioni con altri applicativi</div>
          {outgoing.map((i) => {
            const t = apps.find((a) => a.id === i.toId);
            if (!t) return null;
            return (
              <div key={i.id} className="flex items-center gap-1.5">
                <button onClick={() => onJump(t.id)} className="flex flex-1 items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12px] font-medium" style={{ backgroundColor: "#EAF2F2", color: i.type.color }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: i.type.color }} />
                  <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide">{i.type.name}</span>
                  Si integra con «{t.name}» — {i.label}
                </button>
                <button onClick={() => onDeleteIntegration(i.id)} disabled={saving} className="shrink-0 p-1 disabled:opacity-50"><Trash2 size={13} style={{ color: "#B5B0A3" }} /></button>
              </div>
            );
          })}
          {incoming.map((i) => {
            const s = apps.find((a) => a.id === i.fromId);
            if (!s) return null;
            return (
              <div key={i.id} className="flex items-center gap-1.5">
                <button onClick={() => onJump(s.id)} className="flex flex-1 items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12px] font-medium" style={{ backgroundColor: "#EAF2F2", color: i.type.color }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: i.type.color }} />
                  <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide">{i.type.name}</span>
                  Usato da «{s.name}» — {i.label}
                </button>
                <button onClick={() => onDeleteIntegration(i.id)} disabled={saving} className="shrink-0 p-1 disabled:opacity-50"><Trash2 size={13} style={{ color: "#B5B0A3" }} /></button>
              </div>
            );
          })}
        </div>
      )}

      <ul className="space-y-2.5">
        {app.requirements.map((f) => (
          <li key={f.id} className="rounded-md p-2.5" style={{ backgroundColor: "#FBFAF7" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13.5px]" style={{ color: "#232019" }}>{f.name}</span>
              <div className="flex items-center gap-2">
                <StatusPill status={f.status} />
                <button onClick={() => onDeleteFeature(f.id)} disabled={saving} className="disabled:opacity-50"><Trash2 size={13} style={{ color: "#B5B0A3" }} /></button>
              </div>
            </div>
            {f.externalId && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
                <Tag size={10} /> {f.externalId}{f.externalSystem ? ` · ${f.externalSystem}` : ""}
              </div>
            )}
            {sharedOf(f).map((other) => (
              <button key={other.id} onClick={() => onJump(apps.find((a) => a.requirements.some((rr) => rr.id === other.id))?.id)}
                className="mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium" style={{ backgroundColor: "#FBEDE8", color: "#B5482B" }}>
                <Link2 size={12} /> Requisito già presente anche in «{apps.find((a) => a.requirements.some((rr) => rr.id === other.id))?.name}» — {other.name}
              </button>
            ))}
          </li>
        ))}
        {app.requirements.length === 0 && (
          <li className="rounded-md border border-dashed p-3 text-center text-[12.5px]" style={{ borderColor: "#D8D5CC", color: "#8A8578" }}>Nessun requisito censito</li>
        )}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setModal("feature")} className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}><Plus size={13} /> Requisito</button>
        <button onClick={() => setModal("integration")} className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}><Plus size={13} /> Integrazione</button>
        <button onClick={() => onDeleteApp(app.id)} disabled={saving} className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium disabled:opacity-50" style={{ color: "#B5482B" }}><Trash2 size={13} /> Elimina applicativo</button>
      </div>

      {onClose && <button onClick={onClose} className="mt-4 flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "#8A8578" }}><X size={12} /> Chiudi dettaglio</button>}

      {modal === "feature" && <NewFeatureModal app={app} apps={apps} onClose={() => setModal(null)} onCreate={(payload) => { onAddFeature(app.id, payload); setModal(null); }} />}
      {modal === "integration" && (
        <NewIntegrationModal app={app} apps={apps} types={integrationTypes} onAddType={onAddIntegrationType} onClose={() => setModal(null)}
          onCreate={(payload) => { onAddIntegration(payload); setModal(null); }} />
      )}
    </div>
  );
}

function RelationMap({ apps, integrations, integrationTypes, selected, onSelect, ...panelProps }) {
  const width = 860;
  const height = 480;

  const { nodes, links } = useMemo(() => {
    const appIds = new Set(apps.map((a) => a.id));
    const rawNodes = apps.map((a) => ({ id: a.id, name: a.name, domain: a.domain }));
    const rawLinks = [];
    integrations.forEach((i) => {
      if (appIds.has(i.fromId) && appIds.has(i.toId)) rawLinks.push({ source: i.fromId, target: i.toId, kind: "integration", type: i.type, label: i.label });
    });
    const seen = new Set();
    apps.forEach((app) =>
      app.requirements.forEach((f) => {
        sharedOf(f).forEach((other) => {
          const otherApp = apps.find((a) => a.requirements.some((rr) => rr.id === other.id));
          if (otherApp && otherApp.id !== app.id) {
            const key = [app.id, otherApp.id].sort().join("--");
            if (!seen.has(key)) { seen.add(key); rawLinks.push({ source: app.id, target: otherApp.id, kind: "requirement" }); }
          }
        });
      })
    );
    const simNodes = rawNodes.map((n) => ({ ...n }));
    const simLinks = rawLinks.map((l) => ({ ...l }));
    const simulation = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink(simLinks).id((d) => d.id).distance(150).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(54))
      .stop();
    for (let i = 0; i < 400; i++) simulation.tick();
    simNodes.forEach((n) => { n.x = Math.max(50, Math.min(width - 50, n.x)); n.y = Math.max(40, Math.min(height - 40, n.y)); });
    return { nodes: simNodes, links: simLinks };
  }, [apps, integrations]);

  const selectedApp = selected ? apps.find((a) => a.id === selected) : null;
  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const s = new Set([selected]);
    links.forEach((l) => { if (l.source.id === selected) s.add(l.target.id); if (l.target.id === selected) s.add(l.source.id); });
    return s;
  }, [selected, links]);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E2DFD6" }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: "auto", maxHeight: 480 }}>
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2F6F76" /></marker>
            {integrationTypes.map((t) => (
              <marker key={t.id} id={`arrow-${t.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={t.color} /></marker>
            ))}
          </defs>
          {links.map((l, idx) => {
            const dim = connectedIds && !(connectedIds.has(l.source.id) && connectedIds.has(l.target.id));
            const isReq = l.kind === "requirement";
            const stroke = isReq ? "#B5482B" : l.type?.color || "#2F6F76";
            return (
              <line key={idx} x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y} stroke={stroke}
                strokeWidth={isReq ? 1.6 : 1.8} strokeDasharray={isReq ? "4 3" : "0"} opacity={dim ? 0.15 : isReq ? 0.7 : 0.6}
                markerEnd={isReq ? undefined : `url(#arrow-${l.type?.id || "default"})`}>
                {!isReq && <title>{l.type ? `${l.type.name} — ${l.label}` : l.label}</title>}
              </line>
            );
          })}
          {nodes.map((n) => {
            const dim = connectedIds && !connectedIds.has(n.id);
            const isSelected = selected === n.id;
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`} onClick={() => onSelect(isSelected ? null : n.id)} style={{ cursor: "pointer" }} opacity={dim ? 0.3 : 1}>
                <circle r={30} fill={n.domain?.color || "#8791A0"} stroke={isSelected ? "#232019" : "#fff"} strokeWidth={isSelected ? 2.5 : 2} />
                <text textAnchor="middle" dy={4} fontSize="9.5" fontWeight="600" fill="#fff" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  {n.name.length > 14 ? n.name.slice(0, 13) + "…" : n.name}
                </text>
                <title>{n.name}</title>
              </g>
            );
          })}
        </svg>
      </div>
      {selectedApp && (
        <div className="mt-3 rounded-lg border bg-white p-4" style={{ borderColor: "#E2DFD6" }}>
          <div className="mb-3">
            <div className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{selectedApp.name}</div>
            <div className="mt-1 inline-block rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
              {contractLabel(selectedApp.contract)}
            </div>
          </div>
          <AppDetailPanel app={selectedApp} apps={apps} integrations={integrations} integrationTypes={integrationTypes} onClose={() => onSelect(null)} {...panelProps} />
        </div>
      )}
    </div>
  );
}

function rowsFromSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  return sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "" }) : [];
}

function datasetFromWorkbook(workbook) {
  const domains = rowsFromSheet(workbook, "Domini").filter((r) => r.id).map((r, i) => ({ id: String(r.id), name: String(r.etichetta || r.id), color: r.colore_hex || COLOR_PALETTE[i % COLOR_PALETTE.length] }));
  const vendors = rowsFromSheet(workbook, "Fornitori").filter((r) => r.id).map((r) => ({ id: String(r.id), name: String(r.etichetta || r.id) }));
  const integrationTypes = rowsFromSheet(workbook, "TipiIntegrazione").filter((r) => r.id).map((r, i) => ({ id: String(r.id), name: String(r.etichetta || r.id), color: r.colore_hex || TYPE_PALETTE[i % TYPE_PALETTE.length] }));
  const contracts = rowsFromSheet(workbook, "Contratti").filter((r) => r.id).map((r) => ({
    id: String(r.id), name: String(r.nome || r.id), vendorId: String(r.fornitore_id || ""),
    startDate: r.data_inizio || null, endDate: r.data_fine || null,
  }));
  const reqRows = rowsFromSheet(workbook, "Requisiti").filter((r) => r.id && r.app_id);
  const reqByApp = {};
  reqRows.forEach((r) => {
    const appId = String(r.app_id);
    if (!reqByApp[appId]) reqByApp[appId] = [];
    const status = ["presente", "in-sviluppo", "backlog"].includes(r.stato) ? r.stato : "backlog";
    const feat = { id: String(r.id), name: String(r.nome || r.id), status, externalId: r.id_esterno || null, externalSystem: r.sistema_esterno || null };
    if (r.requisito_condiviso_con) feat.sharedWith = [String(r.requisito_condiviso_con)];
    reqByApp[appId].push(feat);
  });
  reqRows.forEach((r) => {
    if (!r.requisito_condiviso_con) return;
    const targetId = String(r.requisito_condiviso_con);
    Object.values(reqByApp).forEach((list) => list.forEach((f) => {
      if (f.id === targetId && !(f.sharedWith || []).includes(String(r.id))) f.sharedWith = [...(f.sharedWith || []), String(r.id)];
    }));
  });
  const apps = rowsFromSheet(workbook, "Applicativi").filter((r) => r.id).map((r) => ({
    id: String(r.id), name: String(r.nome || r.id), domainId: String(r.dominio_id || ""),
    contractId: r.contratto_id ? String(r.contratto_id) : null, requirements: reqByApp[String(r.id)] || [],
  }));
  const integrations = rowsFromSheet(workbook, "Integrazioni").filter((r) => r.id && r.da_app_id && r.verso_app_id).map((r) => ({
    id: String(r.id), fromId: String(r.da_app_id), toId: String(r.verso_app_id), typeId: String(r.tipo_id || ""), label: String(r.descrizione || ""),
  }));
  return { domains, vendors, integrationTypes, contracts, apps, integrations };
}

function toExportDataset(data) {
  return {
    domains: data.domains.map((d) => ({ id: d.id, name: d.name, color: d.color })),
    vendors: data.vendors.map((v) => ({ id: v.id, name: v.name })),
    integrationTypes: data.integrationTypes.map((t) => ({ id: t.id, name: t.name, color: t.color })),
    contracts: data.contracts.map((c) => ({ id: c.id, name: c.name, vendorId: c.vendorId, startDate: c.startDate, endDate: c.endDate })),
    apps: data.applications.map((a) => ({
      id: a.id, name: a.name, domainId: a.domainId, contractId: a.contractId,
      requirements: a.requirements.map((r) => ({
        id: r.id, name: r.name, status: r.status, externalId: r.externalId, externalSystem: r.externalSystem,
        sharedWith: sharedOf(r).map((s) => s.id),
      })),
    })),
    integrations: data.integrations.map((i) => ({ id: i.id, fromId: i.fromId, toId: i.toId, typeId: i.typeId, label: i.label })),
  };
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ImportExportModal({ data, onClose, onImport }) {
  const [status, setStatus] = useState(null);
  const jsonInputRef = useRef(null);
  const excelInputRef = useRef(null);

  const handleJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        await onImport(parsed);
        setStatus({ ok: true, msg: "Dati JSON importati." });
      } catch (err) { setStatus({ ok: false, msg: "Il file JSON non è valido: " + err.message }); }
    };
    reader.readAsText(file);
  };

  const handleExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const wb = XLSX.read(reader.result, { type: "array" });
        const parsed = datasetFromWorkbook(wb);
        await onImport(parsed);
        setStatus({ ok: true, msg: `Importati ${parsed.apps.length} applicativi da Excel.` });
      } catch (err) { setStatus({ ok: false, msg: "Impossibile leggere il file Excel: " + err.message }); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Modal title="Importa / esporta dati" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-medium" style={{ color: "#232019" }}>Esporta</div>
          <button onClick={() => downloadFile("mappa-applicativa.json", JSON.stringify(toExportDataset(data), null, 2), "application/json")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
            <Download size={14} /> Scarica i dati attuali in JSON
          </button>
        </div>
        <div className="border-t pt-4" style={{ borderColor: "#E2DFD6" }}>
          <div className="mb-1.5 text-[12.5px] font-medium" style={{ color: "#232019" }}>Importa</div>
          <p className="mb-2 text-[12px]" style={{ color: "#8A8578" }}>Gli elementi con lo stesso id sostituiscono quelli esistenti, gli altri vengono aggiunti.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => jsonInputRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              <Upload size={14} /> Importa file JSON
            </button>
            <input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJson} />
            <button onClick={() => excelInputRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              <FileSpreadsheet size={14} /> Importa file Excel (modello a 6 fogli)
            </button>
            <input ref={excelInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleExcel} />
          </div>
        </div>
        {status && (
          <div className="rounded-md p-2 text-[12.5px]" style={{ backgroundColor: status.ok ? "#EAF2ED" : "#FBEDE8", color: status.ok ? "#2F7D5C" : "#B5482B" }}>{status.msg}</div>
        )}
      </div>
    </Modal>
  );
}

export default function MappaApplicativa({ userEmail }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("map");
  const [domainFilter, setDomainFilter] = useState(null);
  const [vendorFilter, setVendorFilter] = useState(null);
  const [contractFilter, setContractFilter] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [flash, setFlash] = useState(null);
  const [showNewApp, setShowNewApp] = useState(false);
  const [showNewContract, setShowNewContract] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const cardRefs = useRef({});

  const refresh = async () => {
    const json = await api("/api/data");
    setData(json);
    return json;
  };

  useEffect(() => { refresh(); }, []);

  const withSaving = async (fn) => {
    setSaving(true);
    try { await fn(); await refresh(); } finally { setSaving(false); }
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#F5F6F3" }}>
        <Loader2 className="animate-spin" size={22} style={{ color: "#8A8578" }} />
      </div>
    );
  }

  const contracts = data.contracts;
  const vendorOfApp = (app) => app.contract?.vendor?.name || "Nessun fornitore (senza contratto)";
  const vendorIdOfApp = (app) => app.contract?.vendorId || null;

  const filtered = data.applications.filter((app) => {
    if (domainFilter && app.domainId !== domainFilter) return false;
    if (vendorFilter && vendorIdOfApp(app) !== vendorFilter) return false;
    if (contractFilter && app.contractId !== contractFilter) return false;
    if (query && !app.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const jumpTo = (appId) => {
    if (!appId) return;
    setExpanded(appId);
    setFlash(appId);
    setTimeout(() => cardRefs.current[appId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    setTimeout(() => setFlash(null), 1600);
  };

  // Le ComboAdd hanno bisogno dell'id subito dopo la creazione: creiamo e aggiorniamo lo stato prima di restituirlo.
  const createAndGetId = async (url, body) => {
    const created = await api(url, "POST", body);
    await refresh();
    return created.id;
  };

  const addVendor = async (name) => createAndGetId("/api/vendors", { name });
  const addIntegrationType = async (name) => {
    const color = TYPE_PALETTE[data.integrationTypes.length % TYPE_PALETTE.length];
    return createAndGetId("/api/integration-types", { name, color });
  };
  const addDomainAsync = async (name) => {
    const color = COLOR_PALETTE[data.domains.length % COLOR_PALETTE.length];
    return createAndGetId("/api/domains", { name, color });
  };

  const createContract = (payload) => withSaving(async () => { await api("/api/contracts", "POST", payload); setShowNewContract(false); });
  const createApp = (payload) => withSaving(async () => {
    const app = await api("/api/applications", "POST", payload);
    setShowNewApp(false);
    setExpanded(app.id);
  });
  const deleteApp = (appId) => {
    if (!window.confirm("Eliminare questo applicativo e tutti i suoi requisiti?")) return;
    withSaving(async () => { await api(`/api/applications/${appId}`, "DELETE"); });
    setExpanded(null);
  };
  const addFeature = (appId, payload) => withSaving(async () => { await api("/api/requirements", "POST", { applicationId: appId, ...payload }); });
  const deleteFeature = (featureId) => withSaving(async () => { await api(`/api/requirements/${featureId}`, "DELETE"); });
  const addIntegration = (payload) => withSaving(async () => { await api("/api/integrations", "POST", payload); });
  const deleteIntegration = (id) => withSaving(async () => { await api(`/api/integrations/${id}`, "DELETE"); });
  const importDataset = (dataset) => withSaving(async () => { await api("/api/data/import", "POST", dataset); });

  const panelProps = {
    apps: data.applications,
    onJump: jumpTo,
    saving,
    onDeleteApp: deleteApp,
    onDeleteFeature: deleteFeature,
    onDeleteIntegration: deleteIntegration,
    onAddFeature: addFeature,
    onAddIntegration: addIntegration,
    onAddIntegrationType: addIntegrationType,
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F5F6F3", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <header style={{ backgroundColor: "#1B2430" }} className="px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-1 flex items-center justify-between gap-2 text-[12px] font-medium tracking-wide" style={{ color: "#8FA3B0", fontFamily: "'IBM Plex Mono', monospace" }}>
            <span className="flex items-center gap-2">REGIONE SARDEGNA · ECOSISTEMA DOCUMENTALE {saving && <Loader2 size={11} className="animate-spin" />}</span>
            <button onClick={() => signOut({ callbackUrl: "/signin" })} className="flex items-center gap-1 text-[11px]" style={{ color: "#8FA3B0" }}>
              <LogOut size={11} /> {userEmail}
            </button>
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: "#F5F6F3", fontFamily: "'IBM Plex Serif', serif" }}>Mappa applicativa e dei requisiti</h1>
          <p className="mt-1 max-w-2xl text-[14px]" style={{ color: "#AEB8C2" }}>Vista navigabile del parco applicativo: domini, contratti, fornitori e requisiti, con rilevamento delle sovrapposizioni.</p>
        </div>
      </header>

      <div className="border-b" style={{ borderColor: "#E2DFD6", backgroundColor: "#FBFAF7" }}>
        <div className="mx-auto max-w-6xl space-y-3 px-6 py-4 sm:px-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[12px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Dominio</span>
              {data.domains.map((d) => (
                <Chip key={d.id} active={domainFilter === d.id} color={d.color} onClick={() => setDomainFilter(domainFilter === d.id ? null : d.id)}>{d.name}</Chip>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setShowImportExport(true)} className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
                <Upload size={13} /> Importa / esporta
              </button>
              <button onClick={() => setShowNewApp(true)} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-white" style={{ backgroundColor: "#1B2430" }}>
                <Plus size={13} /> Applicativo
              </button>
              <div className="flex gap-1 rounded-md border p-0.5" style={{ borderColor: "#D8D5CC" }}>
                <button onClick={() => setView("map")} className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[12.5px] font-medium" style={view === "map" ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}><Network size={13} /> Mappa</button>
                <button onClick={() => setView("grid")} className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[12.5px] font-medium" style={view === "grid" ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}><LayoutGrid size={13} /> Griglia</button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Fornitore</span>
            {data.vendors.map((v) => (
              <Chip key={v.id} active={vendorFilter === v.id} color="#1B2430" onClick={() => setVendorFilter(vendorFilter === v.id ? null : v.id)}>{v.name}</Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="relative">
              <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value)} className="appearance-none rounded-md border bg-white py-1.5 pl-3 pr-8 text-[13px]" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
                <option value="">Tutti i contratti</option>
                {contracts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5" style={{ color: "#8A8578" }} />
            </div>
            <button onClick={() => setShowNewContract(true)} className="flex items-center gap-1 text-[12.5px] font-medium underline underline-offset-2" style={{ color: "#6B655A" }}>
              <Plus size={12} /> Nuovo contratto
            </button>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-2.5" style={{ color: "#8A8578" }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca applicativo…" className="w-full rounded-md border bg-white py-1.5 pl-8 pr-3 text-[13px] outline-none" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }} />
            </div>
            {(domainFilter || vendorFilter || contractFilter || query) && (
              <button onClick={() => { setDomainFilter(null); setVendorFilter(null); setContractFilter(""); setQuery(""); }} className="text-[13px] font-medium underline underline-offset-2" style={{ color: "#6B655A" }}>
                Azzera filtri
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-5 sm:px-10">
        <div className="flex flex-wrap items-center gap-4 text-[12px]" style={{ color: "#6B655A" }}>
          {Object.values(STATUS).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}</span>
          ))}
          <span className="flex items-center gap-1.5"><AlertTriangle size={12} style={{ color: "#B5482B" }} /> Requisito condiviso tra progettualità diverse</span>
          {data.integrationTypes.map((t) => (
            <span key={t.id} className="flex items-center gap-1.5"><ArrowLeftRight size={12} style={{ color: t.color }} /> {t.name}</span>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6 sm:px-10">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center" style={{ borderColor: "#D8D5CC" }}>
            <Layers size={22} className="mx-auto mb-2" style={{ color: "#B5B0A3" }} />
            <p className="text-[14px]" style={{ color: "#6B655A" }}>Nessun applicativo censito con questi filtri.</p>
          </div>
        ) : view === "map" ? (
          <RelationMap apps={filtered} integrations={data.integrations} integrationTypes={data.integrationTypes} selected={expanded} onSelect={setExpanded} {...panelProps} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => {
              const isOpen = expanded === app.id;
              const hasShared = app.requirements.some((f) => sharedOf(f).length > 0);
              const { outgoing, incoming } = integrationsFor(data.integrations, app.id);
              const hasIntegrations = outgoing.length > 0 || incoming.length > 0;
              const isFlashing = flash === app.id;
              return (
                <div key={app.id} ref={(el) => (cardRefs.current[app.id] = el)} className={`rounded-lg bg-white transition-shadow ${isOpen ? "sm:col-span-2 lg:col-span-3" : ""}`}
                  style={{ border: isFlashing ? "1.5px solid #B5482B" : "1px solid #E2DFD6", boxShadow: isFlashing ? "0 0 0 4px rgba(181,72,43,0.12)" : "none", transition: "box-shadow 0.4s ease, border-color 0.4s ease" }}>
                  <button onClick={() => setExpanded(isOpen ? null : app.id)} className="w-full rounded-t-lg px-4 pt-4 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: app.domain.color }} />
                        <div>
                          <div className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{app.name}</div>
                          <div className="text-[12px]" style={{ color: "#8A8578" }}>{vendorOfApp(app)}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {hasIntegrations && <ArrowLeftRight size={14} style={{ color: "#2F6F76" }} />}
                        {hasShared && <AlertTriangle size={15} style={{ color: "#B5482B" }} />}
                      </div>
                    </div>
                    <div className="mt-2 inline-block rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {contractLabel(app.contract)}
                    </div>
                    <div className="mt-3">
                      <StatusBar requirements={app.requirements} />
                      <div className="mt-1.5 text-[12px]" style={{ color: "#8A8578" }}>{app.requirements.length} requisiti censiti</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t px-4 py-4" style={{ borderColor: "#E2DFD6" }}>
                      <AppDetailPanel app={app} integrations={data.integrations} integrationTypes={data.integrationTypes} onClose={() => setExpanded(null)} {...panelProps} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-2 text-[12px] sm:px-10" style={{ color: "#B5B0A3" }}>
        I dati sono salvati su database e restano disponibili a ogni accesso.
      </footer>

      {showNewApp && (
        <NewAppModal domains={data.domains} contracts={data.contracts} onClose={() => setShowNewApp(false)} onCreate={createApp}
          onAddDomain={addDomainAsync} onOpenNewContract={() => { setShowNewApp(false); setShowNewContract(true); }} />
      )}
      {showNewContract && <NewContractModal vendors={data.vendors} onClose={() => setShowNewContract(false)} onCreate={createContract} onAddVendor={addVendor} />}
      {showImportExport && <ImportExportModal data={data} onClose={() => setShowImportExport(false)} onImport={importDataset} />}
    </div>
  );
}
