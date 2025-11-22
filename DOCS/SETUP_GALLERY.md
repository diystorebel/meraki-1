# Setup Gallery Manager

## Stato: ✅ COMPLETATO

Sistema completo di gestione gallery con admin panel e frontend integrato.

---

## 1. Esegui migrazione database

Vai su Supabase Dashboard → SQL Editor ed esegui:

```sql
-- Crea tabella gallery
CREATE TABLE IF NOT EXISTS gallery (
    id BIGSERIAL PRIMARY KEY,
    immagine_url TEXT NOT NULL,
    alt_text TEXT,
    ordine INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_ordine ON gallery(ordine);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery images are viewable by everyone"
    ON gallery FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert gallery images"
    ON gallery FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery images"
    ON gallery FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery images"
    ON gallery FOR DELETE
    TO authenticated
    USING (true);
```

## 2. Crea bucket storage

Vai su Supabase Dashboard → Storage:

1. Crea nuovo bucket: `gallery-images`
2. Rendilo **pubblico** (Public bucket: ON)
3. Configura policy:

```sql
-- Lettura pubblica
CREATE POLICY "Gallery images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'gallery-images');

-- Upload per autenticati
CREATE POLICY "Authenticated users can upload gallery images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'gallery-images');

-- Delete per autenticati
CREATE POLICY "Authenticated users can delete gallery images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'gallery-images');
```

## 3. Funzionalità disponibili

- **Upload**: Carica immagini (auto-compress a WebP, max 1MB)
- **Delete**: Rimuove immagine da storage e DB
- **Riordino**: Drag & drop per cambiare ordine visualizzazione
- **Alt Text**: Modifica testo alternativo per SEO/accessibilità
- **Preview**: Click su immagine per zoom full-screen

## 4. Uso

1. Vai su `/admin`
2. Click su "Gestisci Gallery"
3. Click "Aggiungi Immagine" per upload
4. Drag & drop card per riordinare
5. Click icona Edit per modificare alt text
6. Click icona Trash per eliminare

## Note tecniche

- Immagini compresse automaticamente in WebP
- Ordine salvato nel campo `ordine` (integer)
- Storage bucket separato da menu-images
- RLS abilitato: pubblico legge, solo admin scrive

---

## File creati/modificati

### Nuovi file:
- `src/lib/stores/galleryStore.js` - Store Svelte per gestione stato gallery
- `DOCS/migration_gallery.sql` - Migrazione SQL per tabella gallery
- `DOCS/SETUP_GALLERY.md` - Documentazione setup (questo file)

### File modificati:
- `src/lib/utils/imageUpload.js` - Aggiunte funzioni `uploadGalleryImage` e `deleteGalleryImage`
- `src/routes/admin/+page.svelte` - Aggiunta sezione "Gestisci Gallery" completa
- `src/routes/gallery/+page.svelte` - Caricamento dinamico da database

### Funzionalità implementate:
✅ CRUD completo (Create, Read, Update, Delete)
✅ Upload con compressione automatica WebP
✅ Drag & drop per riordinamento
✅ Modifica alt text per SEO/accessibilità
✅ Preview zoom full-screen
✅ Integrazione con Supabase Storage + Database
✅ RLS policies per sicurezza
✅ UI/UX moderna e responsive
✅ Loading states e gestione errori

