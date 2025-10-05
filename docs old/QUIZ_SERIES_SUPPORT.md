# Sistema Quiz - Supporto Film e Serie TV

## ✅ Sistema Verificato e Aggiornato

Il sistema dei quiz è completamente funzionale per **film** e **serie TV** con la nuova distribuzione delle domande.

## 🎯 Configurazione Quiz (Aggiornata 5 Ottobre 2025)

### Distribuzione Domande

- **5 domande EASY** (5 punti ciascuna) = 25 punti
- **4 domande MEDIUM** (10 punti ciascuna) = 40 punti
- **1 domanda HARD** (15 punti) = 15 punti
- **TOTALE**: 10 domande = 85 punti massimi

### Punteggio per Superare

- **Soglia**: 60% (51 punti su 85)
- **Timer**: 30 secondi per domanda
- **Modello AI**: gemini-2.0-flash (stable)

## 🔧 Modifiche Implementate

### 1. Aggiornamento Tipi TypeScript

**File**: `src/components/QuizButton.tsx`, `src/components/QuizContainer.tsx`

- Aggiunto supporto per `"series"` come tipo di contenuto
- Tipo ora: `"movie" | "tv" | "series"`

```typescript
interface QuizButtonProps {
  contentId: number;
  contentType: "movie" | "tv" | "series";
  contentTitle: string;
}
```

### 2. Normalizzazione Content Type

**File**: `src/components/QuizContainer.tsx` (linea ~101)

Aggiunta conversione automatica `tv -> series` prima della chiamata API:

```typescript
// Normalizza il content_type per l'API (tv -> series)
const apiContentType = contentType === "tv" ? "series" : contentType;
```

### 3. API Robusta

**File**: `src/app/api/quiz/generate/route.ts` (linea ~32)

L'API ora accetta e normalizza automaticamente sia `"tv"` che `"series"`:

```typescript
// Normalizza content_type (accetta sia "tv" che "series")
if (content_type === "tv") {
  content_type = "series";
}
```

### 4. Correzione SeriesHero

**File**: `src/app/series/[id]/components/SeriesHero.tsx` (linea ~145)

Cambiato da `contentType="tv"` a `contentType="series"`:

```tsx
<QuizButton
  contentId={series.id}
  contentType="series"
  contentTitle={series.name}
/>
```

## 📋 Funzionalità

### Film (`/movie/[id]`)

- ✅ Pulsante "Fai il Quiz" presente in `MovieHero`
- ✅ `contentType="movie"` passato correttamente
- ✅ API genera quiz per film usando TMDB movie data

### Serie TV (`/series/[id]`)

- ✅ Pulsante "Fai il Quiz" presente in `SeriesHero`
- ✅ `contentType="series"` passato correttamente
- ✅ API genera quiz per serie usando TMDB series data
- ✅ API chiama `tmdb.getSeriesComplete()` per recuperare dati completi

## 🎯 Flow Completo

### Per Film

1. User clicca "Fai il Quiz" su pagina film
2. `QuizButton` riceve `contentType="movie"`
3. `QuizContainer` passa `"movie"` all'API
4. API `/api/quiz/generate` chiama `tmdb.getMovieComplete(tmdb_id)`
5. Genera quiz con Gemini AI basato su dati film
6. Restituisce quiz personalizzato

### Per Serie TV

1. User clicca "Fai il Quiz" su pagina serie
2. `QuizButton` riceve `contentType="series"`
3. `QuizContainer` passa `"series"` all'API (dopo normalizzazione)
4. API `/api/quiz/generate` chiama `tmdb.getSeriesComplete(tmdb_id)`
5. Genera quiz con Gemini AI basato su dati serie (stagioni, episodi, cast)
6. Restituisce quiz personalizzato

## 🧪 Testing

### Test Locale

1. Avvia dev server:

   ```bash
   npm run dev
   ```

2. Testa Film:

   - Vai su `http://localhost:3000/movie/[id]`
   - Clicca "Fai il Quiz"
   - Verifica generazione e gioco

3. Testa Serie:
   - Vai su `http://localhost:3000/series/[id]`
   - Clicca "Fai il Quiz"
   - Verifica generazione e gioco

### Console Logs

Durante il test, controlla la console del browser per i log:

```
📦 Generate Response: { success, cached, quiz: {...} }
🎮 Start Response: { attempt_id, quiz: {...} }
🏁 Submit Response: { score, questions, ... }
```

## 🔍 Compatibilità

Il sistema ora supporta **tre formati** di contentType:

| Formato    | Dove viene usato       | Normalizzato in |
| ---------- | ---------------------- | --------------- |
| `"movie"`  | Film                   | `"movie"`       |
| `"tv"`     | (Legacy/TMDB standard) | `"series"`      |
| `"series"` | Serie TV               | `"series"`      |

## 📊 Dati TMDB per Serie

L'API recupera dati completi per le serie includendo:

- `name`, `original_name`
- `overview`, `tagline`
- `first_air_date`, `last_air_date`
- `number_of_seasons`, `number_of_episodes`
- `genres`, `keywords`
- `cast`, `crew`
- `production_companies`
- `vote_average`, `popularity`

Questi dati vengono usati da Gemini AI per generare domande pertinenti sulla serie.

## ✅ Build Status

Build completato con successo:

```
✓ Compiled successfully
15 routes generated
/series/[id]: 3.71 kB (Dynamic)
```

## 🎉 Conclusione

Il sistema quiz è completamente funzionale per:

- ✅ Film
- ✅ Serie TV
- ✅ Compatibilità con formato TMDB (`tv`)
- ✅ TypeScript types corretti
- ✅ API robusta con normalizzazione automatica

---

**Ultima verifica**: 4 ottobre 2025
**Status**: ✅ Funzionante
