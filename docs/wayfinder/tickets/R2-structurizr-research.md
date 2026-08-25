# R2 — Research: formato Structurizr DSL

## Question

Qual è la sintassi e la struttura del Structurizr DSL per generare file `.dsl` validi? Serve per implementare l'export DSL (ticket C2).

## Da investigare

1. Sintassi base: `workspace`, `model`, `views`, `styles` — struttura completa di un file .dsl
2. Mapping entità: come si rappresentano `softwareSystem`, `container`, `person`, `relationship`?
3. Viste: come si definiscono System Landscape, System Context, Container diagram?
4. Proprietà custom: si possono aggiungere metadati (scope, slug, dominio)?
5. Temi e stili: come si definisce una palette custom nel DSL?
6. Validazione: esiste un tool CLI per validare un .dsl generato?
7. Esempio completo: un file .dsl minimo con 3 sistemi, 2 container e relazioni
