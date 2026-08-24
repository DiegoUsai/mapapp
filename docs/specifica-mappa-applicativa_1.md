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

Il modello dati è allineato alle astrazioni del **C4 model** ([c4model.com](https://c4model.com/)): l'Applicativo corrisponde al *Software System*, il Modulo al *Container*, l'Integrazione alla *Relationship*. Il Dominio non è un livello gerarchico del C4 (che non lo prevede come concetto formale): è un raggruppamento funzionale di Applicativi — una lente di classificazione trasversale coerente con la tassonomia PA — e corrisponde al concetto di *Domain* nativo di Backstage. Il *System Landscape* del C4 — la vista di tutti i sistemi in un'organizzazione — corrisponde alla **vista radice della mappa senza filtri applicati**, non a un'entità del modello dati.

## Modello dati

Le entità e le loro relazioni. I campi elencati sono quelli funzionalmente necessari; identificativi tecnici e metadati (date di creazione e simili) sono lasciati all'implementazione.

**Dominio** — rappresenta un'area applicativa. Campi: nome, colore (usato per distinguere i nodi nella mappa), **ambito** (verticale o trasversale), **criticità core** (sì/no), e un riferimento semantico agli standard di classificazione della PA italiana ed europea. L'ambito e la criticità sono due attributi **indipendenti**, non un unico valore: l'ambito dice quanto un dominio è condiviso (**verticale** = specifico di un ambito funzionale; **trasversale** = usato da più ambiti), la criticità dice quanto è fondante (**core** = pilastro senza cui l'ecosistema non opera). Sono indipendenti perché tutte le combinazioni esistono davvero: la gestione documentale è trasversale e core; la contabilità è verticale ma core (un ente non opera senza); un portale self-service per le ferie è trasversale ma non core (impatta tutti i dipendenti, ma la sua indisponibilità non ferma i procedimenti); un gestionale di un singolo ufficio è verticale e non core. Il riferimento semantico non è un testo libero: va scelto da un **elenco precompilato** costruito sulle ontologie ufficiali — i codici **COFOG** (Classification of the Functions of Government) e/o gli **URI Eurovoc** — così che ogni dominio sia agganciato a una voce standard e non a una descrizione arbitraria. Questo allinea i domini alle nomenclature ufficiali e alle linee guida AgID, rafforzando la credibilità dello strumento verso il cliente. Il dominio non è gerarchico: un applicativo appartiene a un solo dominio, ma requisiti di domini diversi possono essere collegati tra loro.

**Fornitore** — l'azienda o il raggruppamento che realizza le applicazioni. Campi: nome. Può rappresentare anche un **RTI** (Raggruppamento Temporaneo di Imprese), non solo un singolo fornitore.

**Contratto** — l'arco temporale e amministrativo entro cui un'applicazione è affidata a un fornitore. Campi: nome o codice, fornitore (o RTI) di riferimento, data di inizio, data di fine (vuota se ancora attivo), uno o più **CIG**, uno o più **CUP**. CIG e CUP sono liste: un contratto può averne più di uno.

**Tipo di integrazione** — categoria di una relazione tecnica tra applicazioni (es. *editing documentale*, *protocollazione*). Campi: nome, colore. È una tassonomia estendibile dall'utente.

**Applicativo** — l'unità centrale, rappresentata come tessera nella vista a griglia e come nodo nella vista a mappa. Campi: nome, dominio di appartenenza, **`scope`**, uno o più **contratti**, e uno **slug**.

Lo **`scope`** classifica la natura dell'applicativo rispetto alla Regione:

- `interno` — sviluppato o gestito dalla Regione o da un suo fornitore diretto tramite contratto (es. SibarDoc, SUPAE)
- `nazionale` — sistema della PA nazionale con cui la Regione si integra ma che non gestisce direttamente (es. PagoPA, ANPR, SPID, NoiPA)
- `privato` — SaaS o sistema di terze parti non PA, con contratto commerciale diretto (es. Microsoft 365, Zimbra)

La tabella seguente descrive la compilabilità degli attributi in base allo `scope`:

| Attributo | `interno` | `nazionale` | `privato` |
|---|---|---|---|
| **Fornitore** | obbligatorio | non applicabile | obbligatorio |
| **Contratto** | obbligatorio | non applicabile | obbligatorio |
| **Moduli** | obbligatori e navigabili | opzionali | opzionali |
| **Requisiti** | obbligatori e navigabili | non applicabili | opzionali |
| **Integrazioni** | sempre presenti | sempre presenti | sempre presenti |
| **Dominio** | obbligatorio | obbligatorio | obbligatorio |

Per i sistemi `nazionale`, Fornitore e Contratto sono **non applicabili** — non sono campi vuoti per dimenticanza, ma attributi privi di significato per quella categoria: sistemi come PagoPA non hanno un contratto con la Regione né un fornitore gestibile dalla Regione stessa. Ciò che interessa mappare è esclusivamente come i sistemi regionali vi si connettono, informazione che risiede nelle Integrazioni. I **Moduli** sono opzionali per `nazionale` e `privato` perché la Regione può conoscerne la struttura interna con sufficiente granularità da volerla rappresentare (es. distinguere il modulo notifiche di PagoPA dal modulo pagamenti), mantenendo così la granularità nelle integrazioni **modulo→modulo** anche verso sistemi esterni. I **Requisiti** sono opzionali per `privato` perché possono esistere requisiti di configurazione o personalizzazione contrattuale anche su sistemi SaaS. Le **Integrazioni** sono sempre presenti su tutti gli scope: il valore informativo per la Regione sta esattamente nel *come ci si connette*, indipendentemente da chi possiede il sistema.

Un applicativo può vivere in più contratti contemporaneamente, perché può essere frammentato per dominio o per competenze (esempio: un contratto per la progettazione UI/UX e un altro per la realizzazione del front-end). Il fornitore di un applicativo non è un dato diretto: si deriva dall'insieme dei contratti collegati, e può quindi risultare più di uno.

Lo **slug** è un identificatore tecnico stabile, generato automaticamente al momento della creazione a partire dal nome (es. `sibar-documentale`), composto da caratteri alfanumerici minuscoli e trattini. È modificabile solo in fase di creazione; dopo il salvataggio diventa immutabile e non è esposto nei form di modifica. È visibile nella pagina di dettaglio come campo in sola lettura con pulsante "copia". Serve per l'integrazione con sistemi esterni come Backstage.

Un applicativo può inoltre essere articolato in **moduli** (vedi sotto).

**Modulo** — una parte funzionale distinta di un applicativo (esempio: il modulo gateway che espone i servizi di protocollazione di SibarDoc, o il modulo identity provider dello stesso applicativo). Campi: nome, descrizione, applicativo di appartenenza, e uno **slug** — identificatore tecnico stabile generato alla creazione, non modificabile tramite UI dopo il salvataggio, necessario per il riferimento univoco nelle integrazioni con sistemi esterni. Un modulo appartiene sempre a **un solo applicativo**, ma le sue integrazioni possono puntare verso altri applicativi o loro moduli: è così che, per esempio, l'identity provider di SibarDoc resta un suo modulo pur essendo usato da molti altri applicativi che vi si integrano. La modularità è ciò che rende leggibile "chi parla con chi": senza di essa, il fatto che il gateway di un applicativo dialoghi con decine di sistemi mentre un altro suo modulo dialoghi con uno solo andrebbe perso, perché tutte le integrazioni risulterebbero appese all'applicativo intero.

Ogni applicativo possiede sempre un **livello di default coincidente con l'applicativo stesso**, che ospita i requisiti e le integrazioni non ancora attribuiti a un modulo specifico. I moduli sono opzionali e aggiuntivi: in fase di prima compilazione tutto può stare sul livello di default, e requisiti o integrazioni si possono **spostare** su un modulo in un secondo momento. In altre parole, un requisito o un'integrazione appartiene sempre a un applicativo, e opzionalmente a uno dei suoi moduli; quando il modulo non è indicato, resta sul livello di default dell'applicativo.

**Requisito** — una funzionalità o un bisogno afferente a un applicativo o a un suo modulo. Campi: applicativo di appartenenza, modulo di appartenenza (opzionale; se assente, il requisito sta sul livello di default dell'applicativo), nome o intento (descrittivo), stato (*presente*, *in sviluppo*, *backlog*), un identificativo esterno opzionale con il relativo sistema di provenienza, ed eventuali collegamenti ad altri requisiti che rappresentano lo stesso concetto. Nelle viste di dettaglio, il requisito va mostrato con il suo **tipo** (lo stato: presente/in sviluppo/backlog) e la sua **descrizione** (il nome/intento) affiancati, cioè i due campi già esistenti presentati insieme — non sono campi aggiuntivi rispetto a quelli qui elencati. L'**identificativo esterno** serve a legare il requisito a un registro condiviso/ufficiale o a un backlog esterno (per esempio una chiave Jira), e il **sistema esterno** ne indica la fonte. Il collegamento tra requisiti equivalenti è **bidirezionale**: se A è collegato a B, anche B risulta collegato ad A, e da entrambi i lati compare l'avviso di sovrapposizione. Il requisito deve poter essere **spostato** dal livello di default a un modulo (e viceversa) in qualsiasi momento.

**Integrazione** — una relazione tecnica orientata tra due estremi, da un'origine a una destinazione. Ciascun estremo può essere un **applicativo** oppure un suo **modulo specifico**, in modo indipendente dall'altro: sono quindi ammesse tutte le combinazioni, incluse le connessioni **modulo→modulo** (un modulo di un applicativo integrato direttamente con il modulo di un altro). Campi: origine (applicativo o suo modulo), destinazione (applicativo o suo modulo), tipo, stato (*presente*, *in sviluppo*, *backlog* — lo stesso insieme di valori del requisito), descrizione testuale della relazione. Come per i requisiti, l'integrazione appartiene a un applicativo e opzionalmente a un suo modulo, e deve poter essere **spostata** sul modulo specifico in qualsiasi momento. Concettualmente un'integrazione è anch'essa un requisito, ma nel modello è tenuta come entità separata perché ha una direzione e collega due estremi; ha un proprio stato indipendente da quello dei requisiti.

Alla creazione di un'integrazione, lo strumento deve poter **generare anche un requisito corrispondente**, agganciato all'**origine** dell'integrazione (stesso applicativo o modulo di origine), con nome/intento e stato coerenti con quelli dell'integrazione. Questa generazione è **attiva di default**: la creazione di un'integrazione produce quindi normalmente sia l'integrazione sia il requisito collegato, salvo che l'utente disattivi esplicitamente l'opzione per quella specifica creazione.

## Comportamenti attesi

### Viste

Lo strumento offre due viste sullo stesso insieme di dati, alternabili in qualsiasi momento.

La **vista a griglia** mostra gli applicativi come tessere. Ogni tessera riporta il nome, il dominio con l'evidenza visiva del suo **ambito** (verticale/trasversale) e della sua **criticità** (badge "CORE" quando il dominio è core), il fornitore (derivato dai contratti), i contratti collegati, una sintesi visiva dello stato dei suoi requisiti e degli indicatori quando l'applicativo contiene requisiti condivisi o integrazioni. Sulla tessera è visibile anche il badge **`scope`** dell'applicativo (`interno` / `nazionale` / `privato`), con colore o stile distinto per tipo, utilizzabile come filtro nella barra sopra la vista. Aprendo una tessera si accede al dettaglio completo dell'applicativo.

Sopra le viste sono disponibili filtri e una ricerca testuale. I filtri per dominio, fornitore e contratto devono elencare **solo i valori effettivamente in uso** — per esempio, tra i domini vanno mostrati unicamente quelli associati ad almeno un applicativo, non l'intero elenco dei domini censiti — così da non affollare l'interfaccia con opzioni che non filtrerebbero nulla. La **ricerca e i filtri devono coprire qualsiasi entità**, non solo l'applicativo: digitando un testo si devono trovare anche moduli, requisiti, integrazioni, fornitori, contratti e domini che vi corrispondono, con un rimando che porti all'applicativo (e, se pertinente, al modulo) a cui appartengono.

La **vista a mappa** dispone gli applicativi come nodi di un grafo con posizionamento automatico, dove i nodi più connessi tendono a collocarsi al centro. Il layout deve **minimizzare per quanto possibile gli incroci tra archi**: non è un vincolo assoluto (grafi molto connessi possono non essere disegnabili senza alcun incrocio), ma un obiettivo di leggibilità da perseguire con l'algoritmo di posizionamento e, dove utile, con archi curvi che aggirano i nodi. Ogni nodo deve rendere evidente l'**ambito** e la **criticità core** del dominio dell'applicativo, con lo stesso badge/etichetta usato sulla tessera, così che il tipo si colga anche dalla mappa. I nodi con `scope = nazionale` o `scope = privato` sono visivamente distinguibili dagli applicativi interni — ad esempio tramite bordo tratteggiato o colore del nodo dedicato — per comunicare immediatamente che si tratta di sistemi non governati direttamente dalla Regione. Gli archi rappresentano due tipi di relazione, distinguibili a colpo d'occhio: le **integrazioni tecniche** (orientate, colorate secondo il tipo di integrazione) e le **sovrapposizioni di requisiti** (non orientate, con uno stile visivamente distinto da quello delle integrazioni). Gli archi di integrazione devono comunicare la **direzionalità** (da chi verso chi) tramite un'**animazione di scorrimento** lungo l'arco — ad esempio un gradiente o un tratteggio che si muove nel verso dell'integrazione — così che il flusso sia leggibile anche quando gli archi sono numerosi. Su ogni arco di integrazione lo **stato** dev'essere reso evidente — ad esempio con un indicatore colorato lungo l'arco — così che si veda immediatamente se l'integrazione è presente, in sviluppo o in backlog. Selezionando un nodo, le connessioni di quel nodo vengono messe in risalto rispetto al resto e si apre il pannello di dettaglio dell'applicativo.

Nella prima vista d'insieme la mappa mostra gli applicativi, non i moduli, per non sovraccaricare il quadro. I **moduli compaiono in drill-down**: cliccando su un applicativo, la mappa cambia scena per dedicarsi al dettaglio di quell'applicativo. In questa modalità di dettaglio:

- L'applicativo selezionato diventa un **contenitore visivo** che racchiude i suoi moduli: i moduli appaiono dentro un'area/raggruppamento che rappresenta l'app, così che sia sempre chiaro che quei moduli appartengono a quell'applicativo e non fluttuino come nodi indipendenti.
- Si vedono le **integrazioni dei singoli moduli** verso l'esterno: ogni arco parte dal modulo specifico (non genericamente dall'app) e raggiunge l'applicativo — o il modulo — con cui è integrato. È questo che rende leggibile "chi parla con chi" a livello di modulo.
- Restano visibili **solo le applicazioni effettivamente collegate** all'applicativo in drill-down (le destinazioni delle sue integrazioni e di quelle dei suoi moduli); le applicazioni non collegate **scompaiono**, per liberare spazio alla navigazione di dettaglio.

Questo livello è essenziale per capire "chi parla con chi": nell'esempio reale, il modulo gateway di SibarDoc espone servizi (come la protocollazione) ed è integrato con decine di sistemi, mentre il modulo workspace dello stesso applicativo è integrato solo con SAP — un'informazione che a livello di solo applicativo, o con i moduli slegati dall'app, andrebbe persa. Uscendo dal drill-down si torna alla vista d'insieme degli applicativi.

### Viste di focus

Oltre alla navigazione generale, lo strumento deve offrire due modalità di focus su un singolo applicativo.

Il **focus sull'applicativo** è la scheda completa del singolo applicativo con tutti i suoi dettagli: moduli, requisiti, integrazioni, contratti e fornitori, dominio.

Il **focus sulle integrazioni** risponde alla domanda "questo applicativo (o un suo modulo specifico) con chi è integrato o connesso?": una vista che isola l'applicativo scelto e mostra tutte e sole le sue connessioni verso l'esterno, distinguendo quali partono dall'applicativo nel complesso e quali da un suo modulo particolare.

### Dettaglio dell'applicativo

Il pannello di dettaglio, comune alle due viste, mostra i contratti collegati e i fornitori derivati, i **moduli** dell'applicativo, l'elenco dei requisiti con il loro stato e l'eventuale identificativo esterno, l'elenco delle integrazioni in entrata e in uscita con tipo e stato, e per ogni requisito condiviso un rimando all'applicativo in cui il concetto è già presente. Requisiti e integrazioni sono mostrati raggruppati per collocazione (livello di default dell'applicativo, oppure il modulo di appartenenza). Dai rimandi si deve poter navigare direttamente all'applicativo collegato, che viene messo in evidenza all'arrivo.

Sia i requisiti sia le integrazioni devono essere **filtrabili per stato** e **ordinati per stato** con una precedenza fissa: prima i *presenti*, poi quelli *in lavorazione* (in sviluppo), infine quelli in *backlog*.

Un'integrazione si **affaccia nel riepilogo del livello a cui è agganciato ciascuno dei suoi due estremi**, in modo indipendente per i due estremi. Se un estremo è l'applicativo nel suo complesso (nessun modulo indicato), l'integrazione compare nel riepilogo di quell'applicativo; se l'estremo è un modulo, compare nel riepilogo di quel modulo. Ne conseguono i tre casi tipici: un'integrazione applicativo1 → applicativo2 compare nel riepilogo di entrambi gli applicativi; un'integrazione applicativo1 → modulo1-di-applicativo2 compare nel riepilogo di applicativo1 e nel riepilogo di modulo1; un'integrazione modulo1-di-applicativo1 → modulo1-di-applicativo2 compare nel riepilogo del rispettivo modulo su ciascun lato, non nel riepilogo generale dei due applicativi. In sintesi, ogni estremo dell'integrazione si mostra esattamente dove "vive": sull'applicativo se agganciato all'applicativo, sul modulo se agganciato al modulo.

### Gestione dei dati (CRUD)

Tutte le entità devono essere creabili, **modificabili in qualsiasi momento** ed eliminabili dall'interfaccia. Ogni entità deve avere un punto in cui vederne gli attributi e modificarli o cancellarli, ma la forma di quel punto dipende dalla **densità informativa** dell'entità:

- **Pagina di dettaglio dedicata**, per le entità con molte informazioni, form articolati o relazioni multiple da mostrare: **Applicativo** (dominio, contratti, moduli, requisiti, integrazioni), **Modulo** (ha propri requisiti e integrazioni), **Contratto** (CIG e CUP come liste, più applicativi collegati).
- **Modale o pannello inline**, per le entità con form semplici e poche relazioni, senza uscire dal flusso di navigazione: **Fornitore**, **Dominio**, **Tipo di integrazione**, **Requisito**, **Integrazione**.

La modificabilità vale per **tutte** le entità senza eccezioni, applicativo compreso: dev'essere possibile aggiornare da front-end nome, dominio, contratti collegati e moduli di un applicativo già creato, non solo crearlo. In particolare:

- Nella creazione di un applicativo si indica il **dominio** (per nome, scelto o creato al volo), lo **`scope`** (`interno`, `nazionale`, `privato`) e uno o più contratti (solo se `scope` lo prevede). Deve essere possibile creare un nuovo dominio o un nuovo contratto al volo, senza interrompere l'operazione. Aprire la creazione di un contratto (o di un dominio) **non deve chiudere né scartare la maschera dell'applicativo in corso di compilazione**: la creazione dell'entità collegata si apre sopra, e al ritorno la maschera dell'applicativo dev'essere ancora presente con i dati già inseriti (nome, dominio) e con la nuova entità appena creata già disponibile e preferibilmente preselezionata. Il tipo del dominio scelto (**ambito** verticale/trasversale e **criticità** core/non core) dev'essere reso evidente **visivamente sull'applicativo**, tramite un badge o un'etichetta colorata visibile sia sulla tessera nella vista a griglia sia sul nodo nella vista a mappa (per esempio un'etichetta "CORE" e una indicazione "Trasversale"/"Verticale"), così che la natura di governance del dominio si colga a colpo d'occhio senza aprire il dettaglio. In base al valore di `scope` selezionato, il form mostra o nasconde dinamicamente i campi Fornitore, Contratto e Requisiti: per `scope = nazionale` questi campi non compaiono (non sono vuoti, sono assenti); per `scope = privato` il campo Requisiti compare ma non è obbligatorio. Lo `scope` è modificabile dopo la creazione, con avviso esplicito sulle conseguenze (es. la rimozione dei contratti collegati se si passa da `interno` a `nazionale`). Lo **slug** viene generato automaticamente dal sistema a partire dal nome inserito e mostrato in anteprima nel form prima del salvataggio; è modificabile solo in fase di creazione, dopo il quale diventa immutabile.
- Nella creazione di un contratto si inseriscono nome, fornitore/RTI, date, e le liste di CIG e CUP; deve essere possibile creare un nuovo fornitore al volo. Un contratto già creato dev'essere **modificabile in qualsiasi momento** (nome, fornitore, date, CIG, CUP), non solo al momento della creazione.
- L'**associazione tra applicativo e contratti dev'essere editabile dopo la creazione**, in modo che si possa collegare un contratto già esistente a un applicativo già esistente (e scollegarlo), senza doverli ricreare. Poiché il legame è molti-a-molti, dev'essere gestibile da entrambi i lati: modificando l'applicativo si aggiungono o rimuovono i suoi contratti, e un contratto può essere associato a più applicativi.
- Un applicativo deve poter avere **moduli**, creabili e modificabili; requisiti e integrazioni devono poter essere **spostati** dal livello di default dell'applicativo a un suo modulo (e viceversa) in qualsiasi momento.
- Nella creazione di un requisito si inseriscono nome, stato, eventuale identificativo esterno e sistema, l'eventuale modulo di appartenenza, ed eventualmente il collegamento a un requisito già esistente di un altro applicativo (è così che nasce la sovrapposizione).
- Nella creazione di un'integrazione si scelgono la direzione e i due estremi. Per **ciascuno dei due estremi**, in modo indipendente, si seleziona **prima l'applicativo e poi, opzionalmente, uno dei suoi moduli**: la scelta del modulo non è obbligatoria (se omessa, l'estremo è l'applicativo nel suo complesso). Devono essere possibili **tutte** le combinazioni: applicativo→applicativo, applicativo→modulo, modulo→applicativo e in particolare **modulo→modulo**, cioè un modulo di un applicativo che si integra direttamente con il modulo di un altro applicativo (per esempio il modulo gateway di SibarDoc che dialoga con il modulo di autenticazione di un altro sistema). La possibilità di collegare due moduli tra loro è un requisito esplicito, non un caso limite. Si scelgono inoltre il tipo (creabile al volo) e lo stato dell'integrazione. Un'opzione, **attiva di default**, permette di generare contestualmente anche il requisito collegato (agganciato all'origine); l'utente può disattivarla per quella singola creazione se non la vuole.

**Ogni cancellazione, di qualsiasi entità, deve essere confermata** dall'utente prima di essere eseguita, e deve **garantire l'integrità referenziale del dato**: la rimozione di un'entità referenziata da altre non deve trascinare via silenziosamente ciò che vi dipende, né lasciare riferimenti orfani. Dove esistono dipendenze, lo strumento deve gestirle in modo esplicito e prevedibile — impedendo la cancellazione finché le dipendenze non sono state risolte, oppure scollegando i riferimenti senza distruggere le entità collegate — e comunque solo dopo conferma. Fa eccezione il legame di stretta proprietà: gli elementi che esistono solo come parte di un'entità (i requisiti e le integrazioni interni a un applicativo, i moduli di un applicativo) vengono rimossi insieme al loro contenitore, ma sempre previa conferma esplicita che chiarisca cosa verrà eliminato.

### Rilevamento delle sovrapposizioni e logica di dominio

Quando un requisito viene collegato a un altro, entrambi gli applicativi coinvolti mostrano l'avviso di sovrapposizione, e sulla mappa compare l'arco che li unisce. La logica operativa che lo strumento deve supportare: se due requisiti simili appartengono allo stesso dominio, quello esistente va arricchito o specializzato invece di essere ricostruito; se appartengono a domini diversi, possono coesistere in autonomia. Lo strumento evidenzia la sovrapposizione; la decisione su come risolverla resta agli attori (escalation a due livelli: prima i team coinvolti si confrontano direttamente, poi, se non trovano un accordo, il cliente indica dove posizionare il requisito).

### Esportazione

Lo strumento deve permettere di **esportare** i dati correnti in JSON, come backup del lavoro di popolamento.

È inoltre prevista una funzionalità di **export verso Backstage** ([backstage.io](https://backstage.io)), il software catalog open source che produce file YAML conformi al formato *Backstage Catalog Descriptor*. Il flusso è unidirezionale: la mappa applicativa è il **system of record** e Backstage è un consumer in sola lettura — Backstage non scrive mai sulla mappa.

**Regole di filtro per l'export verso Backstage:**

- Vengono esportati solo gli **Applicativi con `scope = interno`**; i sistemi `nazionale` e `privato` restano esclusivamente nella mappa come contesto di governance e non hanno significato nel catalogo tecnico interno.
- Vengono esportati i **Moduli** degli applicativi inclusi nell'export.
- Vengono esportati i **Domini** (Backstage ha nativamente questo concetto con identico significato).
- Vengono esportati i **Fornitori** associati ad almeno un applicativo incluso nell'export.
- Vengono esportate le **Integrazioni** tra applicativi `interno`, se esprimono un'interfaccia formale definita.

**Mapping delle entità verso Backstage:**

| Nostra entità | Entità Backstage |
|---|---|
| **Applicativo** (`interno`) | `System` |
| **Modulo** (di applicativo `interno`) | `Component` |
| **Dominio** | `Domain` |
| **Fornitore** | `Group` (tipo `vendor`) |
| **Integrazione** (tra `interno`) | `API` + relazione |

Ogni entità esportata è identificata dal proprio **slug** nel formato `kind/namespace/name` atteso da Backstage (es. `system:regione-sardegna/sibar-documentale`).

**Modalità di export nella UI:** l'export è accessibile dalla pagina di dettaglio del singolo Applicativo (export del sistema e dei suoi moduli) e da una sezione dedicata "Esportazioni" per l'export completo di tutti gli applicativi `interno`. L'export produce un archivio `.zip` contenente i file YAML pronti per essere caricati nel catalogo Backstage.

In questa fase di POC non è prevista alcuna funzione di importazione né di sincronizzazione automatica con Backstage: i dati si inseriscono direttamente dall'interfaccia e l'export è manuale su richiesta. L'importazione da file (Excel/JSON) è rimandata a una fase successiva, quando ci sarà una massa di dati preesistenti da caricare.

## Requisiti non funzionali e vincoli tecnici

I seguenti punti sono vincolanti perché legati a scelte già prese o all'ambiente di deploy; il resto dell'implementazione è libero.

- **Persistenza**: i dati vivono in un database persistente, non nello storage del browser; sopravvivono a refresh, dispositivi e sessioni diverse.
- **Autenticazione**: accesso protetto tramite **social login Google**, ristretto agli account del dominio email `@aicof.it`. Chi non appartiene al dominio autorizzato non deve poter accedere.
- **Hosting**: deploy su **Vercel**, da repository **GitHub** (nome progetto: `mappa-applicativa`).
- **Integrazione con Backstage**: il modello dati è allineato al formato *Backstage Catalog Descriptor* e supporta l'export manuale verso Backstage tramite file YAML (vedi sezione Esportazione). Il flusso è unidirezionale — mappa → Backstage — e l'export è manuale su richiesta. La sincronizzazione automatica (webhook, polling) è fuori scope per il POC.

## Fuori scope in questa fase (non-goal)

- Multi-utente con ruoli e permessi granulari per dominio o fornitore: l'accesso è ristretto per dominio email, ma non c'è differenziazione di ruoli.
- **Entità cliente e macro-aree**: le macro-aree della PA (PA Centrale, PA Locale, Sanità e Assistenza, Istruzione e Ricerca) non sono un attributo del dominio ma una caratteristica del **cliente**: un ente appartiene già per sua natura a una o più di queste aree, quindi classificarle sul dominio sarebbe ridondante. Andrebbero quindi modellate come attributo di un'entità cliente. In questa fase non esiste un'entità cliente nel modello (lo strumento è pensato per un singolo cliente alla volta) e non la si introduce, per semplicità; macro-aree ed entità cliente restano quindi fuori scope, da valutare solo se lo strumento dovesse un giorno servire più clienti.
- **Sincronizzazione automatica con Backstage**: l'export verso Backstage è manuale su richiesta (vedi sezione Esportazione); webhook, polling e sincronizzazione continua sono rimandati a una fase successiva.
- Storico delle modifiche (chi ha cambiato cosa e quando): utile in una fase di uso condiviso, non necessario ora.
- Esportazione della mappa come immagine o documento stampabile: desiderabile in seguito per le presentazioni, non richiesto in questa fase.
- **Importazione da file** (Excel o JSON): rimandata a quando ci sarà una massa di dati preesistenti da caricare; nella POC i dati si inseriscono a mano dall'interfaccia.

## Materiali a corredo

**Dataset di seed dei domini (COFOG/Eurovoc)** — un file dati (`domini-seed-cofog-eurovoc.json`) fornisce un elenco precompilato di domini applicativi tipici della PA (gestione documentale, identità digitale, pagamenti, HR, contabilità, anagrafe, territorio, sanità) già caratterizzati per **ambito** (verticale / trasversale) e **criticità core** (sì/no), e agganciati al relativo **codice COFOG** e, dove disponibile, all'**URI Eurovoc**. Serve a popolare l'elenco precompilato da cui si sceglie la classificazione semantica di un dominio, così che lo strumento parta con una tassonomia coerente con le nomenclature ufficiali invece che vuota.

Due avvertenze sulla qualità del dato, importanti per l'uso: i **codici COFOG** sono verificati sulla classificazione ONU/Eurostat e possono essere usati direttamente; gli **URI Eurovoc** vanno invece confermati concetto per concetto sul portale ufficiale delle EU Vocabularies (il formato corretto è `http://eurovoc.europa.eu/{id}`, non un generico indirizzo europa.eu), e nel file quelli non ancora verificati sono lasciati vuoti con l'indicazione del termine da cercare. Il dataset è un punto di partenza modificabile, non un riferimento immutabile: i domini restano creabili e modificabili dall'utente.

## Registro delle modifiche

Questo registro elenca le modifiche significative alla specifica, in modo che chi realizza (Claude Code) possa allineare il codice esistente ai soli cambiamenti recenti, senza rileggere l'intero documento. La voce più recente è in cima.

**21 agosto 2026 — Allineamento C4 model, attributo `scope`, slug e integrazione Backstage**

- **[MODELLO DATI — Principi]** Documentato l'allineamento con il C4 model ([c4model.com](https://c4model.com/)): Applicativo = *Software System*, Modulo = *Container*, Integrazione = *Relationship*, Dominio = *Domain* (concetto nativo di Backstage). La vista radice senza filtri corrisponde al *System Landscape* del C4 — non è un'entità del modello dati.
- **[MODELLO DATI — Applicativo]** Introdotto l'attributo **`scope`** con valori `interno | nazionale | privato`. Lo scope determina la compilabilità degli altri attributi: Fornitore e Contratto sono non applicabili per `scope = nazionale`; Moduli e Requisiti sono opzionali per `scope = nazionale` e `privato`; le Integrazioni sono sempre presenti su tutti gli scope. Per i sistemi nazionali (es. PagoPA) la Regione non ha contratto né fornitore gestibile; il dato rilevante è come i sistemi regionali vi si connettono, informazione che risiede nelle Integrazioni.
- **[MODELLO DATI — Applicativo e Modulo]** Introdotto il campo **`slug`**: identificatore tecnico stabile generato alla creazione a partire dal nome (alfanumerico minuscolo, trattini), modificabile solo al momento della creazione, immutabile dopo il salvataggio, visibile in sola lettura nella pagina di dettaglio. Necessario per l'integrazione con Backstage e con sistemi esterni.
- **[INTEGRAZIONE — Backstage]** Definita la funzionalità di export verso Backstage: flusso unidirezionale mappa → Backstage, solo entità con `scope = interno`, mapping delle entità sul formato *Backstage Catalog Descriptor* (YAML), identificazione tramite slug. Export manuale su richiesta dalla pagina di dettaglio Applicativo e da sezione "Esportazioni". La sincronizzazione automatica rimane fuori scope per il POC.
- **[UI — vista a griglia]** Il badge `scope` è visibile sulla tessera di ogni Applicativo e utilizzabile come filtro.
- **[UI — vista a mappa]** I nodi con `scope = nazionale` e `scope = privato` sono visivamente distinti dagli applicativi interni (es. bordo tratteggiato o colore dedicato).
- **[UI — form creazione Applicativo]** Il form mostra e nasconde dinamicamente i campi Fornitore, Contratto e Requisiti in base al valore di `scope` selezionato. Lo slug è generato in tempo reale e mostrato in anteprima prima del salvataggio.

**13 agosto 2026 (aggiornamento 6 — ridefinizione strutturata)**

- Recepita una ridefinizione sistematica delle entità, relazioni e comportamenti da parte di Diego. Modifiche integrate:
  - **Architettura di interazione**: chiarito il criterio pagina dedicata vs modale in base alla densità informativa. Pagina dedicata per **Applicativo**, **Modulo**, **Contratto**; modale/pannello inline per **Fornitore**, **Dominio**, **Tipo di integrazione**, **Requisito**, **Integrazione**. Sostituisce la precedente indicazione generica "senza pagine di amministrazione separate".
  - Il **Modulo** ha ora anche un campo **descrizione**, oltre a nome e applicativo di appartenenza.
  - Chiarito che "tipo e descrizione" del requisito, citati nel dettaglio applicativo, corrispondono ai campi già esistenti **stato** e **nome/intento** mostrati insieme — non sono campi nuovi (interpretazione assunta, da confermare se si intendeva altro).
  - **Generazione automatica di un requisito dall'integrazione**: attiva di default alla creazione di un'integrazione, il requisito generato si aggancia all'**origine** dell'integrazione; disattivabile per la singola creazione.
  - **Ricerca e filtri estesi a qualsiasi entità** (non solo applicativo e requisito): anche moduli, integrazioni, fornitori, contratti e domini.
  - Rafforzata la clausola di cancellazione con **integrità referenziale esplicita** (nessun riferimento orfano), a conferma di quanto già stabilito sulla non-cascata indiscriminata.
  - Confermato che lo stato intermedio resta **"in sviluppo"** (non rinominato in "in realizzazione").

**13 agosto 2026 (aggiornamento 5 — dal collaudo)**

- Ulteriori correzioni emerse provando l'implementazione:
  - **Affacciamento delle integrazioni nei riepiloghi**: un'integrazione compare nel riepilogo del livello a cui è agganciato ciascun estremo — app→app in entrambe le app, app→modulo nell'app e nel modulo, modulo→modulo nei rispettivi moduli (non nel riepilogo generale delle app).
  - Il **drill-down visivo sulla mappa non funziona** e va reso operativo secondo il comportamento già descritto (contenitore visivo dell'app, moduli racchiusi, solo app collegate visibili).
  - Nella maschera di creazione dell'applicativo, aprire la creazione di un **contratto (o dominio) non deve chiudere/scartare la maschera dell'applicativo**: al ritorno i dati inseriti devono essere ancora presenti e la nuova entità già selezionabile. Attualmente il contratto viene creato ma l'applicativo va perso.
  - I **filtri domini** devono mostrare **solo i domini associati ad almeno un applicativo** (già richiesto, non ancora implementato): evitare opzioni che darebbero zero risultati.
  - Un **contratto creato dev'essere modificabile** (nome, fornitore, date, CIG, CUP): attualmente non lo è.
  - Dev'essere possibile **associare un contratto esistente a un applicativo esistente** (e scollegarlo), da entrambi i lati del legame molti-a-molti: attualmente non è possibile.

**13 agosto 2026 (aggiornamento 4 — dal collaudo)**

- Correzioni emerse provando la prima implementazione:
  - L'**applicativo dev'essere modificabile da front-end** (nome, dominio, contratti, moduli), non solo creabile.
  - I filtri devono elencare **solo i domini (e valori) effettivamente in uso**, non l'intero elenco censito.
  - La **ricerca testuale deve includere i requisiti** (e moduli/integrazioni), non solo i nomi degli applicativi.
  - Nella creazione di un'integrazione, per ciascun estremo si sceglie **prima l'applicativo e poi opzionalmente un suo modulo**, così da poter puntare al modulo specifico di un altro applicativo.
  - Il layout della mappa deve **minimizzare gli incroci tra archi** (obiettivo, non vincolo assoluto; ammessi archi curvi).
  - Gli archi di integrazione devono comunicare la **direzionalità con un'animazione di scorrimento** nel verso dell'integrazione.
  - Devono essere possibili le connessioni **modulo→modulo** (entrambi gli estremi di un'integrazione possono essere moduli, in modo indipendente): attualmente non lo sono.

**13 agosto 2026 (aggiornamento 3)**

- Precisato il comportamento del **drill-down sui moduli** nella mappa: l'applicativo selezionato diventa un **contenitore visivo** che racchiude i suoi moduli (così resta chiaro che i moduli gli appartengono); gli archi di integrazione partono dal singolo modulo verso l'esterno; restano visibili **solo le applicazioni collegate**, mentre le non collegate scompaiono per liberare spazio al dettaglio. Uscendo si torna alla vista d'insieme.

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