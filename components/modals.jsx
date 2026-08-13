"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal, Field, ComboAdd, inputClass, inputStyle, STATUS, DOMAIN_TYPES } from "./shared";
import { COFOG_OPTIONS } from "@/lib/cofog";

export function RenameModal({ title, label, initialValue, placeholder, saveLabel = "Salva", onClose, onSave }) {
  const [name, setName] = useState(initialValue || "");
  const canSave = name.trim();
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        <Field label={label}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder={placeholder} />
        </Field>
        <button disabled={!canSave} onClick={() => canSave && onSave(name.trim())}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {saveLabel}
        </button>
      </div>
    </Modal>
  );
}

export function NewContractModal({ vendors, initial, onClose, onSave, onAddVendor }) {
  const [name, setName] = useState(initial?.name || "");
  const [vendorId, setVendorId] = useState(initial?.vendorId || vendors[0]?.id || "");
  const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0, 10) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? initial.endDate.slice(0, 10) : "");
  const [cig, setCig] = useState((initial?.cig || []).join(", "));
  const [cup, setCup] = useState((initial?.cup || []).join(", "));
  const canSave = name.trim() && vendorId;
  const parseList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return (
    <Modal title={initial ? "Modifica contratto" : "Nuovo contratto"} onClose={onClose}>
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
        <div className="grid grid-cols-2 gap-2">
          <Field label="CIG (separati da virgola)">
            <input value={cig} onChange={(e) => setCig(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. 91234567A1" />
          </Field>
          <Field label="CUP (separati da virgola)">
            <input value={cup} onChange={(e) => setCup(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. J12345678901" />
          </Field>
        </div>
        <button
          disabled={!canSave}
          onClick={() => canSave && onSave({ name: name.trim(), vendorId, startDate: startDate || null, endDate: endDate || null, cig: parseList(cig), cup: parseList(cup) })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva contratto" : "Crea contratto"}
        </button>
      </div>
    </Modal>
  );
}

export function NewDomainModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "verticale");
  const [cofogCode, setCofogCode] = useState(initial?.cofogCode || "");
  const canSave = name.trim();
  return (
    <Modal title={initial ? "Modifica dominio" : "Nuovo dominio"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome dominio">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Gestione documentale" />
        </Field>
        <Field label="Tipo">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} style={inputStyle}>
            {Object.entries(DOMAIN_TYPES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </Field>
        <Field label="Classificazione COFOG (opzionale)">
          <select value={cofogCode} onChange={(e) => setCofogCode(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Nessuna</option>
            {COFOG_OPTIONS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </Field>
        <button
          disabled={!canSave}
          onClick={() => canSave && onSave({ name: name.trim(), type, cofogCode: cofogCode || null })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva dominio" : "Crea dominio"}
        </button>
      </div>
    </Modal>
  );
}

export function NewAppModal({ domains, contracts, initial, onClose, onSave, onAddDomain, onOpenNewContract }) {
  const [name, setName] = useState(initial?.name || "");
  const [domainId, setDomainId] = useState(initial?.domainId || domains[0]?.id || "");
  const [contractIds, setContractIds] = useState(initial?.contracts?.map((c) => c.id) || []);
  const canSave = name.trim() && domainId;
  const toggleContract = (id) => setContractIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <Modal title={initial ? "Modifica applicativo" : "Nuovo applicativo"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome applicativo">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Portale istanze online" />
        </Field>
        <Field label="Dominio">
          <ComboAdd options={domains} value={domainId} onChange={setDomainId} onAddNew={onAddDomain} placeholder="Nome nuovo dominio" />
        </Field>
        <Field label="Contratti">
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2" style={{ borderColor: "#D8D5CC" }}>
            {contracts.length === 0 && <div className="text-[12.5px]" style={{ color: "#8A8578" }}>Nessun contratto disponibile</div>}
            {contracts.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-[13px]" style={{ color: "#3D3A34" }}>
                <input type="checkbox" checked={contractIds.includes(c.id)} onChange={() => toggleContract(c.id)} />
                {c.name} — {c.vendor.name}
              </label>
            ))}
          </div>
          <button type="button" onClick={onOpenNewContract} className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium underline underline-offset-2" style={{ color: "#6B655A" }}>
            <Plus size={12} /> Nuovo contratto
          </button>
        </Field>
        <button disabled={!canSave} onClick={() => canSave && onSave({ name: name.trim(), domainId, contractIds })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva applicativo" : "Crea applicativo"}
        </button>
      </div>
    </Modal>
  );
}

export function NewModuleModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const canSave = name.trim();
  return (
    <Modal title={initial ? "Modifica modulo" : "Nuovo modulo"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome modulo">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Gateway di protocollazione" />
        </Field>
        <button disabled={!canSave} onClick={() => canSave && onSave({ name: name.trim() })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva modulo" : "Crea modulo"}
        </button>
      </div>
    </Modal>
  );
}

export function NewFeatureModal({ app, apps, modules, initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [status, setStatus] = useState(initial?.status || "backlog");
  const [externalId, setExternalId] = useState(initial?.externalId || "");
  const [externalSystem, setExternalSystem] = useState(initial?.externalSystem || "");
  const [moduleId, setModuleId] = useState(initial?.moduleId || "");
  const [shareWith, setShareWith] = useState("");
  const otherFeatures = apps.filter((a) => a.id !== app.id).flatMap((a) => a.requirements.map((f) => ({ id: f.id, label: `${a.name} — ${f.name}` })));
  return (
    <Modal title={initial ? `Modifica requisito · ${app.name}` : `Nuovo requisito · ${app.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome / intento del requisito">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Notifica automatica scadenza pratica" />
        </Field>
        <Field label="Stato">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </Field>
        {modules.length > 0 && (
          <Field label="Modulo">
            <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Livello di default dell'applicativo</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Id esterno (opzionale)">
            <input value={externalId} onChange={(e) => setExternalId(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. DOC-123" />
          </Field>
          <Field label="Sistema esterno">
            <input value={externalSystem} onChange={(e) => setExternalSystem(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Jira" />
          </Field>
        </div>
        {!initial && (
          <Field label="Requisito condiviso con (opzionale)">
            <select value={shareWith} onChange={(e) => setShareWith(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Nessuno</option>
              {otherFeatures.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </Field>
        )}
        <button
          disabled={!name.trim()}
          onClick={() => onSave({
            name: name.trim(), status, externalId: externalId.trim() || null, externalSystem: externalSystem.trim() || null,
            moduleId: moduleId || null, ...(initial ? {} : { shareWithId: shareWith || null }),
          })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva requisito" : "Aggiungi requisito"}
        </button>
      </div>
    </Modal>
  );
}

export function NewIntegrationModal({ app, apps, types, modules, initial, onAddType, onClose, onSave }) {
  const others = apps.filter((a) => a.id !== app.id);
  const initialDirection = initial ? (initial.fromId === app.id ? "out" : "in") : "out";
  const [direction, setDirection] = useState(initialDirection);
  const [target, setTarget] = useState(initial ? (initialDirection === "out" ? initial.toId : initial.fromId) : others[0]?.id || "");
  const [typeId, setTypeId] = useState(initial?.typeId || types[0]?.id || "");
  const [status, setStatus] = useState(initial?.status || "backlog");
  const [label, setLabel] = useState(initial?.label || "");
  const [appModuleId, setAppModuleId] = useState((initialDirection === "out" ? initial?.fromModuleId : initial?.toModuleId) || "");
  return (
    <Modal title={initial ? `Modifica integrazione · ${app.name}` : `Nuova integrazione · ${app.name}`} onClose={onClose}>
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
        {modules.length > 0 && (
          <Field label={`Modulo di ${app.name} coinvolto (opzionale)`}>
            <select value={appModuleId} onChange={(e) => setAppModuleId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Livello di default dell'applicativo</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Tipologia di integrazione">
          <ComboAdd options={types} value={typeId} onChange={setTypeId} onAddNew={onAddType} placeholder="Nome nuova tipologia" />
        </Field>
        <Field label="Stato">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Descrizione della relazione">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} style={inputStyle} placeholder="Es. Richiama l'API di protocollazione" />
        </Field>
        <button
          disabled={!target || !typeId || !label.trim()}
          onClick={() => onSave({
            fromId: direction === "out" ? app.id : target,
            toId: direction === "out" ? target : app.id,
            fromModuleId: direction === "out" ? (appModuleId || null) : null,
            toModuleId: direction === "in" ? (appModuleId || null) : null,
            typeId, status, label: label.trim(),
          })}
          className="mt-2 w-full rounded-md py-2 text-[13.5px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#1B2430" }}>
          {initial ? "Salva integrazione" : "Aggiungi integrazione"}
        </button>
      </div>
    </Modal>
  );
}
