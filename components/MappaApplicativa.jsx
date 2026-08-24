"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import { signOut } from "next-auth/react";
import {
  Search, AlertTriangle, Layers, ChevronDown, ArrowLeftRight,
  Network, LayoutGrid, Plus, Loader2, Upload, Download, FileSpreadsheet, LogOut,
} from "lucide-react";
import { STATUS, COLOR_PALETTE, TYPE_PALETTE, DOMAIN_AMBITI, AMBITO_COLORS, CORE_BADGE_BG } from "./constants";
import { api, sharedOf, integrationsFor, vendorNamesOfApp, vendorIdsOfApp, contractsLabel } from "./data-helpers";
import { Chip, StatusBar, Modal } from "./ui-primitives";
import { NewContractModal, NewDomainModal, NewAppModal } from "./modals";
import { AppDetailPanel } from "./AppDetailPanel";

function RelationMap({ apps, allApps, integrations, integrationTypes, selected, onSelect, ...panelProps }) {
  const width = 860;
  const height = 480;

  const { nodes, links } = useMemo(() => {
    const appIds = new Set(apps.map((a) => a.id));
    const rawNodes = apps.map((a) => ({ id: a.id, name: a.name, domain: a.domain }));
    const rawLinks = [];
    integrations.forEach((i) => {
      if (appIds.has(i.fromId) && appIds.has(i.toId))
        rawLinks.push({ source: i.fromId, target: i.toId, kind: "integration", type: i.type, label: i.label, status: i.status });
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
            <marker id="arrow-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2F6F76" />
            </marker>
            {integrationTypes.map((t) => (
              <marker key={t.id} id={`arrow-${t.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={t.color} />
              </marker>
            ))}
          </defs>
          {links.map((l, idx) => {
            const dim = connectedIds && !(connectedIds.has(l.source.id) && connectedIds.has(l.target.id));
            const isReq = l.kind === "requirement";
            const stroke = isReq ? "#B5482B" : l.type?.color || "#2F6F76";
            return (
              <g key={idx} opacity={dim ? 0.15 : isReq ? 0.7 : 0.6}>
                <line x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y}
                  stroke={stroke} strokeWidth={isReq ? 1.6 : 1.8} strokeDasharray={isReq ? "4 3" : "0"}
                  markerEnd={isReq ? undefined : `url(#arrow-${l.type?.id || "default"})`}>
                  {!isReq && <title>{l.type ? `${l.type.name} — ${l.label} (${STATUS[l.status]?.label || l.status})` : l.label}</title>}
                </line>
                {!isReq && (
                  <circle cx={(l.source.x + l.target.x) / 2} cy={(l.source.y + l.target.y) / 2} r={4}
                    fill={STATUS[l.status]?.color || "#8791A0"} stroke="#fff" strokeWidth={1}>
                    <title>{STATUS[l.status]?.label || l.status}</title>
                  </circle>
                )}
              </g>
            );
          })}
          {nodes.map((n) => {
            const dim = connectedIds && !connectedIds.has(n.id);
            const isSelected = selected === n.id;
            const selectedAppData = isSelected ? apps.find((a) => a.id === n.id) : null;
            const modules = selectedAppData?.modules || [];
            return (
              <g key={n.id}>
                {/* App node */}
                <g transform={`translate(${n.x},${n.y})`} onClick={() => onSelect(isSelected ? null : n.id)} style={{ cursor: "pointer" }} opacity={dim ? 0.3 : 1}>
                  <circle r={30} fill={n.domain?.color || "#8791A0"} stroke={isSelected ? "#232019" : "#fff"} strokeWidth={isSelected ? 2.5 : 2} />
                  {n.domain?.core && (
                    <circle r={30} fill="none" stroke={CORE_BADGE_BG} strokeWidth="2" strokeDasharray="3,2" opacity="0.8" />
                  )}
                  <text textAnchor="middle" dy={4} fontSize="9.5" fontWeight="600" fill="#fff" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    {n.name.length > 14 ? n.name.slice(0, 13) + "…" : n.name}
                  </text>
                  <title>{n.name}</title>
                </g>
                {/* Module drill-down */}
                {isSelected && modules.length > 0 && modules.map((mod, idx) => {
                  const angle = (idx / modules.length) * 2 * Math.PI;
                  const radius = 60;
                  const mx = n.x + radius * Math.cos(angle);
                  const my = n.y + radius * Math.sin(angle);
                  return (
                    <g key={`mod-${mod.id}`} transform={`translate(${mx},${my})`} opacity={0.85}>
                      <circle r={12} fill="#E8D7C8" stroke="#8A8578" strokeWidth={1} />
                      <text textAnchor="middle" dy={2} fontSize="7" fontWeight="600" fill="#3D3A34" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        {mod.name.length > 8 ? mod.name.slice(0, 7) + "…" : mod.name}
                      </text>
                      <title>{mod.name}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Module integration arcs */}
          {selected && apps.find((a) => a.id === selected)?.modules?.map((mod, modIdx) => {
            const selectedAppNode = nodes.find((n) => n.id === selected);
            if (!selectedAppNode) return null;
            const angle = (modIdx / (apps.find((a) => a.id === selected)?.modules?.length || 1)) * 2 * Math.PI;
            const radius = 60;
            const mx = selectedAppNode.x + radius * Math.cos(angle);
            const my = selectedAppNode.y + radius * Math.sin(angle);
            return integrations
              .filter((i) => (i.fromModuleId === mod.id || i.toModuleId === mod.id))
              .map((i, idx) => {
                const isFromMod = i.fromModuleId === mod.id;
                const otherAppId = isFromMod ? i.toId : i.fromId;
                const otherAppNode = nodes.find((n) => n.id === otherAppId);
                if (!otherAppNode) return null;
                const dim = connectedIds && !(connectedIds.has(selected) && connectedIds.has(otherAppId));
                const stroke = i.type?.color || "#2F6F76";
                return (
                  <g key={`mod-arc-${mod.id}-${i.id}`} opacity={dim ? 0.15 : 0.6}>
                    <line x1={mx} y1={my} x2={otherAppNode.x} y2={otherAppNode.y}
                      stroke={stroke} strokeWidth={1.8} markerEnd={`url(#arrow-${i.type?.id || "default"})`}>
                      <title>{i.type ? `${i.type.name} — ${i.label} (${STATUS[i.status]?.label || i.status})` : i.label}</title>
                    </line>
                    <circle cx={(mx + otherAppNode.x) / 2} cy={(my + otherAppNode.y) / 2} r={4}
                      fill={STATUS[i.status]?.color || "#8791A0"} stroke="#fff" strokeWidth={1}>
                      <title>{STATUS[i.status]?.label || i.status}</title>
                    </circle>
                  </g>
                );
              });
          })}
        </svg>
      </div>
      {selectedApp && (
        <div className="mt-3 rounded-lg border bg-white p-4" style={{ borderColor: "#E2DFD6" }}>
          <div className="mb-3">
            <div className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{selectedApp.name}</div>
            <div className="mt-1 inline-block rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
              {contractsLabel(selectedApp.contracts)}
            </div>
          </div>
          <AppDetailPanel
            app={selectedApp} apps={allApps}
            integrations={integrations} integrationTypes={integrationTypes}
            onClose={() => onSelect(null)}
            {...panelProps}
          />
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
  const domains = rowsFromSheet(workbook, "Domini").filter((r) => r.id).map((r, i) => ({
    id: String(r.id), name: String(r.etichetta || r.id), color: r.colore_hex || COLOR_PALETTE[i % COLOR_PALETTE.length],
    ambito: r.ambito === "trasversale" ? "trasversale" : (r.tipo === "trasversale-core" ? "trasversale" : "verticale"),
    core: r.core === true || r.tipo === "trasversale-core" || false,
    cofogCode: r.codice_cofog || null,
  }));
  const vendors = rowsFromSheet(workbook, "Fornitori").filter((r) => r.id).map((r) => ({ id: String(r.id), name: String(r.etichetta || r.id) }));
  const integrationTypes = rowsFromSheet(workbook, "TipiIntegrazione").filter((r) => r.id).map((r, i) => ({
    id: String(r.id), name: String(r.etichetta || r.id), color: r.colore_hex || TYPE_PALETTE[i % TYPE_PALETTE.length],
  }));
  const contracts = rowsFromSheet(workbook, "Contratti").filter((r) => r.id).map((r) => ({
    id: String(r.id), name: String(r.nome || r.id), vendorId: String(r.fornitore_id || ""),
    startDate: r.data_inizio || null, endDate: r.data_fine || null,
    cig: r.cig ? String(r.cig).split(",").map((x) => x.trim()).filter(Boolean) : [],
    cup: r.cup ? String(r.cup).split(",").map((x) => x.trim()).filter(Boolean) : [],
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
    contractIds: r.contratto_id ? [String(r.contratto_id)] : [], requirements: reqByApp[String(r.id)] || [],
  }));
  const integrations = rowsFromSheet(workbook, "Integrazioni").filter((r) => r.id && r.da_app_id && r.verso_app_id).map((r) => ({
    id: String(r.id), fromId: String(r.da_app_id), toId: String(r.verso_app_id), typeId: String(r.tipo_id || ""), label: String(r.descrizione || ""),
    status: ["presente", "in-sviluppo", "backlog"].includes(r.stato) ? r.stato : "backlog",
  }));
  return { domains, vendors, integrationTypes, contracts, apps, integrations };
}

function toExportDataset(data) {
  return {
    domains: data.domains.map((d) => ({ id: d.id, name: d.name, color: d.color, ambito: d.ambito, core: d.core, cofogCode: d.cofogCode })),
    vendors: data.vendors.map((v) => ({ id: v.id, name: v.name })),
    integrationTypes: data.integrationTypes.map((t) => ({ id: t.id, name: t.name, color: t.color })),
    contracts: data.contracts.map((c) => ({ id: c.id, name: c.name, vendorId: c.vendorId, startDate: c.startDate, endDate: c.endDate, cig: c.cig, cup: c.cup })),
    apps: data.applications.map((a) => ({
      id: a.id, name: a.name, domainId: a.domainId,
      contractIds: a.contracts.map((c) => c.id),
      modules: (a.modules || []).map((m) => ({ id: m.id, name: m.name, description: m.description || null })),
      requirements: a.requirements.map((r) => ({
        id: r.id, name: r.name, status: r.status, externalId: r.externalId, externalSystem: r.externalSystem,
        moduleId: r.moduleId || null,
        sharedWith: sharedOf(r).map((s) => s.id),
      })),
    })),
    integrations: data.integrations.map((i) => ({
      id: i.id, fromId: i.fromId, toId: i.toId, typeId: i.typeId, label: i.label, status: i.status,
      fromModuleId: i.fromModuleId || null, toModuleId: i.toModuleId || null,
    })),
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
  const [showNewDomain, setShowNewDomain] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingContractId, setEditingContractId] = useState(null);
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

  const domainsInUse = data.domains.filter((d) =>
    data.applications.some((a) => a.domainId === d.id)
  );

  const vendorsInUse = data.vendors.filter((v) =>
    data.applications.some((a) => vendorIdsOfApp(a).includes(v.id))
  );

  const matchesQuery = (app, q) => {
    const lowerQ = q.toLowerCase();
    if (app.name.toLowerCase().includes(lowerQ)) return true;
    if (app.domain?.name.toLowerCase().includes(lowerQ)) return true;
    if (app.contracts?.some((c) => c.name.toLowerCase().includes(lowerQ))) return true;
    if (app.requirements?.some((r) => r.name.toLowerCase().includes(lowerQ))) return true;
    if (app.modules?.some((m) => m.name.toLowerCase().includes(lowerQ))) return true;
    if (app.integrations?.some((i) => (i.label || "").toLowerCase().includes(lowerQ))) return true;
    return false;
  };

  const filtered = data.applications.filter((app) => {
    if (domainFilter && app.domainId !== domainFilter) return false;
    if (vendorFilter && !vendorIdsOfApp(app).includes(vendorFilter)) return false;
    if (contractFilter && !app.contracts.some((c) => c.id === contractFilter)) return false;
    if (query && !matchesQuery(app, query)) return false;
    return true;
  });

  const jumpTo = (appId) => {
    if (!appId) return;
    setExpanded(appId);
    setFlash(appId);
    setTimeout(() => cardRefs.current[appId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    setTimeout(() => setFlash(null), 1600);
  };

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

  const createContract = (payload) => withSaving(async () => { await api("/api/contracts", "POST", payload); setShowNewContract(false); });
  const updateContract = (contractId, payload) => withSaving(async () => { await api(`/api/contracts/${contractId}`, "PATCH", payload); setEditingContractId(null); });
  const createDomain = (payload) => withSaving(async () => {
    const color = COLOR_PALETTE[data.domains.length % COLOR_PALETTE.length];
    await api("/api/domains", "POST", { ...payload, color });
    setShowNewDomain(false);
  });
  const createApp = (payload) => withSaving(async () => {
    const app = await api("/api/applications", "POST", payload);
    setShowNewApp(false);
    setExpanded(app.id);
  });
  const updateApp = (appId, payload) => withSaving(async () => { await api(`/api/applications/${appId}`, "PATCH", payload); });
  const openNewDomain = () => { setShowNewDomain(true); };

  const deleteApp = (appId) => withSaving(async () => {
    await api(`/api/applications/${appId}`, "DELETE");
    setExpanded(null);
  });
  const addFeature = (appId, payload) => withSaving(async () => { await api("/api/requirements", "POST", { applicationId: appId, ...payload }); });
  const updateFeature = (featureId, payload) => withSaving(async () => { await api(`/api/requirements/${featureId}`, "PATCH", payload); });
  const deleteFeature = (featureId) => withSaving(async () => { await api(`/api/requirements/${featureId}`, "DELETE"); });
  const addIntegration = (payload) => withSaving(async () => { await api("/api/integrations", "POST", payload); });
  const updateIntegration = (integrationId, payload) => withSaving(async () => { await api(`/api/integrations/${integrationId}`, "PATCH", payload); });
  const deleteIntegration = (id) => withSaving(async () => { await api(`/api/integrations/${id}`, "DELETE"); });
  const addModule = (appId, { name }) => withSaving(async () => { await api("/api/modules", "POST", { name, applicationId: appId }); });
  const updateModule = (moduleId, { name }) => withSaving(async () => { await api(`/api/modules/${moduleId}`, "PATCH", { name }); });
  const deleteModule = (moduleId) => withSaving(async () => { await api(`/api/modules/${moduleId}`, "DELETE"); });
  const importDataset = (dataset) => withSaving(async () => { await api("/api/data/import", "POST", dataset); });

  const panelProps = {
    saving,
    onJump: jumpTo,
    onDeleteApp: deleteApp,
    onDeleteFeature: deleteFeature,
    onDeleteIntegration: deleteIntegration,
    onAddFeature: addFeature,
    onUpdateFeature: updateFeature,
    onUpdateApp: updateApp,
    onAddIntegration: addIntegration,
    onUpdateIntegration: updateIntegration,
    onAddIntegrationType: addIntegrationType,
    onAddModule: addModule,
    onUpdateModule: updateModule,
    onDeleteModule: deleteModule,
    domains: data.domains,
    contracts: data.contracts,
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
              {domainsInUse.map((d) => (
                <Chip key={d.id} active={domainFilter === d.id} color={d.color} onClick={() => setDomainFilter(domainFilter === d.id ? null : d.id)}>{d.name}</Chip>
              ))}
              <button onClick={() => setShowNewDomain(true)} className="flex items-center gap-1 text-[12.5px] font-medium underline underline-offset-2" style={{ color: "#6B655A" }}>
                <Plus size={12} /> Nuovo dominio
              </button>
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
            {vendorsInUse.map((v) => (
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
            {contractFilter && (
              <button onClick={() => setEditingContractId(contractFilter)} className="p-1">
                <Pencil size={13} style={{ color: "#B5B0A3" }} />
              </button>
            )}
            <button onClick={() => setShowNewContract(true)} className="flex items-center gap-1 text-[12.5px] font-medium underline underline-offset-2" style={{ color: "#6B655A" }}>
              <Plus size={12} /> Nuovo contratto
            </button>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-2.5" style={{ color: "#8A8578" }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca…" className="w-full rounded-md border bg-white py-1.5 pl-8 pr-3 text-[13px] outline-none" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }} />
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
          <RelationMap
            apps={filtered} allApps={data.applications}
            integrations={data.integrations} integrationTypes={data.integrationTypes}
            selected={expanded} onSelect={setExpanded}
            {...panelProps}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => {
              const isOpen = expanded === app.id;
              const hasShared = app.requirements.some((f) => sharedOf(f).length > 0);
              const { outgoing, incoming } = integrationsFor(data.integrations, app.id);
              const hasIntegrations = outgoing.length > 0 || incoming.length > 0;
              const isFlashing = flash === app.id;
              return (
                <div key={app.id} ref={(el) => (cardRefs.current[app.id] = el)}
                  className={`rounded-lg bg-white transition-shadow ${isOpen ? "sm:col-span-2 lg:col-span-3" : ""}`}
                  style={{ border: isFlashing ? "1.5px solid #B5482B" : "1px solid #E2DFD6", boxShadow: isFlashing ? "0 0 0 4px rgba(181,72,43,0.12)" : "none", transition: "box-shadow 0.4s ease, border-color 0.4s ease" }}>
                  <button onClick={() => setExpanded(isOpen ? null : app.id)} className="w-full rounded-t-lg px-4 pt-4 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: app.domain.color }} />
                        <div>
                          <div className="text-[15px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>{app.name}</div>
                          <div className="text-[12px]" style={{ color: "#8A8578" }}>{vendorNamesOfApp(app)}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: AMBITO_COLORS[app.domain.ambito], color: "#fff" }}>
                              {DOMAIN_AMBITI[app.domain.ambito]}
                            </span>
                            {app.domain.core && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: CORE_BADGE_BG }}>
                                CORE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {hasIntegrations && <ArrowLeftRight size={14} style={{ color: "#2F6F76" }} />}
                        {hasShared && <AlertTriangle size={15} style={{ color: "#B5482B" }} />}
                      </div>
                    </div>
                    <div className="mt-2 inline-block rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {contractsLabel(app.contracts)}
                    </div>
                    <div className="mt-3">
                      <StatusBar requirements={app.requirements} />
                      <div className="mt-1.5 text-[12px]" style={{ color: "#8A8578" }}>{app.requirements.length} requisiti censiti</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t px-4 py-4" style={{ borderColor: "#E2DFD6" }}>
                      <AppDetailPanel
                        app={app} apps={data.applications}
                        integrations={data.integrations} integrationTypes={data.integrationTypes}
                        onClose={() => setExpanded(null)}
                        {...panelProps}
                      />
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
        <NewAppModal domains={data.domains} contracts={data.contracts} onClose={() => setShowNewApp(false)} onSave={createApp}
          onOpenNewDomain={openNewDomain} onOpenNewContract={() => setShowNewContract(true)} />
      )}
      {showNewContract && <NewContractModal vendors={data.vendors} onClose={() => setShowNewContract(false)} onSave={createContract} onAddVendor={addVendor} />}
      {editingContractId && <NewContractModal vendors={data.vendors} initial={contracts.find((c) => c.id === editingContractId)} onClose={() => setEditingContractId(null)} onSave={(payload) => updateContract(editingContractId, payload)} onAddVendor={addVendor} />}
      {showNewDomain && <NewDomainModal onClose={() => setShowNewDomain(false)} onSave={createDomain} />}
      {showImportExport && <ImportExportModal data={data} onClose={() => setShowImportExport(false)} onImport={importDataset} />}
    </div>
  );
}
