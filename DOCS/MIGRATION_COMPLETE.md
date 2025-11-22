# ✅ Migrazione a Supabase Completata

## Modifiche Implementate

### 1. **Database Schema**
- ✅ Tabelle `categories` e `menu_items` create
- ✅ 175 items del menu migrati con successo
- ✅ Pricing JSONB per gestire prezzi singoli e varianti (es: Piccola/Media, Calice/Bottiglia)
- ✅ RLS (Row Level Security) policies configurate
- ✅ Ottimizzazioni performance applicate

### 2. **Autenticazione**
- ✅ Supabase Auth configurato
- ✅ Login con email/password (rimossa password hardcoded)
- ✅ Session management automatico

### 3. **Storage**
- ✅ Bucket `menu-images` creato
- ✅ Conversione automatica immagini a WebP (max 500KB)
- ✅ Sovrascrittura automatica con upsert

### 4. **Frontend**
- ✅ localStorage rimosso completamente
- ✅ Stores aggiornati per usare Supabase
- ✅ Menu page compatibile con nuovo schema
- ✅ Admin page con upload immagini integrato

## Setup Iniziale

### 1. Crea Primo Utente Admin

**Opzione A - Via Supabase Dashboard:**
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto
3. Vai in `Authentication` → `Users`
4. Click `Add User` → `Create new user`
5. Inserisci email e password
6. Conferma la mail (o disabilita conferma email in `Authentication` → `Providers` → `Email`)

**Opzione B - Via SQL:**
```sql
-- Crea utente admin direttamente (SOLO per sviluppo)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@meraki.it',
  crypt('tua-password-qui', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### 2. Avvia Applicazione

```bash
cd meraki-site
npm install
npm run dev
```

### 3. Login Admin

1. Vai su `http://localhost:5173/admin`
2. Inserisci email e password dell'utente creato
3. Gestisci prodotti e categorie

## Schema Prezzi

### Prezzo Singolo
```json
{
  "type": "single",
  "value": 8.50
}
```

### Prezzi con Varianti
```json
{
  "type": "multiple",
  "variants": [
    {"name": "Piccola", "price": 3.50},
    {"name": "Media", "price": 7.00}
  ]
}
```

## Struttura Database

### Tabella `categories`
- `id` - BIGSERIAL PRIMARY KEY
- `name` - TEXT UNIQUE
- `subcategories` - TEXT[] (array di sottocategorie)
- `created_at` / `updated_at`

### Tabella `menu_items`
- `id` - BIGSERIAL PRIMARY KEY
- `category_id` - FK a categories
- `subcategory` - TEXT nullable
- `name` - TEXT
- `description` - TEXT
- `pricing` - JSONB (single o multiple)
- `note` - TEXT (es: "Opzione senza glutine +2€")
- `image_url` - TEXT (URL da Supabase Storage)
- `is_available` - BOOLEAN (per nascondere temporaneamente)
- `sort_order` - INT
- `created_at` / `updated_at`

## Sicurezza

### RLS Policies
- **Read**: Pubblico (chiunque può leggere il menu)
- **Write**: Solo utenti autenticati (admin)

### Storage Policies
- **Read**: Pubblico (immagini visibili a tutti)
- **Write**: Solo utenti autenticati

## Ottimizzazioni Applicate

1. ✅ Search path fix per trigger function (security)
2. ✅ RLS policies ottimizzate con `(select auth.role())` (performance)
3. ✅ Indici su category_id, subcategory, is_available, sort_order

## Prossimi Passi Consigliati

1. **Backup Regolari**: Configura backup automatici su Supabase
2. **Monitoring**: Attiva alert per errori e downtime
3. **CDN**: Considera Cloudflare per caching immagini
4. **Analytics**: Integra Plausible o similare
5. **SEO**: Meta tags e sitemap
6. **PWA**: Service worker per offline support

## Supporto

Per problemi o domande:
- Supabase Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard

