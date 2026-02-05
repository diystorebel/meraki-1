# Cleanup Automatico Candidature - Supabase

## Implementazione con Supabase pg_cron

✅ **Funzione PostgreSQL**: `cleanup_old_candidature()`
- Elimina automaticamente le candidature più vecchie di 7 giorni
- Eseguita direttamente sul database (più efficiente)

✅ **Cron Job Supabase**
- Configurato tramite `pg_cron` extension
- Schedule: `0 2 * * *` (ogni giorno alle 02:00 UTC)

## Setup

### 1. Abilita pg_cron su Supabase

1. Vai su Supabase Dashboard → Database → Extensions
2. Cerca "pg_cron"
3. Abilita l'estensione

### 2. Esegui la Migration

Esegui il file `CLEANUP_CANDIDATURE_SUPABASE.sql` tramite:
- Supabase Dashboard → SQL Editor
- Oppure tramite MCP Supabase

### 3. Verifica

```sql
-- Verifica che il cron job sia attivo
SELECT * FROM cron.job WHERE jobname = 'cleanup-candidature-daily';

-- Test manuale della funzione
SELECT * FROM cleanup_old_candidature();
```

## Vantaggi rispetto a Vercel Cron

✅ **Più efficiente**: Eseguito direttamente sul database
✅ **Nessuna dipendenza esterna**: Non dipende da Vercel
✅ **Più veloce**: Nessuna chiamata HTTP
✅ **Più sicuro**: Funzione SECURITY DEFINER con controllo RLS
✅ **Logging integrato**: Log direttamente nel database

## Modificare il Periodo di Retention

Per cambiare da 7 giorni a un altro periodo:

```sql
-- Modifica la funzione
CREATE OR REPLACE FUNCTION cleanup_old_candidature()
RETURNS TABLE(deleted_count BIGINT, cutoff_date TIMESTAMP WITH TIME ZONE) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count BIGINT;
BEGIN
  -- Cambia INTERVAL '7 days' con il periodo desiderato
  cutoff_date := NOW() - INTERVAL '30 days';  -- Esempio: 30 giorni
  
  DELETE FROM candidature
  WHERE created_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleanup candidature: eliminate % record precedenti al %', deleted_count, cutoff_date;
  
  RETURN QUERY SELECT deleted_count, cutoff_date;
END;
$$;
```

## Monitoraggio

I log sono disponibili su:
- Supabase Dashboard → Database → Logs
- Query: `SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-candidature-daily');`

## Gestione Cron Job

```sql
-- Modificare lo schedule
SELECT cron.alter_job(
  'cleanup-candidature-daily',
  schedule := '0 3 * * *'  -- Cambia a 03:00 UTC
);

-- Disabilitare temporaneamente
SELECT cron.unschedule('cleanup-candidature-daily');

-- Riabilitare
SELECT cron.schedule(
  'cleanup-candidature-daily',
  '0 2 * * *',
  $$SELECT cleanup_old_candidature()$$
);
```
