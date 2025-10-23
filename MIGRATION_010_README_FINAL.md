# Migration 010: Grant BYPASSRLS to Service Role - SOLUZIONE UFFICIALE ✅

## ⚠️ Problema Critico

Errore `42501: permission denied for schema public` blocca completamente il sistema di quiz.

**Root Cause**: Il role PostgreSQL `service_role` non ha il privilegio `BYPASSRLS` necessario per bypassare le policy RLS.

## 🎯 Soluzione Ufficiale Supabase

Secondo la [documentazione ufficiale Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), il modo corretto per permettere a un role di bypassare RLS è:

```sql
ALTER ROLE service_role WITH BYPASSRLS;
```

Questo è **il metodo raccomandato** dalla documentazione ufficiale per roles amministrativi che devono operare senza restrizioni RLS.

### Perché questa soluzione?

1. **Ufficiale**: Metodo documentato in Supabase RLS docs
2. **Semplice**: Un solo comando invece di grant multipli
3. **Completo**: Bypassa tutte le RLS policies automaticamente
4. **Sicuro**: Il service_role è usato solo server-side (mai esposto al client)

## 🚀 Come Applicare (1 solo comando!)

### Via Supabase Dashboard SQL Editor

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard/project/myrhdfglwnosaukymzdi
2. Clicca su **SQL Editor** nella sidebar sinistra
3. Clicca su **New Query**
4. Esegui questo comando:

```sql
ALTER ROLE service_role WITH BYPASSRLS;
```

5. Clicca su **Run** (o premi `Ctrl+Enter`)

**Fatto!** È tutto qui. 🎉

## ✅ Verifica

Dopo l'esecuzione, verifica che il privilegio sia stato assegnato:

```sql
SELECT rolname, rolbypassrls
FROM pg_roles
WHERE rolname = 'service_role';
```

**Risultato atteso**:

```
rolname      | rolbypassrls
-------------|-------------
service_role | t            ← DEVE essere 't' (true)
```

## 🧪 Test

Dopo aver applicato la migration:

1. **NON serve riavviare il server** - i permessi sono lato database
2. Vai su una pagina film/serie nel browser
3. Clicca su **"Fai il Quiz"**
4. Il quiz dovrebbe generarsi correttamente! ✨

## 📊 Log Attesi

Dopo il fix, il log del terminale dovrebbe mostrare:

```
🎯 Quiz Generation Request (Intelligent): movie #755898 for user ...
📋 Step 0: Recupero/creazione content...
✅ Dati TMDB recuperati: La guerra dei mondi
🔍 getOrCreateContent - Tentativo di recupero/creazione content: 755898 movie
📝 Content non trovato, creo nuovo...
💾 Inserimento content: {...}
✅ Nuovo content creato: [UUID]     ← SUCCESSO! ✅
📋 Step 1: Verifica quiz disponibili...
```

## 🔍 Spiegazione Tecnica

### Cosa fa `ALTER ROLE ... WITH BYPASSRLS`?

- Concede al role `service_role` il privilegio di **bypassare tutte le policy RLS**
- Questo è esattamente ciò che la Service Role Key dovrebbe fare
- È il modo **ufficiale e sicuro** secondo Supabase

### Differenza con approccio precedente (GRANT)

| Metodo                     | Comandi    | Copertura                    | Status                 |
| -------------------------- | ---------- | ---------------------------- | ---------------------- |
| `GRANT ALL`                | ~5 comandi | Solo permessi schema/tabelle | ❌ Non funzionava      |
| `ALTER ROLE ... BYPASSRLS` | 1 comando  | Bypassa RLS completamente    | ✅ Soluzione ufficiale |

### Perché i GRANT non funzionavano?

I comandi `GRANT` danno permessi su **schema e tabelle**, ma **non bypassano RLS**. Anche con tutti i permessi, le policy RLS vengono ancora valutate. Il privilegio `BYPASSRLS` è specificamente progettato per questo scopo.

## ⚠️ Note di Sicurezza

- ✅ **Sicuro**: Il service_role è usato solo in API routes server-side
- ✅ **Sicuro**: La Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) non è mai esposta al client
- ✅ **Sicuro**: RLS policies proteggono ancora gli accessi client-side (con anon key)
- ⚠️ **Importante**: Mai esporre `SUPABASE_SERVICE_ROLE_KEY` nel codice frontend o variabili `NEXT_PUBLIC_*`

## 📦 Dipendenze

Questa migration può essere applicata in qualsiasi momento, non ha dipendenze da altre migrations.

## 🔄 Rollback

Se necessario (molto improbabile), rimuovi il privilegio con:

```sql
ALTER ROLE service_role WITH NOBYPASSRLS;
```

⚠️ **Attenzione**: Dopo il rollback, il sistema di quiz non funzionerà più!

## 📚 Riferimenti

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Sezione: "Alter Postgres Role to bypass Row Level Security"
- Quote dalla docs: _"This allows the specified role to bypass all Row Level Security policies, making it suitable for system-level access and administrative tasks."_
