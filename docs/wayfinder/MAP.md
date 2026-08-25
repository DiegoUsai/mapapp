# Wayfinder Map — Scope, Slug, Export e Visualizzatore C4

## Destination

Implementare le specifiche del 21 e 24 agosto 2026: attributo `scope` e `slug` sul modello dati, export verso Backstage (YAML) e Structurizr (DSL), visualizzatore C4 interattivo basato su Mermaid come terzo tab sulla home.

## Notes

- Stack: Next.js 16, Prisma 6, PostgreSQL (Neon), Vercel
- Skill da consultare: `prisma-expert`, `react-expert`, `tailwind-expert`
- Caveman mode attivo — comunicazione terse
- L'architettura SPA con pannello laterale e modali resta invariata (pagine dedicate rimandate)
- Il C4 visualizer vive sulla **home** come terzo tab (Griglia | Mappa | C4), NON nel dettaglio app
- Spec di riferimento: `docs/specifica-mappa-applicativa_1.md`, changelog 21 ago e 24 ago 2026

## Decisions so far

- [Q1 — Ordine cluster](tickets/Q1-ordine.md) — A (scope+slug) → C1+C2+C3 (export+C4) in parallelo. B (pagine dedicate) rimandato.
- [Q2 — Enforcement scope](tickets/Q2-enforcement.md) — Sia API (400 per operazioni incoerenti) sia UI (campi nascosti).
- [Q3 — Unicità slug](tickets/Q3-slug-unique.md) — `@unique` per entità, suffisso numerico per duplicati.
- [Q4 — Migrazione scope](tickets/Q4-migrazione.md) — 4 app non-interno (Firma Namirial, Firma Aruba, PEC Aruba = privato; P.A.R.E.R. = nazionale). Resto = interno.
- [Q5 — C4 come tab](tickets/Q5-c4-tab.md) — Terzo tab sulla home, non nel dettaglio app.
- [Q6 — Pagine dedicate](tickets/Q6-pagine.md) — Rimandate. SPA con pannello laterale e modali resta.
- [Q7 — Accesso export](tickets/Q7-export-access.md) — Tab aggiuntivi nell'ImportExportModal. Bottone per-app nel pannello dettaglio.
- [Q8 — C4 default](tickets/Q8-c4-default.md) — Tutti gli scope visibili, filtro disponibile.
- [Q9 — Cambio scope](tickets/Q9-cambio-scope.md) — Scollegamento automatico contratti con dialog di conferma.
- [Q10 — Mermaid](tickets/Q10-mermaid.md) — OK installare `mermaid` come dipendenza npm.

## Tickets

### Cluster A — scope + slug (fondazione)

| # | Ticket | Tipo | Blocca | Bloccato da |
|---|--------|------|--------|-------------|
| A1 | [Schema + migration](tickets/A1-schema-migration.md) | task | A2 | — |
| A2 | [API routes scope/slug](tickets/A2-api-routes.md) | task | A3, A4, A5 | A1 |
| A3 | [UI: form scope/slug](tickets/A3-ui-forms.md) | task | — | A2 |
| A4 | [UI: badge e mappa](tickets/A4-ui-badges-map.md) | task | — | A2 |
| A5 | [Import/export JSON](tickets/A5-import-export.md) | task | C1, C2 | A2 |

### Cluster C — Export e C4

| # | Ticket | Tipo | Blocca | Bloccato da |
|---|--------|------|--------|-------------|
| R1 | [Research: Mermaid C4 syntax](tickets/R1-mermaid-research.md) | research | C3 | — |
| R2 | [Research: Structurizr DSL format](tickets/R2-structurizr-research.md) | research | C2 | — |
| C1 | [Backstage YAML export](tickets/C1-backstage-export.md) | task | — | A5 |
| C2 | [Structurizr DSL export](tickets/C2-structurizr-export.md) | task | C3 | A5, R2 |
| C3 | [C4 Mermaid visualizer](tickets/C3-c4-visualizer.md) | task | — | C2, R1 |

### Ordine di esecuzione

```
R1 (research) ──────────────────────────────────────────────┐
R2 (research) ────────────────────────────────┐             │
A1 → A2 → A3 (form)                          │             │
           ├→ A4 (badge/mappa)                │             │
           └→ A5 (import/export) → C1 (YAML)  │             │
                                  └→ C2 (DSL) ←┘ → C3 (C4) ←┘
```

## Not yet specified

- **Cluster B — Pagine dedicate**: pagine `/app/[id]`, `/app/[id]/module/[mid]`, `/contract/[id]` per Applicativo, Modulo, Contratto. Rimandato — nessun driver immediato dopo lo spostamento del C4 sulla home. Valutare se e quando la densità informativa del pannello laterale diventa insufficiente.
- **DSL→Mermaid translation**: la spec prevede che il DSL sia il formato di persistenza e venga tradotto in Mermaid al volo. Valutare in fase di C2/C3 se conviene tradurre DSL→Mermaid oppure generare entrambi direttamente dal modello dati.

## Out of scope

- Sincronizzazione automatica Backstage (webhook/polling) — esplicito nella spec come fuori scope POC
- Esportazione immagine/PDF della mappa — coperta da DSL + Mermaid
- Multi-utente con ruoli — fuori scope POC
