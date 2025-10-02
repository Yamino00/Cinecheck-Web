# Placeholder Images - Cinecheck

Questo modulo fornisce placeholder eleganti per immagini mancanti da TMDB con il tema cinema di Cinecheck.

## 🎨 Componenti Disponibili

### SVG Components (React)
Componenti React per uso diretto in JSX:

```tsx
import { PosterPlaceholder, BackdropPlaceholder, ProfilePlaceholder } from '@/components/placeholders'

// In un componente
<PosterPlaceholder className="w-full h-auto" />
<BackdropPlaceholder className="w-full h-auto" />
<ProfilePlaceholder className="w-full h-auto" />
```

### Data URLs (Inline)
URL data inline per uso diretto con tag `<img>` o `next/image`:

```tsx
import { PLACEHOLDER_POSTER_URL, PLACEHOLDER_BACKDROP_URL, PLACEHOLDER_PROFILE_URL } from '@/components/placeholders'

<Image 
  src={movie.poster_path ? tmdb.getPosterUrl(movie.poster_path) : PLACEHOLDER_POSTER_URL}
  alt="Poster"
/>
```

## 🔧 Utilizzo nel TMDBService

Il servizio TMDB usa automaticamente questi placeholder:

```typescript
// Già implementato in src/services/tmdb.ts
getPosterUrl(path: string | null): string {
  if (!path) return PLACEHOLDER_POSTER_URL  // ← Fallback automatico
  return `${this.imageBaseUrl}/${size}${path}`
}
```

## 🎬 Design

Tutti i placeholder seguono il tema cinema di Cinecheck:
- Sfondo nero/grigio scuro
- Icone cinematografiche (pellicola, camera, silhouette)
- Bordi e decorazioni stile film strip
- Watermark "CINECHECK"
- Testo descrittivo in italiano

## 📐 Dimensioni

- **Poster**: 342x513px (aspect ratio 2:3)
- **Backdrop**: 1280x720px (aspect ratio 16:9)
- **Profile**: 185x278px (aspect ratio 2:3)

## ⚡ Performance

I placeholder sono:
- **Lightweight**: Data URLs inline, no HTTP requests
- **Scalabili**: SVG vettoriali, sempre nitidi
- **Fast**: Rendering immediato senza loading
- **SEO-friendly**: Alt text automatici

## 🔮 Future Improvements

- [ ] Versione animata con GSAP
- [ ] Placeholder personalizzati per genere
- [ ] Gradient backgrounds dinamici
- [ ] Loading skeleton integration
