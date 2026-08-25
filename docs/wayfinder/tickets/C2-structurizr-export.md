# C2 — Export Structurizr DSL

## Question

Implementare l'export in formato Structurizr DSL (.dsl) con selezione del livello di vista.

## Scope

### Tre livelli di vista

1. **System Landscape** — tutti gli applicativi con integrazioni. Filtrabile per scope.
2. **System Context** — un singolo applicativo con i sistemi con cui si integra direttamente.
3. **Container diagram** — un singolo applicativo con i suoi moduli e integrazioni modulo→modulo.

### Implementazione

- API route `app/api/export/structurizr/route.js`
  - Query param `level` = landscape | context | container
  - Query param `appId` (per context e container)
  - Query param `scope` (per landscape, filtro opzionale)
  - Response: testo DSL con Content-Type `text/plain`, header download

- **ImportExportModal**: tab "Structurizr DSL" con:
  - Select livello
  - Select applicativo (per context/container)
  - Filtro scope (per landscape)
  - Bottone download

- **AppDetailPanel**: bottone "Export DSL" che scarica System Context per quell'app

### Struttura DSL generato

Da R2 (research). Include: `workspace`, `model` con tutti gli elementi e relazioni, `views` con la vista richiesta, `styles` con palette coerente.
