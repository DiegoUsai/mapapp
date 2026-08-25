"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { SCOPE_VALUES } from "./constants";

let mermaidMod = null;

function sanitize(s) {
  return (s || "").replace(/"/g, "'").replace(/[<>]/g, "");
}

function toAlias(entity) {
  return (entity.slug || entity.name || entity.id)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || `e_${entity.id?.slice(0, 8)}`;
}

function scopeColor(scope) {
  return SCOPE_VALUES[scope]?.color || SCOPE_VALUES.interno.color;
}

function buildLandscape(apps, integrations, scopeFilter) {
  const filtered = scopeFilter
    ? apps.filter((a) => (a.scope || "interno") === scopeFilter)
    : apps;
  const filteredIds = new Set(filtered.map((a) => a.id));

  const lines = ["C4Context"];
  lines.push(`    title Mappa Applicativa — System Landscape`);
  lines.push("");

  const interno = filtered.filter((a) => (a.scope || "interno") === "interno");
  const nazionale = filtered.filter((a) => a.scope === "nazionale");
  const privato = filtered.filter((a) => a.scope === "privato");

  if (interno.length) {
    lines.push(`    Enterprise_Boundary(b_interno, "Applicativi interni") {`);
    for (const a of interno) {
      lines.push(`        System(${toAlias(a)}, "${sanitize(a.name)}", "${sanitize(a.domain?.name || "")}")`);
    }
    lines.push("    }");
    lines.push("");
  }
  for (const a of nazionale) {
    lines.push(`    System_Ext(${toAlias(a)}, "${sanitize(a.name)}", "Nazionale")`);
  }
  for (const a of privato) {
    lines.push(`    System_Ext(${toAlias(a)}, "${sanitize(a.name)}", "Privato")`);
  }
  lines.push("");

  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));
  const seen = new Set();
  for (const i of integrations) {
    if (!filteredIds.has(i.fromId) || !filteredIds.has(i.toId)) continue;
    const from = appsById[i.fromId];
    const to = appsById[i.toId];
    if (!from || !to) continue;
    const key = `${toAlias(from)}-${toAlias(to)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`    Rel(${toAlias(from)}, ${toAlias(to)}, "${sanitize(i.type?.name || "")}")`);
  }
  lines.push("");

  for (const a of filtered) {
    const bg = scopeColor(a.scope || "interno");
    lines.push(`    UpdateElementStyle(${toAlias(a)}, $bgColor="${bg}", $fontColor="#ffffff", $borderColor="${bg}")`);
  }

  lines.push(`    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")`);
  return { def: lines.join("\n"), aliasMap: Object.fromEntries(filtered.map((a) => [toAlias(a), a.id])) };
}

function buildContext(apps, integrations, appId) {
  const target = apps.find((a) => a.id === appId);
  if (!target) return null;

  const connectedIds = new Set([appId]);
  integrations.forEach((i) => {
    if (i.fromId === appId) connectedIds.add(i.toId);
    if (i.toId === appId) connectedIds.add(i.fromId);
  });

  const contextApps = apps.filter((a) => connectedIds.has(a.id));
  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));

  const lines = ["C4Context"];
  lines.push(`    title System Context — ${sanitize(target.name)}`);
  lines.push("");

  lines.push(`    System(${toAlias(target)}, "${sanitize(target.name)}", "${sanitize(target.domain?.name || "")}")`);
  lines.push("");

  const others = contextApps.filter((a) => a.id !== appId);
  for (const a of others) {
    const scope = a.scope || "interno";
    if (scope === "interno") {
      lines.push(`    System(${toAlias(a)}, "${sanitize(a.name)}", "${sanitize(a.domain?.name || "")}")`);
    } else {
      lines.push(`    System_Ext(${toAlias(a)}, "${sanitize(a.name)}", "${SCOPE_VALUES[scope]?.label || scope}")`);
    }
  }
  lines.push("");

  const seen = new Set();
  for (const i of integrations) {
    if (!connectedIds.has(i.fromId) || !connectedIds.has(i.toId)) continue;
    const from = appsById[i.fromId];
    const to = appsById[i.toId];
    if (!from || !to) continue;
    const key = `${toAlias(from)}-${toAlias(to)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`    Rel(${toAlias(from)}, ${toAlias(to)}, "${sanitize(i.type?.name || "")}")`);
  }
  lines.push("");

  for (const a of contextApps) {
    const bg = scopeColor(a.scope || "interno");
    const border = a.id === appId ? "#232019" : bg;
    lines.push(`    UpdateElementStyle(${toAlias(a)}, $bgColor="${bg}", $fontColor="#ffffff", $borderColor="${border}")`);
  }

  lines.push(`    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")`);
  return { def: lines.join("\n"), aliasMap: Object.fromEntries(contextApps.map((a) => [toAlias(a), a.id])) };
}

function buildContainerView(apps, integrations, appId) {
  const target = apps.find((a) => a.id === appId);
  if (!target || !target.modules?.length) return null;

  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));

  const lines = ["C4Container"];
  lines.push(`    title Container — ${sanitize(target.name)}`);
  lines.push("");

  lines.push(`    System_Boundary(b_${toAlias(target)}, "${sanitize(target.name)}") {`);
  for (const m of target.modules) {
    lines.push(`        Container(${toAlias(m)}, "${sanitize(m.name)}", "", "${sanitize(m.description || "")}")`);
  }
  lines.push("    }");
  lines.push("");

  const connectedIds = new Set();
  integrations.forEach((i) => {
    if (i.fromId === appId && i.toId !== appId) connectedIds.add(i.toId);
    if (i.toId === appId && i.fromId !== appId) connectedIds.add(i.fromId);
  });
  const externalApps = apps.filter((a) => connectedIds.has(a.id));
  for (const a of externalApps) {
    lines.push(`    System_Ext(${toAlias(a)}, "${sanitize(a.name)}", "${SCOPE_VALUES[a.scope]?.label || "Interno"}")`);
  }
  lines.push("");

  const seen = new Set();
  for (const i of integrations) {
    if (i.fromId === appId && i.toId === appId) {
      const fromMod = target.modules.find((m) => m.id === i.fromModuleId);
      const toMod = target.modules.find((m) => m.id === i.toModuleId);
      if (fromMod && toMod) {
        const key = `${toAlias(fromMod)}-${toAlias(toMod)}`;
        if (!seen.has(key)) {
          seen.add(key);
          lines.push(`    Rel(${toAlias(fromMod)}, ${toAlias(toMod)}, "${sanitize(i.label || "")}")`);
        }
      }
    } else if (i.fromId === appId || i.toId === appId) {
      const from = appsById[i.fromId];
      const to = appsById[i.toId];
      if (!from || !to) continue;
      const key = `${toAlias(from)}-${toAlias(to)}`;
      if (!seen.has(key)) {
        seen.add(key);
        lines.push(`    Rel(${toAlias(from)}, ${toAlias(to)}, "${sanitize(i.type?.name || "")}")`);
      }
    }
  }
  lines.push("");

  const bg = scopeColor(target.scope || "interno");
  for (const m of target.modules) {
    lines.push(`    UpdateElementStyle(${toAlias(m)}, $bgColor="${bg}", $fontColor="#ffffff")`);
  }
  for (const a of externalApps) {
    const ebg = scopeColor(a.scope || "interno");
    lines.push(`    UpdateElementStyle(${toAlias(a)}, $bgColor="${ebg}", $fontColor="#ffffff")`);
  }

  lines.push(`    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")`);

  const aliasMap = Object.fromEntries([
    ...externalApps.map((a) => [toAlias(a), a.id]),
  ]);
  return { def: lines.join("\n"), aliasMap };
}

export function C4Viewer({ apps, integrations }) {
  const [level, setLevel] = useState("landscape");
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [scopeFilter, setScopeFilter] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const containerRef = useRef(null);
  const renderCount = useRef(0);

  const navigateTo = useCallback((newLevel, appId) => {
    if (newLevel === "landscape") {
      setBreadcrumb([]);
      setSelectedAppId(null);
    } else {
      const app = apps.find((a) => a.id === appId);
      if (newLevel === "context") {
        setBreadcrumb([{ label: app?.name || "App", level: "context", appId }]);
      } else if (newLevel === "container") {
        const prev = breadcrumb.length ? breadcrumb : [];
        const contextEntry = prev.find((b) => b.level === "context");
        if (!contextEntry) {
          setBreadcrumb([
            { label: app?.name || "App", level: "context", appId },
            { label: `${app?.name || "App"} (container)`, level: "container", appId },
          ]);
        } else {
          setBreadcrumb([
            ...prev,
            { label: `${app?.name || "App"} (container)`, level: "container", appId },
          ]);
        }
      }
      setSelectedAppId(appId);
    }
    setLevel(newLevel);
  }, [apps, breadcrumb]);

  const diagram = React.useMemo(() => {
    if (level === "landscape") return buildLandscape(apps, integrations, scopeFilter);
    if (level === "context" && selectedAppId) return buildContext(apps, integrations, selectedAppId);
    if (level === "container" && selectedAppId) return buildContainerView(apps, integrations, selectedAppId);
    return buildLandscape(apps, integrations, scopeFilter);
  }, [apps, integrations, level, selectedAppId, scopeFilter]);

  useEffect(() => {
    if (!containerRef.current || !diagram) return;
    let cancelled = false;

    (async () => {
      if (!mermaidMod) {
        mermaidMod = await import("mermaid");
      }
      const mermaid = mermaidMod.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          primaryColor: "#3E5C76",
          primaryTextColor: "#fff",
          primaryBorderColor: "#3E5C76",
          lineColor: "#707070",
          secondaryColor: "#F0EEE7",
          tertiaryColor: "#FBFAF7",
        },
        c4: {
          c4ShapeInRow: 4,
          c4BoundaryInRow: 1,
          wrap: true,
        },
      });

      if (cancelled) return;

      try {
        const renderId = `c4-${level}-${renderCount.current++}`;
        const { svg } = await mermaid.render(renderId, diagram.def);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;

        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.querySelectorAll("text, tspan").forEach((el) => {
            const t = el.textContent?.trim();
            if (t === "[Software System]" || t === "[ENTERPRISE]" || t === "[Container]") {
              el.textContent = "";
            }
          });

          if (diagram.aliasMap) {
            const groups = svgEl.querySelectorAll("g[id]");
            groups.forEach((g) => {
              const appId = diagram.aliasMap[g.id];
              if (!appId) return;
              g.style.cursor = "pointer";
              g.addEventListener("click", (e) => {
                e.stopPropagation();
                if (level === "landscape") {
                  navigateTo("context", appId);
                } else if (level === "context") {
                  const clickedApp = apps.find((a) => a.id === appId);
                  if (clickedApp?.modules?.length) {
                    navigateTo("container", appId);
                  } else {
                    navigateTo("context", appId);
                  }
                }
              });
            });
          }
        }
      } catch (err) {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="color:#B5482B;font-size:13px">${err.message}</pre>`;
        }
      }
    })();

    return () => { cancelled = true; };
  }, [diagram, level, apps, navigateTo]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => navigateTo("landscape", null)}
          className="rounded px-2.5 py-1 text-[12.5px] font-medium"
          style={level === "landscape" ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}
        >
          Landscape
        </button>
        {breadcrumb.map((b, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={12} style={{ color: "#B5B0A3" }} />
            <button
              onClick={() => navigateTo(b.level, b.appId)}
              className="rounded px-2.5 py-1 text-[12.5px] font-medium"
              style={level === b.level && selectedAppId === b.appId ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A" }}
            >
              {b.label}
            </button>
          </React.Fragment>
        ))}
        {level === "landscape" && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide" style={{ color: "#8A8578" }}>Scope:</span>
            {[null, ...Object.keys(SCOPE_VALUES)].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setScopeFilter(s)}
                className="rounded px-2 py-0.5 text-[11px] font-medium"
                style={scopeFilter === s ? { backgroundColor: "#1B2430", color: "#fff" } : { color: "#6B655A", border: "1px solid #D8D5CC" }}
              >
                {s ? SCOPE_VALUES[s].label : "Tutti"}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mb-2 text-[11px]" style={{ color: "#B5B0A3" }}>
        {level === "landscape" && "Click su un applicativo per vedere il contesto di integrazione."}
        {level === "context" && "Click su un applicativo con moduli per vederne i container."}
        {level === "container" && "Vista container: moduli interni e integrazioni."}
      </p>
      <div
        ref={containerRef}
        className="overflow-auto rounded-lg border bg-white p-4"
        style={{ borderColor: "#E2DFD6", minHeight: 300 }}
      />
    </div>
  );
}
