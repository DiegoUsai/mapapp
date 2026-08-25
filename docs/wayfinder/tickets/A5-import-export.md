# A5 — Import/export JSON: scope e slug

## Question

Aggiornare import e export JSON per includere scope e slug.

## Scope

### Export

- Ogni application include `scope` e `slug`
- Ogni module include `slug`

### Import

- Accettare `scope` su application (default `interno` se assente per retrocompatibilità)
- Accettare `slug` su application e module
- Se slug fornito: usarlo (verificare unicità, errore se duplicato)
- Se slug assente: generarlo dal nome
- Enforcement scope: se `scope = nazionale` e ci sono contratti nel JSON, ignorarli con warning (non bloccare import)
