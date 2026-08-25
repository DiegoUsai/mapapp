# C3 — Visualizzatore C4 Mermaid (terzo tab home)

## Question

Implementare il visualizzatore C4 interattivo come terzo tab sulla home, basato su Mermaid.

## Scope

### Tab sulla home

- Terzo tab: **Griglia | Mappa | C4**
- Vista di default: **System Landscape** (tutti gli applicativi)
- Filtro scope disponibile (default: tutti visibili)

### Navigazione interattiva

- Click su applicativo nel Landscape → **System Context** (quell'app + i sistemi integrati)
- Click su applicativo nel System Context → **Container diagram** (moduli dell'app)
- Click su app esterna nel System Context → System Context di quell'app
- Breadcrumb / back per tornare al livello precedente
- Pulsante "Vista landscape" per tornare alla radice

### Rendering

- Dipendenza: `mermaid` npm
- Generare sintassi Mermaid C4 (`C4Context`, `C4Container`) dal modello dati
- Decisione da prendere durante implementazione: generare Mermaid direttamente dal DB, oppure passare per il DSL di C2 e tradurre (spec prevede DSL→Mermaid, ma valutare costo/beneficio)
- Componente React `"use client"` con `mermaid.initialize()` e `mermaid.render()`

### Stile

- Badge scope visibile su ogni elemento nel diagramma
- Palette coerente con il design system dell'app (colori da `constants.js`)
- Nodi nazionale/privato distinguibili (come sulla mappa force-directed)

### Limiti noti (documentati in spec)

- Layout automatico non configurabile manualmente
- Vista landscape può risultare densa con molti nodi — è punto di ingresso, non vista di lavoro quotidiana
