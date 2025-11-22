-- ESEGUI QUESTO SU SUPABASE SQL EDITOR ORA

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

