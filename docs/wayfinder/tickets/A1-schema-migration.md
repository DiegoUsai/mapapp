# A1 — Schema Prisma + migration: scope e slug

## Question

Aggiungere `scope` e `slug` al modello dati e migrare i dati esistenti.

## Scope

### Schema changes (`prisma/schema.prisma`)

**Application:**
- `scope String @default("interno")` — valori: `interno`, `nazionale`, `privato`
- `slug String @unique` — kebab-case, immutabile dopo creazione

**Module:**
- `slug String @unique` — kebab-case, immutabile dopo creazione

### Migration script

1. Aggiungere i campi con default temporanei
2. Generare slug da nome per tutti gli Application e Module esistenti (kebab-case, suffisso numerico se duplicati)
3. Settare scope per le 4 app non-interno:
   - `privato`: Firma Namirial, Firma Aruba, PEC Aruba
   - `nazionale`: P.A.R.E.R.
4. Tutti gli altri: `interno` (default)
5. Applicare vincolo `@unique` su slug

### Utility

Creare `lib/slugify.js`:
- Input: stringa (nome) → output: kebab-case (alfanumerico minuscolo + trattini)
- Gestione duplicati: se slug esiste già, appendere `-2`, `-3`, etc.
- Usata sia in migration sia nelle API di creazione
