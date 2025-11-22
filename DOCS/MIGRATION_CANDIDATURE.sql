-- Migration: Setup candidature (Lavora con Noi)
-- Tabella per salvare le candidature di lavoro

-- 1. Crea tabella candidature
CREATE TABLE IF NOT EXISTS candidature (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  messaggio TEXT NOT NULL,
  cv_url TEXT NOT NULL,
  cv_filename VARCHAR(500) NOT NULL,
  consenso_privacy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indici per performance
CREATE INDEX IF NOT EXISTS idx_candidature_created_at ON candidature(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidature_email ON candidature(email);

-- 3. RLS (Row Level Security)
ALTER TABLE candidature ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admin autenticati possono leggere
CREATE POLICY "Admin can read candidature"
  ON candidature
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Tutti possono inserire (form pubblico)
CREATE POLICY "Public can insert candidature"
  ON candidature
  FOR INSERT
  WITH CHECK (true);

-- 4. Trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidature_updated_at
  BEFORE UPDATE ON candidature
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STORAGE BUCKET:
-- Esegui manualmente in Supabase Dashboard > Storage:
-- 1. Crea bucket "candidature" (PUBLIC)
-- 2. Policies:
--    - INSERT: allow public (size < 5MB, file type: pdf/jpg/jpeg/png)
--    - SELECT: admin only (authenticated users)

