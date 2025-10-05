# 🎬 CINECHECK REDESIGN - Netflix meets Spotify

## 📋 Piano di Implementazione

**Concept**: Layout ibrido con navigation sidebar, infinite scrolling, dark mode cinematografico  
**Timeline**: 10 giorni  
**Data Inizio**: 5 Ottobre 2025  
**Status**: 📋 Planning

---

## 🎯 Obiettivi

✅ **Navigation sidebar** sempre visibile (collapsible)  
✅ **Infinite horizontal scrolling** per categorie  
✅ **Preview auto-play** on hover  
✅ **Dark mode cinematografico** (purple/blue gradients)  
✅ **Micro-interactions** fluide ovunque  
✅ **Mobile-first** con drawer navigation

---

## 📦 Fase 1: Setup & Dependencies (Giorno 1)

### Nuove Librerie da Installare

```bash
npm install embla-carousel-react
npm install @studio-freight/lenis
npm install react-use
npm install vaul
```

### File da Creare

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # NEW - Sidebar navigation
│   │   ├── TopBar.tsx            # NEW - Top bar minimal
│   │   └── AppLayout.tsx         # NEW - Layout wrapper
│   ├── carousel/
│   │   ├── InfiniteCarousel.tsx  # NEW - Carousel component
│   │   └── CarouselCard.tsx      # NEW - Card con hover preview
│   └── ui/
│       └── DrawerMenu.tsx        # NEW - Mobile drawer
└── styles/
    └── gradients.css             # NEW - Gradient utilities
```

---

## 🎨 Fase 2: Design System Update (Giorno 2)

### Aggiornare `tailwind.config.js`

**Nuova Palette:**

```javascript
colors: {
  'cinema-purple': {
    50: '#f5f3ff',
    500: '#7C3AED',
    900: '#4C1D95',
  },
  'cinema-amber': {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  'cinema-dark': {
    950: '#0F0F1E',
    900: '#1A1A2E',
    800: '#16213E',
  }
}
```

**Nuovi Gradients:**

```javascript
backgroundImage: {
  'cinema-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'cinema-dark': 'linear-gradient(180deg, #0F0F1E 0%, #1A1A2E 100%)',
  'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
}
```

**Animations:**

```javascript
animation: {
  'slide-in-left': 'slideInLeft 0.3s ease-out',
  'fade-in-up': 'fadeInUp 0.4s ease-out',
  'shimmer': 'shimmer 2s infinite',
}
```

---

## 🧩 Fase 3: Core Components (Giorni 3-5)

### 3.1 Sidebar Component (Giorno 3)

**File**: `src/components/layout/Sidebar.tsx`

**Features:**

- ✅ Collapsible (icon only / full width)
- ✅ Active state con glow effect
- ✅ Smooth transitions
- ✅ User profile section bottom
- ✅ Icons da Lucide React

**Links:**

- 🏠 Home
- 🔍 Discover
- 🎬 Movies
- 📺 Series
- ⭐ Watchlist
- 👤 Profile
- 🏆 Achievements

### 3.2 InfiniteCarousel Component (Giorno 4)

**File**: `src/components/carousel/InfiniteCarousel.tsx`

**Features:**

- ✅ Embla Carousel con loop
- ✅ Snap scroll magnetico
- ✅ Navigation arrows on hover
- ✅ Drag to scroll
- ✅ Responsive (2-6 items visible)

**Props:**

```typescript
interface InfiniteCarouselProps {
  title: string;
  items: ContentItem[];
  onItemClick: (id: number) => void;
  autoPlayOnHover?: boolean;
}
```

### 3.3 CarouselCard Component (Giorno 4-5)

**File**: `src/components/carousel/CarouselCard.tsx`

**Features:**

- ✅ Hover scale + shadow
- ✅ Preview video overlay (dopo 2s hover)
- ✅ Quick actions buttons (Play, Add, Info)
- ✅ Rating badge
- ✅ Gradient overlay per readability

**Animations:**

```typescript
- Scale: 1 → 1.05
- Shadow: sm → 2xl
- Overlay: opacity 0 → 1
- Buttons: translateY(10px) → 0
```

---

## 🏗️ Fase 4: Layout Refactor (Giorno 6)

### 4.1 AppLayout Component

**File**: `src/components/layout/AppLayout.tsx`

```tsx
<div className="flex min-h-screen bg-cinema-dark-950">
  {/* Sidebar Desktop */}
  <Sidebar collapsed={sidebarCollapsed} />

  {/* Main Content */}
  <main className="flex-1 ml-0 lg:ml-64">
    <TopBar onMenuClick={() => setMobileDrawer(true)} />
    {children}
  </main>

  {/* Mobile Drawer */}
  <DrawerMenu open={mobileDrawer} onClose={() => setMobileDrawer(false)} />
</div>
```

### 4.2 Aggiornare `src/app/layout.tsx`

- Rimuovere `<Navigation />` attuale
- Wrappare con `<AppLayout>`
- Aggiungere smooth scroll (Lenis)

---

## 🎬 Fase 5: Homepage Redesign (Giorno 7)

### File: `src/app/page.tsx`

**Nuova Struttura:**

```tsx
<>
  {/* Hero Section - Video Background */}
  <HeroSection movie={featuredMovie} />

  {/* Infinite Carousels */}
  <section className="space-y-12 px-8 py-12">
    <InfiniteCarousel
      title="Trending Today"
      items={trendingMovies}
      autoPlayOnHover
    />

    <InfiniteCarousel title="Popular on Cinecheck" items={popularMovies} />

    <InfiniteCarousel title="Top Rated Films" items={topRatedMovies} />

    <InfiniteCarousel title="New Releases" items={newReleases} />

    {user && (
      <InfiniteCarousel
        title="Because You Watched..."
        items={recommendations}
      />
    )}
  </section>
</>
```

---

## 🎨 Fase 6: Detail Pages Update (Giorno 8)

### Movie/Series Detail Pages

**Modifiche:**

- Hero con parallax background
- Sidebar sticky (TOC style)
- Tabs animate con underline slider
- Cast carousel horizontal
- Reviews masonry layout

**File da Aggiornare:**

```
src/app/movie/[id]/page.tsx
src/app/movie/[id]/components/MovieHero.tsx
src/app/series/[id]/page.tsx
```

---

## 📱 Fase 7: Mobile Optimization (Giorno 9)

### DrawerMenu Component

**File**: `src/components/ui/DrawerMenu.tsx`

**Features:**

- Swipe to close (vaul)
- Navigation items
- User profile preview
- Quick actions

### Responsive Adjustments

- Sidebar → Drawer su mobile
- Carousels → 1.5 items visible
- Hero → Reduce height
- Touch gestures per carousel

---

## ✨ Fase 8: Micro-interactions & Polish (Giorno 10)

### Animations da Aggiungere

1. **Page Transitions**

   ```typescript
   // Framer Motion variants
   const pageVariants = {
     initial: { opacity: 0, y: 20 },
     animate: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -20 },
   };
   ```

2. **Hover Effects**

   - Card tilt subtle (react-spring)
   - Button ripple effect
   - Glow on active elements

3. **Loading States**

   - Skeleton screens
   - Shimmer effect
   - Progress indicators

4. **Toast Notifications**
   - Custom styling
   - Position top-right
   - Icon + message

---

## 📊 Checklist Finale

### Design

- [ ] Palette colori aggiornata
- [ ] Typography hierarchy definita
- [ ] Spacing system consistente
- [ ] Gradient library completa

### Components

- [ ] Sidebar funzionante
- [ ] InfiniteCarousel implementato
- [ ] CarouselCard con preview
- [ ] DrawerMenu mobile
- [ ] HeroSection parallax

### Pages

- [ ] Homepage redesignata
- [ ] Movie detail aggiornato
- [ ] Series detail aggiornato
- [ ] Profile page template
- [ ] Search results layout

### UX

- [ ] Smooth scroll attivo
- [ ] Page transitions fluide
- [ ] Hover states consistenti
- [ ] Loading states ovunque
- [ ] Error states styled

### Performance

- [ ] Image optimization
- [ ] Lazy loading carousels
- [ ] Code splitting
- [ ] Lighthouse score >90

### Responsive

- [ ] Mobile drawer funzionante
- [ ] Touch gestures
- [ ] Breakpoint testing
- [ ] Safe area handling

---

## 🚀 Quick Start

### Comandi Utili

```bash
# Installa dipendenze
npm install

# Sviluppo
npm run dev

# Build production
npm run build

# Test Lighthouse
npm run build && npm start
```

### File Priority

**Giorno 1-2**: Setup  
**Giorno 3-5**: Components core  
**Giorno 6-7**: Layout + Homepage  
**Giorno 8-9**: Detail pages + Mobile  
**Giorno 10**: Polish finale

---

## 📝 Note

- **Backward Compatibility**: Mantenere componenti vecchi per 1 sprint
- **Feature Flags**: Usare env var per toggle nuovo design
- **A/B Testing**: Considerare per metrics comparison
- **Documentation**: Aggiornare Storybook con nuovi componenti

---

## 🎯 Success Metrics

- [ ] **Page Load Time**: <2s (target <1.5s)
- [ ] **Time to Interactive**: <3s (target <2s)
- [ ] **Lighthouse Performance**: >90
- [ ] **User Engagement**: +30% session time
- [ ] **Mobile Score**: >85

---

**📅 Ultimo Aggiornamento**: 5 Ottobre 2025  
**👤 Responsabile**: Design Team  
**🔄 Review Date**: 15 Ottobre 2025

**🎬 Let's redesign Cinecheck! 🚀**
