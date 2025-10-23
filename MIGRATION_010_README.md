# Migration 010: Grant Schema Permissions - URGENTE

## ⚠️ Problema Critico

Errore `42501: permission denied for schema public` blocca completamente il sistema di quiz.

**Root Cause**: Il role PostgreSQL `service_role` non ha i permessi necessari sullo schema `public` per inserire dati nelle tabelle, anche usando la Service Role Key.

## 🎯 Soluzione

### Applica IMMEDIATAMENTE questa migration

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard/project/myrhdfglwnosaukymzdi
2. Clicca su **SQL Editor** nella sidebar sinistra
3. Clicca su **New Query**
4. Copia e incolla il contenuto di `010_grant_schema_permissions.sql` oppure esegui direttamente:

```sql
-- Grant usage permission on the public schema
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant all privileges on all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant all privileges on all existing sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Make these privileges apply to all future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
```

5. Clicca su **Run** (o premi `Ctrl+Enter`)

### ✅ Verifica

Dopo l'esecuzione, verifica che i permessi siano stati assegnati:

```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'service_role'
LIMIT 20;
```

Dovresti vedere molte righe con `service_role` e vari `privilege_type` (SELECT, INSERT, UPDATE, DELETE, etc.)

## 🚀 Test

Dopo aver applicato la migration:

1. **NON serve riavviare il server** - i permessi sono lato database
2. Vai su una pagina film/serie nel browser
3. Clicca su **"Fai il Quiz"**
4. Il quiz dovrebbe generarsi correttamente!

## 📊 Log Attesi

Dopo il fix, il log del terminale dovrebbe mostrare:

```
🎯 Quiz Generation Request (Intelligent): movie #755898 for user ...
📋 Step 0: Recupero/creazione content...
✅ Dati TMDB recuperati: La guerra dei mondi
🔍 getOrCreateContent - Tentativo di recupero/creazione content: 755898 movie
📝 Content non trovato, creo nuovo...
💾 Inserimento content: {...}
✅ Nuovo content creato: [UUID]     ← QUESTO È IL SUCCESSO!
📋 Step 1: Verifica quiz disponibili...
```

## 🔍 Perché è successo?

Supabase di default **non** assegna tutti i permessi al `service_role`. Questo è intenzionale per sicurezza, ma nel nostro caso l'API `/api/quiz/generate` usa la Service Role Key per operazioni amministrative (creazione content, quiz, etc.) e **necessita** di questi permessi.

## ⚠️ Note di Sicurezza

- ✅ **Sicuro**: Il service_role è usato solo in API routes server-side
- ✅ **Sicuro**: La Service Role Key non è mai esposta al client
- ✅ **Sicuro**: RLS policies proteggono ancora gli accessi client-side (con anon key)
- ⚠️ **Importante**: Mai esporre `SUPABASE_SERVICE_ROLE_KEY` nel codice frontend

## 📦 Dipendenze

Questa migration può essere applicata in qualsiasi momento, non ha dipendenze da altre migrations.

## 🔄 Rollback

Se necessario (molto improbabile), rimuovi i permessi con:

```sql
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM service_role;
REVOKE USAGE ON SCHEMA public FROM service_role;
```

⚠️ **Attenzione**: Dopo il rollback, il sistema di quiz non funzionerà più!
