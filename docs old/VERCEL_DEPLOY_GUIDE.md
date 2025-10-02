# 🚀 Guida Completa Deploy su Vercel

## 📋 Prerequisiti

- ✅ Account GitHub
- ✅ Account Vercel (gratuito)
- ✅ Progetto pushato su GitHub
- ✅ Database Supabase configurato

---

## 🎯 Step 1: Prepara il Repository GitHub

### 1.1 Inizializza Git (se non fatto)
```bash
git init
git add .
git commit -m "feat: Initial commit con sistema di autenticazione"
```

### 1.2 Crea Repository su GitHub
1. Vai su [github.com/new](https://github.com/new)
2. Nome: `Cinecheck`
3. Descrizione: `Social platform per recensioni cinematografiche verificate`
4. Visibilità: **Private** (consigliato) o Public
5. **NON** inizializzare con README, .gitignore o license
6. Click "Create repository"

### 1.3 Push del Codice
```bash
git remote add origin https://github.com/TUO_USERNAME/Cinecheck.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy su Vercel

### 2.1 Collega il Repository
1. Vai su [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Importa il repository "Cinecheck"
4. Click "Import"

### 2.2 Configura il Progetto

**Framework Preset**: Next.js (auto-detected) ✅

**Root Directory**: `web` ⚠️ **IMPORTANTE!**
- Click "Edit" accanto a Root Directory
- Inserisci: `web`
- Click "Continue"

**Build Command**: 
```bash
npm run build
```

**Output Directory**: 
```bash
.next
```

**Install Command**:
```bash
npm install
```

### 2.3 Configura Variabili d'Ambiente

⚠️ **CRITICO**: Aggiungi tutte queste variabili **PRIMA** del deploy!

**🚀 METODO RAPIDO: Importa il file `.env`**

1. Nella sezione "Environment Variables" di Vercel, cerca il link **"Import .env"** o il pulsante con l'icona di upload
2. Seleziona il file: `docs/vercel.env` (dal repository)
3. Vercel importerà automaticamente tutte le 5 variabili! ✅

---

**📝 METODO MANUALE (alternativo):**

Se preferisci inserirle manualmente, aggiungi queste 5 variabili una alla volta:

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://myrhdfglwnosaukymzdi.supabase.co`

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: (copia questo token completo senza spazi):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cmhkZmdsd25vc2F1a3ltemRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDE3MjcsImV4cCI6MjA3NDcxNzcyN30.zNvF-xfNKLblA3SAtU5rGqazPEw_OeA6jiTv7iHPZZk
```

#### 3. NEXT_PUBLIC_TMDB_API_KEY
- **Key**: `NEXT_PUBLIC_TMDB_API_KEY`
- **Value**: `ff53bba635f14c9cb22fcf332fb3ae53`

#### 4. NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN
- **Key**: `NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN`
- **Value**: (copia questo token completo senza spazi):
```
eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZjUzYmJhNjM1ZjE0YzljYjIyZmNmMzMyZmIzYWU1MyIsIm5iZiI6MTc1ODkxNjc0NC45NDgsInN1YiI6IjY4ZDZmMDg4ZmMxODE0M2M0MGI5OTJjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MSpf3pfX-0YVeWDc83esGu-o66CNRRn9kBrf6IrC-oc
```

#### 5. NEXT_PUBLIC_APP_NAME
- **Key**: `NEXT_PUBLIC_APP_NAME`
- **Value**: `Cinecheck`

⚠️ **IMPORTANTE**: 
- **NON** mettere virgolette o apici intorno ai valori
- **NON** lasciare spazi prima o dopo i valori
- Copia e incolla direttamente i token JWT completi dal blocco di codice sopra

---

📌 **NOTA**: La variabile `NEXT_PUBLIC_APP_URL` NON è inclusa nel file `vercel.env` perché deve contenere l'URL di produzione che otterrai DOPO il primo deploy (vedi Step 3.2)

### 2.4 Avvia il Deploy
1. Click "Deploy"
2. Attendi 2-3 minuti ⏱️
3. 🎉 Il tuo sito è online!

---

## 🔧 Step 3: Configurazione Post-Deploy

### 3.1 Ottieni l'URL di Produzione
Dopo il deploy vedrai:
```
https://cinecheck-abc123.vercel.app
```

O se hai un dominio custom:
```
https://cinecheck.com
```

### 3.2 Aggiungi NEXT_PUBLIC_APP_URL
1. Vercel Dashboard → Il tuo progetto
2. Settings → Environment Variables
3. Aggiungi:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://cinecheck-abc123.vercel.app` (il tuo URL)
   - **Environments**: Production ✅, Preview ❌, Development ❌

4. **Redeploy**:
   - Vai su "Deployments"
   - Click "..." sul deployment più recente
   - Click "Redeploy"

---

## 🔐 Step 4: Configura Supabase per Produzione

### 4.1 Aggiungi URL di Produzione a Supabase
1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard)
2. Apri il tuo progetto Cinecheck
3. Settings → Authentication → URL Configuration

**Site URL**: `https://cinecheck-abc123.vercel.app`

**Redirect URLs**: Aggiungi entrambi:
```
https://cinecheck-abc123.vercel.app/auth/callback
https://cinecheck-abc123.vercel.app/*
```

4. Click "Save"

### 4.2 Configura Email Templates
1. Authentication → Email Templates
2. Verifica che i link nelle email usino l'URL di produzione
3. Template "Confirm signup": Assicurati che il link sia corretto

---

## ✅ Step 5: Verifica il Deploy

### 5.1 Test Checklist

Visita il tuo sito: `https://cinecheck-abc123.vercel.app`

- [ ] **Homepage carica** senza errori
- [ ] **Animazioni** funzionano
- [ ] **Navigation** è visibile
- [ ] **Logo e styling** corretti

#### Test Autenticazione
1. [ ] Vai su `/auth`
2. [ ] **Form di registrazione** appare
3. [ ] **Registra nuovo utente**:
   - Username: `testprod`
   - Email: tua email reale
   - Password: `Test123!`
4. [ ] **Email di conferma** arriva
5. [ ] **Click sul link** nell'email
6. [ ] **Torna al sito** e fai login
7. [ ] **Redirect** alla homepage funziona
8. [ ] **Navigation** mostra "Profilo" e "Logout"
9. [ ] **Vai su `/profile`** - vedi i tuoi dati
10. [ ] **Logout** funziona

#### Test Route Protection
1. [ ] **Logout**
2. [ ] Prova ad andare su `/profile` direttamente
3. [ ] **Redirect automatico** a `/auth` ✅

---

## 🐛 Troubleshooting

### Problema: "Application error: a client-side exception has occurred"

**Causa**: Variabili d'ambiente mancanti

**Soluzione**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica che TUTTE le variabili siano presenti
3. Redeploy

---

### Problema: "Cannot connect to Supabase"

**Causa**: URL o key errati

**Soluzione**:
1. Controlla che `NEXT_PUBLIC_SUPABASE_URL` sia corretto
2. Controlla che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretto
3. Verifica che non ci siano spazi extra o quote
4. Redeploy

---

### Problema: "Email di conferma non arriva"

**Causa**: URL redirect non configurato in Supabase

**Soluzione**:
1. Supabase → Settings → Authentication
2. Aggiungi URL produzione ai Redirect URLs
3. Verifica Site URL
4. Riprova registrazione

---

### Problema: "Redirect loop su /auth"

**Causa**: Middleware che non riconosce la sessione

**Soluzione**:
1. Pulisci cookies del browser
2. Prova in incognito
3. Verifica che `@supabase/auth-helpers-nextjs` sia installato
4. Redeploy

---

## 🚀 Step 6: Ottimizzazioni Post-Deploy

### 6.1 Aggiungi Dominio Custom (Opzionale)
1. Vercel Dashboard → Il tuo progetto → Settings → Domains
2. Aggiungi il tuo dominio (es: `cinecheck.com`)
3. Configura DNS secondo le istruzioni Vercel
4. Aggiorna Supabase URLs con il nuovo dominio

### 6.2 Abilita Analytics
1. Vercel Dashboard → Il tuo progetto → Analytics
2. Enable Vercel Analytics
3. Vedrai metriche real-time del sito

### 6.3 Configura Monitoraggio Errori (Opzionale)
```bash
# Installa Sentry
npm install --save @sentry/nextjs -w web

# Inizializza
npx @sentry/wizard@latest -i nextjs
```

---

## 📊 Monitoring & Manutenzione

### Dashboard Vercel
- **Deployments**: Cronologia deploy
- **Analytics**: Visite, performance
- **Logs**: Debug errori real-time
- **Speed Insights**: Core Web Vitals

### Dashboard Supabase
- **Authentication**: Utenti registrati
- **Database**: Dati utenti
- **Logs**: Query e errori
- **API**: Usage statistics

---

## 🔄 Workflow Aggiornamenti

### Deploy Automatico
Ogni push su `main` triggera un deploy automatico!

```bash
# Fai modifiche
git add .
git commit -m "feat: Nuova funzionalità"
git push origin main

# Vercel deploya automaticamente! 🚀
```

### Preview Deployments
Ogni pull request crea un ambiente di preview:
```
https://cinecheck-git-feature-username.vercel.app
```

---

## 📝 Checklist Finale

Prima di considerare il deploy "production-ready":

- [ ] ✅ Tutte le variabili d'ambiente configurate
- [ ] ✅ Supabase URLs aggiornate
- [ ] ✅ Test completo autenticazione
- [ ] ✅ Test su mobile
- [ ] ✅ Test su browser diversi (Chrome, Firefox, Safari)
- [ ] ✅ Velocità caricamento < 3s
- [ ] ✅ No errori in console
- [ ] ✅ Email di conferma funzionanti
- [ ] ✅ Route protection attiva
- [ ] ✅ Analytics configurate
- [ ] ✅ Dominio custom (se necessario)

---

## 🎉 Congratulazioni!

Il tuo progetto Cinecheck è ora live su Vercel!

**URL Produzione**: `https://cinecheck-abc123.vercel.app`

### 🔗 Link Utili

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentazione Vercel**: https://vercel.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/TUO_USERNAME/Cinecheck

---

## 📧 Supporto

**Problemi con il deploy?**
1. Controlla i logs su Vercel Dashboard
2. Verifica Environment Variables
3. Consulta questa guida
4. Controlla Supabase logs

**Tutto funziona? 🎊**
- Condividi il link!
- Continua lo sviluppo
- Monitora analytics
- Raccogli feedback utenti

---

**🚀 Happy Deploying!**
