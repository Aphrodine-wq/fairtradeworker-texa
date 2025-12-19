# VOID API Reference

## Store API (`lib/void/store.ts`)

### State

```typescript
interface VoidStore {
  // Desktop
  icons: IconData[]
  iconPositions: Record<string, GridPosition>
  pinnedIcons: Set<string>
  windows: WindowData[]
  activeWindowId: string | null
  desktopBackground: string | null
  wiremapEnabled: boolean
  wiremapNodeCount: number
  
  // Media
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  
  // Theme
  theme: Theme
  
  // Voice
  voiceState: VoiceState
  voiceTranscript: string
  
  // Buddy
  buddyState: BuddyState
  buddyMessages: BuddyMessage[]
}
```

### Actions

#### Desktop Actions

```typescript
// Icon management
updateIconPosition(id: string, position: GridPosition): void
pinIcon(id: string): void
unpinIcon(id: string): void
sortIcons(option: SortOption): void
recordIconUsage(id: string): void

// Window management
openWindow(menuId: string): void
closeWindow(id: string): void
minimizeWindow(id: string): void
maximizeWindow(id: string): void
updateWindowPosition(id: string, position: { x: number; y: number }): void
updateWindowSize(id: string, size: { width: number; height: number }): void
focusWindow(id: string): void

// Desktop settings
setDesktopBackground(background: string | null): void
setWiremapEnabled(enabled: boolean): void
setWiremapNodeCount(count: number): void
```

#### Media Actions

```typescript
setCurrentTrack(track: Track | null): void
setIsPlaying(playing: boolean): void
setVolume(volume: number): void // 0-1
setIsMuted(muted: boolean): void
```

#### Theme Actions

```typescript
setTheme(theme: Theme): void
```

#### Voice Actions

```typescript
setVoiceState(state: VoiceState): void
setVoicePermission(permission: VoicePermission): void
setVoiceRecording(blob: Blob | null): void
setVoiceTranscript(text: string): void
setExtractedEntities(entities: ExtractedEntities | null): void
```

#### Buddy Actions

```typescript
setBuddyCollapsed(collapsed: boolean): void
setBuddyPosition(position: BuddyState['position']): void
setBuddyDocked(docked: boolean): void
setBuddyEmotion(emotion: BuddyState['emotion']): void
addBuddyMessage(message: BuddyMessage): void
updateBuddyLastMessageTime(time: number): void
```

## Theme API (`lib/themes.ts`)

### Functions

```typescript
// Get theme colors
getThemeColors(theme: Theme): ThemeColors

// Apply theme to document
applyTheme(theme: Theme): void

// Get current theme
getCurrentTheme(): Theme

// Initialize theme
initTheme(): void
```

### Types

```typescript
type Theme = 'dark' | 'light'

interface ThemeColors {
  surface: string
  surfaceSecondary: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  background: string
  backgroundOverlay: string
  accent: string
  accentSecondary: string
  wiremap: {
    node: string
    line: string
    ripple: string
  }
  glass: {
    background: string
    border: string
    shadow: string
  }
}
```

## Spotify API (`lib/music/spotify.ts`)

### Functions

```typescript
// Authentication
authenticateSpotify(): Promise<boolean>
handleSpotifyCallback(code: string): Promise<MusicServiceConfig | null>
refreshSpotifyToken(refreshToken: string): Promise<MusicServiceConfig | null>

// Configuration
getSpotifyConfig(): MusicServiceConfig | null
saveSpotifyConfig(config: MusicServiceConfig): void

// Playback
getSpotifyCurrentlyPlaying(): Promise<Track | null>
playSpotifyTrack(track: Track): Promise<void>
pauseSpotifyPlayback(): Promise<void>
setSpotifyVolume(volume: number): Promise<void>

// Caching
getCachedTracks(): Promise<Track[]>

// Media Session
updateSpotifyMediaSession(track: Track | null, isPlaying: boolean): void
```

### API Client

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

## Media Session API (`lib/music/mediaSession.ts`)

### Functions

```typescript
// Initialize Media Session
initMediaSession(handlers: MediaSessionHandlers): void

// Update metadata
updateMediaMetadata(track: Track | null, isPlaying: boolean): void

// Update playback state
updatePlaybackState(isPlaying: boolean): void

// Set position state
setPositionState(
  duration: number,
  position: number,
  playbackRate?: number
): void

// Clear Media Session
clearMediaSession(): void
```

### Handlers

```typescript
interface MediaSessionHandlers {
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSeekBackward?: (details: MediaSessionActionDetails) => void
  onSeekForward?: (details: MediaSessionActionDetails) => void
  onSeekTo?: (details: MediaSessionSeekToActionDetails) => void
  onStop?: () => void
}
```

## Animation API (`hooks/use120fps.ts`)

### use120fps Hook

```typescript
use120fps(options?: Use120FpsOptions): {
  currentFps: number
  isThrottled: boolean
  effectiveFps: number
  frameDelay: number
}

interface Use120FpsOptions {
  targetFps?: number // Default: 120
  throttleThreshold?: number // Default: 8.33
  onFpsChange?: (fps: number) => void
}
```

### use120fpsSpring Hook

```typescript
use120fpsSpring(
  target: number,
  options?: {
    stiffness?: number // Default: 300
    damping?: number // Default: 30
    mass?: number // Default: 1
    precision?: number // Default: 0.01
  }
): number
```

### Utilities

```typescript
// GPU-accelerated transform
gpuTransform(transform: {
  x?: number
  y?: number
  z?: number
  scale?: number
  rotate?: number
}): string
```

## Wiremap Worker API

### Messages (Main → Worker)

```typescript
// Initialize
{
  type: 'init',
  config: {
    nodeCount: number
    width: number
    height: number
    nodeColor: string
    lineColor: string
    rippleColor: string
  },
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

### Messages (Worker → Main)

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

## Hooks API

### useMediaSession

```typescript
useMediaSession(options: UseMediaSessionOptions): void

interface UseMediaSessionOptions {
  track: Track | null
  isPlaying: boolean
  currentTime?: number
  duration?: number
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSeekBackward?: (offset: number) => void
  onSeekForward?: (offset: number) => void
  onSeekTo?: (time: number) => void
  onStop?: () => void
}
```

### useCRMMoodSync

```typescript
useCRMMoodSync(): void
// No options, uses store automatically
```

## Storage API

### LocalStorage Keys

- `void-theme`: Theme preference (`'dark'` | `'light'`)
- `void-desktop-storage`: Zustand persisted state

### IndexedDB Databases

#### `void-desktop`
- **Store**: `backgrounds`
- **Key**: `'current'`
- **Value**: `{ id: 'current', data: string, timestamp: number }`

#### `spotify-tracks-cache`
- **Store**: `tracks`
- **Key**: Track ID
- **Value**: `Track & { cachedAt: number }`
- **Limit**: 10 tracks (auto-cleanup)

## Error Handling

### Spotify Errors

```typescript
try {
  await spotifyAPI.playTrack(track)
} catch (error) {
  if (error.message === 'Authentication expired') {
    // Re-authenticate
  } else if (error.message === 'Not authenticated') {
    // Show login prompt
  } else {
    // Handle other errors
  }
}
```

### Worker Errors

```typescript
worker.onerror = (error) => {
  console.error('Wiremap worker error:', error)
  // Fallback to main thread rendering
}
```

## Type Definitions

### Core Types

```typescript
type Theme = 'dark' | 'light'
type VoiceState = 'idle' | 'permission-prompt' | 'recording' | 'processing' | 'extracting' | 'validation' | 'complete'
type VoicePermission = 'granted' | 'denied' | 'prompt'
type SortOption = 'name' | 'date' | 'usage'
type BuddyEmotion = 'neutral' | 'happy' | 'thinking' | 'excited'
type MusicService = 'local' | 'spotify' | 'pandora'
```

### Data Types

```typescript
interface GridPosition {
  row: number // 1-200
  col: number // 1-200
}

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
