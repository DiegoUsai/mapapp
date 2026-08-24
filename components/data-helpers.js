import { STATUS_ORDER } from "./constants";

export async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const err = new Error(errBody?.error || `${method} ${url} → ${res.status}`);
    err.status = res.status;
    err.body = errBody;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export function sharedOf(req) {
  const map = new Map();
  (req.sharedWith || []).forEach((r) => map.set(r.id, r));
  (req.sharedBy || []).forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
}

export function sortByStatus(items) {
  return [...items].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export function contractsLabel(contracts) {
  if (!contracts?.length) return "Nessun contratto collegato";
  return contracts.map((c) => c.name).join(", ");
}

export function vendorNamesOfApp(app) {
  const names = Array.from(new Set(app.contracts.map((c) => c.vendor.name)));
  return names.length ? names.join(" · ") : "Nessun fornitore (senza contratto)";
}

export function vendorIdsOfApp(app) {
  return app.contracts.map((c) => c.vendorId);
}

export function integrationsFor(integrations, appId) {
  return { outgoing: integrations.filter((i) => i.fromId === appId), incoming: integrations.filter((i) => i.toId === appId) };
}

export function endpointLabel(appName, moduleName) {
  return moduleName ? `${appName} · ${moduleName}` : appName;
}
