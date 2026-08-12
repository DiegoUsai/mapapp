# Mappa applicativa e dei requisiti

Applicazione web per censire domini, fornitori/RTI, contratti, applicativi, requisiti e
integrazioni tecniche di un ecosistema documentale multi-fornitore, con due viste
navigabili (griglia filtrabile e mappa a grafo) e rilevamento delle sovrapposizioni di
requisiti tra progettualità diverse.

Stack: **Next.js 16** (App Router) · **Postgres** (Prisma 6) · **Auth.js v5 / NextAuth v5** (Google,
ristretto per dominio email) · pensata per il deploy su **Vercel**.

## 1. Prerequisiti

- Un account [Vercel](https://vercel.com) collegato al repository Git del progetto
- Un database Postgres. Il modo più semplice: da Vercel → *Storage* → *Create Database* →
  **Postgres** (basato su Neon), che genera automaticamente le variabili `DATABASE_URL` e
  `DIRECT_URL`
- Un client OAuth Google (per il login):
  1. [Google Cloud Console](https://console.cloud.google.com) → crea un progetto (o usane uno
     esistente)
  2. *API e servizi* → *Schermata consenso OAuth* → tipo **Esterno**, compila i campi minimi
  3. *Credenziali* → *Crea credenziali* → *ID client OAuth* → tipo **Applicazione web**
  4. **URI di reindirizzamento autorizzati**: `https://<il-tuo-dominio-vercel>/api/auth/callback/google`
  5. Copia **Client ID** e **Client secret**

## 2. Configurazione locale (facoltativa, per provare prima del deploy)

```bash
npm install
cp .env.example .env.local   # poi compila i valori
npx prisma migrate dev --name init
npm run dev
```

## 3. Deploy su Vercel

1. Pusha questo progetto su GitLab (o GitHub) e collega il repository su Vercel come nuovo
   progetto
2. In *Settings → Environment Variables* imposta:
   - `DATABASE_URL`, `DIRECT_URL` (dal database Postgres creato al passo 1)
   - `AUTH_SECRET` → genera con `npx auth secret` (oppure `openssl rand -base64 32`). Su Vercel l'URL
     pubblico viene rilevato in automatico, non serve impostarlo a mano.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (dal passo 1)
   - `ALLOWED_EMAIL_DOMAINS` → `aicof.it` (o più domini separati da virgola)
3. Deploy. Al primo deploy le tabelle non esistono ancora: da locale, puntando `DATABASE_URL`/
   `DIRECT_URL` al database di produzione, esegui:
   ```bash
   npx prisma migrate deploy
   ```
   (oppure `npx prisma db push` per la primissima creazione dello schema senza storico di
   migrazioni)
4. Apri l'URL del progetto: dovresti vedere la schermata di accesso con Google

## 4. Popolare i dati

L'app parte vuota. Due strade:
- Usa i pulsanti **"+ Applicativo"**, **"+ Nuovo contratto"** e i moduli dentro il dettaglio di
  ogni applicativo per censire tutto a mano
- Compila il modello Excel fornito a parte (`modello-dati-mappa-applicativa.xlsx`) e importalo da
  **"Importa / esporta" → "Importa file Excel"**

## Struttura del progetto

```
app/                    Route Next.js (pagine e API)
  api/                   Endpoint REST per ogni entità + /api/data (lettura aggregata) e /api/data/import
  signin/                Pagina di login
  page.jsx               Pagina principale (protetta)
components/
  MappaApplicativa.jsx   Componente client: griglia, mappa a grafo, moduli di creazione/modifica
prisma/
  schema.prisma          Modello dati (Domain, Vendor, Contract, IntegrationType, Application, Requirement, Integration)
lib/
  auth.js                Configurazione Auth.js (Google + restrizione di dominio)
  prisma.js              Client Prisma condiviso
middleware.js            Protegge tutte le rotte tranne login e asset statici
```

## Prossimi passi possibili

- Esportazione diretta in formato `catalog-info.yaml` (Backstage), per collegare in futuro
  questo strumento leggero a un'eventuale adozione interna di Backstage
- Storico delle modifiche (chi ha aggiunto cosa e quando)
- Passaggio a un uso condiviso con altri fornitori (oggi l'app resta a uso singolo, protetta
  solo dal dominio email)
