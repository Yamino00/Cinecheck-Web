# 🎬 Cinecheck - Quick Reference: Pagine da Creare

## 📋 Checklist Pagine Mancanti

### 🔴 PRIORITÀ ALTA - Immediate

#### 1. 📽️ Movie Detail Page
**Rotta**: `/movie/[id]`
**Status**: ❌ Non creata

**File da creare**:
```
src/app/movie/[id]/
├── page.tsx           ⬅️ MAIN PAGE
├── loading.tsx        ⬅️ Loading skeleton
├── error.tsx          ⬅️ Error handling
└── not-found.tsx      ⬅️ 404 handling
```

**Components**:
```
src/components/movie/
├── MovieHero.tsx         ⬅️ Hero section con poster e info base
├── MovieInfo.tsx         ⬅️ Dettagli (cast, crew, budget, etc)
├── MovieMedia.tsx        ⬅️ Trailer e gallery immagini
├── MovieReviews.tsx      ⬅️ Sezione recensioni
└── MovieRecommendations.tsx ⬅️ Film simili
```

**Dati da mostrare**:
- ✅ Backdrop full-width con gradient
- ✅ Poster thumbnail
- ✅ Titolo, anno, tagline
- ✅ Rating TMDB + Cinecheck
- ✅ Overview/Trama
- ✅ Metadata (durata, generi, budget, revenue)
- ✅ Cast top 10 con foto
- ✅ Crew principale (regista, sceneggiatori)
- ✅ Trailer embedded
- ✅ Gallery immagini
- ✅ Recensioni utenti
- ✅ Film simili/raccomandati
- ✅ Call-to-action (Fai Quiz, Scrivi Recensione, Aggiungi a Watchlist)

---

#### 2. 📺 Series Detail Page
**Rotta**: `/series/[id]`
**Status**: ❌ Non creata

**File da creare**:
```
src/app/series/[id]/
├── page.tsx
├── loading.tsx
├── error.tsx
└── not-found.tsx
```

**Components**:
```
src/components/series/
├── SeriesHero.tsx
├── SeriesInfo.tsx
├── SeasonsNavigator.tsx  ⬅️ SPECIFICO SERIE
├── EpisodeList.tsx       ⬅️ SPECIFICO SERIE
└── SeriesReviews.tsx
```

**Dati specifici Serie TV**:
- ✅ Numero stagioni/episodi totali
- ✅ Navigator stagioni (dropdown/tabs)
- ✅ Lista episodi per stagione
- ✅ Info episodi (titolo, air date, overview)
- ✅ Progress tracking episodi visti
- ✅ Status (In produzione/Conclusa)
- ✅ Network/Piattaforma streaming
- ✅ Prossimo episodio (se in corso)

---

#### 3. 🎎 Anime Detail Page
**Rotta**: `/anime/[id]`
**Status**: ❌ Non creata

Similare a Series ma con:
- ✅ Info studio animazione
- ✅ Link a MAL (future)
- ✅ Opening/Ending themes

---

### 🟡 PRIORITÀ MEDIA - Prossime

#### 4. 🔍 Search Results Page
**Rotta**: `/search?q=[query]`
**Status**: ❌ Non creata

**Cosa mostrare**:
- Barra ricerca in alto
- Tabs (All, Movies, Series, Anime, Users)
- Filtri sidebar (genere, anno, rating)
- Results grid con cards
- Paginazione

---

#### 5. 📋 Browse by Genre
**Rotta**: `/browse/[genre]`
**Status**: ❌ Non creata

**Esempi**:
- `/browse/action`
- `/browse/comedy`
- `/browse/horror`

**Layout**:
- Hero con genere
- Grid contenuti del genere
- Filtri e ordinamento
- Infinite scroll

---

#### 6. 📈 Trending Page
**Rotta**: `/trending`
**Status**: ❌ Non creata

**Tabs**:
- Oggi
- Questa settimana
- Questo mese

**Features**:
- Trend indicators (↑↓)
- Type filters
- Share trending

---

#### 7. 👤 Enhanced Profile
**Rotta**: `/profile/[username]`
**Status**: 🔄 Base esistente, da espandere

**Da aggiungere**:
- Banner customizzabile
- Stats dashboard
- Tabs (Recensioni, Watchlist, Liste, Stats)
- Edit profile modal
- Following/Followers lists

---

#### 8. 📱 Activity Feed
**Rotta**: `/feed`
**Status**: ❌ Non creata

**Content**:
- Timeline attività seguiti
- Like e comment inline
- Real-time updates
- Filters per tipo attività

---

#### 9. 📝 Full Review Page
**Rotta**: `/review/[id]`
**Status**: ❌ Non creata

**Layout**:
- Review completa
- Author card con follow
- Comments thread
- Related reviews
- Share options

---

#### 10. 📋 User Watchlist
**Rotta**: `/watchlist` (user-specific)
**Status**: ❌ Non creata

**Categories**:
- To Watch
- Watching (per serie)
- Watched

**Features**:
- Quick actions (move, prioritize)
- Sort & filter
- Add reminder

---

#### 11. 📚 Custom Lists
**Rotta**: `/lists/[listId]`
**Status**: ❌ Non creata

**Management**:
- List header (nome, desc, cover)
- Items grid
- Add/remove items
- Reorder (drag & drop)
- Share list

---

#### 12. 🌐 Lists Explorer
**Rotta**: `/lists/explore`
**Status**: ❌ Non creata

**Content**:
- Public lists community
- Featured editorial lists
- Search lists
- Follow lists

---

### 🟢 PRIORITÀ BASSA - Future

#### 13. 🏆 Leaderboard
**Rotta**: `/leaderboard`
**Rankings**, **Achievements**, **Top Users**

#### 14. 🎮 Achievements
**Rotta**: `/achievements`
**Browse achievements**, **Progress tracking**

#### 15. ⚙️ Settings
**Rotta**: `/settings`
**Account**, **Privacy**, **Notifications**

#### 16. 🛠️ Admin Panel
**Rotta**: `/admin`
**Moderation**, **Analytics**, **Content Management**

---

## 🎯 Priority Order per Implementazione

### Sprint 1 (Immediate - Questa Settimana)
1. **Movie Detail Page** (3 giorni)
2. **Series Detail Page** (2 giorni)

### Sprint 2 (Prossime 2 Settimane)
3. **Search Results** (2 giorni)
4. **Browse by Genre** (1 giorno)
5. **Full Review Page** (2 giorni)

### Sprint 3 (Settimane 3-4)
6. **Enhanced Profile** (3 giorni)
7. **Watchlist** (2 giorni)
8. **Custom Lists** (2 giorni)

### Sprint 4 (Mese 2)
9. **Activity Feed** (2 giorni)
10. **Trending Page** (1 giorno)
11. **Lists Explorer** (2 giorni)

---

## 📐 Layout Templates Standard

### Template Base per Detail Pages
```tsx
export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  // 1. Fetch data da TMDB
  const content = await tmdb.getMovie(params.id)
  
  // 2. Fetch reviews da Supabase
  const reviews = await getReviews(params.id)
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ContentHero content={content} />
      
      {/* Info Section */}
      <ContentInfo content={content} />
      
      {/* Media Section */}
      <ContentMedia trailers={content.videos} />
      
      {/* Reviews Section */}
      <ContentReviews reviews={reviews} contentId={params.id} />
      
      {/* Recommendations */}
      <ContentRecommendations contentId={params.id} />
    </div>
  )
}
```

### Template Loading State
```tsx
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-96 bg-gray-800" /> {/* Hero skeleton */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 bg-gray-700 rounded" />
          <div className="h-32 bg-gray-700 rounded" />
          <div className="h-32 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}
```

### Template Error Handling
```tsx
'use client'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Qualcosa è andato storto!</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button onClick={reset} className="btn btn-primary">
          Riprova
        </button>
      </div>
    </div>
  )
}
```

---

## 🔗 Links Utili

### TMDB API Endpoints per Detail Pages
```typescript
// Movie
GET https://api.themoviedb.org/3/movie/{id}?append_to_response=videos,images,credits,recommendations

// Series  
GET https://api.themoviedb.org/3/tv/{id}?append_to_response=videos,images,credits,recommendations,seasons

// Images
GET https://api.themoviedb.org/3/movie/{id}/images

// Videos
GET https://api.themoviedb.org/3/movie/{id}/videos
```

### Next.js Features da Usare
- **Metadata API** per SEO dinamico
- **Server Components** per performance
- **Streaming** con Suspense
- **Image Optimization** con next/image
- **Dynamic Routes** per [id]

---

**📅 Creato**: 2 Ottobre 2025  
**🔄 Aggiornare dopo**: Ogni pagina implementata

**🚀 Inizia con Movie Detail Page - È la più importante!**