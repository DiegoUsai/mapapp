# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Diego Usai (AICOF), unico utente attuale. Usa lo strumento per popolare i dati dell'ecosistema applicativo della Regione Sardegna e preparare una demo da presentare al cliente. Nella visione a lungo termine, lo strumento sarà usato dal cliente stesso e dai suoi fornitori per la governance dell'ecosistema.

## Product Purpose

Mapapp è una mappa applicativa navigabile che rende visibile l'intero ecosistema applicativo di un cliente PA (attualmente Regione Sardegna): applicativi, contratti, domini, requisiti e integrazioni. Esiste perché in un ecosistema multi-fornitore ogni fornitore vede solo il proprio silo, e il cliente non ha una visione d'insieme — il che porta a requisiti duplicati scoperti per caso (il caso emblematico: il requisito "workspace" sviluppato indipendentemente da due fornitori diversi). Lo strumento rende sistematica e anticipata la scoperta di queste sovrapposizioni.

Il successo nella fase attuale (POC) significa: dati popolati, demo convincente al cliente, decisione di proseguire verso uno strumento di governance reale.

## Positioning

Due meccanismi complementari che un generico strumento di application portfolio management non offre insieme:

1. **Visibilità condivisa multi-fornitore** — una mappa navigabile (griglia + grafo interattivo con drill-down sui moduli) che rende leggibile l'intero ecosistema, normalmente frammentato per fornitore.
2. **Rilevamento sistematico delle sovrapposizioni** — il collegamento esplicito tra requisiti concettualmente equivalenti fa emergere le duplicazioni prima che diventino lavoro sprecato, indipendentemente dal nome dato da ciascun team.

## Operating Context

L'ecosistema del cliente è centrato su un sistema di gestione documentale e protocollo (SibarDoc), con numerose applicazioni satellite affidate a fornitori diversi. I domini applicativi seguono le nomenclature ufficiali della PA italiana (codici COFOG, URI Eurovoc, linee guida AgID). I contratti hanno CIG e CUP multipli. Un applicativo può appartenere a più contratti contemporaneamente (frammentazione per dominio/competenze). Le integrazioni sono orientate e possono collegare singoli moduli tra applicativi diversi.

Workflow attuale: Diego popola i dati direttamente dall'interfaccia (CRUD completo su tutte le entità) e usa import/export Excel/JSON per alimentare il sistema. La demo avviene mostrando le viste griglia e mappa navigabili.

## Capabilities and Constraints

**Funzionalità confermate:**
- Vista a griglia (tessere applicativi) e vista a mappa (grafo D3 con posizionamento automatico)
- Drill-down sui moduli nella mappa (contenitore visivo dell'applicativo con moduli interni)
- CRUD completo su tutte le entità (Dominio, Fornitore, Contratto, Applicativo, Modulo, Requisito, Integrazione, Tipo di integrazione)
- Creazione inline di entità collegate (dominio e contratto creabili al volo durante la creazione di un applicativo)
- Collegamento bidirezionale tra requisiti equivalenti con avviso di sovrapposizione
- Generazione automatica di un requisito alla creazione di un'integrazione (attiva di default, disattivabile per singola creazione)
- Filtri (dominio, fornitore, contratto — solo valori in uso) e ricerca testuale su tutte le entità
- Import da file (Excel/JSON) e export JSON
- Integrazioni modulo→modulo (tutte le combinazioni app/modulo ammesse su entrambi gli estremi)
- Autenticazione Google ristretta a `@aicof.it`

**Vincoli tecnici:**
- Deploy su Vercel da GitHub
- Database Postgres (Neon) tramite Prisma
- Compatibilità futura con export verso Backstage (catalog-info.yaml), senza integrazione runtime in questa fase

**Fuori scope (POC):**
- Multi-utente con ruoli e permessi
- Entità cliente e macro-aree PA
- Sincronizzazione automatica con Backstage
- Storico delle modifiche
- Esportazione mappa come immagine

## Evidence on Hand

- Dataset di seed dei domini con allineamento COFOG/Eurovoc (`docs/domini-seed-cofog-eurovoc.json`) — codici COFOG verificati, URI Eurovoc da confermare
- Specifica funzionale completa (`docs/specifica-mappa-applicativa_1.md`)
- Implementazione funzionante e deployata su Vercel
- Nessun dato reale del cliente ancora caricato (dati di esempio per la demo)

## Product Principles

1. **Rendere visibile l'invisibile** — il valore sta nel mostrare connessioni e sovrapposizioni che nessun singolo fornitore può vedere dal proprio silo.
2. **Collegare, non classificare** — i domini sono etichette descrittive con confini labili, non contenitori esclusivi; la sovrapposizione emerge dal collegamento esplicito tra requisiti, non dalla tassonomia.
3. **Modularità leggibile** — il drill-down sui moduli rende leggibile "chi parla con chi" senza sovraccaricare la vista d'insieme.
4. **Integrità senza rigidità** — le cancellazioni rispettano l'integrità referenziale, ma lo strumento resta flessibile (spostamento di requisiti e integrazioni tra livelli, associazioni editabili in qualsiasi momento).
5. **Credibilità istituzionale** — l'allineamento ai codici COFOG e Eurovoc rafforza la legittimità dello strumento verso il cliente PA.

## Accessibility & Inclusion

Nessun requisito specifico stabilito per la POC. Lo strumento è usato su desktop da un singolo utente tecnico.
