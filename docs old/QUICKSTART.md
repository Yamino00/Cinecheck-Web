# 🎬 Quick Start - Sistema di Autenticazione Cinecheck

## ⚡ Setup Rapido (5 minuti)

### 1. Prerequisiti
```bash
# Verifica Node.js (>= 18)
node --version

# Verifica npm
npm --version
```

### 2. Installa Dipendenze
```bash
# Dalla root del progetto
npm install
```

### 3. Configura Supabase

**Crea file `.env.local` in `/web`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Ottieni le credenziali:**
1. Vai su [supabase.com](https://supabase.com)
2. Apri il tuo progetto
3. Settings → API
4. Copia URL e anon key

### 4. Applica Migrations

**Nel dashboard Supabase:**
1. Vai su SQL Editor
2. Copia il contenuto di `supabase/migrations/001_initial_schema.sql`
3. Esegui la query
4. Ripeti con `002_rls_policies.sql`

**Oppure via CLI:**
```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link progetto
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 5. Avvia il Server
```bash
npm run dev -w web
```

### 6. Apri nel Browser
```
http://localhost:3000
```

---

## 🎯 Test Veloce

### Registrazione
1. Vai su `/auth`
2. Clicca "Registrati"
3. Compila:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
4. Submit ✅

### Login
1. Usa le credenziali sopra
2. Dovresti vedere la home page
3. Navigation mostra "Profilo" e "Logout"

### Profilo
1. Vai su `/profile`
2. Vedi le tue informazioni
3. Clicca "Logout"

---

## 🐛 Problemi Comuni

### "Cannot find module '@shared/...'"
```bash
# Reinstalla workspace
npm install
```

### "Supabase connection failed"
```bash
# Verifica .env.local
cat web/.env.local

# Controlla che le variabili siano corrette
```

### "Migration failed"
```bash
# Verifica che le tabelle non esistano già
# Drop le tabelle e riprova
```

### Port 3000 già in uso
```bash
# Cambia porta
PORT=3001 npm run dev -w web
```

---

## 📱 Features Overview

| Feature | Descrizione | Status |
|---------|-------------|--------|
| 🔐 Login | Email + Password | ✅ |
| 📝 Registrazione | Username + Email + Password | ✅ |
| 📧 Email Verification | Link di conferma | ✅ |
| 🚪 Logout | Termina sessione | ✅ |
| 🛡️ Route Protection | Middleware | ✅ |
| 👤 Profilo | Pagina utente | ✅ |
| 📱 Responsive | Mobile + Desktop | ✅ |
| ✨ Animazioni | Framer Motion | ✅ |
| 🎨 UI Components | Card, Button, Input | ✅ |
| 🧭 Navigation | Con menu mobile | ✅ |

---

## 🎨 UI Preview

### Login/Registrazione (`/auth`)
- Sfondo animato con particelle
- Form unificato con toggle
- Animazioni fluide
- Feedback in tempo reale
- Glass morphism design

### Profilo (`/profile`)
- Informazioni account
- Statistiche utente
- Button logout
- Layout responsive

### Navigation
- Logo animato
- Menu links
- Button CTA
- Hamburger menu (mobile)

---

## 📚 Risorse

| Documento | Descrizione |
|-----------|-------------|
| `AUTH_SYSTEM.md` | Documentazione completa |
| `TESTING_AUTH.md` | Guida testing |
| `AUTH_IMPLEMENTATION_SUMMARY.md` | Riepilogo implementazione |

---

## 🔧 Comandi Utili

```bash
# Dev mode
npm run dev -w web

# Build production
npm run build -w web

# Start production
npm run start -w web

# Type check
npm run type-check -w web

# Lint
npm run lint -w web
```

---

## ✅ Checklist Pre-Production

- [ ] Variabili ambiente configurate
- [ ] Migrations applicate
- [ ] Email SMTP configurato (Supabase)
- [ ] RLS policies abilitate
- [ ] Test su browser diversi
- [ ] Test su mobile
- [ ] Performance check
- [ ] Security audit
- [ ] Backup database

---

## 🚀 Deploy

### Vercel (Raccomandato)
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel

# Configura variabili ambiente nel dashboard
```

### Altre Piattaforme
- **Netlify**: Supporto Next.js
- **Railway**: Deploy automatico
- **DigitalOcean App Platform**: Container support

---

## 💡 Tips

### Performance
- Usa immagini ottimizzate (Next.js Image)
- Abilita caching (Vercel Edge)
- Monitor con Web Vitals

### Sicurezza
- Abilita HTTPS in produzione
- Configura CORS su Supabase
- Rate limiting su API

### UX
- Test su diversi browser
- Verifica accessibilità
- Ottimizza per SEO

---

## 📞 Supporto

**Problemi?**
1. Controlla console browser (F12)
2. Verifica logs server
3. Consulta documentazione Supabase
4. Leggi `TESTING_AUTH.md`

---

**🎉 Tutto pronto! Buon sviluppo!**
