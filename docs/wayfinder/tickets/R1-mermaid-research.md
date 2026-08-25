# R1 — Research: sintassi Mermaid C4 e capabilities

## Question

Quali sono la sintassi, i limiti e le best practice di Mermaid per i diagrammi C4? Serve per implementare il visualizzatore C4 interattivo (ticket C3).

## Da investigare

1. Sintassi Mermaid C4: `C4Context`, `C4Container`, `C4Deployment` — quali sono supportati?
2. Styling: si può customizzare palette/colori per allinearsi al design system dell'app?
3. Interattività: si possono aggiungere click handler ai nodi per drill-down?
4. Limiti noti: quanti nodi regge prima di diventare illeggibile? Il layout è configurabile?
5. Integrazione React: esiste un wrapper React per Mermaid, o si usa `mermaid.init()` direttamente?
6. Versione: quale versione di `mermaid` npm supporta C4?
7. Rendering: server-side o client-side? Compatibilità con Next.js App Router / "use client"?
