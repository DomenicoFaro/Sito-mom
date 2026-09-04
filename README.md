# MōMA · Japanese Cuisine Gourmet — Sito web & ordinazione al tavolo

Sito vetrina + sistema di ordinazione al tavolo via QR code per il ristorante
MōMA (Via del Bosco 134, Catania), come da PRD. Stack: **Next.js (App
Router) + TypeScript + Tailwind CSS + Supabase** (Postgres, Auth, Realtime,
Storage).

## Struttura del progetto

- `src/app/(marketing)/…` — sito vetrina pubblico: Home, Menù, Chi siamo,
  Galleria, Prenotazioni, Contatti.
- `src/app/ordina/[token]/…` — mini-webapp di ordinazione al tavolo,
  raggiunta solo tramite il QR code stampato sul tavolo (`/ordina/<qr_token>`).
- `src/app/cucina/…` — Kitchen Display System (realtime).
- `src/app/cassa/…` — vista cassa/sala: tavoli attivi, conti, chiusura.
- `src/app/admin/…` — backoffice: menù (CRUD + foto), tavoli/QR, statistiche.
- `src/app/staff/login/…` — login staff (Supabase Auth).
- `supabase/migrations/` — schema DB, RLS, storage bucket.
- `supabase/seed/seed.sql` — categorie, tavoli e piatti di esempio.

Le foto dei piatti **non sono ancora disponibili** (vedi PRD §8): finché non
vengono caricate dal backoffice, l'interfaccia mostra un placeholder
fotografico elegante al posto dell'immagine reale.

## Setup

### 1. Progetto Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Nel SQL editor, esegui in ordine:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_storage.sql`
   - (opzionale, per dati di prova) `supabase/seed/seed.sql`
3. Abilita **Realtime** sulle tabelle `orders`, `order_items`,
   `restaurant_tables` (le migration lo fanno già via
   `alter publication supabase_realtime add table …`, verificalo in
   Database → Replication).

### 2. Variabili d'ambiente

Copia `.env.example` in `.env.local` e compila con le chiavi del progetto
Supabase (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Account staff

Non esiste un flusso di self-signup per lo staff (per design: solo un admin
può creare accesso a cucina/sala/cassa/admin). Per creare un account:

1. In Supabase → Authentication → Users, crea un utente con email/password.
2. Nel SQL editor, inserisci il profilo corrispondente:
   ```sql
   insert into staff_profiles (id, full_name, role)
   values ('<uuid-utente-auth>', 'Nome Cognome', 'admin'); -- o 'cucina' | 'sala' | 'cassa'
   ```
3. Login su `/staff/login`.

### 4. Avvio in sviluppo

```bash
npm install
npm run dev
```

- Sito vetrina: [http://localhost:3000](http://localhost:3000)
- Ordinazione al tavolo (dopo aver seedato i tavoli):
  `http://localhost:3000/ordina/<qr_token>` — il token di ogni tavolo si
  trova in `restaurant_tables.qr_token`, oppure genera/scarica il QR da
  `/admin/tavoli`.
- Cucina: `/cucina` · Cassa/Sala: `/cassa` · Backoffice: `/admin`

## Note implementative

- **Nessun login per il cliente**: il tavolo viene identificato dal token
  del QR nell'URL; l'ordine attivo per quel tavolo viene trovato o creato al
  primo caricamento della pagina.
- **Round di ordini**: ogni invio dal carrello crea un nuovo "giro"
  (`order_items.round`) collegato allo stesso ordine, così un tavolo AYCE
  può continuare ad ordinare nella stessa sessione.
- **Tempo reale**: cucina, cassa e la pagina del cliente si aggiornano via
  Supabase Realtime (postgres changes su `orders`/`order_items`).
- **Sicurezza**: Row Level Security su tutte le tabelle; lo staff ha
  permessi differenziati per ruolo (`cucina`, `sala`, `cassa`, `admin`) via
  `staff_profiles.role`; le aree `/cucina`, `/cassa`, `/admin` sono protette
  sia da `src/proxy.ts` (redirect se non autenticato/non autorizzato) sia da
  controlli lato server nei rispettivi layout.
- **Foto piatti**: caricabili dal backoffice (`/admin/menu`) su Supabase
  Storage, bucket pubblico `menu-photos`.

## Prossimi passi (fuori scope fase 1, vedi PRD §9)

- Pagamento online integrato.
- Prenotazioni con disponibilità realtime (oggi è solo un form di richiesta).
- Multilingua IT/EN.
- Contenuti reali: logo, foto professionali, menù definitivo, orari
  confermati dal locale.
