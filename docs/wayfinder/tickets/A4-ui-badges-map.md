# A4 — UI: badge scope su tessere/nodi e distinzione visiva mappa

## Question

Rendere lo scope visibile sulle tessere della griglia e sui nodi della mappa, con filtro nella toolbar.

## Scope

### Vista a griglia

- Badge `scope` su ogni tessera (es. chip colorato: interno=neutro, nazionale=blu, privato=arancione)
- Filtro scope nella toolbar (chip selezionabili, pattern StatusFilterChips)

### Vista a mappa

- Nodi `nazionale` e `privato` visivamente distinti:
  - Bordo tratteggiato (dashed) per `nazionale`
  - Bordo punteggiato (dotted) o colore diverso per `privato`
  - Oppure: icona/badge overlay sul nodo
- Badge scope visibile nel tooltip o label del nodo

### Costanti

- Aggiungere in `constants.js`:
  - `SCOPE_VALUES` con label e colore per ciascuno scope
  - Stili per i nodi mappa per scope
