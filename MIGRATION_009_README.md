# Migration 009: Fix Contents Policy - README

## Problema

Errore `42501: permission denied for schema public` quando si tenta di creare un content.

Questo accade perché:

1. La policy RLS attuale richiede `auth.jwt() ->> 'role' = 'admin'`
2. L'API route usa Service Role Key, ma non passa attraverso `auth.jwt()`
3. Il Service Role bypassa RLS, ma la policy impedisce comunque l'insert

## Soluzione

Modificare la policy per permettere a **tutti gli utenti autenticati** di inserire contents.

## Come Applicare

### Via Supabase Dashboard SQL Editor

```sql
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Only admins can insert contents" ON contents;

-- Create new policy: Authenticated users can insert contents
CREATE POLICY "Authenticated users can insert contents" ON contents
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
```

### Verifica

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'contents';
```

## Alternative (Se il problema persiste)

Se l'errore persiste anche dopo aver applicato la migration, significa che è un problema di **permessi PostgreSQL** sullo schema, non di RLS.

In quel caso, esegui:

```sql
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant all privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant all privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Make it apply to future tables too
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
```
