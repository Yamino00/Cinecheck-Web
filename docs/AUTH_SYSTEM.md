# 🎬 Sistema di Autenticazione Cinecheck

## 📋 Panoramica

Il sistema di autenticazione di Cinecheck è completamente integrato con **Supabase Auth** e offre un'esperienza utente moderna, animata e interattiva.

## ✨ Caratteristiche

### 🎨 Design Interattivo
- **Animazioni fluide** con Framer Motion
- **Transizioni dinamiche** tra login e registrazione
- **Feedback visivo** in tempo reale (errori, successo, caricamento)
- **Effetti hover** e micro-interazioni
- **Sfondo animato** con particelle e gradienti
- **Toggle password** per visibilità

### 🔒 Sicurezza
- Autenticazione tramite **Supabase Auth**
- **Password sicure** (gestite da Supabase)
- **Email verification** per nuove registrazioni
- **Middleware** per protezione delle route
- **Session management** automatico

### 🚀 Funzionalità

#### Login (`/auth`)
- Email e password
- Validazione in tempo reale
- Feedback degli errori
- Redirect automatico dopo il login
- Link "Password dimenticata?"

#### Registrazione (`/auth`)
- Username, email e password
- Validazione campi
- Creazione profilo utente
- Email di conferma
- Redirect a pagina di conferma

#### Profilo Protetto (`/profile`)
- Accessibile solo agli utenti autenticati
- Informazioni account
- Statistiche utente
- Logout

## 📁 Struttura File

```
web/src/
├── app/
│   ├── auth/
│   │   ├── page.tsx              # Pagina login/registrazione
│   │   ├── layout.tsx            # Layout auth
│   │   └── confirm/
│   │       └── page.tsx          # Conferma email
│   ├── profile/
│   │   └── page.tsx              # Profilo utente (protetto)
│   └── layout.tsx                # Layout principale con Navigation
├── components/
│   ├── Navigation.tsx            # Barra di navigazione
│   └── ui/
│       ├── Button.tsx            # Button component
│       ├── Card.tsx              # Card component
│       ├── Input.tsx             # Input component
│       └── Label.tsx             # Label component
├── hooks/
│   └── useAuth.ts                # Hook personalizzato per auth
└── middleware.ts                 # Protezione route
```

## 🛠️ Tecnologie Utilizzate

- **Next.js 14** (App Router)
- **Supabase Auth** (Backend autenticazione)
- **Framer Motion** (Animazioni)
- **Tailwind CSS** (Styling)
- **TypeScript** (Type safety)
- **Heroicons** (Icone)

## 🎯 Come Funziona

### 1. Flusso di Registrazione

```typescript
User compila form → Submit → Supabase.signUp() → 
Email di conferma → User conferma → Profilo creato
```

### 2. Flusso di Login

```typescript
User compila form → Submit → Supabase.signInWithPassword() → 
Session creata → Redirect a home
```

### 3. Protezione Route

Il **middleware** (`middleware.ts`) intercetta le richieste e:
- Verifica la sessione con Supabase
- Reindirizza a `/auth` se non autenticato e prova ad accedere a route protette
- Reindirizza a `/` se già autenticato e prova ad accedere a `/auth`

### 4. Hook useAuth

```typescript
const { user, loading, signOut, isAuthenticated } = useAuth()
```

Fornisce:
- `user`: Dati utente corrente
- `loading`: Stato di caricamento
- `signOut`: Funzione per logout
- `isAuthenticated`: Booleano per stato auth

## 🎨 Componenti UI

### Button
```tsx
<Button variant="premium" size="lg">
  Clicca qui
</Button>
```

Varianti: `default`, `premium`, `destructive`, `outline`, `ghost`, `link`

### Card
```tsx
<Card variant="glass">
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
  </CardHeader>
  <CardContent>Contenuto</CardContent>
</Card>
```

Varianti: `default`, `glass`, `interactive`

### Input
```tsx
<Input 
  type="email" 
  placeholder="email@esempio.com"
  className="pl-10"  // Per icone interne
/>
```

## 🔧 Configurazione

### Variabili d'Ambiente

Assicurati di avere nel file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Supabase

Il database deve avere la tabella `profiles` creata tramite la migration `001_initial_schema.sql`.

## 🚀 Utilizzo

### Avviare il server di sviluppo

```bash
npm run dev -w web
```

### Testare l'autenticazione

1. Vai su `http://localhost:3000/auth`
2. Registra un nuovo account
3. Controlla la tua email per la conferma
4. Torna all'app e accedi
5. Visita `/profile` per vedere il tuo profilo

## 🎭 Animazioni

Le animazioni sono gestite da **Framer Motion**:

### Transizione Login/Registrazione
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={isLogin ? 'login' : 'register'}
    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
  >
```

### Feedback Visivo
```tsx
<motion.div
  initial={{ opacity: 0, y: -10, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -10, scale: 0.9 }}
>
```

### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

## 📱 Responsive

Il design è completamente responsive:
- **Desktop**: Navigazione completa
- **Mobile**: Menu hamburger con animazioni

## 🔐 Sicurezza

### Best Practices Implementate

1. ✅ Password nascoste di default (con toggle)
2. ✅ Validazione lato client e server
3. ✅ Email verification obbligatoria
4. ✅ Session management sicuro
5. ✅ Middleware per protezione route
6. ✅ HTTPS obbligatorio (in produzione)
7. ✅ Token JWT gestiti da Supabase

## 🎨 Personalizzazione

### Colori del Tema

I colori sono configurati in `tailwind.config.js`:

```javascript
colors: {
  primary: { ... },    // Cinema Red
  accent: { ... },     // Gold Awards
  neon: {              // Neon accents
    pink: '#ff0080',
    purple: '#9333ea',
    // ...
  }
}
```

### Animazioni Custom

Puoi aggiungere nuove animazioni in `tailwind.config.js`:

```javascript
animation: {
  'custom-name': 'keyframe-name duration ease-function',
}
keyframes: {
  'keyframe-name': {
    '0%': { /* styles */ },
    '100%': { /* styles */ },
  }
}
```

## 🐛 Troubleshooting

### La sessione non persiste
- Verifica che i cookies siano abilitati
- Controlla le variabili d'ambiente

### Email di conferma non arriva
- Controlla la configurazione SMTP in Supabase
- Verifica la cartella spam

### Redirect loop
- Pulisci i cookies
- Verifica la logica nel middleware

## 📚 Risorse

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎉 Prossimi Passi

- [ ] Reset password
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] Captcha per bot protection

---

**Creato con ❤️ per Cinecheck**
