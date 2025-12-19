# VOID Desktop System - Complete Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [State Management](#state-management)
4. [Component Specifications](#component-specifications)
5. [Theme System](#theme-system)
6. [Visual Effects System](#visual-effects-system)
7. [Media Integration](#media-integration)
8. [WebGL Wiremap System](#webgl-wiremap-system)
9. [Performance Specifications](#performance-specifications)
10. [File Structure](#file-structure)
11. [API Reference](#api-reference)
12. [Data Flow Diagrams](#data-flow-diagrams)
13. [Configuration Options](#configuration-options)
14. [Dependencies](#dependencies)
15. [Integration Patterns](#integration-patterns)
16. [Testing Strategy](#testing-strategy)
17. [Deployment Guide](#deployment-guide)
18. [Troubleshooting Reference](#troubleshooting-reference)
19. [Future Roadmap](#future-roadmap)

---

## Executive Summary

The VOID Desktop System is a revolutionary desktop interface that combines Windows Aero aesthetics with iOS design principles. It features glassmorphism effects, 120fps micro-interactions, WebGL wiremap backgrounds, and seamless media integration.

### Key Features

- **Instant Theme Switching**: 0ms perceived delay with background cross-fade
- **120fps Animations**: Smooth micro-interactions with auto-throttling
- **WebGL Wiremap**: Interactive 3D background (80 nodes desktop / 40 mobile)
- **Media Integration**: Spotify + Media Session API support
- **Glassmorphism**: Windows Aero + iOS hybrid aesthetic
- **State Persistence**: Zustand with localStorage/IndexedDB
- **Responsive Design**: Adaptive node counts and layouts

### Performance Targets

- **Frame Rate**: 120fps target, 60fps minimum
- **Frame Time**: <8.33ms for 120fps, <16.67ms for 60fps
- **Memory**: ~15-25MB typical usage
- **Load Time**: <2s initial load, <500ms route navigation

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Components  │  │  Animations  │  │    Styles     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  State Management Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Zustand    │  │  Persistence │  │   Hooks       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Utilities  │  │   Services   │  │   Workers    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  IndexedDB   │  │  LocalStorage│  │   Web APIs    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
VoidDesktopPage (pages/void/index.tsx)
├── BackgroundSystem
├── WiremapBackground
│   └── Web Worker (wiremapWorker.ts)
├── VoidThemeToggle
├── MediaToolbar
│   ├── NowPlayingWidget
│   └── useMediaSession hook
└── Desktop Content
    ├── VoidIcon (multiple)
    ├── VoidWindow (multiple)
    └── VoidTaskbar
```

### Data Flow

1. **User Interaction** → Component Event Handler
2. **Component** → Zustand Store Action
3. **Store** → Persistence Middleware
4. **Persistence** → localStorage/IndexedDB
5. **Store Update** → Component Re-render
6. **Component** → Visual Update

---

## State Management

### Store Structure (`lib/void/store.ts`)

#### Complete State Interface

```typescript
interface VoidStore {
  // ========== ICON MANAGEMENT ==========
  icons: IconData[]
  iconPositions: Record<string, GridPosition>
  pinnedIcons: Set<string>
  iconUsage: Record<string, number>
  sortOption: SortOption | null
  
  // ========== WINDOW MANAGEMENT ==========
  windows: WindowData[]
  activeWindowId: string | null
  nextZIndex: number
  
  // ========== THEME ==========
  theme: Theme // 'dark' | 'light'
  
  // ========== DESKTOP SLICE ==========
  desktopBackground: string | null // Data URL or URL
  wiremapEnabled: boolean
  wiremapNodeCount: number // 80 desktop / 40 mobile
  
  // ========== MEDIA SLICE ==========
  currentTrack: Track | null
  isPlaying: boolean
  volume: number // 0-1
  isMuted: boolean
  
  // ========== VOICE SLICE ==========
  voiceState: VoiceState
  voicePermission: VoicePermission
  voiceRecording: Blob | null
  voiceTranscript: string
  extractedEntities: ExtractedEntities | null
  
  // ========== BUDDY SLICE ==========
  buddyState: BuddyState
  buddyMessages: BuddyMessage[]
  
  // ========== ACTIONS ==========
  // Icon actions
  updateIconPosition: (id: string, position: GridPosition) => void
  pinIcon: (id: string) => void
  unpinIcon: (id: string) => void
  sortIcons: (option: SortOption) => void
  recordIconUsage: (id: string) => void
  
  // Window actions
  openWindow: (menuId: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  focusWindow: (id: string) => void
  
  // Voice actions
  setVoiceState: (state: VoiceState) => void
  setVoicePermission: (permission: VoicePermission) => void
  setVoiceRecording: (blob: Blob | null) => void
  setVoiceTranscript: (text: string) => void
  setExtractedEntities: (entities: ExtractedEntities | null) => void
  
  // Buddy actions
  setBuddyCollapsed: (collapsed: boolean) => void
  setBuddyPosition: (position: BuddyState['position']) => void
  setBuddyDocked: (docked: boolean) => void
  setBuddyEmotion: (emotion: BuddyState['emotion']) => void
  addBuddyMessage: (message: BuddyMessage) => void
  updateBuddyLastMessageTime: (time: number) => void
  
  // Theme actions
  setTheme: (theme: Theme) => void
  
  // Desktop slice actions
  setDesktopBackground: (background: string | null) => void
  setWiremapEnabled: (enabled: boolean) => void
  setWiremapNodeCount: (count: number) => void
  
  // Media slice actions
  setCurrentTrack: (track: Track | null) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setIsMuted: (muted: boolean) => void
}
```

### Initial State

```typescript
{
  icons: initialIcons, // 16 default icons
  iconPositions: initialPositions, // Grid positions
  pinnedIcons: new Set<string>(),
  iconUsage: {},
  windows: [],
  activeWindowId: null,
  nextZIndex: 1000,
  sortOption: null,
  theme: 'light',
  desktopBackground: null,
  wiremapEnabled: true,
  wiremapNodeCount: 80,
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  isMuted: false,
  voiceState: 'idle',
  voicePermission: 'prompt',
  voiceRecording: null,
  voiceTranscript: '',
  extractedEntities: null,
  buddyState: {
    collapsed: false,
    position: 'top-left',
    docked: false,
    lastMessageTime: 0,
    emotion: 'neutral',
  },
  buddyMessages: [],
}
```

### Persistence Configuration

```typescript
persist(
  (set, get) => ({ /* store implementation */ }),
  {
    name: 'void-desktop-storage',
    partialize: (state) => ({
      iconPositions: state.iconPositions,
      pinnedIcons: Array.from(state.pinnedIcons), // Convert Set to Array
      iconUsage: state.iconUsage,
      sortOption: state.sortOption,
      theme: state.theme,
      desktopBackground: state.desktopBackground,
      wiremapEnabled: state.wiremapEnabled,
      wiremapNodeCount: state.wiremapNodeCount,
      currentTrack: state.currentTrack,
      isPlaying: state.isPlaying,
      volume: state.volume,
      isMuted: state.isMuted,
      voicePermission: state.voicePermission,
      buddyState: state.buddyState,
    }),
  }
)
```

### Default Icons

```typescript
const defaultIcons = [
  { id: 'customers', label: 'Customers', type: 'folder', menuId: 'customers' },
  { id: 'leads', label: 'Leads', type: 'folder', menuId: 'leads' },
  { id: 'pipeline', label: 'Pipeline', type: 'folder', menuId: 'pipeline' },
  { id: 'contacts', label: 'Contacts', type: 'folder', menuId: 'contacts' },
  { id: 'documents', label: 'Documents', type: 'folder', menuId: 'documents' },
  { id: 'ai-hub', label: 'AI Hub', type: 'tool', menuId: 'ai' },
  { id: 'automation', label: 'Automation', type: 'tool', menuId: 'automation' },
  { id: 'integrations', label: 'Integrations', type: 'tool', menuId: 'integrations' },
  { id: 'analytics', label: 'Analytics', type: 'tool', menuId: 'analytics' },
  { id: 'email', label: 'Email', type: 'tool', menuId: 'email' },
  { id: 'billing', label: 'Billing', type: 'tool', menuId: 'billing' },
  { id: 'calendar', label: 'Calendar', type: 'tool', menuId: 'calendar' },
  { id: 'marketplace', label: 'Marketplace', type: 'tool', menuId: 'marketplace' },
  { id: 'settings', label: 'Settings', type: 'system', menuId: 'settings' },
  { id: 'voice-capture', label: 'Voice Capture', type: 'tool', menuId: 'voice' },
]
```

### Icon Grid Layout

- **Grid System**: 200×200 CSS Grid (1-200 rows, 1-200 cols)
- **Icon Size**: 64×64px per grid cell
- **Default Layout**: 5 icons per row, starting at row 2, col 2
- **Voice Icon**: Special 2×2 grid size at row 10, col 10

---

## Component Specifications

### Core Components

#### 1. VoidDesktopPage (`pages/void/index.tsx`)

**Purpose**: Main entry point for VOID desktop

**Props**: None

**Structure**:
```tsx
<div className="void-desktop fixed inset-0 overflow-hidden">
  <BackgroundSystem />
  {wiremapEnabled && <WiremapBackground />}
  <div className="relative z-10 w-full h-full">
    <VoidThemeToggle />
    <MediaToolbar />
    {/* Desktop content */}
  </div>
</div>
```

**Lifecycle**:
- `useEffect`: Initialize theme on mount
- `useCRMMoodSync`: Auto-pause during voice recording

**Dependencies**:
- `@/lib/void/store`
- `@/lib/themes`
- `@/hooks/useCRMMoodSync`

#### 2. WiremapBackground (`components/void/WiremapBackground.tsx`)

**Purpose**: WebGL wiremap background rendering

**Props**:
```typescript
interface WiremapBackgroundProps {
  className?: string
}
```

**Implementation Details**:

1. **OffscreenCanvas Setup**:
   ```typescript
   const offscreen = canvas.transferControlToOffscreen()
   ```

2. **Web Worker Creation**:
   ```typescript
   const worker = new Worker(
     new URL('@/lib/void/wiremapWorker.ts', import.meta.url),
     { type: 'module' }
   )
   ```

3. **Initialization Message**:
   ```typescript
   worker.postMessage({
     type: 'init',
     config: {
       nodeCount: 80, // or 40 for mobile
       width: canvas.width,
       height: canvas.height,
       nodeColor: getThemeColors(theme).wiremap.node,
       lineColor: getThemeColors(theme).wiremap.line,
       rippleColor: getThemeColors(theme).wiremap.ripple,
     },
     canvas: offscreen,
   }, [offscreen])
   ```

4. **Mouse Interaction**:
   ```typescript
   const handleMouseMove = (e: MouseEvent) => {
     const rect = canvas.getBoundingClientRect()
     worker.postMessage({
       type: 'mouse',
       mouse: {
         x: e.clientX - rect.left,
         y: e.clientY - rect.top,
       },
     })
   }
   ```

5. **Click Ripples**:
   ```typescript
   const handleClick = (e: MouseEvent) => {
     const rect = canvas.getBoundingClientRect()
     worker.postMessage({
       type: 'click',
       click: {
         x: e.clientX - rect.left,
         y: e.clientY - rect.top,
       },
     })
   }
   ```

**Responsive Behavior**:
- Desktop: 80 nodes
- Mobile: 40 nodes
- Auto-detects via `useIsMobile()` hook

**Cleanup**:
```typescript
return () => {
  if (workerRef.current) {
    workerRef.current.terminate()
  }
}
```

#### 3. BackgroundSystem (`components/void/BackgroundSystem.tsx`)

**Purpose**: Drag-drop background upload and management

**Features**:
- Drag-drop image upload
- Auto-contrast adjustment
- IndexedDB storage
- Idle timeout (5 minutes)
- Right-click context menu

**File Limits**:
- Max size: 2MB
- Formats: All image types
- Auto-conversion: WebP/AVIF when possible

**IndexedDB Schema**:
```typescript
// Database: void-desktop
// Store: backgrounds
// Key: 'current'
// Value: { id: 'current', data: string, timestamp: number }
```

**Contrast Analysis**:
```typescript
const analyzeContrast = (imageData: ImageData) => {
  // Calculate average brightness
  let sum = 0
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    const brightness = (r + g + b) / 3
    sum += brightness
  }
  const avgBrightness = sum / (imageData.data.length / 4)
  
  // Adjust overlay opacity based on brightness
  // Dark images: lower opacity (0.2)
  // Bright images: higher opacity (0.5)
  return avgBrightness < 128 ? 0.2 : 0.5
}
```

#### 4. VoidThemeToggle (`components/void/ThemeToggle.tsx`)

**Purpose**: Instant theme switching

**Implementation**:
```typescript
const toggleTheme = () => {
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
  
  // Instant switch (0ms perceived delay)
  document.documentElement.setAttribute('data-theme', nextTheme)
  applyTheme(nextTheme)
  
  // Update dark class for compatibility
  if (nextTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Store preference
  localStorage.setItem('void-theme', nextTheme)
  setTheme(nextTheme)
}
```

**Animation**:
- Icon rotation: 180deg spring animation
- Background cross-fade: 300ms CSS transition (only backgrounds)

#### 5. MediaToolbar (`components/media/MediaToolbar.tsx`)

**Purpose**: Collapsible media player toolbar

**States**:
- **Expanded**: 40px height, full controls
- **Collapsed**: 40px height, track info only
- **Minimized**: 8px height, track name marquee

**Position**: Fixed top-right, right of profile icon

**Integration**:
- Uses `useMediaSession` hook for Windows media keys
- Auto-minimizes when no track playing

#### 6. NowPlayingWidget (`components/media/NowPlayingWidget.tsx`)

**Purpose**: Full-featured now playing widget

**Features**:
- Album art (40×40px)
- Track info with marquee
- Playback controls (prev, play/pause, next)
- Like button
- Volume slider with mute

**Marquee Animation**:
```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

---

## Theme System

### Theme Objects (`lib/themes.ts`)

#### Theme Type

```typescript
type Theme = 'dark' | 'light'
```

#### ThemeColors Interface

```typescript
interface ThemeColors {
  // Surface colors
  surface: string // Main glass panel background
  surfaceSecondary: string // Secondary panels
  border: string // Border color with opacity
  
  // Text colors
  textPrimary: string // Main text (95% opacity)
  textSecondary: string // Secondary text (70% opacity)
  textMuted: string // Muted text (50% opacity)
  
  // Background colors
  background: string // Main background
  backgroundOverlay: string // Overlay for contrast
  
  // Accent colors
  accent: string // Primary accent
  accentSecondary: string // Secondary accent
  
  // Wiremap colors
  wiremap: {
    node: string // Node color
    line: string // Connection line color
    ripple: string // Click ripple color
  }
  
  // Glass panel colors
  glass: {
    background: string // Glass background
    border: string // Glass border
    shadow: string // Glass shadow
  }
}
```

### Dark Theme Colors

```typescript
dark: {
  surface: 'rgba(20, 20, 20, 0.9)',
  surfaceSecondary: 'rgba(30, 30, 30, 0.9)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  background: '#000000',
  backgroundOverlay: 'rgba(0, 0, 0, 0.4)',
  accent: '#4A90E2',
  accentSecondary: '#6B9BD2',
  wiremap: {
    node: '#4A90E2',
    line: '#2E5C8A',
    ripple: '#6B9BD2',
  },
  glass: {
    background: 'rgba(20, 20, 20, 0.9)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
}
```

### Light Theme Colors

```typescript
light: {
  surface: 'rgba(255, 255, 255, 0.9)',
  surfaceSecondary: 'rgba(250, 250, 250, 0.9)',
  border: 'rgba(0, 0, 0, 0.1)',
  textPrimary: 'rgba(0, 0, 0, 0.95)',
  textSecondary: 'rgba(0, 0, 0, 0.7)',
  textMuted: 'rgba(0, 0, 0, 0.5)',
  background: '#FFFFFF',
  backgroundOverlay: 'rgba(255, 255, 255, 0.4)',
  accent: '#2563EB',
  accentSecondary: '#3B82F6',
  wiremap: {
    node: '#2563EB',
    line: '#1E40AF',
    ripple: '#3B82F6',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
}
```

### CSS Variables

All theme colors are mapped to CSS variables:

```css
:root {
  --void-surface: rgba(255, 255, 255, 0.9);
  --void-surface-secondary: rgba(250, 250, 250, 0.9);
  --void-border: rgba(0, 0, 0, 0.1);
  --void-text-primary: rgba(0, 0, 0, 0.95);
  --void-text-secondary: rgba(0, 0, 0, 0.7);
  --void-text-muted: rgba(0, 0, 0, 0.5);
  --void-background: #FFFFFF;
  --void-background-overlay: rgba(255, 255, 255, 0.4);
  --void-accent: #2563EB;
  --void-accent-secondary: #3B82F6;
  --void-wiremap-node: #2563EB;
  --void-wiremap-line: #1E40AF;
  --void-wiremap-ripple: #3B82F6;
  --void-glass-background: rgba(255, 255, 255, 0.9);
  --void-glass-border: rgba(0, 0, 0, 0.1);
  --void-glass-shadow: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --void-surface: rgba(20, 20, 20, 0.9);
  /* ... all dark theme colors ... */
}
```

### Theme Functions

#### `getThemeColors(theme: Theme): ThemeColors`
Returns theme colors object for specified theme.

#### `applyTheme(theme: Theme): void`
Applies theme to document:
1. Sets `data-theme` attribute
2. Updates all CSS variables
3. Updates dark class for compatibility

#### `getCurrentTheme(): Theme`
Gets current theme from:
1. localStorage (`void-theme`)
2. System preference (prefers-color-scheme)
3. Default: 'light'

#### `initTheme(): void`
Initializes theme on page load:
1. Gets current theme
2. Applies theme
3. Sets dark class if needed

---

## Visual Effects System

### Glassmorphism

#### CSS Implementation

```css
.glass-panel {
  background: var(--void-glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--void-glass-border);
  border-radius: 12px;
  box-shadow:
    0 8px 32px var(--void-glass-shadow),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  will-change: transform, opacity;
  transform: translateZ(0);
}
```

#### Glass Components

- `.glass-panel`: Main glass container
- `.glass-card`: Card variant
- `.glass-window`: Window variant
- `.glass-button`: Interactive button
- `.glass-overlay`: Modal overlay

### 120fps Micro-Interactions

#### use120fps Hook

**Purpose**: Monitor and maintain 120fps target with auto-throttling

**Implementation**:
```typescript
export function use120fps(options: Use120FpsOptions = {}) {
  const {
    targetFps = 120,
    throttleThreshold = 8.33, // 120fps = 8.33ms per frame
    onFpsChange,
  } = options

  // Track frame time history (last 60 frames)
  const frameTimeHistoryRef = useRef<number[]>([])
  
  // Calculate average frame time
  const avgFrameTime = frameTimeHistoryRef.current.reduce((a, b) => a + b, 0) / frameTimeHistoryRef.current.length
  
  // Auto-throttle if frame time > threshold
  const shouldThrottle = avgFrameTime > throttleThreshold
  
  return {
    currentFps,
    isThrottled: shouldThrottle,
    effectiveFps: shouldThrottle ? 60 : 120,
    frameDelay: shouldThrottle ? 16.67 : 8.33,
  }
}
```

**Auto-Throttling Logic**:
- Monitors last 60 frames
- Calculates average frame time
- Throttles to 60fps if average > 8.33ms
- Sustains for >3 seconds before throttling

#### Micro-Interaction Types

1. **Icon Hover**:
   - Scale: `1 → 1.05`
   - Glow: `0 → 4px`
   - Duration: 16ms
   - Easing: `easeOut`

2. **Icon Drag**:
   - Z-Index: Increments to 1000
   - Shadow: `0 → 24px`
   - Rotation: `0 → 2deg`
   - Duration: 16ms

3. **Window Open**:
   - Scale: `0.9 → 1`
   - Blur: `10px → 0`
   - Duration: 200ms
   - Easing: Spring (stiffness: 300, damping: 30)

4. **Window Snap**:
   - Magnetic threshold: 50px
   - Haptic feedback: 10ms vibration
   - Spring animation: Smooth snap

5. **Button Tap**:
   - Scale: `1 → 0.98`
   - Background shift: Opacity change
   - Duration: 8ms

#### GPU Acceleration

All animations use GPU-accelerated transforms:

```css
transform: translate3d(0, 0, 0);
will-change: transform, opacity;
backface-visibility: hidden;
```

#### gpuTransform Utility

```typescript
export function gpuTransform(transform: {
  x?: number
  y?: number
  z?: number
  scale?: number
  rotate?: number
}): string {
  const { x = 0, y = 0, z = 0, scale = 1, rotate = 0 } = transform
  return `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotate(${rotate}deg)`
}
```

#### use120fpsSpring Hook

Spring physics animation hook:

```typescript
export function use120fpsSpring(
  target: number,
  options: {
    stiffness?: number // Default: 300
    damping?: number // Default: 30
    mass?: number // Default: 1
    precision?: number // Default: 0.01
  } = {}
): number
```

**Physics Calculation**:
```typescript
const diff = target - value
const springForce = diff * (stiffness / 1000)
const dampingForce = velocity * (damping / 1000)
const acceleration = (springForce - dampingForce) / mass
velocity += acceleration
value += velocity
```

---

## Media Integration

### Spotify Integration

#### Authentication Flow

1. User clicks "Connect Spotify"
2. Redirect to Spotify OAuth:
   ```
   https://accounts.spotify.com/authorize?
     client_id={CLIENT_ID}&
     response_type=code&
     redirect_uri={REDIRECT_URI}&
     scope=user-read-playback-state,user-modify-playback-state
   ```
3. Spotify redirects with `code`
4. Exchange code for access token
5. Store token in localStorage

#### API Methods

```typescript
const spotifyAPI: MusicServiceAPI = {
  authenticate(): Promise<boolean>
  getPlaylists(): Promise<Playlist[]>
  getStations(): Promise<Station[]>
  getCurrentlyPlaying(): Promise<Track | null>
  playTrack(track: Track): Promise<void>
  playPlaylist(playlist: Playlist): Promise<void>
  playStation(station: Station): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  setVolume(volume: number): Promise<void>
  seek(position: number): Promise<void>
  next(): Promise<void>
  previous(): Promise<void>
}
```

#### Offline Caching

**IndexedDB Schema**:
```typescript
// Database: spotify-tracks-cache
// Store: tracks
// Key: Track ID
// Value: Track & { cachedAt: number }
// Limit: 10 tracks (auto-cleanup oldest)
```

**Cache Functions**:
```typescript
async function cacheTrack(track: Track): Promise<void> {
  const db = await openDB('spotify-tracks-cache', 1)
  await db.put('tracks', { ...track, cachedAt: Date.now() }, track.id)
  
  // Cleanup if >10 tracks
  const allTracks = await db.getAll('tracks')
  if (allTracks.length > 10) {
    const sorted = allTracks.sort((a, b) => a.cachedAt - b.cachedAt)
    await db.delete('tracks', sorted[0].id)
  }
}

export async function getCachedTracks(): Promise<Track[]> {
  const db = await openDB('spotify-tracks-cache', 1)
  return await db.getAll('tracks')
}
```

### Media Session API

#### Initialization

```typescript
export function initMediaSession(handlers: MediaSessionHandlers): void {
  if (!('mediaSession' in navigator)) return
  
  navigator.mediaSession.setActionHandler('play', handlers.onPlay)
  navigator.mediaSession.setActionHandler('pause', handlers.onPause)
  navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious)
  navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext)
  navigator.mediaSession.setActionHandler('seekbackward', handlers.onSeekBackward)
  navigator.mediaSession.setActionHandler('seekforward', handlers.onSeekForward)
  navigator.mediaSession.setActionHandler('seekto', handlers.onSeekTo)
  navigator.mediaSession.setActionHandler('stop', handlers.onStop)
}
```

#### Metadata Updates

```typescript
export function updateMediaMetadata(track: Track | null, isPlaying: boolean): void {
  if (!('mediaSession' in navigator)) return
  
  if (track) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      artwork: track.artwork ? [
        { src: track.artwork, sizes: '96x96', type: 'image/png' },
        { src: track.artwork, sizes: '128x128', type: 'image/png' },
        { src: track.artwork, sizes: '192x192', type: 'image/png' },
      ] : [],
    })
  }
  
  updatePlaybackState(isPlaying)
}
```

#### useMediaSession Hook

```typescript
export function useMediaSession(options: UseMediaSessionOptions): void {
  const {
    track,
    isPlaying,
    currentTime = 0,
    duration = 0,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onSeekBackward,
    onSeekForward,
    onSeekTo,
    onStop,
  } = options

  useEffect(() => {
    initMediaSession({
      onPlay,
      onPause,
      onNext,
      onPrevious,
      onSeekBackward,
      onSeekForward,
      onSeekTo,
      onStop,
    })
  }, [])

  useEffect(() => {
    updateMediaMetadata(track, isPlaying)
  }, [track, isPlaying])

  useEffect(() => {
    if (duration > 0) {
      setPositionState(duration, currentTime)
    }
  }, [duration, currentTime])
}
```

### CRM Mood Sync

#### useCRMMoodSync Hook

**Purpose**: Sync media playback with CRM context

**Features**:
1. **Auto-Pause During Voice Recording**:
   ```typescript
   if (voiceState === 'recording' && isPlaying) {
     setIsPlaying(false)
   }
   ```

2. **High-Focus Task Detection** (Placeholder):
   ```typescript
   // Switch to instrumental playlist when high-focus task detected
   const handleFocusMode = () => {
     // Implementation pending
   }
   ```

3. **Win Celebration**:
   ```typescript
   const handleWin = () => {
     const audio = new Audio('/sounds/celebration.mp3')
     audio.volume = 0.3
     audio.play()
   }
   ```

4. **Lead Added Notification**:
   ```typescript
   const handleLeadAdded = () => {
     if (isPlaying && currentTrack) {
       // Show notification: "Want to add a note while listening?"
     }
   }
   ```

---

## WebGL Wiremap System

### Architecture

- **Web Worker**: OffscreenCanvas rendering
- **Three.js**: 3D scene management
- **PostMessage**: Main thread ↔ Worker communication

### Worker Implementation (`lib/void/wiremapWorker.ts`)

#### WiremapNode Interface

```typescript
interface WiremapNode {
  position: THREE.Vector3
  originalPosition: THREE.Vector3
  velocity: THREE.Vector3
  connections: number[]
}
```

#### WiremapConfig Interface

```typescript
interface WiremapConfig {
  nodeCount: number
  width: number
  height: number
  nodeColor: string
  lineColor: string
  rippleColor: string
  mouseAttractRadius: number // 200px
  mouseAttractStrength: number // 0.5
  maxConnectionDistance: number // 2.5 units
}
```

#### WiremapRenderer Class

```typescript
class WiremapRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private nodes: WiremapNode[] = []
  private connections: THREE.Line[] = []
  private ripples: Ripple[] = []
  private mousePosition: THREE.Vector2 | null = null
  private config: WiremapConfig
  private frameTimeHistory: number[] = []
  private isThrottled: boolean = false
  
  constructor(config: WiremapConfig, canvas: OffscreenCanvas) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, config.width / config.height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.config = config
    
    // Create nodes
    this.createNodes()
    
    // Create connections
    this.createConnections()
    
    // Start animation loop
    this.animate()
  }
  
  private createNodes(): void {
    for (let i = 0; i < this.config.nodeCount; i++) {
      const node: WiremapNode = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        originalPosition: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        connections: [],
      }
      node.originalPosition.copy(node.position)
      this.nodes.push(node)
    }
  }
  
  private createConnections(): void {
    // Connect nodes within maxConnectionDistance
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const distance = this.nodes[i].position.distanceTo(this.nodes[j].position)
        if (distance < this.config.maxConnectionDistance) {
          this.nodes[i].connections.push(j)
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              this.nodes[i].position,
              this.nodes[j].position,
            ]),
            new THREE.LineBasicMaterial({ color: this.config.lineColor, opacity: 0.3, transparent: true })
          )
          this.connections.push(line)
          this.scene.add(line)
        }
      }
    }
  }
  
  private updateNodes(): void {
    for (const node of this.nodes) {
      // Mouse attraction
      if (this.mousePosition) {
        const mouse3D = this.screenToWorld(this.mousePosition)
        const distance = node.position.distanceTo(mouse3D)
        if (distance < this.config.mouseAttractRadius) {
          const direction = mouse3D.sub(node.position).normalize()
          const strength = (1 - distance / this.config.mouseAttractRadius) * this.config.mouseAttractStrength
          node.velocity.add(direction.multiplyScalar(strength))
        }
      }
      
      // Spring back to original position
      const springForce = node.originalPosition.clone().sub(node.position).multiplyScalar(0.05)
      node.velocity.add(springForce)
      
      // Damping
      node.velocity.multiplyScalar(0.95)
      
      // Update position
      node.position.add(node.velocity)
    }
  }
  
  private updateRipples(): void {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i]
      ripple.age += 0.016 // ~60fps
      ripple.radius += ripple.speed
      ripple.opacity = Math.max(0, 1 - ripple.age / ripple.duration)
      
      if (ripple.age >= ripple.duration) {
        this.ripples.splice(i, 1)
      }
    }
  }
  
  private animate(): void {
    const startTime = performance.now()
    
    // Update nodes
    this.updateNodes()
    
    // Update connections
    this.updateConnections()
    
    // Update ripples
    this.updateRipples()
    
    // Render
    this.renderer.render(this.scene, this.camera)
    
    // FPS monitoring
    const frameTime = (performance.now() - startTime)
    this.frameTimeHistory.push(frameTime)
    if (this.frameTimeHistory.length > 180) {
      this.frameTimeHistory.shift()
    }
    
    // Auto-throttle
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
    this.isThrottled = avgFrameTime > 8.33
    
    // Schedule next frame
    if (this.isThrottled) {
      setTimeout(() => this.animate(), 16.67) // 60fps
    } else {
      requestAnimationFrame(() => this.animate())
    }
  }
  
  public updateConfig(config: Partial<WiremapConfig>): void {
    this.config = { ...this.config, ...config }
  }
  
  public setMousePosition(x: number, y: number): void {
    this.mousePosition = new THREE.Vector2(x, y)
  }
  
  public addClickRipple(x: number, y: number): void {
    // Create 3 waves
    for (let i = 0; i < 3; i++) {
      this.ripples.push({
        position: this.screenToWorld(new THREE.Vector2(x, y)),
        radius: 0,
        speed: 0.1 + i * 0.05,
        opacity: 1,
        age: i * 0.3,
        duration: 3,
      })
    }
  }
}
```

### Worker Messages

#### Main → Worker

```typescript
// Initialize
{
  type: 'init',
  config: WiremapConfig,
  canvas: OffscreenCanvas
}

// Update config
{
  type: 'update',
  config: Partial<WiremapConfig>
}

// Update theme
{
  type: 'theme',
  theme: {
    node: string
    line: string
    ripple: string
  }
}

// Mouse position
{
  type: 'mouse',
  mouse: { x: number, y: number }
}

// Click
{
  type: 'click',
  click: { x: number, y: number }
}
```

#### Worker → Main

```typescript
// Ready
{
  type: 'ready'
}

// Error
{
  type: 'error',
  error: string
}
```

### Node Behavior

- **Original Position**: Stored for spring-back
- **Mouse Attraction**: 200px radius, 0.5 strength
- **Spring Force**: Returns to original position (0.05 multiplier)
- **Velocity**: Damped motion (0.95 multiplier)
- **Connections**: Dynamic updates on node movement

### Click Ripples

- **Waves**: 3 waves per click
- **Stagger**: 0.3s between waves
- **Duration**: 3 seconds total
- **Decay**: Exponential fade
- **Speed**: Increases with each wave (0.1, 0.15, 0.2)

---

## Performance Specifications

### Frame Rate Targets

- **Target**: 120fps (8.33ms per frame)
- **Minimum**: 60fps (16.67ms per frame)
- **Throttle Threshold**: 8.33ms average frame time
- **Throttle Duration**: >3 seconds sustained

### Memory Usage

- **Wiremap Worker**: ~10-20MB
- **Track Cache**: ~1-2MB (10 tracks)
- **Background Image**: ~2MB max
- **Total Typical**: ~15-25MB

### Load Time Targets

- **Initial Load**: <2s
- **Route Navigation**: <500ms
- **Component Lazy Load**: <200ms
- **Worker Initialization**: <100ms

### Optimization Strategies

1. **Lazy Loading**: Components load on demand
2. **Code Splitting**: Route-based splitting
3. **Worker Offloading**: Heavy computation in worker
4. **GPU Acceleration**: `translate3d`, `will-change`
5. **Frame Throttling**: Auto-throttle to 60fps if needed
6. **Memory Management**: Proper cleanup on unmount
7. **Connection Culling**: Only render nearby connections
8. **Texture Caching**: Reuse textures

---

## File Structure

### Complete Directory Tree

```
src/
├── lib/
│   ├── themes.ts                    # Theme system
│   ├── void/
│   │   ├── store.ts                 # Zustand store
│   │   ├── types.ts                 # TypeScript types
│   │   ├── wiremapWorker.ts         # WebGL worker
│   │   ├── config.ts                 # Configuration
│   │   ├── grid.ts                  # Grid utilities
│   │   ├── particles.ts             # Particle system
│   │   ├── menuConfigs.ts           # Menu configurations
│   │   ├── voiceExtraction.ts       # Voice entity extraction
│   │   ├── buddyContext.ts          # Buddy context
│   │   ├── buddyLearning.ts         # Buddy learning
│   │   ├── dataHooks.ts             # Data hooks
│   │   └── iconMap.tsx              # Icon mappings
│   └── music/
│       ├── spotify.ts               # Spotify API
│       ├── mediaSession.ts          # Media Session API
│       └── types.ts                 # Music types
├── components/
│   ├── void/
│   │   ├── WiremapBackground.tsx    # Wiremap component
│   │   ├── BackgroundSystem.tsx     # Background system
│   │   ├── ThemeToggle.tsx          # Theme toggle
│   │   ├── MicroInteractions.tsx    # Micro-interactions
│   │   ├── VoidIcon.tsx             # Desktop icon
│   │   ├── VoidWindow.tsx           # Window component
│   │   ├── VoidWindowManager.tsx    # Window manager
│   │   ├── VoidTaskbar.tsx          # Taskbar
│   │   ├── VoidToolbar.tsx          # Toolbar
│   │   ├── VoidBuddy.tsx            # Buddy component
│   │   ├── VoidBuddyPanel.tsx       # Buddy panel
│   │   ├── VoidBuddyIcon.tsx        # Buddy icon
│   │   ├── VoidVoiceHub.tsx         # Voice hub
│   │   ├── VoidVoiceCapture.tsx     # Voice capture
│   │   ├── VoidVoiceIcon.tsx        # Voice icon
│   │   ├── VoiceRecordingDialog.tsx # Recording dialog
│   │   ├── VoicePermissionDialog.tsx # Permission dialog
│   │   ├── VoiceValidationDialog.tsx # Validation dialog
│   │   ├── VoiceEntityEditor.tsx    # Entity editor
│   │   ├── VoiceWaveform.tsx        # Waveform display
│   │   ├── VoidSpotifyPlayer.tsx    # Spotify player
│   │   ├── VoidCanvas.tsx           # Canvas component
│   │   ├── WiremapCanvas.tsx        # Wiremap canvas
│   │   ├── VoidParticles.tsx        # Particles
│   │   ├── BootAnimation.tsx        # Boot animation
│   │   ├── VoidMobileNav.tsx        # Mobile navigation
│   │   ├── VOID.tsx                 # Main VOID component
│   │   ├── VOID.lazy.tsx            # Lazy VOID
│   │   ├── windows/
│   │   │   ├── index.ts             # Window exports
│   │   │   ├── CustomersWindow.tsx  # Customers window
│   │   │   ├── LeadsWindow.tsx      # Leads window
│   │   │   ├── PipelineWindow.tsx   # Pipeline window
│   │   │   ├── SalesWindow.tsx      # Sales window
│   │   │   └── AIWindow.tsx         # AI window
│   │   └── menus/
│   │       └── VoidMenu.tsx         # Menu component
│   └── media/
│       ├── MediaToolbar.tsx        # Media toolbar
│       └── NowPlayingWidget.tsx    # Now playing widget
├── hooks/
│   ├── use120fps.ts                 # 120fps hook
│   ├── useMediaSession.ts           # Media Session hook
│   ├── useCRMMoodSync.ts           # CRM mood sync
│   └── use-mobile.ts                # Mobile detection
├── pages/
│   └── void/
│       └── index.tsx                # Main VOID page
└── styles/
    ├── glass.css                    # Glassmorphism styles
    └── void-effects.css             # VOID-specific styles
```

---

## API Reference

### Store Actions

#### Icon Management

```typescript
updateIconPosition(id: string, position: GridPosition): void
// Updates icon position in grid

pinIcon(id: string): void
// Pins icon (adds to pinnedIcons Set)

unpinIcon(id: string): void
// Unpins icon (removes from pinnedIcons Set)

sortIcons(option: SortOption): void
// Sorts icons by name, date, or usage

recordIconUsage(id: string): void
// Increments usage count for icon
```

#### Window Management

```typescript
openWindow(menuId: string): void
// Opens or focuses window for menu

closeWindow(id: string): void
// Closes window

minimizeWindow(id: string): void
// Minimizes window

maximizeWindow(id: string): void
// Toggles maximized state

updateWindowPosition(id: string, position: { x: number; y: number }): void
// Updates window position

updateWindowSize(id: string, size: { width: number; height: number }): void
// Updates window size

focusWindow(id: string): void
// Brings window to front (increments z-index)
```

#### Theme

```typescript
setTheme(theme: Theme): void
// Sets theme ('dark' | 'light')
```

#### Desktop

```typescript
setDesktopBackground(background: string | null): void
// Sets desktop background (data URL or URL)

setWiremapEnabled(enabled: boolean): void
// Enables/disables wiremap

setWiremapNodeCount(count: number): void
// Sets wiremap node count (80 desktop / 40 mobile)
```

#### Media

```typescript
setCurrentTrack(track: Track | null): void
// Sets current track

setIsPlaying(playing: boolean): void
// Sets playback state

setVolume(volume: number): void
// Sets volume (0-1, clamped)

setIsMuted(muted: boolean): void
// Sets mute state
```

### Theme API

```typescript
getThemeColors(theme: Theme): ThemeColors
applyTheme(theme: Theme): void
getCurrentTheme(): Theme
initTheme(): void
```

### Animation API

```typescript
use120fps(options?: Use120FpsOptions): {
  currentFps: number
  isThrottled: boolean
  effectiveFps: number
  frameDelay: number
}

use120fpsSpring(target: number, options?: SpringOptions): number

gpuTransform(transform: TransformOptions): string
```

### Media API

```typescript
// Spotify
authenticateSpotify(): Promise<boolean>
getSpotifyCurrentlyPlaying(): Promise<Track | null>
playSpotifyTrack(track: Track): Promise<void>
pauseSpotifyPlayback(): Promise<void>
setSpotifyVolume(volume: number): Promise<void>
getCachedTracks(): Promise<Track[]>

// Media Session
initMediaSession(handlers: MediaSessionHandlers): void
updateMediaMetadata(track: Track | null, isPlaying: boolean): void
updatePlaybackState(isPlaying: boolean): void
setPositionState(duration: number, position: number, playbackRate?: number): void
clearMediaSession(): void
```

---

## Configuration Options

### Environment Variables

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/spotify/callback
```

### Store Configuration

```typescript
// Default wiremap node count
wiremapNodeCount: 80 // Desktop
wiremapNodeCount: 40 // Mobile

// Default volume
volume: 0.7

// Default theme
theme: 'light'
```

### Performance Configuration

```typescript
// FPS monitoring
targetFps: 120
throttleThreshold: 8.33 // ms

// Wiremap
mouseAttractRadius: 200 // px
mouseAttractStrength: 0.5
maxConnectionDistance: 2.5 // units
```

---

## Dependencies

### Core Dependencies

```json
{
  "zustand": "^4.4.7",
  "framer-motion": "^12.0.0",
  "three": "^0.160.0",
  "idb": "^8.0.0"
}
```

### Peer Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Dev Dependencies

```json
{
  "@types/three": "^0.160.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

---

## Integration Patterns

### Adding New Icon

```typescript
// 1. Add to defaultIcons in store.ts
{ id: 'new-icon', label: 'New Icon', type: 'tool', menuId: 'new-menu' }

// 2. Add icon component to iconMap.tsx
export const iconMap: Record<string, React.ComponentType> = {
  'new-icon': NewIconComponent,
}

// 3. Add menu configuration in menuConfigs.ts
export const newMenuConfig = {
  id: 'new-menu',
  label: 'New Menu',
  items: [/* ... */],
}
```

### Adding New Window

```typescript
// 1. Create window component
export function NewWindow({ menuId }: WindowProps) {
  return <div>Window Content</div>
}

// 2. Add to window exports
export { NewWindow } from './NewWindow'

// 3. Store will automatically create window on openWindow(menuId)
```

### Adding New Theme

```typescript
// 1. Add theme type
export type Theme = 'dark' | 'light' | 'custom'

// 2. Add theme colors
export const themes: Record<Theme, ThemeColors> = {
  // ... existing themes
  custom: {
    surface: 'rgba(100, 50, 200, 0.9)',
    // ... all required colors
  },
}

// 3. Add CSS variables
[data-theme="custom"] {
  --void-surface: rgba(100, 50, 200, 0.9);
  /* ... all variables */
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Store actions
describe('VoidStore', () => {
  it('should update icon position', () => {
    const store = useVoidStore.getState()
    store.updateIconPosition('customers', { row: 5, col: 5 })
    expect(store.iconPositions.customers).toEqual({ row: 5, col: 5 })
  })
})

// Theme functions
describe('Theme System', () => {
  it('should apply theme', () => {
    applyTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
```

### Integration Tests

```typescript
// Component integration
describe('WiremapBackground', () => {
  it('should initialize worker', async () => {
    render(<WiremapBackground />)
    await waitFor(() => {
      expect(workerRef.current).toBeTruthy()
    })
  })
})
```

### E2E Tests

```typescript
// User flows
describe('VOID Desktop', () => {
  it('should switch theme', () => {
    cy.visit('/void')
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('have.attr', 'data-theme', 'dark')
  })
})
```

---

## Deployment Guide

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'void': ['@/pages/void/index'],
          'three': ['three'],
        },
      },
    },
  },
})
```

### Worker Bundling

```typescript
// vite.config.ts
export default defineConfig({
  worker: {
    format: 'es',
    plugins: [/* ... */],
  },
})
```

### Environment Setup

1. Set Spotify client ID
2. Configure redirect URI
3. Build production bundle
4. Deploy to hosting

---

## Troubleshooting Reference

### Common Issues

1. **Theme Not Switching**: Check `data-theme` attribute and CSS variables
2. **Wiremap Not Rendering**: Verify OffscreenCanvas support and worker loading
3. **Media Keys Not Working**: Check Media Session API support and handlers
4. **Low FPS**: Reduce node count or disable wiremap
5. **Spotify Not Playing**: Verify authentication and token expiration

### Debug Commands

```javascript
// Check theme
document.documentElement.getAttribute('data-theme')

// Check store state
useVoidStore.getState()

// Check CSS variables
getComputedStyle(document.documentElement).getPropertyValue('--void-surface')

// Check worker
workerRef.current
```

---

## Security & Stability

### Security Enhancements (December 2025)

VOID includes comprehensive security measures implemented across all system layers:

#### Runtime Validation
- **Zod Schema Validation**: All store state validated with Zod schemas (`src/lib/void/validation.ts`)
- **Type Guards**: Runtime type checking for all operations
- **Input Sanitization**: All user inputs sanitized to prevent XSS
- **Data Integrity**: Checksums and validation on storage operations

#### Secure Storage
- **Secure Storage Wrapper**: `src/lib/void/secureStorage.ts`
  - Data validation before storage
  - Integrity checks (checksums)
  - Storage quota management (5MB limit)
  - Error handling with graceful fallbacks
  - Token obfuscation for sensitive data

#### Error Boundaries
- **Comprehensive Error Handling**: `VoidErrorBoundary` component (`src/components/void/VoidErrorBoundary.tsx`)
- **Auto-Recovery**: Automatic retry with error count limiting (max 3 attempts)
- **Graceful Degradation**: Components fail safely without breaking entire system
- **Error Reporting**: Safe error logging without exposing sensitive data

#### XSS Prevention
- **Content Sanitization**: All user-generated content sanitized (`sanitizeString` function)
- **No Dangerous HTML**: No `dangerouslySetInnerHTML` usage
- **Input Validation**: All dynamic content validated before rendering
- **String Sanitization**: Comprehensive string cleaning functions

#### API Security
- **Rate Limiting**: 100 requests/minute per endpoint (`src/lib/void/apiSecurity.ts`)
- **Secure Token Storage**: Obfuscated token storage with expiration
- **Request Validation**: All API requests validated before execution
- **SSRF Prevention**: Domain whitelisting for external requests
- **Response Sanitization**: All API responses sanitized

#### Background System Security
- **File Type Validation**: Whitelist of allowed MIME types (JPEG, PNG, WebP, AVIF, GIF)
- **File Size Limits**: 2MB maximum file size
- **Dimension Validation**: Image dimension limits (100px-4096px)
- **Processing Timeouts**: 10-second timeout for image processing
- **File Name Sanitization**: Dangerous characters removed

#### Voice Recording Security
- **Permission Validation**: Explicit permission checks before recording
- **Duration Limits**: 5-minute maximum recording duration
- **Blob Size Limits**: 10MB maximum blob size
- **Transcript Sanitization**: All transcripts sanitized before storage
- **Secure Stream Handling**: Proper cleanup of media streams

### Critical Bug Fixes

#### Set Serialization Fix (December 2025)
- **Issue**: `pinnedIcons` Set serialized to array but not converted back, causing `c.has is not a function` error
- **Root Cause**: Zustand persist middleware serialized Set to Array but lacked deserialization
- **Solution**: Added `merge` function to Zustand persist config to properly rehydrate Sets
- **Impact**: Fixed critical runtime error affecting all users with persisted state
- **Files Modified**: `src/lib/void/store.ts`

### Backward Compatibility

All security enhancements maintain full backward compatibility:
- Existing localStorage data automatically migrated
- No breaking changes to component props or store actions
- Graceful fallbacks for all new validations
- Version detection for future migrations (v1.0.0)

### Security Files

**New Security Files Created:**
- `src/lib/void/validation.ts` - Validation utilities and Zod schemas
- `src/lib/void/secureStorage.ts` - Secure storage wrapper
- `src/lib/void/apiSecurity.ts` - API security utilities
- `src/components/void/VoidErrorBoundary.tsx` - Error boundary component
- `src/styles/void-error-boundary.css` - Error boundary styles

**Files Enhanced with Security:**
- `src/lib/void/store.ts` - Runtime validation, Set serialization fix
- `src/components/void/BackgroundSystem.tsx` - File validation, timeouts
- `src/components/void/VoidDesktop.tsx` - Input validation
- `src/components/void/VoidWindow.tsx` - Input validation, XSS prevention
- `src/hooks/useVoidVoice.ts` - Voice security measures
- `src/lib/music/spotify.ts` - API security enhancements

---

## Future Roadmap

### Planned Features

1. **Multi-Monitor Support**: Extend wiremap across multiple displays
2. **Custom Wiremap Patterns**: User-defined node patterns
3. **Additional Media Providers**: Apple Music, YouTube Music
4. **Advanced Window Management**: Snap zones, virtual desktops
5. **Plugin System**: Third-party extensions
6. **Voice Commands**: Voice-controlled desktop
7. **Gesture Support**: Touch gestures for mobile
8. **Custom Themes**: User-created theme builder

### Performance Improvements

1. **WebGPU Migration**: Move from WebGL to WebGPU
2. **WASM Workers**: Faster computation in workers
3. **Streaming Assets**: Progressive loading of backgrounds
4. **Service Worker Caching**: Offline support

---

**Document Version**: 1.1.0  
**Last Updated**: December 2025  
**Maintained By**: VOID Development Team

### Version History

- **v1.1.0** (December 2025): Security & Stability Update
  - Comprehensive security enhancements
  - Runtime validation with Zod schemas
  - Secure storage wrapper
  - Error boundaries with auto-recovery
  - XSS prevention measures
  - API security layer
  - Critical Set serialization bug fix
- **v1.0.0** (Initial): Initial implementation
  - Visual effects system
  - Media integration
  - Theme system
  - Background system
  - WebGL wiremap

---

*This document is the complete technical specification for the VOID Desktop System. For implementation details, refer to the source code. For usage guides, see the other documentation files in this directory.*
