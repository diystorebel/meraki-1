-- POLICY PER BUCKET "gallery" - Esegui su Supabase SQL Editor

-- Lettura pubblica
CREATE POLICY "Gallery images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'gallery');

-- Upload per autenticati
CREATE POLICY "Authenticated users can upload gallery images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'gallery');

-- Delete per autenticati
CREATE POLICY "Authenticated users can delete gallery images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'gallery');

-- Update per autenticati
CREATE POLICY "Authenticated users can update gallery images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'gallery')
    WITH CHECK (bucket_id = 'gallery');

