# R2 — Findings: formato Structurizr DSL

Risultato della ricerca sulla sintassi Structurizr DSL per la generazione programmatica di file `.dsl` (a supporto del ticket C2).

Fonti: [docs.structurizr.com/dsl/language](https://docs.structurizr.com/dsl/language), [docs.structurizr.com/dsl/basics](https://docs.structurizr.com/dsl/basics), [docs.structurizr.com/dsl/expressions](https://docs.structurizr.com/dsl/expressions), [docs.structurizr.com/dsl/identifiers](https://docs.structurizr.com/dsl/identifiers), [docs.structurizr.com/cli](https://docs.structurizr.com/cli), [docs.structurizr.com/community](https://docs.structurizr.com/community).

---

## 1. Struttura completa di un file .dsl

```
workspace [name] [description] {

    !identifiers hierarchical          # opzionale, abilita id con dot-notation

    model {
        # person, softwareSystem, relationships
    }

    views {
        # systemLandscape, systemContext, container, ...
        styles {
            element "Tag" { ... }
            relationship "Tag" { ... }
        }
        theme <url>
    }

    configuration {
        scope <landscape|softwaresystem|none>
    }
}
```

Regole sintattiche fondamentali:
- La `{` di apertura deve stare sulla stessa riga del keyword.
- La `}` di chiusura deve stare su una riga a se stante.
- Le virgolette doppie (`"..."`) sono opzionali se il valore non contiene spazi.
- Usare `""` come placeholder per saltare un parametro opzionale intermedio.
- Il file e' processato in ordine imperativo: no forward-reference.

---

## 2. Elementi del modello

### person

```
<id> = person <name> [description] [tags] {
    description "..."
    tags "Tag1,Tag2"
    url https://...
    properties {
        "chiave1" "valore1"
        "chiave2" "valore2"
    }
    -> <target_id> [description] [technology] [tags]
}
```

### softwareSystem

```
<id> = softwareSystem <name> [description] [tags] {
    description "..."
    tags "Tag1,Tag2"
    url https://...
    properties {
        "chiave1" "valore1"
    }
    group <name> { ... }
    container <name> [description] [technology] [tags] { ... }
    -> <target_id> [description] [technology] [tags]
}
```

### container

```
<id> = container <name> [description] [technology] [tags] {
    description "..."
    technology "Next.js"
    tags "Tag1"
    properties {
        "slug" "anpr"
    }
    component <name> [description] [technology] [tags] { ... }
    -> <target_id> [description] [technology] [tags]
}
```

### deploymentEnvironment / deploymentNode

```
deploymentEnvironment "Production" {
    deploymentNode "Cloud" "AWS" "Amazon Web Services" {
        deploymentNode "EC2" {
            containerInstance <container_id>
        }
    }
}
```

---

## 3. Relazioni (relationships)

### Sintassi base

```
<source_id> -> <target_id> [description] [technology] [tags]
```

### Con blocco di dettaglio

```
<source_id> -> <target_id> "Invia dati anagrafici" "REST/JSON" "async" {
    tags "Integrazione"
    url https://...
    properties {
        "stato" "in_lavorazione"
    }
}
```

### Dentro un elemento (implicita la sorgente)

```
webapp = softwareSystem "WebApp" {
    -> anpr "Verifica residenza" "REST API"
}
```

### Rimuovere una relazione implicita

```
<source_id> -/> <target_id>
```

### Assegnare un identificatore alla relazione

```
rel = source -> target "Descrizione" "Tecnologia"
```

Vincolo: tutte le relazioni da un source a un destination devono avere descrizione univoca.

---

## 4. Identificatori

### Modalita flat (default)

```
workspace {
    model {
        anpr = softwareSystem "ANPR"
        spid = softwareSystem "SPID"
    }
}
```

Tutti gli id sono globali. Caratteri ammessi: `a-zA-Z_0-9`.

### Modalita hierarchical

```
workspace {
    !identifiers hierarchical

    model {
        portale = softwareSystem "Portale Servizi" {
            api = container "API Gateway"
            db = container "Database"
        }
        backoffice = softwareSystem "Backoffice" {
            api = container "API Gateway"    # OK, non collide
        }
    }
}
```

Riferimento con dot-notation: `portale.api`, `backoffice.api`.

Raccomandazione per il generatore: usare sempre `!identifiers hierarchical` per evitare collisioni tra container con nomi simili in sistemi diversi.

---

## 5. Viste (views)

### systemLandscape — tutti i sistemi

```
systemLandscape [key] [description] {
    include *                              # tutti gli elementi
    include <identifier>                   # uno specifico
    exclude <identifier>                   # escludere uno
    exclude "element.tag==Esterno"         # escludere per tag
    autoLayout lr                          # lr|rl|tb|bt
    title "Mappa Applicativa"
    description "Vista landscape di tutti i sistemi"
}
```

### systemContext — un sistema e le sue connessioni

```
systemContext <system_id> [key] [description] {
    include *
    autoLayout tb
    title "Contesto di ANPR"
}
```

### container — container interni di un sistema

```
container <system_id> [key] [description] {
    include *
    autoLayout tb
    title "Container di Portale Servizi"
}
```

### Altre viste disponibili

```
component <container_id> [key] [description] { ... }

deployment <*|system_id> <environment> [key] [description] {
    include *
    autoLayout lr
}

dynamic <*|system_id|container_id> [key] [description] {
    user -> webapp "Richiede pagina"
    webapp -> db "Query dati"
    autoLayout lr
}

filtered <baseKey> <include|exclude> <tags> [key] [description] { ... }
```

### Espressioni per include/exclude

```
include *                                        # tutto
include <identifier>                             # elemento specifico
include "element.type==SoftwareSystem"           # per tipo
include "element.tag==nazionale"                 # per tag
include "element.tag==nazionale,critico"         # AND di tag
exclude "element.tag==deprecato"                 # escludere per tag
include "element.parent==portale"                # figli di un elemento
include "->portale->"                            # afferenti+efferenti
include "element.properties[scope]==nazionale"   # per property custom

# Operatori combinati
include "element.type==Container && element.parent==portale"
```

### autoLayout

```
autoLayout [tb|bt|lr|rl] [rankSeparation] [nodeSeparation]
```

- `tb` = top-bottom (default)
- `lr` = left-right
- I valori numerici di separazione sono in pixel.

---

## 6. Tags

### Assegnazione inline (nella dichiarazione dell'elemento)

```
anpr = softwareSystem "ANPR" "Anagrafe Nazionale" "nazionale,critico"
```

Il terzo parametro dopo description e' la stringa tag, con virgole per separare.

### Assegnazione esplicita (dentro il blocco)

```
anpr = softwareSystem "ANPR" {
    tags "nazionale" "critico"
    # oppure
    tags "nazionale,critico"
}
```

### Tag predefiniti

Ogni elemento riceve automaticamente tag impliciti:
- `"Element"` — tutti gli elementi
- `"Person"` — le person
- `"Software System"` — i softwareSystem
- `"Container"` — i container
- `"Component"` — i component
- `"Relationship"` — tutte le relazioni

Questi tag predefiniti sono utilizzabili negli stili senza doverli dichiarare.

---

## 7. Properties (metadati custom)

```
portale = softwareSystem "Portale Servizi" {
    properties {
        "scope" "interno"
        "slug" "portale-servizi"
        "dominio" "Servizi Digitali"
        "fornitore" "Acme SpA"
        "codice_contratto" "CIG-12345"
    }
}
```

Le properties sono coppie chiave-valore, entrambe tra virgolette. Sono disponibili su tutti gli elementi (person, softwareSystem, container, component) e sulle relazioni.

Sono filtrabili nelle espressioni delle viste:

```
include "element.properties[scope]==nazionale"
exclude "element.properties[deprecato]==true"
```

---

## 8. Stili

### element style

```
styles {
    element "Software System" {
        shape RoundedBox
        background #1168bd
        color #ffffff            # colore del testo
        stroke #0b4884           # colore del bordo
        strokeWidth 2
        fontSize 24
        border solid             # solid|dashed|dotted
        opacity 100              # 0-100
        metadata true            # mostra/nascondi metadata
        description true         # mostra/nascondi description
        icon <file|url>
    }

    element "Person" {
        shape Person
        background #08427b
        color #ffffff
    }

    element "Container" {
        shape RoundedBox
        background #438dd5
        color #ffffff
    }
}
```

Forme disponibili: `Box`, `RoundedBox`, `Circle`, `Ellipse`, `Hexagon`, `Diamond`, `Cylinder`, `Bucket`, `Pipe`, `Person`, `Robot`, `Folder`, `WebBrowser`, `Window`, `Terminal`, `Shell`, `MobileDevicePortrait`, `MobileDeviceLandscape`, `Component`.

### relationship style

```
styles {
    relationship "Relationship" {
        thickness 2
        color #707070
        style solid              # solid|dashed|dotted
        routing Direct           # Direct|Orthogonal|Curved
        fontSize 24
        width 200
        position 50              # 0-100, posizione etichetta
        opacity 100
    }

    relationship "async" {
        style dashed
        color #999999
    }
}
```

### Stili per tag custom

```
styles {
    element "nazionale" {
        background #1168bd
        color #ffffff
        border solid
        shape RoundedBox
    }
    element "privato" {
        background #999999
        color #ffffff
        border dashed
        shape RoundedBox
    }
    element "interno" {
        background #438dd5
        color #ffffff
        shape RoundedBox
    }
}
```

### Theme (palette predefinita)

```
views {
    theme default
    # oppure URL remoto
    theme https://static.structurizr.com/themes/amazon-web-services-2023.01.31/theme.json
}
```

---

## 9. Esempio completo

```dsl
workspace "Mappa Applicativa" "POC mappa applicativa multi-fornitore" {

    !identifiers hierarchical

    model {
        # --- Persona ---
        operatore = person "Operatore Comunale" "Dipendente del comune che utilizza i servizi"

        # --- Software System: interno ---
        portale = softwareSystem "Portale Servizi" "Portale web per i servizi al cittadino" "interno" {
            tags "interno"
            properties {
                "scope" "interno"
                "slug" "portale-servizi"
                "dominio" "Servizi Digitali"
            }

            webapp = container "Web Application" "Interfaccia utente del portale" "Next.js" {
                tags "webapp"
                properties {
                    "slug" "portale-webapp"
                }
            }

            api = container "API Backend" "Servizi REST per il portale" "Node.js" {
                tags "api"
            }

            db = container "Database" "Dati dei servizi" "PostgreSQL" {
                tags "database"
            }

            webapp -> api "Chiama" "REST/JSON"
            api -> db "Legge e scrive" "Prisma/SQL"
        }

        # --- Software System: nazionale ---
        anpr = softwareSystem "ANPR" "Anagrafe Nazionale della Popolazione Residente" "nazionale" {
            tags "nazionale"
            properties {
                "scope" "nazionale"
                "slug" "anpr"
                "dominio" "Anagrafe"
            }
        }

        # --- Software System: privato ---
        pagoPA = softwareSystem "PagoPA" "Piattaforma di pagamento della PA" "privato" {
            tags "privato"
            properties {
                "scope" "privato"
                "slug" "pagopa"
                "dominio" "Pagamenti"
            }
        }

        # --- Relazioni tra sistemi ---
        operatore -> portale "Utilizza" "Browser"
        portale -> anpr "Verifica residenza" "REST API" "integrazione"
        portale -> pagoPA "Invia pagamento" "REST API" "integrazione"
    }

    views {
        # --- Vista 1: Landscape (tutti i sistemi) ---
        systemLandscape "landscape" "Vista d'insieme di tutti i sistemi" {
            include *
            autoLayout tb
        }

        # --- Vista 2: Context del Portale ---
        systemContext portale "context-portale" "Contesto del Portale Servizi" {
            include *
            autoLayout tb
        }

        # --- Vista 3: Container del Portale ---
        container portale "containers-portale" "Container interni del Portale Servizi" {
            include *
            autoLayout tb
        }

        # --- Stili ---
        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "interno" {
                background #438dd5
                color #ffffff
                shape RoundedBox
                border solid
            }
            element "nazionale" {
                background #2d882d
                color #ffffff
                shape RoundedBox
                border solid
            }
            element "privato" {
                background #aa6c39
                color #ffffff
                shape RoundedBox
                border dashed
            }
            element "Container" {
                shape RoundedBox
                background #85bbf0
                color #000000
            }
            element "database" {
                shape Cylinder
            }
            element "webapp" {
                shape WebBrowser
            }
            relationship "Relationship" {
                thickness 2
                color #707070
                style solid
                routing Direct
            }
            relationship "integrazione" {
                style dashed
                color #d46a6a
                thickness 2
            }
        }
    }
}
```

---

## 10. Validazione

### structurizr-cli (End of Life, febbraio 2026)

```bash
# installazione: richiede Java 17+
# download JAR da https://github.com/structurizr/cli/releases

java -jar structurizr-cli.jar validate -workspace workspace.dsl
```

Il CLI e' stato archiviato (febbraio 2026) e sostituito da Structurizr vNext.

### Structurizr vNext (sostituto attuale)

Il tool consolidato `structurizr.war` include:
- Export delle viste (PlantUML, Mermaid, DOT, Ilograph)
- Server locale di authoring (equivalente di Structurizr Lite)
- Validazione integrata

```bash
java -jar structurizr.war validate -workspace workspace.dsl
```

### Structurizr Lite (Docker)

```bash
docker pull structurizr/lite
docker run -it --rm -p 8080:8080 -v ./workspace:/usr/local/structurizr structurizr/lite
```

Mettere il file `.dsl` nella directory montata. Structurizr Lite lo parsa e mostra errori nella console e nell'interfaccia web. Auto-refresh quando il file cambia.

### Validazione programmatica in TypeScript

Non esiste un validatore ufficiale per Node.js/TypeScript. Opzioni della community:

| Package | Tipo | Note |
|---------|------|------|
| [structurizr-typescript](https://www.npmjs.com/package/structurizr-typescript) | Authoring lib | Genera il modello C4 programmaticamente, non parsa .dsl |
| [structurizr-parser](https://github.com/gerry-rohling/structurizr-parser) | Parser TS | Parsa file .dsl in oggetti TS |
| [Scaffoldizr](https://github.com/FormulaMonks/scaffoldizr) | Scaffolding | Tool opinato per creare workspace DSL |

Per il nostro caso d'uso (generazione, non parsing), la validazione piu' pratica e':
1. **Generare il .dsl** con template string/codegen in TypeScript
2. **Validare con Structurizr Lite** via Docker in CI, oppure
3. **Validare a livello sintattico** con il parser TS della community

### Approccio raccomandato per mapapp

Dato che il nostro obiettivo e' generare (non parsare) .dsl, il generatore puo' essere un modulo TypeScript che:
1. Legge i dati dal database Prisma (softwareSystem, container, relazioni)
2. Produce una stringa .dsl valida usando template literals
3. (Opzionale) Valida la stringa con `structurizr-parser` prima dell'export

Non serve importare alcuna dipendenza esterna per la sola generazione: il formato e' puramente testuale.

---

## 11. Note per il generatore

### Escaping

- I nomi con spazi vanno tra `"doppi apici"`.
- I caratteri `"` dentro una stringa vanno gestiti (il DSL non documenta un escape esplicito; evitare doppi apici nei nomi degli elementi).
- I tag con spazi vanno tra apici: `"Tag Con Spazi"`.

### Ordine di output

Il file deve essere generato nell'ordine:
1. `workspace` + `!identifiers hierarchical`
2. `model` con person, poi softwareSystem (con container annidati), poi relazioni tra sistemi
3. `views` con landscape, context per ogni sistema, container per ogni sistema con container
4. `styles` dentro views

### Mapping entita mapapp -> Structurizr

| Entita mapapp | Elemento Structurizr | Note |
|---------------|---------------------|------|
| Applicativo | `softwareSystem` | Tag con lo scope (interno/nazionale/privato) |
| Modulo (di un applicativo) | `container` | Annidato dentro il suo softwareSystem |
| Integrazione | relazione `->` | Tag "integrazione" + stato nelle properties |
| Dominio | `group` oppure `properties["dominio"]` | Valutare se usare `group` per il raggruppamento visivo |
| Contratto | `properties` | Non ha un elemento Structurizr nativo |
| Requisito | non mappato | Fuori scope per la visualizzazione C4 |
