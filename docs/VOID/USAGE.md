# VOID Usage Guide

## Getting Started

### Accessing VOID Desktop

Navigate to `/void` in your application to access the VOID desktop interface.

### First Time Setup

1. **Theme Selection**: Click theme toggle to switch between dark/light
2. **Background**: Drag and drop an image to set background
3. **Media**: Connect Spotify account (optional)
4. **Wiremap**: Enabled by default, can be toggled

## Theme Switching

### Instant Theme Toggle

Click the theme toggle button (top-left) to instantly switch themes:

- **0ms Perceived Delay**: UI elements change instantly
- **Background Cross-Fade**: Only backgrounds fade (300ms)
- **Wiremap Update**: Wiremap colors update automatically

### Theme Persistence

Your theme preference is saved and persists across sessions.

## Background System

### Setting Background

**Method 1: Drag and Drop**
1. Drag an image file onto the desktop
2. Image is automatically set as background
3. Overlay opacity adjusts for text contrast

**Method 2: Right-Click**
1. Right-click on desktop
2. Select "Set as Background" (if implemented)
3. Choose from gallery or upload

### Background Features

- **Auto-Contrast**: Automatically adjusts overlay opacity
- **File Limit**: 2MB maximum
- **Format Support**: All image formats
- **Auto-Conversion**: Converts to WebP/AVIF when possible
- **Idle Timeout**: Unloads after 5 minutes of inactivity

## Media Player

### Connecting Spotify

1. Click on media toolbar (top-right)
2. Click "Connect Spotify"
3. Authorize in Spotify
4. Return to application

### Playback Controls

- **Play/Pause**: Click play button or press spacebar
- **Next/Previous**: Click arrows or use media keys
- **Volume**: Use slider or mute button
- **Like**: Click heart icon

### Media Keys

Windows media keys work automatically:
- **Play/Pause**: Spacebar or media key
- **Next**: Media next key
- **Previous**: Media previous key

### Toolbar States

- **Expanded**: Full controls visible (40px height)
- **Collapsed**: Track info only (40px height)
- **Minimized**: Track name marquee (8px height)

Click toolbar to toggle between states.

## Wiremap Background

### Interaction

- **Mouse Movement**: Nodes attract to cursor (200px radius)
- **Click**: Creates ripple effect (3 waves)
- **Auto-Throttle**: Automatically throttles to 60fps if needed

### Customization

Wiremap settings in store (programmatic):

```typescript
// Disable wiremap
setWiremapEnabled(false)

// Adjust node count
setWiremapNodeCount(60) // Desktop
setWiremapNodeCount(30) // Mobile
```

## Desktop Icons

### Icon Interaction

- **Hover**: Scale up (1.05x) with glow effect
- **Drag**: Click and drag icon to reposition (uses native HTML5 Drag and Drop API)
- **Double-Click**: Open window
- **Right-Click**: Context menu

### Drag and Drop

VOID uses native HTML5 Drag and Drop API for icon positioning:

1. **Start Drag**: Click and hold on an icon, then drag
2. **Visual Feedback**: Icon scales to 1.2x with enhanced brightness and shadow
3. **Status Indicator**: "DRAGGING" text appears in center of screen
4. **Grid Snapping**: Icon automatically snaps to nearest grid cell
5. **Drop**: Release mouse button to place icon
6. **Status Indicator**: "DROPPING" text appears briefly
7. **Collision Detection**: Icons cannot overlap (80% cell size collision radius)

**Features:**
- **Pinned Icons**: Pinned icons cannot be dragged
- **Precise Placement**: Automatic grid snapping for alignment
- **Collision Prevention**: Icons cannot be placed on top of each other
- **Visual Feedback**: Clear indicators during drag operations

### Icon Management

- **Pin**: Pin icons to keep in place (disables drag)
- **Sort**: Sort by name, date, or usage
- **Usage Tracking**: Icons track usage for sorting

## Windows

### Window Controls

- **Drag**: Click and drag title bar
- **Minimize**: Click minimize button
- **Maximize**: Click maximize button
- **Close**: Click close button
- **Snap**: Drag near edge to snap

### Window Features

- **Magnetic Snap**: Snaps to grid (50px threshold)
- **Haptic Feedback**: Vibration on snap (if supported)
- **Z-Index Management**: Active window on top
- **Position Persistence**: Positions saved

## Micro-Interactions

### Icon Hover

Hover over icons for:
- Scale animation (1 → 1.05)
- Glow effect (0 → 4px)
- 16ms duration

### Button Tap

Tap buttons for:
- Scale animation (1 → 0.98)
- Background shift
- 8ms duration

### Window Open

Windows open with:
- Scale animation (0.9 → 1)
- Blur fade (10px → 0)
- Spring animation (200ms)

## Voice Integration

### Auto-Pause

Media automatically pauses when:
- Voice recording starts
- Resumes when recording stops

### Voice Capture

1. Click voice capture icon
2. Grant microphone permission
3. Start recording
4. Media pauses automatically

## CRM Mood Sync

### Focus Mode

When high-focus task detected:
- Automatically switches to instrumental playlist
- Reduces distractions

### Win Celebration

On task completion:
- Plays subtle celebration sound
- Short, non-intrusive

### Lead Added

When lead is added:
- Shows notification: "Want to add a note while listening?"
- Non-blocking

## Keyboard Shortcuts

- **Spacebar**: Play/Pause media
- **ESC**: Close active window/menu
- **Theme Toggle**: Click theme button (no shortcut)

## Performance Tips

### For Best Performance

1. **Reduce Node Count**: Lower wiremap nodes on low-end devices
2. **Disable Wiremap**: Turn off if experiencing lag
3. **Compress Backgrounds**: Use smaller image files
4. **Close Unused Windows**: Reduces rendering load

### Monitoring Performance

Check FPS in browser console:
- Target: 120fps
- Minimum: 60fps
- Auto-throttles if needed

## Troubleshooting

### Theme Not Switching

1. Check browser console for errors
2. Verify CSS variables are loaded
3. Clear browser cache
4. Refresh page

### Media Not Playing

1. Check Spotify authentication
2. Verify network connection
3. Check browser console for errors
4. Try reconnecting Spotify

### Wiremap Not Showing

1. Check browser supports OffscreenCanvas
2. Verify Web Worker loads
3. Check browser console for errors
4. Try disabling and re-enabling

### Low Performance

1. Reduce wiremap node count
2. Disable wiremap
3. Close unused windows
4. Check for other heavy operations

## Advanced Usage

### Programmatic Control

```typescript
import { useVoidStore } from '@/lib/void/store'

// Control theme
const { theme, setTheme } = useVoidStore()
setTheme('dark')

// Control media
const { setIsPlaying, setVolume } = useVoidStore()
setIsPlaying(true)
setVolume(0.7)

// Control wiremap
const { setWiremapEnabled, setWiremapNodeCount } = useVoidStore()
setWiremapEnabled(true)
setWiremapNodeCount(60)
```

### Custom Components

Create custom components using VOID utilities:

```tsx
import { MicroInteractions } from '@/components/void/MicroInteractions'

function MyCustomButton() {
  return (
    <MicroInteractions type="button" onTap={() => {}}>
      <button>Custom Button</button>
    </MicroInteractions>
  )
}
```

## Best Practices

1. **Use Theme Colors**: Always use CSS variables
2. **Monitor Performance**: Check FPS regularly
3. **Clean Up**: Close unused windows
4. **Optimize Images**: Compress backgrounds
5. **Test Interactions**: Verify all features work

---

**Last Updated**: December 2025
