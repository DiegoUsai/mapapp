# C1 — Export Backstage YAML

## Question

Implementare l'export in formato Backstage Catalog Descriptor (YAML) con download .zip.

## Scope

### Regole di filtro (dalla spec)

Solo entità con `scope = interno`:
- **Application** (interno) → `System`
- **Module** (di app interno) → `Component`
- **Domain** → `Domain`
- **Vendor** (associato ad almeno un app incluso) → `Group` (tipo `vendor`)
- **Integration** (tra app interno) → `API` + relazione

### Identificazione

Ogni entità usa il proprio `slug` nel formato `kind/namespace/name`:
- `system:regione-sardegna/{app-slug}`
- `component:regione-sardegna/{module-slug}`
- `domain:regione-sardegna/{domain-slug}` (domain non ha slug — usare kebab del nome)

### Implementazione

- API route `app/api/export/backstage/route.js` → genera YAML e restituisce .zip
- Un file YAML per entità (o raggruppati per kind)
- Tab "Backstage YAML" nell'ImportExportModal
- Solo download, nessuna preview

### Dipendenze npm

- `js-yaml` per generazione YAML
- `jszip` o `archiver` per .zip (o generare lato API con streaming)
