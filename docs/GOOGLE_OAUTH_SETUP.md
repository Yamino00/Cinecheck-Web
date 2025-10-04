# Configurazione Google OAuth per Cinecheck

Questa guida spiega come configurare l'autenticazione Google per Cinecheck su Supabase.

## 📋 Prerequisiti

- Accesso al progetto Supabase
- Account Google Developer Console
- URL del sito configurato

## 🔧 Step 1: Configurare Google Cloud Console

### 1.1 Crea un Progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca su **"Select a project"** → **"New Project"**
3. Nome progetto: `Cinecheck`
4. Clicca **"Create"**

### 1.2 Abilita Google+ API

1. Nel menu laterale: **APIs & Services** → **Library**
2. Cerca **"Google+ API"**
3. Clicca **"Enable"**

### 1.3 Configura OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. Seleziona **"External"** → **"Create"**
3. Compila i campi:
   - **App name**: `Cinecheck`
   - **User support email**: La tua email
   - **App logo**: (Opzionale) Upload logo Cinecheck
   - **App domain**:
     - Application home page: `https://cinecheck-web.vercel.app`
     - Privacy policy: `https://cinecheck-web.vercel.app/privacy`
     - Terms of service: `https://cinecheck-web.vercel.app/terms`
   - **Developer contact**: La tua email
4. Clicca **"Save and Continue"**
5. **Scopes**: Clicca **"Add or Remove Scopes"**
   - Seleziona: `email`, `profile`, `openid`
6. **"Save and Continue"** → **"Save and Continue"** → **"Back to Dashboard"**

### 1.4 Crea OAuth 2.0 Credentials

1. **APIs & Services** → **Credentials**
2. **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Nome: `Cinecheck Web Client`
5. **Authorized JavaScript origins**:
   ```
   https://cinecheck-web.vercel.app
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:

   ```
   https://myrhdfglwnosaukymzdi.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```

   ⚠️ **Importante**: L'URL deve essere esattamente quello di Supabase!

7. Clicca **"Create"**
8. **Salva** il **Client ID** e **Client Secret** che vengono mostrati

## 🔑 Step 2: Configurare Supabase

### 2.1 Aggiungi le Credenziali Google

1. Vai su [Supabase Dashboard](https://app.supabase.com/project/myrhdfglwnosaukymzdi)
2. **Authentication** → **Providers**
3. Trova **"Google"** e clicca per espandere
4. Inserisci:
   - **Client ID**: (dal passo 1.4)
   - **Client Secret**: (dal passo 1.4)
5. Toggle **"Enable Sign in with Google"**: **ON**
6. Clicca **"Save"**

### 2.2 Configura URL di Redirect

1. **Authentication** → **URL Configuration**
2. Assicurati che sia configurato:
   - **Site URL**: `https://cinecheck-web.vercel.app`
   - **Redirect URLs** (aggiungi):
     ```
     https://cinecheck-web.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

## 🚀 Step 3: Test in Locale

### 3.1 Verifica .env.local

Assicurati che il file `.env.local` contenga:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://myrhdfglwnosaukymzdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Test Login

1. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

2. Vai su `http://localhost:3000/auth`

3. Clicca su **"Continua con Google"**

4. Autorizza l'app Google

5. Dovresti essere reindirizzato a `/auth/callback` e poi alla home

### 3.3 Verifica Profilo Creato

Controlla nel Supabase Dashboard → **Table Editor** → **profiles** che sia stato creato un profilo per il nuovo utente Google.

## 🌐 Step 4: Deploy in Produzione

### 4.1 Aggiorna Variabili Ambiente Vercel

1. Vai su [Vercel Dashboard](https://vercel.com)
2. Seleziona progetto **Cinecheck-Web**
3. **Settings** → **Environment Variables**
4. Assicurati che sia presente:
   ```
   NEXT_PUBLIC_APP_URL=https://cinecheck-web.vercel.app
   ```

### 4.2 Redeploy

```bash
git add .
git commit -m "feat: Add Google OAuth authentication"
git push origin main
```

Vercel farà automaticamente il deploy.

### 4.3 Test in Produzione

1. Vai su `https://cinecheck-web.vercel.app/auth`
2. Clicca **"Continua con Google"**
3. Verifica che il login funzioni

## ✅ Checklist Configurazione

- [ ] Progetto Google Cloud creato
- [ ] Google+ API abilitata
- [ ] OAuth Consent Screen configurato
- [ ] Client ID e Secret ottenuti
- [ ] Redirect URIs corretti in Google Console
- [ ] Google provider abilitato in Supabase
- [ ] Redirect URLs configurati in Supabase
- [ ] Test locale funzionante
- [ ] Variabili ambiente su Vercel configurate
- [ ] Test produzione funzionante

## 🐛 Troubleshooting

### Errore: "redirect_uri_mismatch"

**Causa**: L'URL di redirect non corrisponde a quelli autorizzati.

**Soluzione**:

1. Verifica che in Google Console → Credentials → OAuth 2.0 Client IDs
2. Gli **Authorized redirect URIs** contengano esattamente:
   ```
   https://myrhdfglwnosaukymzdi.supabase.co/auth/v1/callback
   ```

### Errore: "access_denied"

**Causa**: L'utente ha negato l'autorizzazione o c'è un problema con gli scope.

**Soluzione**:

1. Verifica OAuth Consent Screen
2. Assicurati che gli scope `email`, `profile`, `openid` siano configurati
3. Riprova il login

### Profilo non creato automaticamente

**Causa**: La callback non ha creato il profilo.

**Soluzione**:

1. Controlla i log del browser console
2. Verifica che `useAuth` hook stia creando il profilo al login
3. Crea manualmente il profilo tramite Supabase Dashboard se necessario

### "Invalid grant" error

**Causa**: Token scaduto o redirect URL errato.

**Soluzione**:

1. Pulisci i cookie del browser
2. Verifica i redirect URLs
3. Riprova il login

## 📚 Risorse

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 Prossimi Passi

Dopo aver configurato Google OAuth, considera:

- [ ] Aggiungere altri provider (GitHub, Facebook, etc.)
- [ ] Implementare link account (associa email/password a OAuth)
- [ ] Aggiungere analytics per tracciare metodi di login
- [ ] Implementare refresh token management

---

**Made with ❤️ for Cinecheck**
