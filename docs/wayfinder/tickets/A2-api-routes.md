# A2 — API routes: scope e slug

## Question

Aggiornare tutte le API route per gestire scope e slug con enforcement delle regole di business.

## Scope

### Application routes (`app/api/applications/`)

**POST (creazione):**
- Accettare `scope` (default `interno`) e `slug` (opzionale, auto-generato se omesso)
- Validare scope ∈ {interno, nazionale, privato}
- Se `scope = nazionale`: rifiutare con 400 se vengono passati `contracts`
- Generare slug se non fornito, verificare unicità

**PATCH (modifica):**
- Accettare `scope` (modificabile)
- NON accettare `slug` (immutabile dopo creazione)
- Se scope cambia da `interno` a `nazionale`: scollegare automaticamente i contratti (il frontend chiede conferma prima di chiamare)
- Se scope cambia a `nazionale` e ci sono contratti: restituire i contratti scollegati nella response per feedback

**GET / data route:**
- Includere `scope` e `slug` nella response

### Contract association enforcement

- `POST/PATCH` su Application con `scope = nazionale`: rifiutare collegamento contratti (400)
- `POST` su contratti collegati ad app nazionale: rifiutare (400)

### Module routes (`app/api/modules/`)

**POST:** generare slug automaticamente dal nome, verificare unicità
**PATCH:** NON accettare slug (immutabile)

### Data route (`app/api/data/`)

- Includere `scope` e `slug` nella query applications
- Includere `slug` nella query modules
