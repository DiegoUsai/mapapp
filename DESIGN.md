---
name: Mappa Applicativa
description: Navigable application map for PA ecosystem governance
colors:
  navy-ink: "#1B2430"
  warm-paper: "#F5F6F3"
  parchment: "#FBFAF7"
  ink-black: "#232019"
  dark-stone: "#3D3A34"
  worn-stone: "#6B655A"
  dry-stone: "#8A8578"
  faded-stone: "#B5B0A3"
  rule-line: "#D8D5CC"
  card-border: "#E2DFD6"
  light-wash: "#F0EEE7"
  track-bed: "#E7E5DE"
  slate-cool: "#8FA3B0"
  mist-cool: "#AEB8C2"
  status-present: "#2F7D5C"
  status-progress: "#C97F1E"
  status-backlog: "#8791A0"
  alert-terracotta: "#B5482B"
  success-tint: "#EAF2ED"
  error-tint: "#FBEDE8"
  domain-steel-blue: "#3E5C76"
  domain-muted-plum: "#6B4E71"
  domain-olive-ochre: "#7A6A3F"
  domain-clay-red: "#7A3E3E"
  domain-forest: "#4B6B4B"
  domain-dusty-violet: "#5B4B7A"
  domain-deep-teal: "#2F6B6F"
  domain-burnt-sienna: "#7A5A3E"
  integration-teal: "#2F6F76"
  integration-sienna: "#A0522D"
  integration-amethyst: "#6A4FA0"
  integration-emerald: "#1F7A4C"
  integration-steel: "#3A6EA5"
  integration-walnut: "#8A5A44"
  integration-terracotta: "#B5482B"
  integration-moss: "#4B6B4B"
typography:
  display:
    fontFamily: "'IBM Plex Serif', serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: "'IBM Plex Serif', serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.05em"
  mono:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.navy-ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "#2A3642"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.dark-stone}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip-default:
    backgroundColor: "transparent"
    textColor: "{colors.dark-stone}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  chip-active:
    backgroundColor: "{colors.navy-ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  status-pill:
    backgroundColor: "dynamic"
    textColor: "dynamic"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  modal:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Mappa Applicativa

## Overview

**Creative North Star: "La Cartografia Operativa"**

L'atmosfera visiva di Mapapp unisce l'autorità e la leggibilità di una carta topografica istituzionale con lo scopo direzionale di una cabina di regia: non si limita a descrivere l'ecosistema applicativo, ma orienta le decisioni e previene i passi falsi. La palette terrosa e contenuta — pietra, inchiostro, carta invecchiata — comunica solidità senza freddo tecnicismo, mentre la tipografia IBM Plex bilancia carattere editoriale e rigore funzionale.

La densità informativa è alta (domini, stati, integrazioni, sovrapposizioni) ma ogni strato ha il suo registro visivo: i colori di dominio identificano le aree, gli indicatori di stato segnalano il progresso, gli archi sulla mappa raccontano i flussi. Nulla decora, tutto informa. L'interfaccia è calda e accessibile — uno strumento tecnico che non rinuncia a un carattere umano — ma ogni scelta ornamentale è subordinata alla chiarezza del dato.

**Key Characteristics:**
- Palette terrosa e istituzionale: pietre calde, inchiostro profondo, carta naturale
- Tipografia a tre voci: Serif per i titoli, Sans per il corpo, Mono per i metadati tecnici
- Superfici piatte con stratificazione tonale, ombre solo sulle modali
- Componenti sobri con angoli appena smussati e bordi sottili
- Colori semantici per stati e domini, mai decorativi

## Colors

Palette da carta topografica: toni di pietra e terra per le superfici, inchiostro profondo per le azioni, colori semantici contenuti per stati e domini.

### Primary
- **Navy Ink** (#1B2430): Colore d'azione principale. Intestazione, bottoni primari, toggle attivo nella barra vista. L'unico scuro pieno dell'interfaccia — il suo peso visivo è riservato alle azioni e all'identità.

### Neutral
- **Warm Paper** (#F5F6F3): Sfondo pagina. La carta su cui tutto poggia — calda senza essere gialla, neutra senza essere grigia.
- **Parchment** (#FBFAF7): Sfondo secondario (barra filtri, righe requisiti). Un mezzo tono tra la carta e il bianco delle card.
- **Ink Black** (#232019): Testo primario. Nero caldo con una punta d'ambra, mai nero puro.
- **Dark Stone** (#3D3A34): Testo di bottoni secondari e label attive. Un gradino sotto l'inchiostro.
- **Worn Stone** (#6B655A): Testo terziario, label delle sezioni, link secondari. Il grigio di lavoro.
- **Dry Stone** (#8A8578): Testo placeholder, icone mute, metadati di contorno. Il tono più quieto che resti leggibile.
- **Faded Stone** (#B5B0A3): Footer, icone disabilitate. Presente ma non in primo piano.
- **Rule Line** (#D8D5CC): Bordo di input e chip. La riga sottile del registro.
- **Card Border** (#E2DFD6): Bordo delle card e separatori. Un filo più leggero di Rule Line.
- **Light Wash** (#F0EEE7): Sfondo delle etichette contratto. La tinta più leggera prima del bianco.
- **Track Bed** (#E7E5DE): Sfondo della barra di stato dei requisiti.
- **Slate Cool** (#8FA3B0): Testo meta nell'intestazione. L'unico tono freddo della palette neutra, per staccare dal calore della pagina.
- **Mist Cool** (#AEB8C2): Sottotitolo dell'intestazione. Compagno più chiaro di Slate Cool.

### Status (Semantic)
- **Present Green** (#2F7D5C): Stato "Presente" e ambito "Trasversale". Verde bosco profondo, mai brillante.
- **Progress Amber** (#C97F1E): Stato "In sviluppo" e badge "CORE". Ambra calda che segnala attenzione senza allarme.
- **Backlog Gray** (#8791A0): Stato "Backlog". Grigio freddo, volutamente in contrasto con i toni caldi per comunicare inattività.
- **Alert Terracotta** (#B5482B): Azioni distruttive e avviso di sovrapposizione requisiti. Terracotta scura — un rosso che resta nella palette terrosa.
- **Success Tint** (#EAF2ED): Sfondo dei messaggi di conferma. Verde pallido.
- **Error Tint** (#FBEDE8): Sfondo dei messaggi di errore. Rosa pallido terroso.

### Domain Palette
Otto colori desaturati e di media luminosità per distinguere i domini nella mappa e nella griglia. Nessuno domina sugli altri; la parità cromatica riflette i confini labili tra domini.
- **Steel Blue** (#3E5C76), **Muted Plum** (#6B4E71), **Olive Ochre** (#7A6A3F), **Clay Red** (#7A3E3E), **Forest** (#4B6B4B), **Dusty Violet** (#5B4B7A), **Deep Teal** (#2F6B6F), **Burnt Sienna** (#7A5A3E).

### Integration Type Palette
Otto colori per i tipi di integrazione, leggermente più saturi dei colori di dominio per distinguersi sugli archi della mappa.
- **Teal** (#2F6F76), **Sienna** (#A0522D), **Amethyst** (#6A4FA0), **Emerald** (#1F7A4C), **Steel** (#3A6EA5), **Walnut** (#8A5A44), **Terracotta** (#B5482B), **Moss** (#4B6B4B).

### Named Rules
**The Earthy Authority Rule.** Nessun colore nell'interfaccia esce dalla gamma terrosa. I colori brillanti, saturi o neon sono esclusi: la credibilità istituzionale viene dalla sobrietà, non dall'impatto visivo.

**The Status-Only Saturation Rule.** I colori più saturi della palette sono riservati agli indicatori di stato (presente/in sviluppo/backlog) e alle azioni distruttive. Nessun elemento decorativo raggiunge la stessa saturazione.

## Typography

**Display Font:** IBM Plex Serif (with Georgia, serif)
**Body Font:** IBM Plex Sans (with system sans-serif)
**Label/Mono Font:** IBM Plex Mono (with monospace)

**Character:** Tre voci della stessa famiglia IBM Plex, ognuna con un ruolo preciso. La Serif dà autorità editoriale ai titoli e ai nomi delle entità — è la voce che "presenta". La Sans è il corpo del lavoro: leggibile, neutra, densa. La Mono marca i metadati tecnici (contratti, codici, etichette dell'intestazione) con la precisione di un timbro amministrativo.

### Hierarchy
- **Display** (Serif, 600, clamp 1.5rem–1.875rem, lh 1.2): Titolo principale nell'intestazione. Una sola occorrenza per pagina.
- **Headline** (Serif, 600, 15px, lh 1.3): Nomi degli applicativi nelle card e nei pannelli, titoli delle modali. La voce che nomina le entità.
- **Body** (Sans, 400, 13.5px, lh 1.5): Testo corrente, descrizioni, contenuto dei form. Dimensione compatta per alta densità informativa.
- **Label** (Sans, 500, 12px, lh 1.3, tracking 0.05em, uppercase): Etichette di sezione ("DOMINIO", "FORNITORE"). Maiuscolo e tracking largo per distinguersi dal corpo senza alzare la voce.
- **Mono** (Mono, 400, 11px, lh 1.4): Etichette contratto, testo meta dell'intestazione. Segnala "dato tecnico" in modo inequivocabile.

### Named Rules
**The Three Voices Rule.** Ogni testo dell'interfaccia appartiene a una delle tre voci (Serif/Sans/Mono). Non si mescolano all'interno dello stesso blocco. La Serif non scende sotto i 15px; la Mono non sale sopra gli 11px.

## Layout

Container massimo a 6xl (72rem / 1152px), centrato, con padding orizzontale 24px (mobile) / 40px (sm+). Griglia a colonne responsive: 1 colonna su mobile, 2 su sm, 3 su lg, con gap di 16px.

L'intestazione (Navy Ink) e la barra filtri (Parchment) occupano tutta la larghezza; il contenuto sottostante rispetta il container. La barra filtri è separata dal contenuto da un bordo sottile (Card Border).

Il ritmo verticale interno si basa su multipli di 4px: 6px tra elementi stretti (chip, pill), 16px tra sezioni, 24px tra blocchi principali. Le card della griglia si espandono a tutta larghezza (span completo) quando aperte, per dare spazio al pannello di dettaglio.

## Elevation & Depth

Sistema piatto. Le superfici si distinguono per tono, non per ombra. La gerarchia di profondità è interamente tonale: Warm Paper (sfondo) → Parchment (barra filtri) → bianco (card e modali). I bordi sottili (Card Border, Rule Line) delimitano le superfici senza sollevarle.

**The Flat-By-Default Rule.** Le ombre appaiono solo sulle modali (`shadow-xl`) e sull'overlay nero al 30%. Nessun altro elemento dell'interfaccia ha un'ombra. Se un componente deve emergere, usa un bordo più scuro o un tono di sfondo più chiaro, mai un'ombra.

## Shapes

Linguaggio a spigoli smussati, mai rotondi (tranne dove la forma è semantica). Gli angoli comunicano la funzione dell'elemento:

- **Rounded-md (6px)**: Bottoni, input, select, badge piccoli. La forma base di un controllo interattivo.
- **Rounded-lg (8px)**: Card, modali, container. La forma di una superficie che contiene.
- **Rounded-full (9999px)**: Chip, pill di stato, barra di progresso, indicatori circolari. La forma rotonda segnala "dato sintetico" o "filtro toggle".
- **Rounded-sm (4px)**: Indicatore colore del dominio sulla card. Appena percettibile.

**The Shape-Tells-Role Rule.** La rotondità dell'angolo segnala il tipo di elemento. Non mescolare: un bottone non diventa rounded-full (quello è un chip), un chip non diventa rounded-md (quello è un bottone).

## Components

### Buttons
- **Shape:** Angoli appena smussati (6px)
- **Primary:** Navy Ink (#1B2430), testo bianco, padding 10px 16px, font 12.5–13.5px Sans weight 500. L'unico bottone pieno dell'interfaccia.
- **Hover / Focus:** Sfondo schiarito a #2A3642. Nessuna trasformazione o ombra.
- **Secondary / Ghost:** Bordo Rule Line (#D8D5CC), testo Dark Stone (#3D3A34), sfondo trasparente. Usato per azioni secondarie (importa/esporta, annulla).
- **Danger:** Sfondo Alert Terracotta (#B5482B), testo bianco. Riservato ai bottoni di conferma eliminazione.
- **Disabled:** opacity 40%.
- **Link-style:** Testo Worn Stone (#6B655A), underline con offset 2px. Per azioni terziarie inline (+ Nuovo dominio, Azzera filtri).

### Chips
- **Style:** Rounded-full, bordo Rule Line, font 13px Sans weight 500.
- **State:** Default = bordo solo, testo Dark Stone. Active = sfondo pieno (colore del dominio o Navy Ink per i fornitori), testo bianco, bordo in tinta.
- **Status chips:** Più piccoli (11px), con dot indicator colorato. Active = sfondo pieno del colore di stato.

### Cards / Containers
- **Corner Style:** Rounded-lg (8px)
- **Background:** Bianco (#FFFFFF)
- **Shadow Strategy:** Nessuna ombra. Solo bordo Card Border (#E2DFD6).
- **Border:** 1px solid Card Border. Flash state: 1.5px solid Alert Terracotta con ring 4px rgba terracotta 12%.
- **Internal Padding:** 16px.
- Quando espansa, la card occupa tutto lo span della griglia con un divider (bordo Card Border) tra header e dettaglio.

### Inputs / Fields
- **Style:** Bordo Rule Line (#D8D5CC), sfondo bianco, rounded-md, font 13.5px Sans.
- **Focus:** Nessun glow — solo outline:none (gestito dal browser default). Bordo invariato.
- **Label:** 12px Sans weight 500, colore Worn Stone (#6B655A), sopra l'input con gap 4px.

### Navigation
- **Header:** Full-width Navy Ink. Logo/titolo in Serif bianca, meta in Mono Slate Cool.
- **View Toggle:** Due bottoni in un contenitore rounded-md con bordo. Active = Navy Ink pieno, testo bianco. Inactive = sfondo trasparente, testo Worn Stone.
- **Filter Bar:** Full-width Parchment, bordo inferiore Card Border. Chip di dominio e fornitore, select per contratto, campo di ricerca.

### Modals
- **Overlay:** bg-black/30, click-to-dismiss.
- **Container:** max-w-md (modali standard), max-w-sm (dialoghi di conferma), rounded-lg, shadow-xl, padding 20px.
- **Header:** Titolo in Serif 15px weight 600, bottone chiudi (X icon, Dry Stone).
- **Stack:** z-50 per modali normali, z-60 per dialoghi di conferma sovrapposti. Le modali secondarie si aprono sopra senza chiudere la prima.

### Status Bar (Signature Component)
Barra di progresso orizzontale (altezza 6px, rounded-full) che sintetizza la distribuzione dei requisiti per stato. Sfondo Track Bed (#E7E5DE), segmenti colorati proporzionali (verde/ambra/grigio). Presente su ogni card nella griglia.

### Status Pill (Signature Component)
Indicatore inline rounded-full con dot colorato e label. Sfondo tintato al 10% del colore di stato. Font 11px Sans weight 500.

## Do's and Don'ts

### Do:
- **Do** usare i colori di stato solo per indicare stato (presente/in sviluppo/backlog). Mai come decorazione.
- **Do** mantenere la separazione delle tre voci tipografiche: Serif per i nomi, Sans per il corpo, Mono per i metadati tecnici.
- **Do** usare la stratificazione tonale (sfondo pagina → sfondo secondario → bianco) per creare profondità senza ombre.
- **Do** riservare il Navy Ink (#1B2430) pieno alle azioni primarie e all'intestazione. Nessun altro elemento usa lo stesso sfondo pieno.
- **Do** mantenere i colori di dominio alla stessa saturazione e luminosità: nessun dominio deve dominare visivamente sugli altri.

### Don't:
- **Don't** aggiungere ombre a elementi che non sono modali. La profondità è tonale, non proiettata.
- **Don't** usare colori fuori dalla gamma terrosa. Nessun blu brillante, verde neon, o viola saturo.
- **Don't** usare rounded-full su bottoni d'azione (quello è il registro dei chip e delle pill). I bottoni sono rounded-md.
- **Don't** mescolare voci tipografiche nello stesso blocco (es. Serif e Mono nella stessa riga).
- **Don't** usare il nero puro (#000000). Il nero più scuro è Ink Black (#232019).
