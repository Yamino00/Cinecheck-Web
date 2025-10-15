# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Cinecheck** is a social platform for verified movie and TV series reviews. Users must pass AI-generated quizzes about content to unlock the ability to write verified reviews.

**Tech Stack:**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **APIs**: TMDB (The Movie Database), Google Gemini AI
- **Deployment**: Vercel with Analytics and Speed Insights
- **State Management**: React Query + Zustand

## Common Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm run test:gemini    # Test Gemini AI integration
npm run test:quiz-api  # Test quiz API endpoints
```

## Architecture

### Database Schema
The application uses Supabase PostgreSQL with 15+ tables including:
- `profiles` - User profiles with reliability scores
- `contents` - Movies/TV series metadata cache
- `reviews` - User reviews with verification status
- `quiz_questions` - AI-generated quiz questions
- `quiz_attempts` - User quiz attempts and scores
- `watchlists`, `lists`, `achievements` - User activity tracking

Row Level Security (RLS) policies enforce access control at the database level.

### API Routes Structure
```
src/app/api/
├── quiz/
│   ├── generate/    # Generate quiz with Gemini AI
│   ├── start/       # Start quiz attempt
│   └── submit/      # Submit answers and calculate score
└── [future endpoints]
```

### Quiz System Logic (Intelligent System)
- **10 questions per quiz**: 5 easy (5pts), 4 medium (10pts), 1 hard (15pts)
- **Total points**: 80 maximum
- **Pass threshold**: 50 points (62.5%)
- **Timer**: 30 seconds per question
- **Smart Reuse**: Quiz are shared between users, generated only when needed
- **No Duplicates**: Users can never retake the same quiz twice
- **Tracking**: `user_quiz_completions` table tracks which quizzes each user has completed
- **Entity-Based**: Each quiz is a separate entity that can be reused across multiple users
- Questions are generated using Google Gemini AI (gemini-2.0-flash model)

### Page Routes
```
/                    # Homepage
/movie/[id]         # Movie detail page
/series/[id]        # TV series detail page
/profile/[username] # User profile
/search            # Search results
/auth/callback     # OAuth callback handler
```

### Component Organization
```
src/
├── app/            # Next.js app router pages
├── components/     # Reusable components
│   ├── Quiz*       # Quiz system components
│   ├── ui/         # Base UI components
│   └── [feature]/  # Feature-specific components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and integrations
├── services/       # External API services (TMDB)
└── types/          # TypeScript type definitions
```

## Environment Variables

Required environment variables (create `.env.local`):
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://myrhdfglwnosaukymzdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cmhkZmdsd25vc2F1a3ltemRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDE3MjcsImV4cCI6MjA3NDcxNzcyN30.zNvF-xfNKLblA3SAtU5rGqazPEw_OeA6jiTv7iHPZZk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cmhkZmdsd25vc2F1a3ltemRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0MTcyNywiZXhwIjoyMDc0NzE3NzI3fQ.PilgEimYhynRLhxSHzwr-AIm9BnmhqtIa2RnEhZOq5M

# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=ff53bba635f14c9cb22fcf332fb3ae53
NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZjUzYmJhNjM1ZjE0YzljYjIyZmNmMzMyZmIzYWU1MyIsIm5iZiI6MTc1ODkxNjc0NC45NDgsInN1YiI6IjY4ZDZmMDg4ZmMxODE0M2M0MGI5OTJjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MSpf3pfX-0YVeWDc83esGu-o66CNRRn9kBrf6IrC-oc

# App Configuration
NEXT_PUBLIC_APP_URL=https://cinecheck-web.vercel.app
NEXT_PUBLIC_APP_NAME=Cinecheck
NEXT_PUBLIC_APP_DESCRIPTION=La piattaforma sociale rivoluzionaria per recensioni cinematografiche autentiche
```

## Key Services

### TMDB Integration (`src/services/tmdb.ts`)
- `getMovieDetails()` - Fetch movie with full metadata
- `getSeriesDetails()` - Fetch TV series with seasons
- `getMovieComplete()` - Movie with credits, videos, images
- `getSeriesComplete()` - Series with all append_to_response data
- `searchMulti()` - Search movies, series, and people
- `getTrending()` - Get trending content by time window

### Supabase Helpers (`src/lib/supabase.ts`)
- Authentication: `signUp()`, `signIn()`, `signInWithGoogle()`
- Profile management: `getProfile()`, `updateProfile()`
- Real-time subscriptions for reviews, notifications, activities
- Storage helpers for avatars and banners

### Gemini AI (`src/lib/gemini.ts`)
- Quiz question generation from TMDB data
- Configurable difficulty distribution
- JSON schema validation for responses

## Development Workflow

### Feature Implementation Pattern
1. Check existing database schema in `supabase/migrations/`
2. Use TypeScript types from `src/types/`
3. Follow existing component patterns (especially for detail pages)
4. Implement loading and error states
5. Use React Query for data fetching with proper cache keys
6. Ensure responsive design with Tailwind breakpoints

### Adding New Features
- Movie/Series pages follow similar structure - check `src/app/movie/[id]/` for reference
- Quiz components are in `src/components/Quiz*`
- Use `useAuth` hook for authentication state
- TMDB data should be cached in `contents` table when possible

## Current Development Status

### Completed Features ✅
- Authentication system (email/password + Google OAuth)
- Movie and Series detail pages
- Quiz system with Gemini AI
- Basic search functionality
- User profiles (base structure)
- Database schema with RLS policies

### In Progress 🔄
- Review system (form, display, interactions)
- Enhanced search with filters
- User social features (follow, activity feed)
- Watchlist and custom lists

### Planned 📋
- Gamification (achievements, leaderboards)
- Recommendation engine
- Admin panel
- PWA support

## Testing Approach

The project uses manual testing with documented test plans:
- See `TEST_QUIZ_UI.md` for quiz system test checklist
- Database changes can be verified in Supabase dashboard
- Use React Query DevTools in development for cache inspection

## Build and Deployment

```bash
# Local build test
npm run build
npm run start

# Vercel deployment (automatic on push to main)
git push origin main
```

The project uses Vercel's build configuration in `vercel.json` and standalone Next.js output mode for optimized deployments.

## Important Notes

- TypeScript strict mode is enabled - fix type errors before committing
- ESLint must pass for successful builds
- Images are optimized with Next.js Image component and sharp
- Remote images from TMDB, Supabase Storage, and YouTube are configured in `next.config.js`
- The project uses Tailwind CSS - avoid inline styles and use utility classes
- Follow existing patterns for consistency (check similar components first)