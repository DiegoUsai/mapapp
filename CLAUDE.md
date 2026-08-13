# Mapapp — guida per Claude Code

Questo documento fornisce a Claude Code il contesto necessario per lavorare su questo repository in modo coerente. Va tenuto aggiornato man mano che le decisioni di progetto evolvono.

## Panoramica del progetto

**Mapapp** è un'applicazione che costruisce una **mappa applicativa** (application map) navigabile delle progettualità di un cliente: applicativi, contratti, domini, requisiti e integrazioni, con l'obiettivo di dare visibilità condivisa a un ecosistema multi-fornitore ed evitare **requisiti** duplicati o sovrapposti tra team diversi.

È attualmente una **POC** (proof of concept), a uso personale, per popolare dati di esempio e presentare una demo al cliente. Non è ancora in produzione presso il cliente.

## Stack tecnologico

- **Framework**: Next.js 16 (React)
- **Linguaggio**: TypeScript
- **Autenticazione**: Auth.js v5 (ex NextAuth), social login Google, ristretto al dominio email `@aicof.it`
- **Database**: Postgres, tramite **Prisma** come ORM
- **Hosting**: Vercel
- **Repository**: GitHub

*(Sezione da confermare/integrare: gestore di pacchetti — npm/pnpm/yarn —, libreria per la visualizzazione a grafo, eventuale libreria UI/component library)*

## Modello di dominio

Concetti chiave che Claude Code deve conoscere per non introdurre incoerenze nel modello dati:

- **Applicativo**: può appartenere a **più contratti** contemporaneamente (relazione molti-a-molti), per riflettere la frammentazione per dominio/competenze (es. un contratto per l'**UI/UX**, un altro per il **front-end**).
- **Contratto**: entità a sé stante, con intervallo temporale, fornitore/RTI, e uno o più **CIG** e **CUP** (entrambi liste, non valori singoli).
- **Dominio**: ha un tipo (**verticale** o **trasversale-core**), e opzionalmente un codice **COFOG** e un **URI Eurovoc**, in coerenza con le linee guida AgID. Le macro-aree (PAC, PAL, Sanità, Istruzione) non sono un attributo del dominio: appartengono all'entità cliente, che resta fuori scope nella POC (lo strumento gestisce un cliente alla volta).
- **Requisito**: può avere un **id esterno** verso un registro condiviso o un backlog (es. una chiave Jira).
- **Integrazione**: concettualmente è un requisito, ma va tenuta separata e ha uno stato proprio (presente / in lavorazione / backlog). Nella rappresentazione a grafo lo stato va reso visibile lungo l'arco (etichetta o indicatore colorato).

Prima di modificare lo schema Prisma o le entità principali, verificare la coerenza con questi vincoli concettuali.

## Struttura del repository

*(Da completare mano a mano che il progetto cresce — indicare qui la struttura reale delle cartelle: `app/`, `components/`, `lib/`, `prisma/`, ecc., e il criterio con cui è organizzata)*

## Convenzioni di codice

- **TypeScript strict mode** attivo: evitare `any`, preferire tipi espliciti sulle entità di dominio (Applicativo, Contratto, Dominio, Requisito, Integrazione).
- Naming coerente con il modello di dominio in italiano o inglese? *(da decidere: consigliato usare i nomi inglesi nel codice — `Application`, `Contract`, `Domain`, `Requirement`, `Integration` — e riservare l'italiano alla documentazione e all'interfaccia utente, per restare allineati alle convenzioni internazionali del framework)*
- Componenti React organizzati per dominio funzionale, non per tipo tecnico (evitare cartelle generiche tipo `components/misc`).
- Server Components come default; usare `"use client"` solo dove serve interattività.
- Validazione dei dati in ingresso con uno schema (es. **Zod**) coerente con i modelli Prisma, non solo lato database.

*(Sezione da arricchire con eventuali regole di lint/formatter — ESLint, Prettier — se già configurate nel repository)*

## Test e copertura (coverage)

- **Unit test**: coprono la logica di dominio pura (es. calcolo delle sovrapposizioni tra requisiti, validazione delle relazioni molti-a-molti applicativo-contratto) e i componenti isolati.
- **Integration test**: coprono i flussi che attraversano più livelli (es. creazione di un Requisito con id esterno e verifica della sua associazione al Dominio corretto, autenticazione con dominio email ristretto).
- **Coverage target**: *(da definire — indicare qui la soglia minima accettata, es. 70-80% sulla logica di dominio; è ragionevole non pretendere coverage alta sulle parti puramente di presentazione)*
- Framework di test: *(da confermare — Vitest/Jest per gli unit test, Playwright per eventuali test end-to-end)*
- Claude Code deve scrivere o aggiornare i test **in corrispondenza di ogni modifica funzionale**, non come attività separata a posteriori.

## Build, deploy e comandi

*(Sezione da completare con i comandi reali del repository, indicativamente:)*

```bash
npm install
npm run dev        # ambiente di sviluppo locale
npm run build       # build di produzione
npm run lint         # controllo lint
npm run test         # esecuzione test
```

- **Deploy**: automatico su Vercel a fronte di push sul branch principale *(confermare se è già configurato così)*.
- **Variabili d'ambiente**: da documentare in un `.env.example` (connessione al database Postgres, credenziali Auth.js/Google) — non committare mai valori reali.

## Agenti e skill Claude Code disponibili

Il repository include sub-agent specializzati per tecnologia (cartella `.claude/agents/`) e uno skill sulla qualità dei test (`.claude/test-skills.md`, adattato a TypeScript/Vitest per questo progetto).

**Agenti attivi per mapapp**: `react-expert`, `typescript-expert`, `prisma-expert`, `postgres-expert`, `rest-expert`, `tailwind-expert`.

**Agenti esclusi dal set attivo** (non pertinenti allo stack attuale, valutare se reintrodurli in caso di sviluppi futuri): `nestjs-expert` (nessun backend NestJS separato previsto), `react-native-expert` (nessuna app mobile prevista).

### Quando invocare quale agente

Gli agent `react-expert` e `typescript-expert` hanno già, nel proprio file, una descrizione con innesco automatico ("Use PROACTIVELY for...") — Claude Code li seleziona da solo in base al tipo di modifica, senza bisogno di indicazioni aggiuntive qui.

Gli altri quattro coprono l'area dati e non hanno un innesco altrettanto netto, e tre di loro (`prisma-expert`, `postgres-expert`, `sql-expert`) si sovrappongono. Per questi vale una regola esplicita di instradamento, così da evitare che Claude Code ne scelga uno a caso tra i tre:

| Caso d'uso | Agente da usare |
|---|---|
| Modifiche allo schema Prisma, query tramite Prisma Client, migration | `prisma-expert` |
| Query SQL dirette (raw query), tuning e indicizzazione a livello di database Postgres | `postgres-expert` |
| Progettazione di API route Next.js (endpoint, status code, versioning) | `rest-expert` |
| Stile e utility CSS con Tailwind | `tailwind-expert` |

`sql-expert` è **escluso dal set attivo**: le sue competenze sono già coperte da `prisma-expert` (per l'accesso via ORM) e `postgres-expert` (per query dirette e ottimizzazione). Tenerlo attivo in parallelo introduce solo ambiguità su quale dei tre invocare; va ripescato solo se un giorno il progetto avrà bisogno di query SQL complesse scritte a mano e indipendenti da Postgres.

## Documentazione

- Le specifiche funzionali e tecniche complete si trovano nella cartella `docs/`
- Ogni nuova entità o relazione significativa nel modello dati va documentata in questo file, nella sezione **Modello di dominio**, prima ancora di essere implementata nello schema Prisma.
- Le decisioni architetturali rilevanti (es. cambio di libreria, cambio di provider di autenticazione) vanno annotate qui con una breve motivazione, per evitare che Claude Code "dimentichi" il perché di una scelta tra una sessione e l'altra.

## Vincoli e decisioni prese

- Import da file (Excel/JSON) e **export JSON** sono entrambi disponibili dall'interfaccia (`ImportExportModal`), a supporto del popolamento dei dati durante la POC.
- Autenticazione obbligatoria via Google, ristretta al dominio `@aicof.it` (non è più previsto l'accesso senza autenticazione).
- Approccio di lavoro: i requisiti e le decisioni di prodotto si definiscono altrove (documentazione di specifica); Claude Code si occupa della produzione del codice coerente con quella specifica, non della definizione dei requisiti stessi.

---

**Nota per Claude Code**: le sezioni segnate come *(da completare)* vanno riempite con i dettagli reali del repository non appena disponibili — non inventare comandi, librerie o strutture di cartelle non confermate.