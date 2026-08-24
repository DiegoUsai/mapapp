"use client";
import { useState } from "react";
import { Trash2, Plus, Pencil, X, Tag, Link2 } from "lucide-react";
import { sortByStatus, sharedOf, integrationsFor, endpointLabel } from "./data-helpers";
import { StatusPill, StatusFilterChips, ConfirmDialog } from "./ui-primitives";
import { NewFeatureModal, NewIntegrationModal, NewModuleModal, NewAppModal } from "./modals";

export function AppDetailPanel({
  app, apps, integrations, integrationTypes, domains, contracts,
  onJump, onClose, saving,
  onDeleteApp, onDeleteFeature, onDeleteIntegration,
  onAddFeature, onAddIntegration, onAddIntegrationType,
  onUpdateFeature, onUpdateIntegration, onUpdateApp,
  onAddModule, onUpdateModule, onDeleteModule,
}) {
  const [tab, setTab] = useState("detail");
  const [statusFilter, setStatusFilter] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [drillDownModuleId, setDrillDownModuleId] = useState(null);

  const { outgoing: allOutgoing, incoming: allIncoming } = integrationsFor(integrations, app.id);
  const outgoing = allOutgoing.filter((i) => i.fromModuleId === null);
  const incoming = allIncoming.filter((i) => i.toModuleId === null);
  const hasIntegrations = outgoing.length > 0 || incoming.length > 0;
  const modules = app.modules || [];

  const applyFilter = (items) =>
    statusFilter.length === 0 ? items : items.filter((i) => statusFilter.includes(i.status));

  const askConfirm = (props) => setConfirm(props);

  const handleDeleteApp = () => {
    const reqCount = app.requirements.length;
    const intCount = outgoing.length + incoming.length;
    const modCount = modules.length;
    const parts = [];
    if (reqCount > 0) parts.push(`${reqCount} requisit${reqCount === 1 ? "o" : "i"}`);
    if (intCount > 0) parts.push(`${intCount} integrazion${intCount === 1 ? "e" : "i"}`);
    if (modCount > 0) parts.push(`${modCount} modul${modCount === 1 ? "o" : "i"}`);
    const detail = parts.length > 0 ? ` con tutti i suoi ${parts.join(", ")}` : "";
    askConfirm({
      title: "Elimina applicativo",
      message: `Stai per eliminare «${app.name}»${detail}. Questa operazione non è reversibile.`,
      confirmLabel: "Elimina",
      onConfirm: () => { setConfirm(null); onDeleteApp(app.id); },
    });
  };

  const handleDeleteFeature = (f) => askConfirm({
    title: "Elimina requisito",
    message: `Stai per eliminare il requisito «${f.name}».`,
    confirmLabel: "Elimina",
    onConfirm: () => { setConfirm(null); onDeleteFeature(f.id); },
  });

  const handleDeleteIntegration = (i) => {
    const other = apps.find((a) => a.id === (i.fromId === app.id ? i.toId : i.fromId));
    askConfirm({
      title: "Elimina integrazione",
      message: `Stai per eliminare l'integrazione con «${other?.name || "?"}» — ${i.label}.`,
      confirmLabel: "Elimina",
      onConfirm: () => { setConfirm(null); onDeleteIntegration(i.id); },
    });
  };

  const handleDeleteModule = (mod) => {
    const reqCount = app.requirements.filter((r) => r.moduleId === mod.id).length;
    const intCount = integrations.filter((i) => i.fromModuleId === mod.id || i.toModuleId === mod.id).length;
    const parts = [];
    if (reqCount > 0) parts.push(`${reqCount} requisit${reqCount === 1 ? "o scollegato" : "i scollegati"}`);
    if (intCount > 0) parts.push(`${intCount} integrazion${intCount === 1 ? "e scollegata" : "i scollegate"}`);
    const detail = parts.length > 0 ? ` (${parts.join(", ")}, non eliminati)` : "";
    askConfirm({
      title: "Elimina modulo",
      message: `Stai per eliminare il modulo «${mod.name}»${detail}.`,
      confirmLabel: "Elimina modulo",
      onConfirm: () => { setConfirm(null); onDeleteModule(mod.id); },
    });
  };

  // Group requirements by module
  const reqsByModule = {};
  modules.forEach((m) => { reqsByModule[m.id] = []; });
  const defaultReqs = [];
  app.requirements.forEach((r) => {
    if (r.moduleId && reqsByModule[r.moduleId] !== undefined) reqsByModule[r.moduleId].push(r);
    else defaultReqs.push(r);
  });

  const renderRequirement = (f) => (
    <li key={f.id} className="rounded-md p-2.5" style={{ backgroundColor: "#FBFAF7" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13.5px]" style={{ color: "#232019" }}>{f.name}</span>
        <div className="flex items-center gap-1.5">
          <StatusPill status={f.status} />
          {onUpdateFeature && (
            <button onClick={() => setModal({ type: "editFeature", payload: f })} className="p-1">
              <Pencil size={12} style={{ color: "#B5B0A3" }} />
            </button>
          )}
          <button onClick={() => handleDeleteFeature(f)} disabled={saving} className="p-1 disabled:opacity-50">
            <Trash2 size={13} style={{ color: "#B5B0A3" }} />
          </button>
        </div>
      </div>
      {f.externalId && (
        <div className="mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px]" style={{ backgroundColor: "#F0EEE7", color: "#6B655A", fontFamily: "'IBM Plex Mono', monospace" }}>
          <Tag size={10} /> {f.externalId}{f.externalSystem ? ` · ${f.externalSystem}` : ""}
        </div>
      )}
      {sharedOf(f).map((other) => {
        const otherApp = apps.find((a) => a.requirements.some((rr) => rr.id === other.id));
        return (
          <button key={other.id} onClick={() => onJump(otherApp?.id)}
            className="mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium" style={{ backgroundColor: "#FBEDE8", color: "#B5482B" }}>
            <Link2 size={12} /> Requisito già presente anche in «{otherApp?.name}» — {other.name}
          </button>
        );
      })}
    </li>
  );

  const renderIntegrationRow = (i, direction) => {
    const otherId = direction === "out" ? i.toId : i.fromId;
    const otherModuleId = direction === "out" ? i.toModuleId : i.fromModuleId;
    const thisModuleId = direction === "out" ? i.fromModuleId : i.toModuleId;
    const otherApp = apps.find((a) => a.id === otherId);
    if (!otherApp) return null;
    const otherMod = otherApp.modules?.find((m) => m.id === otherModuleId);
    const thisMod = modules.find((m) => m.id === thisModuleId);
    const otherLabel = endpointLabel(otherApp.name, otherMod?.name);
    const verb = direction === "out" ? "Si integra con" : "Usato da";
    return (
      <div key={i.id} className="flex items-center gap-1.5">
        <button onClick={() => onJump(otherApp.id)}
          className="flex flex-1 items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12px] font-medium" style={{ backgroundColor: "#EAF2F2", color: i.type.color }}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: i.type.color }} />
          <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide">{i.type.name}</span>
          <span className="flex-1 truncate">{verb} «{otherLabel}»{thisMod ? ` · via «${thisMod.name}»` : ""} — {i.label}</span>
        </button>
        <StatusPill status={i.status} />
        {onUpdateIntegration && (
          <button onClick={() => setModal({ type: "editIntegration", payload: i })} className="shrink-0 p-1">
            <Pencil size={12} style={{ color: "#B5B0A3" }} />
          </button>
        )}
        <button onClick={() => handleDeleteIntegration(i)} disabled={saving} className="shrink-0 p-1 disabled:opacity-50">
          <Trash2 size={13} style={{ color: "#B5B0A3" }} />
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Header with tabs and edit button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-fit gap-1 rounded-md border p-0.5" style={{ borderColor: "#D8D5CC" }}>
          <button onClick={() => setTab("detail")} className="rounded px-3 py-1 text-[12.5px] font-medium"
            style={tab === "detail" ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}>
            Dettaglio
          </button>
          <button onClick={() => setTab("integrations")} className="rounded px-3 py-1 text-[12.5px] font-medium"
            style={tab === "integrations" ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}>
            Con chi è integrato
          </button>
        </div>
        {onUpdateFeature && (
          <button onClick={() => setModal({ type: "editApp" })} className="p-1">
            <Pencil size={14} style={{ color: "#B5B0A3" }} />
          </button>
        )}
      </div>

      {tab === "detail" && (
        <>
          {/* Modules */}
          {modules.length > 0 && (
            <div className="mb-4 space-y-3">
              {modules.map((mod) => {
                const modReqs = applyFilter(sortByStatus(reqsByModule[mod.id] || []));
                return (
                  <div key={mod.id} className="rounded-md border" style={{ borderColor: "#E2DFD6" }}>
                    <button onClick={() => setDrillDownModuleId(mod.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-t-md text-left" style={{ backgroundColor: "#F5F6F3", cursor: "pointer" }}>
                      <span className="text-[12.5px] font-semibold" style={{ color: "#3D3A34" }}>{mod.name}</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {onUpdateModule && (
                          <button onClick={() => setModal({ type: "renameModule", payload: mod })} className="p-1">
                            <Pencil size={12} style={{ color: "#B5B0A3" }} />
                          </button>
                        )}
                        {onDeleteModule && (
                          <button onClick={() => handleDeleteModule(mod)} disabled={saving} className="p-1 disabled:opacity-50">
                            <Trash2 size={12} style={{ color: "#B5B0A3" }} />
                          </button>
                        )}
                      </div>
                    </button>
                    {mod.description && (
                      <div className="px-3 pt-1.5 text-[12px]" style={{ color: "#8A8578" }}>{mod.description}</div>
                    )}
                    <ul className="space-y-2 px-3 py-2">
                      {modReqs.length === 0 && (
                        <li className="py-1 text-[12px]" style={{ color: "#8A8578" }}>Nessun requisito in questo modulo</li>
                      )}
                      {modReqs.map(renderRequirement)}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Drill-down modulo */}
          {drillDownModuleId && (
            <>
              <button onClick={() => setDrillDownModuleId(null)} className="mb-3 flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "#8A8578" }}>
                <X size={12} /> Chiudi drill-down modulo
              </button>
              {(() => {
                const drillMod = modules.find((m) => m.id === drillDownModuleId);
                if (!drillMod) return null;
                const drillModOutgoing = applyFilter(sortByStatus(integrations.filter((i) => i.fromModuleId === drillDownModuleId)));
                const drillModIncoming = applyFilter(sortByStatus(integrations.filter((i) => i.toModuleId === drillDownModuleId)));
                const drillModReqs = applyFilter(sortByStatus(app.requirements.filter((r) => r.moduleId === drillDownModuleId)));
                return (
                  <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: "#E2DFD6", backgroundColor: "#FBFAF7" }}>
                    <div className="text-[14px] font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>
                      Modulo: {drillMod.name}
                    </div>

                    {drillModReqs.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Requisiti ({drillModReqs.length})</div>
                        <ul className="space-y-2">
                          {drillModReqs.map(renderRequirement)}
                        </ul>
                      </div>
                    )}

                    {drillModOutgoing.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Integrazioni in uscita ({drillModOutgoing.length})</div>
                        <div className="space-y-1.5">
                          {drillModOutgoing.map((i) => renderIntegrationRow(i, "out"))}
                        </div>
                      </div>
                    )}

                    {drillModIncoming.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Integrazioni in ingresso ({drillModIncoming.length})</div>
                        <div className="space-y-1.5">
                          {drillModIncoming.map((i) => renderIntegrationRow(i, "in"))}
                        </div>
                      </div>
                    )}

                    {drillModReqs.length === 0 && drillModOutgoing.length === 0 && drillModIncoming.length === 0 && (
                      <div className="text-[12px]" style={{ color: "#8A8578" }}>Nessun contenuto in questo modulo</div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {!drillDownModuleId && (
            <>
          {/* Default level requirements */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>
              {modules.length > 0 ? "Requisiti non assegnati a un modulo" : "Requisiti"}
            </div>
            <StatusFilterChips value={statusFilter} onChange={setStatusFilter} />
          </div>
          <ul className="space-y-2.5">
            {applyFilter(sortByStatus(defaultReqs)).map(renderRequirement)}
            {app.requirements.length === 0 && (
              <li className="rounded-md border border-dashed p-3 text-center text-[12.5px]" style={{ borderColor: "#D8D5CC", color: "#8A8578" }}>
                Nessun requisito censito
              </li>
            )}
          </ul>

          {/* Integrations summary */}
          {hasIntegrations && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>Integrazioni</div>
              <div className="space-y-1.5">
                {applyFilter(sortByStatus(outgoing)).map((i) => renderIntegrationRow(i, "out"))}
                {applyFilter(sortByStatus(incoming)).map((i) => renderIntegrationRow(i, "in"))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setModal({ type: "addFeature" })}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              <Plus size={13} /> Requisito
            </button>
            {onAddModule && (
              <button onClick={() => setModal({ type: "addModule" })}
                className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
                <Plus size={13} /> Modulo
              </button>
            )}
            <button onClick={() => setModal({ type: "addIntegration" })}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              <Plus size={13} /> Integrazione
            </button>
            <button onClick={handleDeleteApp} disabled={saving}
              className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium disabled:opacity-50" style={{ color: "#B5482B" }}>
              <Trash2 size={13} /> Elimina applicativo
            </button>
          </div>
            </>
          )}
        </>
      )}

      {tab === "integrations" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#8A8578" }}>
              {outgoing.length + incoming.length} integrazion{outgoing.length + incoming.length === 1 ? "e" : "i"}
            </div>
            <StatusFilterChips value={statusFilter} onChange={setStatusFilter} />
          </div>
          {!hasIntegrations && (
            <div className="rounded-md border border-dashed p-4 text-center text-[12.5px]" style={{ borderColor: "#D8D5CC", color: "#8A8578" }}>
              Nessuna integrazione con altri applicativi
            </div>
          )}
          {outgoing.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[11px] font-medium" style={{ color: "#8A8578" }}>In uscita</div>
              <div className="space-y-1.5">
                {applyFilter(sortByStatus(outgoing)).map((i) => renderIntegrationRow(i, "out"))}
              </div>
            </div>
          )}
          {incoming.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-medium" style={{ color: "#8A8578" }}>In ingresso</div>
              <div className="space-y-1.5">
                {applyFilter(sortByStatus(incoming)).map((i) => renderIntegrationRow(i, "in"))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <button onClick={() => setModal({ type: "addIntegration" })}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium" style={{ borderColor: "#D8D5CC", color: "#3D3A34" }}>
              <Plus size={13} /> Integrazione
            </button>
          </div>
        </div>
      )}

      {onClose && (
        <button onClick={onClose} className="mt-4 flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "#8A8578" }}>
          <X size={12} /> Chiudi dettaglio
        </button>
      )}

      {/* Modals */}
      {modal?.type === "editApp" && onUpdateApp && (
        <NewAppModal domains={domains} contracts={contracts} initial={app} onClose={() => setModal(null)}
          onSave={(payload) => { onUpdateApp(app.id, payload); setModal(null); }} />
      )}
      {modal?.type === "addFeature" && (
        <NewFeatureModal app={app} apps={apps} modules={modules} onClose={() => setModal(null)}
          onSave={(payload) => { onAddFeature(app.id, payload); setModal(null); }} />
      )}
      {modal?.type === "editFeature" && onUpdateFeature && (
        <NewFeatureModal app={app} apps={apps} modules={modules} initial={modal.payload} onClose={() => setModal(null)}
          onSave={(payload) => { onUpdateFeature(modal.payload.id, payload); setModal(null); }} />
      )}
      {modal?.type === "addIntegration" && (
        <NewIntegrationModal app={app} apps={apps} types={integrationTypes} modules={modules}
          onAddType={onAddIntegrationType} onClose={() => setModal(null)}
          onSave={(payload) => { onAddIntegration(payload); setModal(null); }} />
      )}
      {modal?.type === "editIntegration" && onUpdateIntegration && (
        <NewIntegrationModal app={app} apps={apps} types={integrationTypes} modules={modules}
          initial={modal.payload} onAddType={onAddIntegrationType} onClose={() => setModal(null)}
          onSave={(payload) => { onUpdateIntegration(modal.payload.id, payload); setModal(null); }} />
      )}
      {modal?.type === "addModule" && onAddModule && (
        <NewModuleModal onClose={() => setModal(null)}
          onSave={({ name }) => { onAddModule(app.id, { name }); setModal(null); }} />
      )}
      {modal?.type === "renameModule" && onUpdateModule && (
        <NewModuleModal initial={modal.payload} onClose={() => setModal(null)}
          onSave={({ name }) => { onUpdateModule(modal.payload.id, { name }); setModal(null); }} />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
