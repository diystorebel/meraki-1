-- Crea tabella gallery per gestire le immagini della galleria
CREATE TABLE IF NOT EXISTS gallery (
    id BIGSERIAL PRIMARY KEY,
    immagine_url TEXT NOT NULL,
    alt_text TEXT,
    ordine INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indice per ordinamento veloce
CREATE INDEX IF NOT EXISTS idx_gallery_ordine ON gallery(ordine);

-- Abilita Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica
CREATE POLICY "Gallery images are viewable by everyone"
    ON gallery FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy per insert/update/delete solo per utenti autenticati
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

-- Crea bucket storage per gallery-images (da eseguire manualmente su Supabase se non esiste)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Policy per storage bucket gallery-images - lettura pubblica
-- CREATE POLICY "Gallery images are publicly accessible"
--     ON storage.objects FOR SELECT
--     TO public
--     USING (bucket_id = 'gallery-images');

-- Policy per storage bucket gallery-images - upload per autenticati
-- CREATE POLICY "Authenticated users can upload gallery images"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'gallery-images');

-- Policy per storage bucket gallery-images - delete per autenticati
-- CREATE POLICY "Authenticated users can delete gallery images"
--     ON storage.objects FOR DELETE
--     TO authenticated
--     USING (bucket_id = 'gallery-images');
