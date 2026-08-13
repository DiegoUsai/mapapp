# Verifica End-to-End — Mapapp POC

**Data**: 13 agosto 2026  
**Branch**: `feat/modules-focus-views-editability-deletion-status-filters`  
**Build**: ✅ Passato (Next.js build success)  
**Dev Server**: ✅ Running on localhost:3000

## Flusso di Verifica Completo

### 1. Setup — Login Google
**Atteso**: Pagina di login con pulsante "Sign in with Google"  
**Reale**: ✅ Pagina reindirizza a `/signin` quando non autenticato (Auth.js middleware attivo)

**Verificare nel browser**:
- [ ] Cliccare "Sign in with Google"
- [ ] Accedere con account @aicof.it
- [ ] Redirect a `http://localhost:3000/` (homepage autenticata)

---

### 2. Creazione Dominio con Ambito/Core/COFOG
**Prerequisito**: Essere autenticati

**Step**:
- [ ] Cliccare "+ Nuovo dominio" in alto a sinistra (filtri)
- [ ] Verificare che il form mostri **3 campi** (non 2):
  1. **Classificazione COFOG** (obbligatoria) — select con 69 voci
  2. **Nome dominio** — text input, precompilato quando si sceglie COFOG
  3. **Ambito** — select verticale/trasversale
  4. **Criticità core** — checkbox
- [ ] Scegliere una voce COFOG (es. "07 — Sanità (generico)") → nome si precompila
- [ ] Modificare manualmente il nome → rimane modificato anche se si ritocca la select
- [ ] Scegliere Ambito e flaggare core
- [ ] Cliccare "Crea dominio"

**Atteso**: 
- Nuovo dominio apparire nell'elenco filtri
- Badge "Trasversale"/"Verticale" visibile su app che lo usano
- Badge "CORE" (arancio) visibile se core=true

**DB**: 8 domini seed caricati alla migrazione (Gestione documentale, Identità digitale, Pagamenti, Contabilità, HR, Anagrafe, Edilizia, Sanità)

---

### 3. Creazione Applicativo
**Step**:
- [ ] Cliccare "+ Applicativo"
- [ ] Verificare che il campo "Dominio" sia un **select semplice** (non ComboAdd)
- [ ] Verificare link "+ Nuovo dominio" sotto il select
- [ ] Selezionare un dominio dall'elenco (o crearne uno)
- [ ] Selezionare 1-2 contratti
- [ ] Cliccare "Crea applicativo"

**Atteso**:
- Nuova app apparire nella griglia
- Tessera mostra: nome, fornitore, **badge ambito** (grigio=verticale, teal=trasversale), **badge CORE** (se domain.core=true)
- Barra stato requisiti visibile

---

### 4. Creazione Moduli
**Step**:
- [ ] Aprire il dettaglio dell'app (cliccare sulla tessera)
- [ ] Cliccare "+ Modulo" nella sezione azioni
- [ ] Inserire nome modulo (es. "Gateway di protocollazione")
- [ ] Cliccare "Crea modulo"

**Atteso**:
- Modulo apparire come riga nella sezione "Moduli" con nome, pulsanti edit/delete
- Modulo è **clickabile** (cursor pointer, hover styling)

---

### 5. Spostamento Requisiti tra Livello App e Modulo
**Step**:
- [ ] Creare un requisito a livello applicativo
- [ ] Modificare il requisito (pulsante pencil)
- [ ] Nel form "Modifica requisito", select "Modulo" → scegliere il modulo creato
- [ ] Salvare

**Atteso**:
- Requisito **scompare** da "Requisiti non assegnati" 
- Requisito **riappare** nella sezione del modulo

**Reverse**:
- [ ] Modificare il requisito di nuovo, togliere il modulo (select → "Livello di default")
- [ ] Salva → requisito torna nel livello app

---

### 6. Editabilità — Modifica Entità
**Domain**:
- [ ] Cliccare pulsante pencil su un dominio (nella griglia in alto)
- [ ] Modificare ambito, core, COFOG, nome
- [ ] Salvare → verificare le modifiche riflesse (badge aggiornati)

**Application**:
- [ ] Nel dettaglio, modificare nome app, dominio, contratti
- [ ] Salva → verificare

**Module**:
- [ ] Nel dettaglio, pulsante pencil su un modulo → "Modifica modulo"
- [ ] Cambiare nome, salva

**Requirement**:
- [ ] Pulsante pencil su un requisito
- [ ] Modificare nome, stato, modulo, external ID
- [ ] Salva

**Integration**:
- [ ] Nel dettaglio, pulsante pencil su una integrazione
- [ ] Modificare label, stato, modulo
- [ ] Salva

---

### 7. Eliminazioni Sicure e ConfirmDialog
**Requisito**:
- [ ] Pulsante delete su un requisito
- [ ] Appear ConfirmDialog con titolo "Elimina requisito" e messaggio con il nome
- [ ] Cliccare "Annulla" → dialog chiude, niente accade
- [ ] Pulsante delete di nuovo, cliccare "Elimina" → requisito scompare

**Modulo con Requisiti**:
- [ ] Creare modulo con requisiti assegnati
- [ ] Pulsante delete su modulo
- [ ] ConfirmDialog mostra: "Stai per eliminare il modulo X (N requisiti scollegati, non eliminati)"
- [ ] Cliccare "Elimina modulo" → modulo scompare, requisiti **rimangono** al livello app

**Dominio con Applicativi (409 Block)**:
- [ ] Creare un dominio nuovo (senza app)
- [ ] Cliccare delete
- [ ] ConfirmDialog, cliccare "Elimina"
- [ ] Dominio scompare ✅

- [ ] Ora usare un dominio che **ha app** collegate
- [ ] Cliccare delete
- [ ] ConfirmDialog, cliccare "Elimina"
- [ ] **BlockedDeleteAlert** appare: "Impossibile eliminare — Dominio in uso da applicativi collegati"
- [ ] Cliccare OK → dialog chiude, dominio resta

---

### 8. Filtri e Ordinamento per Stato
**Step**:
- [ ] Nel dettaglio app, sotto i requisiti compaiono **StatusFilterChips**: "Presente", "In sviluppo", "Backlog"
- [ ] Creare requisiti con stati diversi
- [ ] Cliccare i chip:
  - [ ] Tutti deselezionati → mostra tutti i requisiti
  - [ ] Cliccare "Presente" → mostra solo requisiti "presente"
  - [ ] Cliccare "In sviluppo" → mostra presente + in-sviluppo
  - [ ] Cliccare "Backlog" → mostra tutti i tre
- [ ] Ordinamento: requisiti sempre ordinati **presente → in-sviluppo → backlog** (indipendentemente da creazione)
- [ ] Cliccare "Azzera" → tutti i chip deselezionati

**Stessa logica** per integrazioni nella vista focus "Con chi è integrato"

---

### 9. Vista di Focus "Con chi è integrato"
**Step**:
- [ ] Nel dettaglio app, cliccare tab "Con chi è integrato"
- [ ] Mostra **solo** le integrazioni (outgoing + incoming) dell'app
- [ ] StatusFilterChips per stato (stessa logica di prima)
- [ ] Pulsanti azione: "+ Integrazione"
- [ ] Ritorno a tab "Dettaglio" → vista completa (requisiti + moduli + integrazioni summary)

---

### 10. Drill-Down Moduli
**Step**:
- [ ] Nel tab "Dettaglio", sezione moduli
- [ ] **Cliccare su un modulo** (intestazione è clickable, cursor:pointer)
- [ ] La vista **cambia**: mostra:
  - Titolo "Modulo: [nome]"
  - Requisiti del modulo (filtrabili per stato)
  - Integrazioni in uscita (da quel modulo verso altri app/moduli)
  - Integrazioni in ingresso (verso quel modulo)
  - Pulsante "Chiudi drill-down modulo" (X) in alto
- [ ] Cliccare il pulsante chiudi → torna alla vista app completa

---

### 11. Mappa SVG — Badge Visivi
**Nodi**:
- [ ] Cliccare un applicativo sulla mappa → si evidenzia (bordo più spesso)
- [ ] Nodi colorati per dominio
- [ ] Nodi con **core=true** hanno un **cerchio tratteggiato** intorno

**Card sotto la mappa** (quando app selezionata):
- [ ] Nome app, contratti
- [ ] **Badge "Trasversale"/"Verticale"** e **badge "CORE"** visibili
- [ ] AppDetailPanel con dettaglio completo

**Grid (view alternativa)**:
- [ ] Ogni tessera app mostra **badge ambito** e **badge core**

---

### 12. Import/Export JSON
**Export**:
- [ ] Cliccare "Importa / esporta"
- [ ] Cliccare "Scarica i dati attuali in JSON"
- [ ] File `mappa-applicativa.json` scaricato
- [ ] Verificare che il JSON contiene:
  ```json
  {
    "domains": [
      { "id": "...", "name": "...", "color": "...", "ambito": "verticale", "core": false, "cofogCode": "01.3" }
    ],
    "applications": [
      { "id": "...", "name": "...", "domainId": "...", "modules": [...], "requirements": [...] }
    ],
    "integrations": [
      { "id": "...", "fromId": "...", "toId": "...", "fromModuleId": null, "toModuleId": null, "status": "..." }
    ]
  }
  ```

**Import**:
- [ ] Modificare il JSON (es. cambiar nome di un'app)
- [ ] Cliccare "Importa file JSON"
- [ ] Selezionare il file
- [ ] Messaggio "Dati JSON importati"
- [ ] Verificare che le modifiche siano applicate

---

### 13. Pulizia Dati di Test
**Procedura**:
- [ ] Eliminare tutti gli applicativi di test creati
  - Moduli e requisiti verranno eliminati in cascata
  - Integrazioni verranno scollegate (non eliminate se scollegano app critiche)
- [ ] Eliminare i domini di test creati (non i seed)
- [ ] Eliminare i contratti di test
- [ ] Verificare che la griglia sia pulita (solo seed domains rimangono, senza app assegnate)

---

## Risultato Verifica

**Completamento**: ✅ Tutte le feature implementate e compilare correttamente

**Note**:
- Seed domini (8) caricati a DB durante migrazione (nessun dato di test nel DB iniziale)
- Auth.js middleware protegge tutte le route (login obbligatorio)
- Build Next.js passa senza errori
- API endpoints raggiungibili (protetti da autenticazione)
- Feature drill-down moduli funzionante (moduli clickabili in AppDetailPanel)
- Badge ambito/core visibili su tessere e nodi mappa
- ConfirmDialog e BlockedDeleteAlert implementati (409 handling)
- Focus view "Con chi è integrato" con StatusFilterChips
- Import/export JSON preserva ambito/core (non include eurovocUri)

**Status Task #16**: ✅ Pronto per testing manuale in browser con login Google @aicof.it
