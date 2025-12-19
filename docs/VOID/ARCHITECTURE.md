# VOID Architecture

## System Overview

VOID is built on a modular architecture that separates concerns into distinct layers:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Components, Animations, UI)          │
├─────────────────────────────────────────┤
│         State Management               │
│  (Zustand Store, Persistence)          │
├─────────────────────────────────────────┤
│         Business Logic                 │
│  (Hooks, Utilities, Services)           │
├─────────────────────────────────────────┤
│         Infrastructure                 │
│  (WebGL Worker, IndexedDB, APIs)        │
└─────────────────────────────────────────┘
```

## Core Components

### 1. State Management (`lib/void/store.ts`)

Zustand store with persistence middleware managing:

- **Desktop State**: Icons, windows, positions, backgrounds
- **Media State**: Current track, playback, volume
- **Theme State**: Current theme, preferences
- **Voice State**: Recording, transcript, entities
- **Buddy State**: Messages, emotions, position

**Store Structure:**
```typescript
interface VoidStore {
  // Desktop
  icons: IconData[]
  windows: WindowData[]
  desktopBackground: string | null
  wiremapEnabled: boolean
  
  // Media
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  
  // Theme
  theme: Theme
  
  // Actions...
}
```

### 2. Theme System (`lib/themes.ts`)

TypeScript theme objects mapping to CSS variables:

- **Theme Objects**: Type-safe color definitions
- **CSS Variables**: Automatic synchronization
- **Wiremap Colors**: Theme-aware node/line colors
- **Glass Colors**: Theme-aware glassmorphism

**Theme Application:**
```typescript
applyTheme(theme: Theme) {
  // Sets data-theme attribute
  // Updates CSS variables
  // Updates wiremap colors
}
```

### 3. WebGL Wiremap (`lib/void/wiremapWorker.ts`)

Web Worker rendering system:

- **OffscreenCanvas**: Rendering in background thread
- **Three.js**: 3D scene management
- **Adaptive Nodes**: 80 desktop / 40 mobile
- **FPS Monitoring**: Auto-throttle to 60fps
- **Mouse Interaction**: 200px attract radius
- **Click Ripples**: 3-wave propagation

**Worker Communication:**
```typescript
// Main thread → Worker
worker.postMessage({
  type: 'theme',
  theme: { node, line, ripple }
})

// Worker → Main thread
worker.onmessage = (e) => {
  // Ready, error, etc.
}
```

### 4. Animation System (`hooks/use120fps.ts`)

120fps animation hook with auto-throttling:

- **Target FPS**: 120fps (8.33ms per frame)
- **Throttle Threshold**: 8.33ms average frame time
- **Auto-Throttle**: Drops to 60fps if needed
- **GPU Acceleration**: `translate3d` transforms

**Usage:**
```typescript
const { currentFps, isThrottled, effectiveFps } = use120fps({
  targetFps: 120,
  throttleThreshold: 8.33
})
```

### 5. Media Integration (`lib/music/`)

Spotify + Media Session API integration:

- **Spotify Web API**: OAuth, playback control
- **Media Session API**: Windows media keys
- **IndexedDB Caching**: Last 10 tracks
- **CRM Mood Sync**: Auto-pause, mood switching

## Data Flow

### Theme Switching Flow

```
User clicks theme toggle
  ↓
onTap handler (0ms)
  ↓
setAttribute('data-theme', theme) (instant)
  ↓
applyTheme() updates CSS variables (instant)
  ↓
Background cross-fade (300ms CSS transition)
  ↓
Wiremap worker receives theme update
  ↓
Worker updates node/line colors
```

### Media Playback Flow

```
User clicks play
  ↓
setIsPlaying(true) in store
  ↓
Spotify API playTrack()
  ↓
Media Session API updateMetadata()
  ↓
Toolbar updates UI
  ↓
Windows media keys work
```

### Wiremap Interaction Flow

```
Mouse moves
  ↓
Main thread captures position
  ↓
postMessage to worker
  ↓
Worker updates node positions
  ↓
OffscreenCanvas renders
  ↓
Frame transferred to main canvas
```

## File Structure

```
src/
├── lib/
│   ├── themes.ts              # Theme system
│   ├── void/
│   │   ├── store.ts           # Zustand store
│   │   ├── wiremapWorker.ts   # WebGL worker
│   │   └── types.ts           # TypeScript types
│   └── music/
│       ├── spotify.ts         # Spotify API
│       └── mediaSession.ts    # Media Session API
├── components/
│   ├── void/
│   │   ├── WiremapBackground.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── BackgroundSystem.tsx
│   │   └── MicroInteractions.tsx
│   └── media/
│       ├── MediaToolbar.tsx
│       └── NowPlayingWidget.tsx
├── hooks/
│   ├── use120fps.ts
│   ├── useMediaSession.ts
│   └── useCRMMoodSync.ts
├── pages/
│   └── void/
│       └── index.tsx          # Main VOID page
└── styles/
    ├── glass.css              # Glassmorphism
    └── void-effects.css       # VOID-specific styles
```

## State Persistence

Zustand persist middleware stores:

- Icon positions
- Pinned icons
- Theme preference
- Desktop background
- Wiremap settings
- Media preferences

**Storage Keys:**
- `void-desktop-storage`: Main store
- `spotify-tracks-cache`: Track cache (IndexedDB)
- `void-desktop`: Background storage (IndexedDB)

## Performance Architecture

### Rendering Pipeline

1. **Main Thread**: UI updates, user input
2. **Web Worker**: WebGL rendering (wiremap)
3. **CSS Animations**: GPU-accelerated transforms
4. **RAF Loop**: 120fps animation monitoring

### Optimization Strategies

- **Lazy Loading**: Components load on demand
- **Code Splitting**: Route-based splitting
- **Worker Offloading**: Heavy computation in worker
- **GPU Acceleration**: `translate3d`, `will-change`
- **Frame Throttling**: Auto-throttle to 60fps if needed

## Integration Points

### With Existing App

- **Routing**: `/void` route in App.tsx
- **Store**: Extends existing Zustand patterns
- **Theming**: Integrates with existing theme system
- **Media**: Uses existing Spotify integration

### External APIs

- **Spotify Web API**: OAuth, playback control
- **Media Session API**: System media keys
- **IndexedDB**: Offline caching
- **WebGL**: Three.js rendering

## Security Considerations

- **OAuth Tokens**: Stored securely, auto-refresh
- **IndexedDB**: Same-origin only
- **Web Worker**: Isolated execution context
- **CSP**: Compatible with Content Security Policy

## Browser Support

### Required APIs

- OffscreenCanvas
- WebGL 2.0
- Media Session API
- IndexedDB
- CSS Custom Properties
- Backdrop Filter

### Fallbacks

- Wiremap: Falls back to main thread if OffscreenCanvas unavailable
- Media Session: Gracefully degrades if unsupported
- Backdrop Filter: Solid backgrounds as fallback

## Future Enhancements

- Multi-monitor support
- Custom wiremap patterns
- Additional media providers
- Advanced window management
- Plugin system

---

**Last Updated**: December 2025
