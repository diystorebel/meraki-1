-- Cleanup Automatico Candidature dopo 7 giorni
-- Eseguito automaticamente tramite pg_cron su Supabase

-- 1. Abilita estensione pg_cron (se non già abilitata)
-- NOTA: Deve essere fatto da un superuser su Supabase Dashboard > Database > Extensions

-- 2. Crea funzione per eliminare candidature vecchie di 7 giorni
CREATE OR REPLACE FUNCTION cleanup_old_candidature()
RETURNS TABLE(deleted_count BIGINT, cutoff_date TIMESTAMP WITH TIME ZONE) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count BIGINT;
BEGIN
  -- Calcola la data di 7 giorni fa
  cutoff_date := NOW() - INTERVAL '7 days';
  
  -- Elimina le candidature più vecchie di 7 giorni
  DELETE FROM candidature
  WHERE created_at < cutoff_date;
  
  -- Conta quante sono state eliminate
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log (opzionale, se hai una tabella di log)
  RAISE NOTICE 'Cleanup candidature: eliminate % record precedenti al %', deleted_count, cutoff_date;
  
  RETURN QUERY SELECT deleted_count, cutoff_date;
END;
$$;

-- 3. Crea cron job che esegue la funzione ogni giorno alle 02:00 UTC
-- NOTA: pg_cron usa sintassi cron standard
SELECT cron.schedule(
  'cleanup-candidature-daily',           -- Nome del job
  '0 2 * * *',                           -- Ogni giorno alle 02:00 UTC
  $$SELECT cleanup_old_candidature()$$   -- Funzione da eseguire
);

-- 4. Verifica che il cron job sia stato creato
SELECT * FROM cron.job WHERE jobname = 'cleanup-candidature-daily';

-- 5. Test manuale della funzione (opzionale)
-- SELECT * FROM cleanup_old_candidature();

-- 6. Per modificare lo schedule del cron job:
-- SELECT cron.alter_job(
--   'cleanup-candidature-daily',
--   schedule := '0 3 * * *'  -- Cambia a 03:00 UTC
-- );

-- 7. Per eliminare il cron job:
-- SELECT cron.unschedule('cleanup-candidature-daily');
