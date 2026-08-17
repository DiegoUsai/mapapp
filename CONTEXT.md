# Glossario del dominio — Mappa Applicativa

## Applicativo (Application)

Sistema software gestito dalla PA (Regione Sardegna). Appartiene a esattamente un Dominio e può essere coperto da più Contratti contemporaneamente (relazione molti-a-molti). Contiene Moduli, Requisiti e Integrazioni.

## Modulo (Module)

Sotto-componente logico di un Applicativo. Serve a partizionare requisiti e integrazioni dentro l'applicativo. Un Modulo appartiene a un solo Applicativo. Eliminare un modulo non elimina i suoi requisiti e integrazioni: li sgancia (tornano a livello applicativo).

## Dominio (Domain)

Classificazione tematica degli applicativi. Ha due attributi indipendenti:
- **Ambito**: `verticale` (specifico di un settore) o `trasversale` (condiviso tra settori).
- **Core**: booleano, indica se il dominio è un servizio core della PA.

Opzionalmente associato a un codice **COFOG** (Classification of Functions of Government), standard internazionale per la classificazione delle funzioni della pubblica amministrazione.

## Requisito (Requirement)

Funzionalità o esigenza censita per un Applicativo. Ha uno stato (`presente`, `in-sviluppo`, `backlog`). Può essere assegnato a un Modulo specifico o restare a livello applicativo. Può avere un riferimento esterno (`externalId` + `externalSystem`) verso un backlog o registro condiviso. La relazione molti-a-molti `sharedWith` rileva sovrapposizioni tra requisiti di applicativi diversi.

## Integrazione (Integration)

Relazione tecnica tra due Applicativi (e opzionalmente tra due Moduli specifici). Ha un estremo origine (`from`) e un estremo destinazione (`to`), ciascuno con un modulo opzionale. Ha un tipo (IntegrationType), uno stato (`presente`, `in-sviluppo`, `backlog`) e una descrizione (`label`). Creare un'integrazione genera automaticamente un Requisito sull'applicativo di origine, a meno che l'utente non disattivi la generazione.

## Tipo di integrazione (IntegrationType)

Classificazione delle integrazioni (es. API REST, file transfer, database link). Ogni tipo ha un colore per la rappresentazione sulla mappa.

## Contratto (Contract)

Contratto di fornitura che copre uno o più Applicativi. Appartiene a un Fornitore. Ha date di inizio/fine, e liste di codici CIG e CUP (identificativi della contrattualistica pubblica italiana). Relazione molti-a-molti con Applicativo.

## Fornitore (Vendor)

Soggetto (azienda o RTI) titolare di uno o più Contratti.

## COFOG

Classification of Functions of Government. Standard internazionale (ONU/Eurostat) che classifica le funzioni della pubblica amministrazione in divisioni, gruppi e classi. Usato come codice opzionale sui Domini per allinearsi alle linee guida AgID.
