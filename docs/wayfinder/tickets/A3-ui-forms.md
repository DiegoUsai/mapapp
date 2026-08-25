# A3 — UI: form creazione/modifica con scope e slug

## Question

Aggiornare i form di creazione e modifica applicativo per gestire scope e slug.

## Scope

### NewAppModal (creazione)

- Aggiungere select per `scope` (interno/nazionale/privato), default `interno`
- In base a scope selezionato, mostrare/nascondere dinamicamente:
  - `nazionale`: nascondere Fornitore, Contratto, Requisiti
  - `privato`: nascondere obbligatorietà Requisiti (opzionali)
  - `interno`: tutto visibile (stato attuale)
- Mostrare **anteprima slug** generata live dal nome (campo read-only sotto il nome)
- Slug modificabile solo in creazione (campo editabile che si auto-popola)

### EditAppModal / pannello modifica

- Scope modificabile con **dialog di conferma** se cambia da `interno` a `nazionale`:
  > "Passando a 'nazionale', i N contratti collegati verranno scollegati. Procedere?"
- Slug NON modificabile — mostrato come campo read-only con **pulsante copia**
- Campi condizionali come in creazione

### NewModuleModal / pannello modulo

- Mostrare **anteprima slug** in creazione
- Slug read-only con copia nel pannello modulo esistente
