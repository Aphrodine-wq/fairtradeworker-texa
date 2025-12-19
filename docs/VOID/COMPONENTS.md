# VOID Component Reference

## Overview

Complete reference for all VOID components, their props, usage, and examples.

## Core Components

### WiremapBackground

WebGL wiremap background component.

**Location**: `components/void/WiremapBackground.tsx`

**Integration Status**: ✅ Automatically integrated in `VOID.tsx` (v1.2.0+). Conditionally rendered based on `wiremapEnabled` from store.

**Props:**
```typescript
interface WiremapBackgroundProps {
  className?: string
}
```

**Usage (Automatic):**
```tsx
import { VOID } from '@/components/void/VOID'

<VOID user={user} />
// WiremapBackground automatically included when wiremapEnabled is true
```

**Usage (Manual):**
```tsx
import { WiremapBackground } from '@/components/void/WiremapBackground'

<WiremapBackground className="fixed inset-0" />
```

**Features:**
- Adaptive node count (80 desktop / 40 mobile)
- Mouse attraction (200px radius)
- Click ripples (3 waves)
- Theme-aware colors
- FPS monitoring with auto-throttle

**Store Integration:**
```typescript
const { wiremapEnabled, theme } = useVoidStore()
```

### ThemeToggle

Instant theme switching button.

**Location**: `components/void/ThemeToggle.tsx`

**Props:** None (uses store)

**Usage:**
```tsx
import { VoidThemeToggle } from '@/components/void/ThemeToggle'

<VoidThemeToggle />
```

**Features:**
- 0ms perceived switch
- Icon animation (rotation)
- Hover effects
- Accessibility labels

### BackgroundSystem

Drag-drop background upload system.

**Location**: `components/void/BackgroundSystem.tsx`

**Integration Status**: ✅ Automatically integrated in `VOID.tsx` (v1.2.0+). Part of Background Layer (LAYER 1: z: 0-1).

**Props:**
```typescript
interface BackgroundSystemProps {
  className?: string
}
```

**Usage (Automatic):**
```tsx
import { VOID } from '@/components/void/VOID'

<VOID user={user} />
// BackgroundSystem automatically included
```

**Usage (Manual):**
```tsx
import { BackgroundSystem } from '@/components/void/BackgroundSystem'

<BackgroundSystem />
```

**Features:**
- Drag-drop image upload
- Auto-contrast adjustment
- IndexedDB storage
- Idle timeout (5 minutes)
- Right-click context menu

**File Limits:**
- Max size: 2MB
- Formats: All image types
- Auto-conversion: WebP/AVIF when possible

### MicroInteractions

120fps micro-interaction wrappers.

**Location**: `components/void/MicroInteractions.tsx`

**Components:**

#### IconInteraction
```tsx
<IconInteraction onHover={() => {}} onDrag={() => {}}>
  <YourIcon />
</IconInteraction>
```

#### DraggableIcon
```tsx
<DraggableIcon onDrag={() => {}}>
  <YourIcon />
</DraggableIcon>
```

#### WindowInteraction
```tsx
<WindowInteraction isOpen={isOpen}>
  <YourWindow />
</WindowInteraction>
```

#### SnappableWindow
```tsx
<SnappableWindow>
  <YourWindow />
</SnappableWindow>
```

#### ButtonInteraction
```tsx
<ButtonInteraction onTap={() => {}}>
  <button>Click Me</button>
</ButtonInteraction>
```

## Media Components

### MediaToolbar

Collapsible media player toolbar.

**Location**: `components/media/MediaToolbar.tsx`

**Props:**
```typescript
interface MediaToolbarProps {
  className?: string
}
```

**Usage:**
```tsx
import { MediaToolbar } from '@/components/media/MediaToolbar'

<MediaToolbar />
```

**States:**
- **Expanded**: 40px height, full controls
- **Collapsed**: 40px height, track info only
- **Minimized**: 8px height, track name marquee

**Position:**
- Fixed top-right
- Right of profile icon
- Z-index: 50

### NowPlayingWidget

Full-featured now playing widget.

**Location**: `components/media/NowPlayingWidget.tsx`

**Props:**
```typescript
interface NowPlayingWidgetProps {
  className?: string
}
```

**Usage:**
```tsx
import { NowPlayingWidget } from '@/components/media/NowPlayingWidget'

<NowPlayingWidget />
```

**Features:**
- Album art (40×40px)
- Track info with marquee
- Playback controls
- Volume control
- Like button

**Store Integration:**
```typescript
const {
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  setIsPlaying,
  setVolume,
  setIsMuted
} = useVoidStore()
```

## Hooks

### use120fps

120fps animation monitoring hook.

**Location**: `hooks/use120fps.ts`

**Usage:**
```typescript
import { use120fps } from '@/hooks/use120fps'

const { currentFps, isThrottled, effectiveFps, frameDelay } = use120fps({
  targetFps: 120,
  throttleThreshold: 8.33,
  onFpsChange: (fps) => console.log(fps)
})
```

**Returns:**
- `currentFps`: Current FPS
- `isThrottled`: Whether throttled to 60fps
- `effectiveFps`: Effective FPS (120 or 60)
- `frameDelay`: Frame delay in ms

### useMediaSession

Media Session API integration hook.

**Location**: `hooks/useMediaSession.ts`

**Usage:**
```typescript
import { useMediaSession } from '@/hooks/useMediaSession'

useMediaSession({
  track: currentTrack,
  isPlaying,
  currentTime: 0,
  duration: 0,
  onPlay: () => setIsPlaying(true),
  onPause: () => setIsPlaying(false),
  onNext: () => handleNext(),
  onPrevious: () => handlePrevious(),
})
```

**Features:**
- Windows media key support
- Metadata updates
- Position state for seeking

### useCRMMoodSync

CRM mood synchronization hook.

**Location**: `hooks/useCRMMoodSync.ts`

**Usage:**
```typescript
import { useCRMMoodSync } from '@/hooks/useCRMMoodSync'

useCRMMoodSync()
```

**Features:**
- Auto-pause during voice recording
- Focus mode playlist switching
- Win celebration sounds
- Lead added notifications

## Utility Functions

### gpuTransform

GPU-accelerated transform utility.

**Location**: `hooks/use120fps.ts`

**Usage:**
```typescript
import { gpuTransform } from '@/hooks/use120fps'

const transform = gpuTransform({
  x: 10,
  y: 20,
  z: 0,
  scale: 1.05,
  rotate: 2
})
// Returns: "translate3d(10px, 20px, 0px) scale(1.05) rotate(2deg)"
```

### use120fpsSpring

Spring physics animation hook.

**Location**: `hooks/use120fps.ts`

**Usage:**
```typescript
import { use120fpsSpring } from '@/hooks/use120fps'

const value = use120fpsSpring(target, {
  stiffness: 300,
  damping: 30,
  mass: 1,
  precision: 0.01
})
```

## Store Actions

### Desktop Actions

```typescript
const {
  setDesktopBackground,
  setWiremapEnabled,
  setWiremapNodeCount
} = useVoidStore()

// Set background
setDesktopBackground('data:image/...')

// Configure wiremap
setWiremapEnabled(true)
setWiremapNodeCount(80)
```

### Media Actions

```typescript
const {
  setCurrentTrack,
  setIsPlaying,
  setVolume,
  setIsMuted
} = useVoidStore()

// Control playback
setCurrentTrack(track)
setIsPlaying(true)
setVolume(0.7)
setIsMuted(false)
```

### Theme Actions

```typescript
const { theme, setTheme } = useVoidStore()

// Get current theme
const currentTheme = theme

// Set theme
setTheme('dark')
```

## Component Composition

### Recommended: Using VOID Component (v1.2.0+)

**Recommended approach** - All background and theme systems are automatically integrated:

```tsx
import { VOID } from '@/components/void/VOID'

export default function VoidDesktop({ user }: { user: User }) {
  return (
    <VOID 
      user={user}
      onNavigate={(page) => navigate(page)}
    />
  )
}
```

The VOID component automatically includes:
- ✅ BackgroundSystem
- ✅ WiremapBackground (when enabled)
- ✅ Theme initialization
- ✅ All layer components

### Manual Composition (Legacy/Advanced)

For advanced use cases requiring manual composition:

```tsx
import { WiremapBackground } from '@/components/void/WiremapBackground'
import { BackgroundSystem } from '@/components/void/BackgroundSystem'
import { MediaToolbar } from '@/components/media/MediaToolbar'
import { VoidThemeToggle } from '@/components/void/ThemeToggle'

export default function VoidDesktop() {
  return (
    <div className="void-desktop">
      <BackgroundSystem />
      <WiremapBackground />
      <VoidThemeToggle />
      <MediaToolbar />
      {/* Your content */}
    </div>
  )
}
```

### With Micro-Interactions

```tsx
import { IconInteraction, ButtonInteraction } from '@/components/void/MicroInteractions'

<IconInteraction onHover={() => {}}>
  <YourIcon />
</IconInteraction>

<ButtonInteraction onTap={() => {}}>
  <button>Click</button>
</ButtonInteraction>
```

## Styling

### Glass Panels

```tsx
<div className="glass-panel">
  {/* Content */}
</div>
```

### Theme-Aware Colors

```tsx
<div style={{ 
  background: 'var(--void-surface)',
  border: '1px solid var(--void-border)',
  color: 'var(--void-text-primary)'
}}>
  {/* Content */}
</div>
```

## Best Practices

1. **Use Store**: Always use Zustand store for state
2. **GPU Acceleration**: Use `gpuTransform` for animations
3. **Theme Colors**: Use CSS variables, not hardcoded
4. **Lazy Load**: Load components on demand
5. **Error Handling**: Handle API errors gracefully

## TypeScript Types

### IconData

```typescript
interface IconData {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  position: GridPosition
  pinned: boolean
  type: 'folder' | 'tool' | 'system'
  menuId?: string
  gridSize?: { width: number; height: number }
}
```

### WindowData

```typescript
interface WindowData {
  id: string
  title: string
  menuId?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  minimized: boolean
  maximized: boolean
  zIndex: number
  content: React.ReactNode
}
```

### Track

```typescript
interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  artwork?: string
  uri?: string
  service: MusicService
}
```

---

**Last Updated**: December 2025
