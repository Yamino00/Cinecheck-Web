# Cinecheck - AI Coding Instructions

## 🎬 Project Overview

Cinecheck is a social platform for **verified movie reviews** using an intelligent quiz system. Users must pass a quiz about content before reviewing it, ensuring authentic opinions.

**Stack**: Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, Framer Motion, Google Gemini AI

## 🏗️ Architecture Principles

### Intelligent Quiz System (Core Feature)

The quiz system uses **entity-based quiz reuse** to minimize AI generation costs:

1. **Quiz Entities**: Each quiz is a reusable entity (`quizzes` table) with linked questions (`quiz_questions.quiz_id`)
2. **Smart Retrieval**: `get_available_quizzes_for_user()` returns quizzes the user hasn't completed
3. **Generation Logic**: Only generate new quizzes when none exist OR user completed all available ones
4. **Completion Tracking**: `user_quiz_completions` with `UNIQUE(user_id, quiz_id)` prevents duplicate attempts

**Key Files**:

- `/src/app/api/quiz/generate/route.ts` - Smart quiz generation/retrieval flow
- `/src/lib/quiz-db.ts` - Database helpers for quiz entity management
- `/src/lib/gemini.ts` - Google Gemini AI integration for quiz generation
- `/docs/INTELLIGENT_QUIZ_SYSTEM.md` - Complete system documentation

### Database Architecture

- **Content Normalization**: TMDB data cached in `contents` table (movies/series/anime)
- **Type Safety**: TypeScript types auto-generated from Supabase schema in `/src/types/database.ts`
- **RLS Policies**: Row-level security enforced - see `/supabase/migrations/002_rls_policies.sql`
- **Database Functions**: Use Postgres functions for complex queries (e.g., `get_available_quizzes_for_user`)

### Authentication Flow

- Supabase Auth with email confirmation required (`confirm_signup.html` template)
- Profile auto-creation in `useAuth` hook if missing after OAuth login
- Protected routes via `middleware.ts` (redirects `/profile`, `/reviews`, etc.)
- Auth pages bypass `AppLayout` component (see `/src/components/layout/AppLayout.tsx`)

### API Integration Patterns

- **TMDB Service** (`/src/services/tmdb.ts`): Fetch movie/series data from The Movie Database
- **Content Service** (`/src/services/content.ts`): Business logic layer above TMDB
- **React Query**: All data fetching uses TanStack Query with custom hooks (`/src/lib/react-query.tsx`)
- **Caching Strategy**: React Query with 5-minute stale time for TMDB data

## 🛠️ Development Workflows

### Running the Project

```powershell
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run type-check       # TypeScript validation
npm run lint             # ESLint check
```

### Testing Quiz System

```powershell
npm run test:intelligent-quiz  # Test intelligent quiz generation flow
tsx scripts/test-gemini-via-api.ts  # Test Gemini API directly
```

### Database Migrations

Migrations in `/supabase/migrations/` must be applied in order:

- `001_initial_schema.sql` - Base tables (profiles, contents, reviews)
- `003_quiz_logic_schema.sql` - Quiz attempts and questions
- `004_intelligent_quiz_system.sql` - Quiz entities and completion tracking

Apply via Supabase CLI or dashboard. Never modify production schema directly.

### Working with Gemini AI

- **Model**: `gemini-2.0-flash` (fast, cost-effective)
- **Configuration**: Temperature 0.8 for creative but consistent quiz questions
- **Prompt Engineering**: See `generateQuizQuestions()` in `/src/lib/gemini.ts` - includes difficulty distribution, category requirements, and Italian language requirement
- **Error Handling**: Always log to `quiz_generation_logs` table for debugging

## 📋 Code Conventions

### API Routes Pattern

```typescript
// Always validate input at the start
const { user_id, tmdb_id, content_type } = await request.json();
if (!user_id || !tmdb_id) {
  return NextResponse.json({ error: "Missing params" }, { status: 400 });
}

// Use try-catch for all database/external API calls
try {
  const result = await someOperation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

### Component Structure

- **Client Components**: Use `"use client"` for hooks/interactivity
- **Server Components**: Default - fetch data directly, no client-side state
- **Layout Pattern**: App uses persistent `AppLayout` with collapsible sidebar (desktop) and drawer (mobile)
- **Animations**: Framer Motion for page transitions, GSAP for complex scroll animations

### Database Query Patterns

```typescript
// Always use typed Supabase client
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("field", value)
  .single(); // or .maybeSingle() to avoid errors

if (error) throw error; // Let calling code handle errors
return data;
```

### Security

- **Rate Limiting**: Configured in `/src/lib/security.ts` per API route
- **CSP Headers**: Applied via `securityMiddleware()` in middleware
- **Supabase RLS**: Always enforce - use service role key only for admin operations
- **Input Validation**: Validate all user input, sanitize before database operations

## 🎨 UI/UX Patterns

### Theme & Colors

- **Dark Theme**: Primary background `#0a0a0a`, cards `#141414`
- **Accent Colors**: Cinema gold `#FFD700` for CTAs, red `#E50914` for error/important
- **Typography**: Inter font, responsive sizing with Tailwind scale

### Component Library

- Base UI in `/src/components/ui/` - Button, Card, Input, Toast, etc.
- Use `cn()` utility from `/src/lib/utils.ts` for conditional classes
- Icons: Heroicons (`@heroicons/react`) and Lucide React

### Animation Guidelines

- Page transitions: Use `PageTransition` wrapper (already in layout)
- Scroll reveals: `useScrollReveal()` hook for intersection observer animations
- Magnetic buttons: `useMagneticHover()` for interactive hover effects
- Performance: Prefer CSS transitions over JS animations when possible

## 🚀 Deployment

- **Platform**: Vercel (framework auto-detected via `vercel.json`)
- **Environment Variables**: Set in Vercel dashboard - see `.env.example` for required vars
- **Analytics**: Vercel Analytics and Speed Insights already integrated
- **PWA Support**: Manifest and service worker configuration in `/public` (partial implementation)

## 📝 When Making Changes

1. **Quiz System Changes**: Update `/docs/INTELLIGENT_QUIZ_SYSTEM.md` to reflect logic changes
2. **Database Schema**: Create new migration file, never modify existing migrations
3. **API Routes**: Log important operations for debugging (generation logs, error tracking)
4. **Types**: If Supabase schema changes, regenerate types with `supabase gen types typescript`
5. **Documentation**: Update `/docs/Piano_Sviluppo.md` when completing features from roadmap

## 🐛 Common Issues

- **"Profile not found"**: `useAuth` hook handles auto-creation, but RLS policies must allow inserts
- **Quiz not generating**: Check `quiz_generation_logs` table for error messages
- **TMDB API errors**: Rate limit is 40 req/10sec - implement exponential backoff if needed
- **Supabase realtime issues**: Check connection in Network tab, verify RLS policies

## 📚 Key Documentation

- `/docs/INTELLIGENT_QUIZ_SYSTEM.md` - Complete quiz system architecture
- `/docs/Piano_Sviluppo.md` - Development roadmap and feature status
- `/docs/QUIZ_SYSTEM_BEHAVIOR.md` - Quiz behavior specifications
