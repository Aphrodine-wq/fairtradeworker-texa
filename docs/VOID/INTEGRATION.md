# VOID Integration Guide

## Overview

This guide explains how to integrate VOID into your existing application.

## Prerequisites

- React 18+
- TypeScript 5+
- Zustand 4+
- Framer Motion 12+
- Three.js (for wiremap)

## Installation

VOID is already integrated into the codebase. If adding to a new project:

### 1. Install Dependencies

```bash
npm install zustand framer-motion three
```

### 2. Copy VOID Files

Copy the following directories:

```
src/
├── lib/
│   ├── themes.ts
│   ├── void/
│   └── music/
├── components/
│   ├── void/
│   └── media/
├── hooks/
│   ├── use120fps.ts
│   ├── useMediaSession.ts
│   └── useCRMMoodSync.ts
├── pages/
│   └── void/
└── styles/
    ├── glass.css
    └── void-effects.css
```

### 3. Add Routing

Add to your routing configuration:

```typescript
// App.tsx or router config
import { lazy } from 'react'

const VoidDesktopPage = lazy(() => 
  import('@/pages/void/index')
)

// Add route
<Route path="/void" element={<VoidDesktopPage />} />
```

## Basic Integration

### Minimal Setup

```tsx
// pages/void/index.tsx
import { WiremapBackground } from '@/components/void/WiremapBackground'
import { VoidThemeToggle } from '@/components/void/ThemeToggle'

export default function VoidDesktop() {
  return (
    <div className="void-desktop">
      <WiremapBackground />
      <VoidThemeToggle />
      {/* Your content */}
    </div>
  )
}
```

### With Media Integration

```tsx
import { MediaToolbar } from '@/components/media/MediaToolbar'
import { useCRMMoodSync } from '@/hooks/useCRMMoodSync'

export default function VoidDesktop() {
  useCRMMoodSync() // Auto-pause during voice recording
  
  return (
    <div className="void-desktop">
      <WiremapBackground />
      <MediaToolbar />
      {/* Your content */}
    </div>
  )
}
```

## Store Integration

### Using VOID Store

```typescript
import { useVoidStore } from '@/lib/void/store'

function MyComponent() {
  const { theme, setTheme } = useVoidStore()
  const { currentTrack, isPlaying } = useVoidStore()
  
  // Use theme
  const colors = getThemeColors(theme)
  
  // Control media
  setIsPlaying(!isPlaying)
}
```

### Extending Store

Add custom state:

```typescript
// In lib/void/store.ts
interface VoidStore {
  // ... existing state
  
  // Your custom state
  customState: string
  setCustomState: (value: string) => void
}

// In store implementation
setCustomState: (value: string) => {
  set({ customState: value })
}
```

## Theme Integration

### Using Theme System

```typescript
import { applyTheme, getThemeColors } from '@/lib/themes'

// Apply theme
applyTheme('dark')

// Get colors
const colors = getThemeColors('dark')
console.log(colors.wiremap.node) // '#4A90E2'
```

### CSS Variables

Use in your CSS:

```css
.my-component {
  background: var(--void-surface);
  border: 1px solid var(--void-border);
  color: var(--void-text-primary);
}
```

## Component Integration

### Adding Custom Components

```tsx
import { MicroInteractions } from '@/components/void/MicroInteractions'

function MyCustomIcon() {
  return (
    <MicroInteractions type="icon">
      <YourIcon />
    </MicroInteractions>
  )
}
```

### Using Glass Panels

```tsx
<div className="glass-panel p-4">
  <h2>Glass Panel</h2>
  <p>Content with glassmorphism effect</p>
</div>
```

## Media Integration

### Spotify Setup

1. **Create Spotify App**
   - Go to Spotify Developer Dashboard
   - Create new app
   - Get Client ID

2. **Configure Environment**

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
```

3. **Add OAuth Callback**

```typescript
// Handle OAuth callback
import { handleSpotifyCallback } from '@/lib/music/spotify'

// In your OAuth callback route
const code = new URLSearchParams(window.location.search).get('code')
if (code) {
  await handleSpotifyCallback(code)
}
```

### Media Session Setup

Automatically handled by `useMediaSession` hook:

```typescript
import { useMediaSession } from '@/hooks/useMediaSession'

useMediaSession({
  track: currentTrack,
  isPlaying,
  onPlay: () => handlePlay(),
  onPause: () => handlePause(),
})
```

## Background System

### Enabling Background System

```tsx
import { BackgroundSystem } from '@/components/void/BackgroundSystem'

<BackgroundSystem />
```

### Custom Background Gallery

Add to `public/backgrounds/`:

```
public/
└── backgrounds/
    ├── gradient-1.jpg
    ├── gradient-2.jpg
    └── ...
```

Load in component:

```typescript
const backgrounds = [
  '/backgrounds/gradient-1.jpg',
  '/backgrounds/gradient-2.jpg',
  // ...
]
```

## Wiremap Customization

### Adjusting Node Count

```typescript
const { setWiremapNodeCount } = useVoidStore()

// Desktop
setWiremapNodeCount(80)

// Mobile
setWiremapNodeCount(40)

// Low-end device
setWiremapNodeCount(20)
```

### Disabling Wiremap

```typescript
const { setWiremapEnabled } = useVoidStore()

// Disable
setWiremapEnabled(false)

// Enable
setWiremapEnabled(true)
```

## Styling Integration

### Import Styles

```typescript
// In your main CSS or component
import '@/styles/glass.css'
import '@/styles/void-effects.css'
```

### Custom Styles

Extend VOID styles:

```css
/* Your custom styles */
.my-void-component {
  /* Use VOID CSS variables */
  background: var(--void-surface);
  border: 1px solid var(--void-border);
  
  /* Add your custom styles */
  padding: 1rem;
  border-radius: 8px;
}
```

## Error Handling

### Component Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <VoidDesktopPage />
</ErrorBoundary>
```

### API Error Handling

```typescript
try {
  await spotifyAPI.playTrack(track)
} catch (error) {
  if (error.message === 'Authentication expired') {
    // Re-authenticate
    await authenticateSpotify()
  } else {
    // Show error to user
    console.error('Playback error:', error)
  }
}
```

## Performance Considerations

### Lazy Loading

```typescript
// Lazy load VOID page
const VoidDesktopPage = lazy(() => 
  import('@/pages/void/index')
)
```

### Conditional Loading

```typescript
// Only load wiremap on desktop
const isDesktop = !useIsMobile()

{isDesktop && <WiremapBackground />}
```

## Testing Integration

### Mock Store

```typescript
// In tests
import { useVoidStore } from '@/lib/void/store'

beforeEach(() => {
  useVoidStore.setState({
    theme: 'light',
    wiremapEnabled: true,
    // ... other state
  })
})
```

### Mock Components

```typescript
// Mock wiremap for tests
jest.mock('@/components/void/WiremapBackground', () => ({
  WiremapBackground: () => <div data-testid="wiremap" />
}))
```

## Troubleshooting

### Theme Not Applying

1. Check `initTheme()` is called
2. Verify CSS variables are loaded
3. Check `data-theme` attribute

### Wiremap Not Rendering

1. Check OffscreenCanvas support
2. Verify Web Worker loads
3. Check browser console for errors

### Media Not Working

1. Verify Spotify authentication
2. Check Media Session API support
3. Review browser console errors

## Best Practices

1. **Lazy Load**: Load VOID components on demand
2. **Error Boundaries**: Wrap VOID components
3. **Performance**: Monitor FPS, throttle when needed
4. **Accessibility**: Use ARIA labels
5. **Testing**: Mock external APIs

---

**Last Updated**: December 2025
