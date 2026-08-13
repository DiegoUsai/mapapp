# Mappa applicativa e dei requisiti — specifica funzionale

Documento di specifica autosufficiente per la realizzazione dell'applicazione. È pensato per essere consegnato a una sessione di sviluppo (Claude Code) come unica fonte: descrive il contesto, il modello dati, i comportamenti attesi e i vincoli tecnici, lasciando le scelte implementative a chi realizza. Dove una scelta tecnica è vincolante (hosting, autenticazione) è indicata come tale; tutto il resto è comportamento da realizzare nel modo ritenuto migliore.

## Contesto e obiettivo

Il cliente (Regione Sardegna) governa un ecosistema applicativo centrato su un sistema di gestione documentale e di protocollo, attorno al quale gravitano numerose applicazioni satellite e progettualità verticali, affidate a fornitori diversi. Oggi il cliente non dispone di una visione d'insieme: esistono solo silos, ciascuno noto al proprio fornitore, senza una tassonomia condivisa, un'architettura comune o una cabina di regia che tenga insieme il quadro.

Questa mancanza produce un problema concreto e ricorrente: lo stesso bisogno funzionale viene richiesto più volte a fornitori diversi, perché né il cliente né i fornitori hanno modo di verificare che esista già. Il caso emblematico è il requisito **workspace** (uno spazio di lavoro che aggrega tutti i documenti afferenti a un procedimento amministrativo): sviluppato nel dominio documentale da un fornitore, è stato richiesto in modo indipendente a un altro fornitore per la gestione dei documenti di una liquidazione, senza che nessuno — cliente compreso — si accorgesse della sovrapposizione, finché non è emersa per caso.

L'applicazione oggetto di questa specifica è lo strumento che rende sistematica e anticipata la scoperta di queste sovrapposizioni: una **mappa navigabile** di domini, applicazioni, contratti e requisiti, consultabile sia dal cliente sia dai fornitori, che mette in evidenza quando lo stesso requisito è già presente altrove e come le applicazioni si integrano tra loro.

In questa fase lo strumento è una **proof of concept** a uso di una sola persona, per popolare i dati e portare una demo al cliente. La visione di lungo periodo è che diventi lo strumento di governance del cliente; il modello dati va quindi progettato in modo da poter essere in futuro esportato verso [Backstage](https://backstage.io) (formato *catalog-info.yaml*), senza che questa compatibilità condizioni le scelte tecniche della POC.

## Principi di modellazione

Il modello non si basa su una tassonomia rigida per dominio. I confini tra domini sono spesso labili (una fattura appartiene sia al dominio amministrativo-contabile sia a quello documentale) e imporre confini netti genererebbe discussioni sui limiti invece che sui contenuti. Il dominio è quindi un'etichetta descrittiva, non un contenitore esclusivo, e la sovrapposizione tra requisiti emerge dal collegamento esplicito tra requisiti simili, non dal nome scelto dal singolo team.

Il rilevamento delle duplicazioni si fonda sulla **descrizione** del requisito, non sul suo nome: due requisiti chiamati diversamente ma concettualmente equivalenti devono poter essere collegati, ed è quel collegamento a far emergere la sovrapposizione.

A questo si affianca un livello di **allineamento semantico** dei domini alle nomenclature ufficiali italiane ed europee (codici COFOG per le funzioni di governo, Eurovoc per i temi dei dati, in coerenza con le linee guida AgID). Questo allineamento non contraddice la scelta dei confini labili: i codici standard sono etichette descrittive che arricchiscono il dominio e ne rafforzano la riconoscibilità istituzionale, non vincoli che impongono a un requisito di stare in una casella e una sola. Allo stesso modo, la caratterizzazione del dominio per **ambito** (verticale o trasversale) e per **criticità** (core o non core) descrive la natura d'uso e l'importanza del dominio senza trasformarsi in una gerarchia rigida.

## Modello dati

Le entità e le loro relazioni. I campi elencati sono quelli funzionalmente necessari; identificativi tecnici e metadati (date di creazione e simili) sono lasciati all'implementazione.

**Dominio** — rappresenta un'area applicativa. Campi: nome, colore (usato per distinguere i nodi nella mappa), **ambito** (verticale o trasversale), **criticità core** (sì/no), e un riferimento semantico agli standard di classificazione della PA italiana ed europea. L'ambito e la criticità sono due attributi **indipendenti**, non un unico valore: l'ambito dice quanto un dominio è condiviso (**verticale** = specifico di un ambito funzionale; **trasversale** = usato da più ambiti), la criticità dice quanto è fondante (**core** = pilastro senza cui l'ecosistema non opera). Sono indipendenti perché tutte le combinazioni esistono davvero: la gestione documentale è trasversale e core; la contabilità è verticale ma core (un ente non opera senza); un portale self-service per le ferie è trasversale ma non core (impatta tutti i dipendenti, ma la sua indisponibilità non ferma i procedimenti); un gestionale di un singolo ufficio è verticale e non core. Il riferimento semantico non è un testo libero: va scelto da un **elenco precompilato** costruito sulle ontologie ufficiali — i codici **COFOG** (Classification of the Functions of Government) e/o gli **URI Eurovoc** — così che ogni dominio sia agganciato a una voce standard e non a una descrizione arbitraria. Questo allinea i domini alle nomenclature ufficiali e alle linee guida AgID, rafforzando la credibilità dello strumento verso il cliente. Il dominio non è gerarchico: un applicativo appartiene a un solo dominio, ma requisiti di domini diversi possono essere collegati tra loro.

**Fornitore** — l'azienda o il raggruppamento che realizza le applicazioni. Campi: nome. Può rappresentare anche un **RTI** (Raggruppamento Temporaneo di Imprese), non solo un singolo fornitore.

**Contratto** — l'arco temporale e amministrativo entro cui un'applicazione è affidata a un fornitore. Campi: nome o codice, fornitore (o RTI) di riferimento, data di inizio, data di fine (vuota se ancora attivo), uno o più **CIG**, uno o più **CUP**. CIG e CUP sono liste: un contratto può averne più di uno.

**Tipo di integrazione** — categoria di una relazione tecnica tra applicazioni (es. *editing documentale*, *protocollazione*). Campi: nome, colore. È una tassonomia estendibile dall'utente.

**Applicativo** — l'unità centrale, rappresentata come tessera nella vista a griglia e come nodo nella vista a mappa. Campi: nome, dominio di appartenenza, uno o più **contratti**. Un applicativo può vivere in più contratti contemporaneamente, perché può essere frammentato per dominio o per competenze (esempio: un contratto per la progettazione UI/UX e un altro per la realizzazione del front-end). Il fornitore di un applicativo non è un dato diretto: si deriva dall'insieme dei contratti collegati, e può quindi risultare più di uno. Un applicativo può inoltre essere articolato in **moduli** (vedi sotto).

**Modulo** — una parte funzionale distinta di un applicativo (esempio: il modulo gateway che espone i servizi di protocollazione di SibarDoc, o il modulo identity provider dello stesso applicativo). Campi: nome, applicativo di appartenenza. Un modulo appartiene sempre a **un solo applicativo**, ma le sue integrazioni possono puntare verso altri applicativi o loro moduli: è così che, per esempio, l'identity provider di SibarDoc resta un suo modulo pur essendo usato da molti altri applicativi che vi si integrano. La modularità è ciò che rende leggibile "chi parla con chi": senza di essa, il fatto che il gateway di un applicativo dialoghi con decine di sistemi mentre un altro suo modulo dialoghi con uno solo andrebbe perso, perché tutte le integrazioni risulterebbero appese all'applicativo intero.

Ogni applicativo possiede sempre un **livello di default coincidente con l'applicativo stesso**, che ospita i requisiti e le integrazioni non ancora attribuiti a un modulo specifico. I moduli sono opzionali e aggiuntivi: in fase di prima compilazione tutto può stare sul livello di default, e requisiti o integrazioni si possono **spostare** su un modulo in un secondo momento. In altre parole, un requisito o un'integrazione appartiene sempre a un applicativo, e opzionalmente a uno dei suoi moduli; quando il modulo non è indicato, resta sul livello di default dell'applicativo.

**Requisito** — una funzionalità o un bisogno afferente a un applicativo o a un suo modulo. Campi: applicativo di appartenenza, modulo di appartenenza (opzionale; se assente, il requisito sta sul livello di default dell'applicativo), nome o intento (descrittivo), stato (*presente*, *in sviluppo*, *backlog*), un identificativo esterno opzionale con il relativo sistema di provenienza, ed eventuali collegamenti ad altri requisiti che rappresentano lo stesso concetto. L'**identificativo esterno** serve a legare il requisito a un registro condiviso/ufficiale o a un backlog esterno (per esempio una chiave Jira), e il **sistema esterno** ne indica la fonte. Il collegamento tra requisiti equivalenti è **bidirezionale**: se A è collegato a B, anche B risulta collegato ad A, e da entrambi i lati compare l'avviso di sovrapposizione. Il requisito deve poter essere **spostato** dal livello di default a un modulo (e viceversa) in qualsiasi momento.

**Integrazione** — una relazione tecnica orientata tra due applicativi (o loro moduli), da un'origine a una destinazione. Campi: origine (un applicativo o un suo modulo), destinazione (un applicativo o un suo modulo), tipo, stato (*presente*, *in sviluppo*, *backlog*), descrizione testuale della relazione. Come per i requisiti, l'integrazione appartiene a un applicativo e opzionalmente a un suo modulo, e deve poter essere **spostata** sul modulo specifico in qualsiasi momento. Concettualmente un'integrazione è anch'essa un requisito, ma nel modello è tenuta come entità separata perché ha una direzione e collega due estremi; ha un proprio stato indipendente da quello dei requisiti.

## Comportamenti attesi

### Viste

Lo strumento offre due viste sullo stesso insieme di dati, alternabili in qualsiasi momento.

La **vista a griglia** mostra gli applicativi come tessere. Ogni tessera riporta il nome, il dominio con l'evidenza visiva del suo **ambito** (verticale/trasversale) e della sua **criticità** (badge "CORE" quando il dominio è core), il fornitore (derivato dai contratti), i contratti collegati, una sintesi visiva dello stato dei suoi requisiti e degli indicatori quando l'applicativo contiene requisiti condivisi o integrazioni. Aprendo una tessera si accede al dettaglio completo dell'applicativo.

La **vista a mappa** dispone gli applicativi come nodi di un grafo con posizionamento automatico, dove i nodi più connessi tendono a collocarsi al centro. Ogni nodo deve rendere evidente l'**ambito** e la **criticità core** del dominio dell'applicativo, con lo stesso badge/etichetta usato sulla tessera, così che il tipo si colga anche dalla mappa. Gli archi rappresentano due tipi di relazione, distinguibili a colpo d'occhio: le **integrazioni tecniche** (orientate, con una freccia, colorate secondo il tipo di integrazione) e le **sovrapposizioni di requisiti** (non orientate, con uno stile visivamente distinto da quello delle integrazioni). Su ogni arco di integrazione lo **stato** dev'essere reso evidente — ad esempio con un indicatore colorato lungo l'arco — così che si veda immediatamente se l'integrazione è presente, in sviluppo o in backlog. Selezionando un nodo, le connessioni di quel nodo vengono messe in risalto rispetto al resto e si apre il pannello di dettaglio dell'applicativo.

Nella prima vista d'insieme la mappa mostra gli applicativi, non i moduli, per non sovraccaricare il quadro. I **moduli compaiono in drill-down**: cliccando su un applicativo se ne aprono i moduli e si vedono le integrazioni di ciascun modulo verso gli applicativi (o i moduli) esterni. Questo livello di dettaglio è essenziale per capire "chi parla con chi": nell'esempio reale, il modulo gateway di SibarDoc espone servizi (come la protocollazione) ed è integrato con decine di sistemi, mentre il modulo workspace dello stesso applicativo è integrato solo con SAP — un'informazione che a livello di solo applicativo andrebbe persa. Gli archi di integrazione devono quindi poter agganciarsi al modulo specifico, non solo all'applicativo nel suo complesso.

### Viste di focus

Oltre alla navigazione generale, lo strumento deve offrire due modalità di focus su un singolo applicativo.

Il **focus sull'applicativo** è la scheda completa del singolo applicativo con tutti i suoi dettagli: moduli, requisiti, integrazioni, contratti e fornitori, dominio.

Il **focus sulle integrazioni** risponde alla domanda "questo applicativo (o un suo modulo specifico) con chi è integrato o connesso?": una vista che isola l'applicativo scelto e mostra tutte e sole le sue connessioni verso l'esterno, distinguendo quali partono dall'applicativo nel complesso e quali da un suo modulo particolare.

### Dettaglio dell'applicativo

Il pannello di dettaglio, comune alle due viste, mostra i contratti collegati e i fornitori derivati, i **moduli** dell'applicativo, l'elenco dei requisiti con il loro stato e l'eventuale identificativo esterno, l'elenco delle integrazioni in entrata e in uscita con tipo e stato, e per ogni requisito condiviso un rimando all'applicativo in cui il concetto è già presente. Requisiti e integrazioni sono mostrati raggruppati per collocazione (livello di default dell'applicativo, oppure il modulo di appartenenza). Dai rimandi si deve poter navigare direttamente all'applicativo collegato, che viene messo in evidenza all'arrivo.

Sia i requisiti sia le integrazioni devono essere **filtrabili per stato** e **ordinati per stato** con una precedenza fissa: prima i *presenti*, poi quelli *in lavorazione* (in sviluppo), infine quelli in *backlog*.

### Gestione dei dati (CRUD)

Tutte le entità devono essere creabili, **modificabili in qualsiasi momento** ed eliminabili dall'interfaccia, restando nel flusso di navigazione, senza pagine di amministrazione separate. In particolare:

- Nella creazione di un applicativo si indica il **dominio** (per nome, scelto o creato al volo) e uno o più contratti; deve essere possibile creare un nuovo dominio o un nuovo contratto al volo, senza interrompere l'operazione. Il tipo del dominio scelto (**ambito** verticale/trasversale e **criticità** core/non core) dev'essere reso evidente **visivamente sull'applicativo**, tramite un badge o un'etichetta colorata visibile sia sulla tessera nella vista a griglia sia sul nodo nella vista a mappa (per esempio un'etichetta "CORE" e una indicazione "Trasversale"/"Verticale"), così che la natura di governance del dominio si colga a colpo d'occhio senza aprire il dettaglio.
- Nella creazione di un contratto si inseriscono nome, fornitore/RTI, date, e le liste di CIG e CUP; deve essere possibile creare un nuovo fornitore al volo.
- Un applicativo deve poter avere **moduli**, creabili e modificabili; requisiti e integrazioni devono poter essere **spostati** dal livello di default dell'applicativo a un suo modulo (e viceversa) in qualsiasi momento.
- Nella creazione di un requisito si inseriscono nome, stato, eventuale identificativo esterno e sistema, l'eventuale modulo di appartenenza, ed eventualmente il collegamento a un requisito già esistente di un altro applicativo (è così che nasce la sovrapposizione).
- Nella creazione di un'integrazione si scelgono direzione, applicativo o modulo collegato, tipo (creabile al volo), stato ed eventuale modulo di origine.

**Ogni cancellazione, di qualsiasi entità, deve essere confermata** dall'utente prima di essere eseguita. Le logiche di eliminazione **non sono a cascata indiscriminata**: la rimozione di un'entità referenziata da altre non deve trascinare via silenziosamente ciò che vi dipende. Dove esistono dipendenze, lo strumento deve gestirle in modo esplicito e prevedibile — impedendo la cancellazione finché le dipendenze non sono state risolte, oppure scollegando i riferimenti senza distruggere le entità collegate — e comunque solo dopo conferma. Fa eccezione il legame di stretta proprietà: gli elementi che esistono solo come parte di un'entità (i requisiti e le integrazioni interni a un applicativo, i moduli di un applicativo) vengono rimossi insieme al loro contenitore, ma sempre previa conferma esplicita che chiarisca cosa verrà eliminato.

### Rilevamento delle sovrapposizioni e logica di dominio

Quando un requisito viene collegato a un altro, entrambi gli applicativi coinvolti mostrano l'avviso di sovrapposizione, e sulla mappa compare l'arco che li unisce. La logica operativa che lo strumento deve supportare: se due requisiti simili appartengono allo stesso dominio, quello esistente va arricchito o specializzato invece di essere ricostruito; se appartengono a domini diversi, possono coesistere in autonomia. Lo strumento evidenzia la sovrapposizione; la decisione su come risolverla resta agli attori (escalation a due livelli: prima i team coinvolti si confrontano direttamente, poi, se non trovano un accordo, il cliente indica dove posizionare il requisito).

### Esportazione

Lo strumento deve permettere di **esportare** i dati correnti in JSON, come backup del lavoro di popolamento e come base per un futuro export verso Backstage. In questa fase di POC non è prevista alcuna funzione di importazione: i dati si inseriscono direttamente dall'interfaccia. L'importazione da file (Excel/JSON) è rimandata a una fase successiva, quando ci sarà una massa di dati preesistenti da caricare.

## Requisiti non funzionali e vincoli tecnici

I seguenti punti sono vincolanti perché legati a scelte già prese o all'ambiente di deploy; il resto dell'implementazione è libero.

- **Persistenza**: i dati vivono in un database persistente, non nello storage del browser; sopravvivono a refresh, dispositivi e sessioni diverse.
- **Autenticazione**: accesso protetto tramite **social login Google**, ristretto agli account del dominio email `@aicof.it`. Chi non appartiene al dominio autorizzato non deve poter accedere.
- **Hosting**: deploy su **Vercel**, da repository **GitHub** (nome progetto: `mappa-applicativa`).
- **Compatibilità futura**: il modello dati deve poter essere esportato verso Backstage in un secondo momento; non è richiesta alcuna integrazione runtime con Backstage in questa fase.

## Fuori scope in questa fase (non-goal)

- Multi-utente con ruoli e permessi granulari per dominio o fornitore: l'accesso è ristretto per dominio email, ma non c'è differenziazione di ruoli.
- **Entità cliente e macro-aree**: le macro-aree della PA (PA Centrale, PA Locale, Sanità e Assistenza, Istruzione e Ricerca) non sono un attributo del dominio ma una caratteristica del **cliente**: un ente appartiene già per sua natura a una o più di queste aree, quindi classificarle sul dominio sarebbe ridondante. Andrebbero quindi modellate come attributo di un'entità cliente. In questa fase non esiste un'entità cliente nel modello (lo strumento è pensato per un singolo cliente alla volta) e non la si introduce, per semplicità; macro-aree ed entità cliente restano quindi fuori scope, da valutare solo se lo strumento dovesse un giorno servire più clienti.
- Sincronizzazione automatica o integrazione runtime con Backstage.
- Storico delle modifiche (chi ha cambiato cosa e quando): utile in una fase di uso condiviso, non necessario ora.
- Esportazione della mappa come immagine o documento stampabile: desiderabile in seguito per le presentazioni, non richiesto in questa fase.
- **Importazione da file** (Excel o JSON): rimandata a quando ci sarà una massa di dati preesistenti da caricare; nella POC i dati si inseriscono a mano dall'interfaccia.

## Materiali a corredo

**Dataset di seed dei domini (COFOG/Eurovoc)** — un file dati (`domini-seed-cofog-eurovoc.json`) fornisce un elenco precompilato di domini applicativi tipici della PA (gestione documentale, identità digitale, pagamenti, HR, contabilità, anagrafe, territorio, sanità) già caratterizzati per **ambito** (verticale / trasversale) e **criticità core** (sì/no), e agganciati al relativo **codice COFOG** e, dove disponibile, all'**URI Eurovoc**. Serve a popolare l'elenco precompilato da cui si sceglie la classificazione semantica di un dominio, così che lo strumento parta con una tassonomia coerente con le nomenclature ufficiali invece che vuota.

Due avvertenze sulla qualità del dato, importanti per l'uso: i **codici COFOG** sono verificati sulla classificazione ONU/Eurostat e possono essere usati direttamente; gli **URI Eurovoc** vanno invece confermati concetto per concetto sul portale ufficiale delle EU Vocabularies (il formato corretto è `http://eurovoc.europa.eu/{id}`, non un generico indirizzo europa.eu), e nel file quelli non ancora verificati sono lasciati vuoti con l'indicazione del termine da cercare. Il dataset è un punto di partenza modificabile, non un riferimento immutabile: i domini restano creabili e modificabili dall'utente.

## Registro delle modifiche

Questo registro elenca le modifiche significative alla specifica, in modo che chi realizza (Claude Code) possa allineare il codice esistente ai soli cambiamenti recenti, senza rileggere l'intero documento. La voce più recente è in cima.

**13 agosto 2026 (aggiornamento 2)**

- Il tipo di dominio è stato **sdoppiato in due attributi indipendenti**: **ambito** (verticale/trasversale) e **criticità core** (sì/no). Motivo: le due dimensioni sono ortogonali e tutte le combinazioni esistono (documentale = trasversale+core, contabilità = verticale+core, portale ferie self-service = trasversale+non core, gestionale di un ufficio = verticale+non core). Il seed COFOG/Eurovoc è stato aggiornato di conseguenza.
- In fase di creazione dell'applicativo si indica il **dominio** (per nome); l'**ambito** e la **criticità core** del dominio devono essere resi **evidenti visivamente sull'applicativo**, con un badge/etichetta colorata (es. "CORE", "Trasversale"/"Verticale") sia sulla tessera della griglia sia sul nodo della mappa.

**13 agosto 2026 (aggiornamento)**

- Aggiunto il **dataset di seed dei domini** con allineamento COFOG/Eurovoc (`domini-seed-cofog-eurovoc.json`), da usare per popolare l'elenco precompilato della classificazione semantica dei domini. Codici COFOG verificati sulla classificazione ONU/Eurostat; URI Eurovoc da confermare sul portale ufficiale.

**13 agosto 2026**

- Introdotta l'entità **Modulo**: un applicativo può articolarsi in più moduli, ciascuno appartenente a un solo applicativo; requisiti e integrazioni appartengono all'applicativo o a un suo modulo, con un livello di default coincidente con l'applicativo per ciò che non è ancora modularizzato; devono poter essere spostati sul modulo in qualsiasi momento. Le integrazioni di un modulo possono puntare verso applicativi o moduli esterni.
- Nella vista a mappa i **moduli compaiono in drill-down** sull'applicativo, non nella prima vista d'insieme, per rendere leggibile quali moduli dialogano con quali sistemi esterni.
- Aggiunte due **viste di focus**: sul singolo applicativo (scheda completa) e sulle sue integrazioni (con chi è connesso l'applicativo o un suo modulo).
- La classificazione semantica del dominio va scelta da un **elenco precompilato** basato sulle ontologie COFOG e/o Eurovoc, non inserita come testo libero; verticale/trasversale resta una caratterizzazione a parte.
- Tutte le entità devono essere **modificabili in qualsiasi momento**.
- Ogni **cancellazione va confermata**; le logiche di eliminazione sono **non a cascata indiscriminata** (gestione esplicita delle dipendenze, con l'unica eccezione degli elementi di stretta proprietà, comunque previa conferma).
- Requisiti e integrazioni devono essere **filtrabili e ordinati per stato**, con precedenza fissa: presenti, poi in lavorazione, poi backlog.

**Versione iniziale**

- Prima stesura consolidata e autosufficiente: contesto, principi di modellazione, modello dati (dominio, fornitore, contratto, tipo di integrazione, applicativo, requisito, integrazione), comportamenti attesi, vincoli tecnici e non-goal.