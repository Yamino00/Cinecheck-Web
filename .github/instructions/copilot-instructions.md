# Cinecheck - AI Coding Instructions

> **🤖 Copilot Responsibilities**:
>
> 1. **Pre-Implementation**: Prima di modifiche importanti, fornisci una pianificazione sommaria dell'approccio e conferma di aver compreso correttamente la richiesta. Aspetta conferma dell'utente.
> 2. **Post-Fix Cleanup**: Dopo aver risolto un problema, rimuovi qualsiasi modifica non necessaria alla risoluzione. Mantieni solo le modifiche strettamente correlate al fix.
> 3. **Documentation**: Mantieni questo file aggiornato dopo ogni modifica significativa al progetto (nuove migration, modifiche API, cambio dipendenze, nuove feature). Documenta immediatamente: schema DB, funzioni critiche, breaking changes, e nuove convenzioni di codice.

## 📋 Quick Reference

**Progetto**: Piattaforma social per **recensioni cinematografiche verificate**  
**Unique Value**: Pass quiz → unlock recensione (anti-fake reviews, autenticità garantita)  
**Core Features**: Discovery contenuti + Quiz verification + Social reviews  
**Tech Stack**: Next.js 14 App Router + TypeScript + Supabase (PostgreSQL) + TMDB API + Gemini AI  
**Deploy**: Vercel (standalone mode)  
**DB**: PostgreSQL 17.6.1 su Supabase (ID: `myrhdfglwnosaukymzdi`, region: `eu-north-1`)

### 🎯 Priorità Sviluppo (da Piano_Sviluppo.md)

1. **Pagine Dettaglio** (Movie/Series) - Foundation per discovery ✅ FATTO
2. **Sistema Recensioni** - Core value proposition 🔄 IN CORSO
3. **Quiz Verification** - Prerequisito per recensioni ✅ FATTO
4. **Search & Discovery** - Trovare contenuti da recensire
5. **Profile & Social** - Community engagement
6. **Watchlist & Lists** - User collections

### 🚀 Comandi Rapidi

```powershell
npm run dev                    # Dev server (port 3000)
npm run test:intelligent-quiz  # Test sistema quiz
supabase gen types typescript  # Rigenera tipi DB
```

### 📁 File Critici

**Dettaglio Contenuti** (Discovery):

- `/src/app/movie/[id]/page.tsx`, `/src/app/series/[id]/page.tsx`
- `/src/services/tmdb.ts` (TMDB API integration)
- `/src/services/content.ts` (Cache layer TMDB → Supabase)

**Sistema Recensioni** (Core Feature):

- `/src/app/api/reviews/*` (API routes - DA IMPLEMENTARE)
- `/src/components/Review/*` (UI components - DA IMPLEMENTARE)

**Quiz Verification** (Prerequisito recensioni):

- `/src/app/api/quiz/generate/route.ts` (logica intelligente)
- `/src/app/api/quiz/start/route.ts`, `/src/app/api/quiz/submit/route.ts`
- `/src/lib/quiz-db.ts`, `/src/lib/gemini.ts`

**Database**:

- `/supabase/migrations/` (applicare in ordine sequenziale)
- `/src/lib/supabase.ts` (client + helpers)

**⚠️ Codice Rimosso** (Cleanup 24 Ott 2025):

- ❌ `/src/services/quiz.ts` - Service layer pre-intelligente (470 righe duplicate)
- ❌ Funzioni obsolete in `quiz-db.ts`: `getQuizByContentId()`, `getQuizByTmdbId()`, `saveQuizQuestions()`
- ❌ Cartelle vuote: `/api/quiz/intelligent/`, `/api/quiz/reviews/`, `/api/quiz/complete/`

## 🧠 Sistema Quiz Verificato (PREREQUISITO RECENSIONI)

**Scopo**: Anti-fake reviews - Solo chi passa il quiz può recensire (prova di visione)  
**Meccanica**: Pass quiz (50/80 pts) → Unlock recensione. Quiz riutilizzabili tra utenti (cost optimization).

### Tabelle Database Critiche

| Tabella                 | Scopo                         | Constraint Critico                          |
| ----------------------- | ----------------------------- | ------------------------------------------- |
| `quizzes`               | Entity quiz riutilizzabile    | `is_active = TRUE` per quiz disponibili     |
| `quiz_questions`        | Domande linkate a quiz entity | `quiz_id` FK → `quizzes.id`                 |
| `user_quiz_completions` | Tracking completamenti utente | **UNIQUE(user_id, quiz_id)** ← NO duplicati |
| `quiz_generation_logs`  | Monitoring generazioni AI     | Log per debug/analytics                     |

### Flusso API Quiz (POST /api/quiz/generate)

**Logica Decisionale Intelligente**:

1. Get/Create `content_id` da TMDB
2. Chiama `get_available_quizzes_for_user(user_id, content_id)`
3. **IF** quiz disponibili → Ritorna quiz esistente (cached + reused)
4. **ELSE IF** tutti completati → Genera nuovo (`generation_reason: 'all_quizzes_completed'`)
5. **ELSE** nessun quiz → Genera nuovo (`generation_reason: 'no_quiz_exists'`)

**Funzioni DB Critiche** (Postgres):

- `get_available_quizzes_for_user()` - Trova quiz non completati dall'utente
- `user_has_completed_all_quizzes()` - Controlla se utente ha esaurito quiz
- `update_quiz_statistics()` - Auto-aggiorna stats dopo completamento (trigger)

## ✍️ Sistema Recensioni Verificate (CORE FEATURE)

**Value Proposition**: Recensioni autentiche garantite tramite quiz verification  
**Status**: 🔄 DA IMPLEMENTARE (Priority 1)

### Workflow Recensione

1. **User** visualizza pagina dettaglio (Movie/Series) ✅
2. **User** clicca "Scrivi Recensione"
3. **System** controlla se quiz passato per quel contenuto
4. **IF NOT** → Redirect a Quiz
5. **IF PASSED** → Mostra ReviewForm
6. **User** compila:
   - Rating generale (0-10) - obbligatorio
   - Titolo recensione
   - Testo recensione (50-5000 char)
   - Tags, spoiler toggle
7. **System** salva review con `quiz_attempt_id` FK
8. **Badge** "Verified Review" visibile sulla card

### Componenti da Implementare

**API Routes** (Priority Sprint 2):

- `POST /api/reviews/create` - Crea recensione (check quiz passato)
- `GET /api/reviews/[contentId]` - Fetch recensioni contenuto
- `PATCH /api/reviews/[id]` - Update propria recensione
- `DELETE /api/reviews/[id]` - Delete propria recensione
- `POST /api/reviews/[id]/like` - Like/Unlike recensione

**UI Components**:

- `ReviewForm.tsx` - Form creazione/edit
- `ReviewCard.tsx` - Card compatta per liste
- `ReviewFull.tsx` - Vista completa recensione
- `ReviewList.tsx` - Lista con filtri (verified/all, rating, date)

### RLS Policies Critical

```sql
-- Solo se quiz passato
CREATE POLICY "Can create review if quiz passed"
ON reviews FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM quiz_attempts
    WHERE user_id = auth.uid()
    AND content_id = reviews.content_id
    AND passed = TRUE
  )
);
```

## 🗄️ Database Schema Essentials

**Tabelle Core**:

- `profiles` - Dati utente, `reliability_score` (0-100), achievements
- `contents` - Cache TMDB, **CRITICAL**: campo `cast_members` (non `cast`)
- `reviews` - Recensioni utente (richiede quiz passato)
- `quizzes`, `quiz_questions`, `quiz_attempts`, `user_quiz_completions` - Sistema quiz

**Mapping TMDB → Supabase** (IMPORTANTE):

```typescript
cast_members: tmdbData.credits?.cast; // TMDB usa 'cast', DB usa 'cast_members'
```

**RLS Policies**:

- Profiles: Read pubblico, update solo proprio
- Contents: Read pubblico, insert via `SECURITY DEFINER` function (migration 010)
- Reviews: Insert solo se quiz passato
- Quiz: Utenti vedono solo propri attempts

**⚠️ CRITICAL: SECURITY DEFINER Pattern**:

- **Problema**: service_role in Supabase non può essere modificato direttamente (reserved role)
- **Soluzione**: Funzione `get_or_create_content()` con `SECURITY DEFINER` che bypassa RLS
- **Pattern Standard Supabase**: Recommended approach per operazioni amministrative
- **Sicurezza**: Funzione controllata e validata, solo operazioni specifiche bypassano RLS

**Funzioni DB Critiche**:

```sql
-- Funzione SECURITY DEFINER per gestione contents (migration 010)
SELECT routine_name, security_type FROM information_schema.routines
WHERE routine_name = 'get_or_create_content';
-- Deve essere: security_type = 'DEFINER'

-- Funzioni sistema quiz intelligente
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%quiz%';
-- Devono esistere: get_available_quizzes_for_user, user_has_completed_all_quizzes,
-- update_quiz_statistics, trigger_update_quiz_statistics
```

## 🔐 Auth & Security

**useAuth Hook** (`/src/hooks/useAuth.ts`): Semplificato, profilo creato da trigger DB (migration 008)  
**Protected Routes**: `/profile`, `/reviews`, `/watchlist`, `/lists` (redirect → `/auth`)  
**Rate Limits** (`/src/lib/security.ts`): 5 req/min auth, 20 req/min quiz, 100 req/min general

## 🔌 API & Services

**TMDB** (`/src/services/tmdb.ts`): Rate limit 40 req/10sec, metodi `getMovie()`, `getSeries()`, `multiSearch()`  
**Content Service** (`/src/services/content.ts`): Cache TMDB → Supabase, mapping `cast` → `cast_members`  
**React Query** (`/src/lib/react-query.tsx`): Cache 5min, `QUERY_KEYS` centralizzati, auto-retry

**API Routes Pattern**:

```typescript
export async function POST(request) {
  const { param } = await request.json();
  if (!param) return NextResponse.json({ error: "Missing" }, { status: 400 });
  try {
    const result = await operation();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## � Migrations & Development

### Database Migrations (APPLICARE IN ORDINE)

**CRITICAL**: Migrations in `/supabase/migrations/` must be applied in order. The sequence is non-linear due to schema reconstruction:

**Historical Sequence (for understanding)**:

1. `001_initial_schema.sql` - Original base schema (profiles, contents, reviews, quiz_questions, quiz_attempts)
2. `002_rls_policies.sql` - Row Level Security policies for all tables
3. `003_quiz_logic_schema.sql` - Added `user_quiz_history` table and quiz grouping logic (LEGACY)
4. `004_intelligent_quiz_system.sql` - **Intelligent quiz system**: Added `quizzes` entity table, `user_quiz_completions` tracking, `get_available_quizzes_for_user()` function, `user_has_completed_all_quizzes()` function (CORE SYSTEM)
5. `005_ricostruzione_db.sql` - **COMPLETE SCHEMA REBUILD** with `DROP SCHEMA IF EXISTS public CASCADE`
   - ⚠️ **Deleted everything** including `user_quiz_completions` and quiz functions from 004
   - Created comprehensive schema with rating system, achievements, social features
   - Added `is_active` column to `quizzes` table
   - **Missing**: `user_quiz_completions` table and intelligent quiz functions
6. `006_restore_intelligent_quiz_logic.sql` - **CRITICAL FIX**: Restores intelligent quiz system features deleted by 005
   - Recreates `user_quiz_completions` table with `UNIQUE(user_id, quiz_id)` constraint
   - Restores `get_available_quizzes_for_user(p_user_id, p_content_id)` function
   - References `is_active` column from 005 schema
7. `007_complete_intelligent_quiz_functions.sql` - **FINAL COMPLETION**: Adds missing functions from 006
   - Creates `user_has_completed_all_quizzes(p_user_id, p_content_id)` function
   - Creates `update_quiz_statistics(quiz_uuid)` function
   - Creates `trigger_update_quiz_statistics()` trigger function
   - Adds trigger on `user_quiz_completions` for automatic stats updates
8. `008_auto_create_profile_trigger.sql` - **PROFILE FIX**: Auto-creates profiles on user signup
   - Creates `on_auth_user_created()` trigger function with SECURITY DEFINER
   - Trigger runs after INSERT on `auth.users` table
   - Eliminates 403 profile creation errors during signup/OAuth
9. `009_fix_contents_rls_policy.sql` - **SUPERSEDED**: Attempted RLS policy fix (migration 010 replaced this approach)
10. `010_grant_schema_permissions.sql` - **SECURITY DEFINER SOLUTION**: Final fix for content creation
    - Creates `get_or_create_content()` function with SECURITY DEFINER privilege
    - Function bypasses RLS safely for administrative content operations
    - **Why**: `service_role` is a **reserved role** in Supabase - cannot be modified with GRANT or ALTER
    - **Pattern**: Official Supabase recommendation for admin operations requiring RLS bypass
    - Includes type casting for content_type ENUM and proper column mapping

**Current Production State**:

- Migrations 001-010: ✅ Applied (quiz + security definer + profile trigger all working)
- **All critical systems operational**: Quiz generation, content caching, profile creation

**⚠️ Migration Status**: All migrations successfully applied. System fully operational.

**Key Insights for Development**:

- Migration 005 was a **complete rebuild** that inadvertently removed intelligent quiz features from 004
- Migration 006 is a **hotfix** that restores critical quiz system functionality (partially)
- Migration 007 **completes** the intelligent quiz system with missing functions
- The `user_quiz_completions` table is **essential** for preventing duplicate quiz attempts
- The `get_available_quizzes_for_user()` function is **called by** `/api/quiz/generate` route
- The `update_quiz_statistics()` function keeps quiz stats accurate automatically
- Never modify production schema directly - always create new migrations

**Schema Dependencies**:

```
user_quiz_completions table depends on:
  ├── profiles(id) - user_id FK
  ├── quizzes(id) - quiz_id FK (from 005)
  ├── contents(id) - content_id FK (from 005)
  └── quiz_attempts(id) - attempt_id FK (from 005)

get_available_quizzes_for_user() function depends on:
  ├── quizzes.is_active column (from 005)
  └── user_quiz_completions table (from 006)

user_has_completed_all_quizzes() function depends on:
  ├── quizzes table (from 005)
  └── user_quiz_completions table (from 006)

update_quiz_statistics() function depends on:
  ├── quizzes table (from 005)
  └── user_quiz_completions table (from 006)

trigger_update_quiz_statistics() depends on:
  └── update_quiz_statistics() function (from 007)
```

Apply via Supabase CLI: `supabase db reset` (local) or Supabase dashboard (production).

### Gemini AI (Quiz Generation)

**Config**: Model `gemini-2.0-flash`, temp 0.8, 10 domande (5 EASY, 4 MEDIUM, 1 HARD)  
**Log**: Tutte generazioni → `quiz_generation_logs` table  
**Prompt**: Italiano, 4 categorie, risposta multipla, con spiegazioni

## 📝 When Making Changes

1. **Review System Changes**: This is the CORE FEATURE - update this file + `/docs/Piano_Sviluppo.md`
2. **Quiz System Changes**: Update `/docs/INTELLIGENT_QUIZ_SYSTEM.md` to reflect logic changes
3. **Database Schema**: Create new migration file, never modify existing migrations
   - Naming: `00X_description.sql` with sequential numbering
   - Always test migrations on local Supabase instance first
4. **API Routes**: Log important operations for debugging (generation logs, error tracking)
5. **Types**: If Supabase schema changes, regenerate types with `supabase gen types typescript`
6. **Documentation**: Update `/docs/Piano_Sviluppo.md` when completing features from roadmap
7. **Testing**: Run `npm run test:intelligent-quiz` after quiz system changes

## 🐛 Common Issues & Solutions

### Quiz System Issues (RISOLTI)

- **Error 42501 "permission denied"**: ✅ Risolto con Migration 010 (SECURITY DEFINER function)
- **"service_role doesn't bypass RLS"**: ✅ service_role è un **reserved role** in Supabase - non modificabile
- **Solution Pattern**: Usare funzioni `SECURITY DEFINER` per operazioni amministrative (es. `get_or_create_content()`)
- **Quiz not generating**: Check `quiz_generation_logs` table per error messages
- **"No quizzes available"**: User completato tutti quiz - sistema genera nuovo
- **Duplicate quiz error**: `UNIQUE(user_id, quiz_id)` constraint previene retaking

### Profile Issues (RISOLTI)

- **"Profile not found"**: ✅ Risolto con Migration 008 (trigger auto-create on auth.users INSERT)
- **Profile not created on OAuth**: ✅ Trigger `on_auth_user_created` gestisce tutti signup types
- **RLS policies blocking profile creation**: ✅ Trigger usa SECURITY DEFINER per bypassare RLS

### TMDB API Issues

- **Rate limit exceeded**: TMDB limit is 40 req/10sec
- **Image not loading**: Use `OptimizedImage` component with automatic fallback
- **Solution**: Implement exponential backoff for repeated requests

### Supabase Issues

- **Realtime not working**: Check connection in Network tab, verify RLS policies
- **RLS policy blocking**: Use Supabase service role key for admin operations only
- **Solution**: Test RLS policies in Supabase SQL editor with `auth.uid()`

### Build Issues

- **Type errors**: Run `npm run type-check` to identify TypeScript issues
- **Supabase types outdated**: Regenerate with `supabase gen types typescript`
- **Solution**: Always regenerate types after schema migrations

## 📚 Key Documentation

- `/docs/INTELLIGENT_QUIZ_SYSTEM.md` - Complete quiz system architecture
- `/docs/Piano_Sviluppo.md` - Development roadmap and feature status
- `/docs/QUIZ_SYSTEM_BEHAVIOR.md` - Quiz behavior specifications
