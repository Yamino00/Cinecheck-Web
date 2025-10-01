# ⚡ Quick Reference - Deploy Vercel

## 🚀 Deploy in 5 Minuti

### 1. Push su GitHub
```bash
git add .
git commit -m "Ready for deploy"
git push origin main
```

### 2. Importa su Vercel
- Vai su [vercel.com](https://vercel.com)
- New Project → Import `Cinecheck`
- **Root Directory**: `web` ⚠️
- Deploy!

### 3. Variabili d'Ambiente
Aggiungi su Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://myrhdfglwnosaukymzdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from .env.local]
NEXT_PUBLIC_TMDB_API_KEY=ff53bba635f14c9cb22fcf332fb3ae53
NEXT_PUBLIC_APP_NAME=Cinecheck
```

### 4. Configura Supabase
- Supabase → Settings → Authentication
- Site URL: `https://tuo-progetto.vercel.app`
- Redirect URLs: `https://tuo-progetto.vercel.app/*`

### 5. Test
- Visita il sito
- Registra utente
- Verifica email
- Login
- ✅ Done!

---

## 🔧 Comandi Essenziali

### Deploy Manuale
```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --cwd web
```

### Build Locale
```bash
cd web
npm run build
npm start  # Test build locale
```

### Verifica Errori
```bash
npm run lint
npm run type-check
```

---

## 🐛 Fix Rapidi

### Errore: "Application error"
→ Controlla Environment Variables su Vercel

### Email non arriva
→ Verifica Redirect URLs in Supabase

### Redirect loop
→ Pulisci cookies, prova incognito

### Build fallisce
→ Controlla logs su Vercel Dashboard

---

## 📊 URLs Importanti

| Servizio | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| GitHub Repo | https://github.com/TUO_USERNAME/Cinecheck |
| Sito Produzione | https://cinecheck-xxx.vercel.app |

---

## ✅ Checklist Deploy

- [ ] Code pushato su GitHub
- [ ] Progetto importato su Vercel
- [ ] Root Directory = `web`
- [ ] Environment Variables configurate
- [ ] Supabase URLs aggiornate
- [ ] Test registrazione
- [ ] Test login
- [ ] Test route protette
- [ ] No errori in console

---

**🎉 Deploy Completato!**
