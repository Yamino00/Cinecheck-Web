# Google OAuth Implementation - Quick Reference

## ✅ Cosa è stato implementato

### Frontend (Client-Side)

1. **Pulsante Google Sign In** (`/src/app/auth/page.tsx`)

   - Design con logo Google ufficiale
   - Loading state durante l'autenticazione
   - Gestione errori

2. **Callback Route** (`/src/app/auth/callback/page.tsx`)

   - Gestisce il redirect dopo login Google
   - Crea automaticamente il profilo utente
   - Supporta avatar e nome completo da Google
   - Stati: loading, success, error con animazioni

3. **Helper Functions** (`/src/lib/supabase.ts`)
   - `signInWithGoogle()`: Wrapper per OAuth Google
   - Configurazione automatica redirect URLs

### Backend (Database)

- **Creazione automatica profilo** per utenti OAuth
- **Supporto avatar_url** da account Google
- **Gestione metadata** (full_name, avatar_url)

### Safety Net

- `useAuth` hook verifica e crea profilo al login se mancante
- Supporto per provider multipli (email/password + OAuth)

## 🎨 Design Features

### Pulsante Google

```tsx
- Logo Google ufficiale (4 colori)
- Background bianco (#FFFFFF)
- Hover state (gray-50)
- Loading animation con spinner
- Disabled state durante auth
```

### Callback Page

```tsx
- Animazioni Framer Motion
- 3 stati visuali:
  ✓ Loading: Spinner rotante
  ✓ Success: Checkmark verde con bounce
  ✓ Error: X rossa con shake effect
```

## 🔑 Variabili Chiave

### OAuth Flow

```javascript
provider: 'google'
redirectTo: `${window.location.origin}/auth/callback`
queryParams: {
  access_type: 'offline',  // Per refresh token
  prompt: 'consent'        // Mostra sempre schermata consenso
}
```

### Profilo Creation

```javascript
{
  id: user.id,
  username: email.split('@')[0] || full_name.toLowerCase(),
  display_name: user_metadata.full_name || username,
  avatar_url: user_metadata.avatar_url || null,
  // ... altri campi default
}
```

## 🚀 Testing Checklist

### Locale (Development)

- [ ] `npm run dev`
- [ ] Vai su http://localhost:3000/auth
- [ ] Clicca "Continua con Google"
- [ ] Autorizza app Google
- [ ] Verifica redirect a /auth/callback
- [ ] Verifica redirect a home (/)
- [ ] Controlla profilo creato in Supabase

### Produzione (Vercel)

- [ ] Deploy su Vercel
- [ ] Vai su https://cinecheck-web.vercel.app/auth
- [ ] Test completo login Google
- [ ] Verifica profilo in Supabase Dashboard

## 📝 Configurazione Richiesta

### 1. Google Cloud Console

```
✓ Crea progetto "Cinecheck"
✓ Abilita Google+ API
✓ Configura OAuth Consent Screen
✓ Crea OAuth 2.0 Client ID
✓ Aggiungi Authorized redirect URIs:
  - https://myrhdfglwnosaukymzdi.supabase.co/auth/v1/callback
  - http://localhost:54321/auth/v1/callback
```

### 2. Supabase Dashboard

```
✓ Authentication → Providers → Google
✓ Inserisci Client ID e Client Secret
✓ Enable Sign in with Google: ON
✓ Save

✓ Authentication → URL Configuration
✓ Site URL: https://cinecheck-web.vercel.app
✓ Redirect URLs:
  - https://cinecheck-web.vercel.app/auth/callback
  - http://localhost:3000/auth/callback
```

### 3. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel (Production)
NEXT_PUBLIC_APP_URL=https://cinecheck-web.vercel.app
```

## 🔄 User Flow

```
1. User clicks "Continua con Google" button
   ↓
2. Redirect to Google OAuth consent screen
   ↓
3. User authorizes Cinecheck app
   ↓
4. Google redirects to: myrhdfglwnosaukymzdi.supabase.co/auth/v1/callback
   ↓
5. Supabase processes OAuth and redirects to: /auth/callback
   ↓
6. /auth/callback:
   - Gets session from Supabase
   - Checks if profile exists
   - Creates profile if missing (with avatar + name from Google)
   - Shows success animation
   ↓
7. Redirect to home (/)
```

## 📊 Data Structure

### User Metadata (da Google)

```json
{
  "email": "user@gmail.com",
  "full_name": "Mario Rossi",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "provider": "google",
  "provider_id": "1234567890"
}
```

### Profile Created

```json
{
  "id": "uuid",
  "username": "mario.rossi" | "user",
  "display_name": "Mario Rossi" | "user",
  "avatar_url": "https://lh3.googleusercontent.com/..." | null,
  "reliability_score": 0,
  "total_reviews": 0,
  "verified_reviews": 0,
  "quiz_success_rate": 0
}
```

## 🎯 Benefits

### User Experience

- ✓ Login con 1 click (no password da ricordare)
- ✓ Avatar automatico da Google
- ✓ Nome reale invece di username generato
- ✓ Esperienza fluida e veloce

### Security

- ✓ OAuth 2.0 standard
- ✓ Nessuna password salvata
- ✓ Token gestiti da Supabase
- ✓ Refresh token automatico

### Developer

- ✓ Meno codice per gestire auth
- ✓ No email verification flow needed
- ✓ Supabase gestisce tutto il backend
- ✓ Facile aggiungere altri provider

## 🔍 Debug Tips

### Console Logs

```javascript
// In /auth/callback/page.tsx
console.log("Session:", session);
console.log("User metadata:", session.user.user_metadata);
console.log("Profile created:", profile);
```

### Network Tab

```
Verifica chiamate:
1. POST /auth/v1/token (Supabase)
2. GET /auth/callback (Next.js)
3. POST /rest/v1/profiles (se crea profilo)
```

### Supabase Dashboard

```
Authentication → Users
- Verifica nuovo utente con provider: google
- Controlla user_metadata per avatar e nome

Table Editor → profiles
- Verifica profilo creato con avatar_url
```

## 📚 Files Modified/Created

```
✓ src/app/auth/page.tsx (modified)
  - Aggiunto pulsante Google
  - Aggiunto handleGoogleSignIn()
  - Aggiunto loading state

✓ src/app/auth/callback/page.tsx (created)
  - Gestisce OAuth callback
  - Crea profilo automaticamente
  - Animazioni success/error

✓ src/lib/supabase.ts (modified)
  - Aggiunto signInWithGoogle() helper

✓ docs/GOOGLE_OAUTH_SETUP.md (created)
  - Guida completa configurazione
```

## 🚀 Next Steps

Opzionali per migliorare ulteriormente:

- [ ] Aggiungere GitHub OAuth
- [ ] Aggiungere Facebook OAuth
- [ ] Account linking (associa email a Google)
- [ ] Visualizza provider usato in /profile
- [ ] Analytics: track login methods
- [ ] Opzione "Disconnetti Google Account"

---

**Implementation Complete! ✨**
