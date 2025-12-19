# VOID Media Integration

## Overview

VOID integrates with Spotify and the Media Session API to provide a native-feeling music player that docks to the toolbar, syncs with CRM mood, and controls Windows-style media keys.

## Components

### Media Toolbar (`components/media/MediaToolbar.tsx`)

Collapsible toolbar strip positioned top-right:

- **Expanded**: 40px height with full controls
- **Collapsed**: 8px height with track name marquee
- **Minimized**: Hidden when no track playing
- **Position**: Fixed top-right, right of profile icon

**States:**
```typescript
- Expanded: Full NowPlayingWidget visible
- Collapsed: Track name + artist, click to expand
- Minimized: 8px bar, track name marquee
```

### Now Playing Widget (`components/media/NowPlayingWidget.tsx`)

Full-featured player widget:

- **Album Art**: 40×40px rounded image
- **Track Info**: Title + artist with marquee
- **Controls**: Previous, Play/Pause, Next, Like, Volume
- **Volume Slider**: Visual feedback with theme colors

## Spotify Integration

### Authentication

OAuth 2.0 flow with Spotify:

```typescript
import { authenticateSpotify } from '@/lib/music/spotify'

// Redirects to Spotify authorization
await authenticateSpotify()
```

### API Methods

```typescript
import { spotifyAPI } from '@/lib/music/spotify'

// Get currently playing
const track = await spotifyAPI.getCurrentlyPlaying()

// Play track
await spotifyAPI.playTrack(track)

// Control playback
await spotifyAPI.pause()
await spotifyAPI.resume()
await spotifyAPI.next()
await spotifyAPI.previous()

// Volume control
await spotifyAPI.setVolume(0.7) // 0-1
```

### Offline Caching

Last 10 tracks cached in IndexedDB:

```typescript
import { getCachedTracks } from '@/lib/music/spotify'

const cachedTracks = await getCachedTracks()
```

**Storage:**
- Database: `spotify-tracks-cache`
- Store: `tracks`
- Key: Track ID
- Auto-cleanup: Removes oldest when >10 tracks

## Media Session API

### Windows Media Key Support

Handles system media keys:

- **Play/Pause**: Spacebar, media keys
- **Next/Previous**: Media keys
- **Seek**: Forward/backward
- **Stop**: Stop playback

### Implementation

```typescript
import { useMediaSession } from '@/hooks/useMediaSession'

useMediaSession({
  track: currentTrack,
  isPlaying,
  onPlay: () => setIsPlaying(true),
  onPause: () => setIsPlaying(false),
  onNext: () => handleNext(),
  onPrevious: () => handlePrevious(),
})
```

### Metadata Updates

Automatically updates system metadata:

```typescript
import { updateMediaMetadata } from '@/lib/music/mediaSession'

updateMediaMetadata(track, isPlaying)
```

**Metadata Includes:**
- Title
- Artist
- Album
- Artwork (multiple sizes)

## CRM Mood Sync

### Integration Points

#### 1. Voice Capture Auto-Pause

Automatically pauses during recording:

```typescript
// In useCRMMoodSync hook
if (voiceState === 'recording' && isPlaying) {
  setIsPlaying(false)
  // Resumes when recording stops
}
```

#### 2. High-Focus Task Detection

Switches to instrumental playlist:

```typescript
const handleFocusMode = () => {
  // Switch to instrumental playlist
  // Triggered by buddy context
}
```

#### 3. Win Celebration

Plays subtle celebration sound:

```typescript
const handleWin = () => {
  const audio = new Audio('/sounds/celebration.mp3')
  audio.volume = 0.3
  audio.play()
}
```

#### 4. Lead Added Notification

Offers to add note while listening:

```typescript
const handleLeadAdded = () => {
  if (isPlaying && currentTrack) {
    // Show notification: "Want to add a note while listening?"
  }
}
```

### Hook Usage

```typescript
import { useCRMMoodSync } from '@/hooks/useCRMMoodSync'

// Automatically handles:
// - Voice capture pause
// - Focus mode switching
// - Celebration sounds
// - Lead notifications
useCRMMoodSync()
```

## State Management

### Store Integration

Media state in Zustand store:

```typescript
const {
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  setIsPlaying,
  setVolume,
  setIsMuted,
  setCurrentTrack
} = useVoidStore()
```

### Persistence

Media preferences persisted:

- Current track (if cached)
- Volume level
- Mute state
- Playback state

## Toolbar Behavior

### Collapse/Expand Animation

Spring animation (200ms):

```typescript
<motion.div
  animate={{ height: isExpanded ? 'auto' : 8 }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30
  }}
/>
```

### Auto-Minimize

Automatically minimizes when:
- No track playing
- Track ends
- User manually minimizes

### Track Marquee

Long track names scroll:

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

## Volume Control

### Slider

Visual volume slider with theme colors:

```typescript
<input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={isMuted ? 0 : volume}
  onChange={handleVolumeChange}
  style={{
    background: `linear-gradient(to right, 
      var(--void-accent) 0%, 
      var(--void-accent) ${volume * 100}%, 
      var(--void-surface-secondary) ${volume * 100}%, 
      var(--void-surface-secondary) 100%)`
  }}
/>
```

### Mute Toggle

Quick mute/unmute:

```typescript
const handleMuteToggle = () => {
  setIsMuted(!isMuted)
}
```

## Playback Control

### Play/Pause

```typescript
const handlePlayPause = async () => {
  if (isPlaying) {
    await spotifyAPI.pause()
  } else {
    await spotifyAPI.resume()
  }
  setIsPlaying(!isPlaying)
}
```

### Next/Previous

```typescript
const handleNext = async () => {
  await spotifyAPI.next()
  // Track updates automatically via polling
}

const handlePrevious = async () => {
  await spotifyAPI.previous()
}
```

## Error Handling

### Authentication Errors

```typescript
try {
  await authenticateSpotify()
} catch (error) {
  // Handle OAuth error
  console.error('Spotify auth failed:', error)
}
```

### Playback Errors

```typescript
try {
  await spotifyAPI.playTrack(track)
} catch (error) {
  // Handle playback error
  // Fallback to cached track if available
}
```

### Offline Handling

```typescript
// Check if track is cached
const cachedTracks = await getCachedTracks()
const cachedTrack = cachedTracks.find(t => t.id === trackId)

if (cachedTrack) {
  // Use cached track
} else {
  // Show offline message
}
```

## Performance

### Lazy Loading

Spotify SDK initializes only on first click:

```typescript
const [isInitialized, setIsInitialized] = useState(false)

useEffect(() => {
  if (!isInitialized) {
    // Initialize Spotify SDK
    initializeSpotify().then(() => {
      setIsInitialized(true)
    })
  }
}, [isInitialized])
```

### Polling Strategy

Current track polling:

- **Interval**: 2 seconds when playing
- **Stops**: When paused or no track
- **Optimization**: Only when toolbar visible

## Best Practices

1. **Check Authentication**: Verify before API calls
2. **Handle Errors**: Graceful degradation
3. **Cache Tracks**: Use IndexedDB for offline
4. **Update Metadata**: Keep Media Session in sync
5. **Monitor State**: Sync with Spotify Connect

## Troubleshooting

### Media Keys Not Working

- Verify Media Session API support
- Check action handlers registered
- Ensure metadata is set
- Test in Chrome/Edge (best support)

### Spotify Not Playing

- Check authentication status
- Verify token expiration
- Check network connection
- Review browser console errors

### Toolbar Not Showing

- Check if track is playing
- Verify component is mounted
- Check CSS positioning
- Ensure z-index is correct

---

**Last Updated**: December 2025
