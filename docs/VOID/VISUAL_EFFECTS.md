# VOID Visual Effects System

## Overview

The VOID visual effects system provides a Windows Aero + iOS hybrid aesthetic with glassmorphism, 120fps micro-interactions, and WebGL wiremap backgrounds.

## Glassmorphism

### Windows Aero + iOS Hybrid

Glass panels combine Windows Aero depth with iOS clarity:

```css
.glass-panel {
  background: var(--void-glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--void-glass-border);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px var(--void-glass-shadow),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}
```

### Theme-Aware Colors

Glass colors adapt to theme:

- **Light Mode**: `rgba(255, 255, 255, 0.9)` background
- **Dark Mode**: `rgba(20, 20, 20, 0.9)` background
- **Borders**: Theme-aware opacity
- **Shadows**: Theme-aware depth

### Glass Components

- `.glass-panel`: Main glass container
- `.glass-card`: Card variant
- `.glass-window`: Window variant
- `.glass-button`: Interactive button
- `.glass-overlay`: Modal overlay

## 120fps Micro-Interactions

### Animation Hook (`use120fps`)

Monitors and maintains 120fps target:

```typescript
const { currentFps, isThrottled, effectiveFps } = use120fps({
  targetFps: 120,
  throttleThreshold: 8.33, // ms
  onFpsChange: (fps) => console.log(fps)
})
```

### Auto-Throttling

Automatically throttles to 60fps if:
- Average frame time > 8.33ms
- Sustained for >3 seconds
- Last 60 frames analyzed

### Micro-Interaction Types

#### Icon Hover
- **Scale**: `1 → 1.05`
- **Glow**: `0 → 4px`
- **Duration**: 16ms
- **Easing**: `easeOut`

#### Icon Drag
- **Z-Index**: Increments to 1000
- **Shadow**: `0 → 24px`
- **Rotation**: `0 → 2deg`
- **Duration**: 16ms

#### Window Open
- **Scale**: `0.9 → 1`
- **Blur**: `10px → 0`
- **Duration**: 200ms
- **Easing**: Spring (stiffness: 300, damping: 30)

#### Window Snap
- **Magnetic Threshold**: 50px
- **Haptic Feedback**: 10ms vibration
- **Spring Animation**: Smooth snap

#### Button Tap
- **Scale**: `1 → 0.98`
- **Background Shift**: Opacity change
- **Duration**: 8ms

### GPU Acceleration

All animations use GPU-accelerated transforms:

```css
transform: translate3d(0, 0, 0);
will-change: transform, opacity;
backface-visibility: hidden;
```

## WebGL Wiremap Background

### Architecture

- **Web Worker**: OffscreenCanvas rendering
- **Three.js**: 3D scene management
- **PostMessage**: Main thread ↔ Worker communication

### Node System

- **Desktop**: 80 nodes
- **Mobile**: 40 nodes
- **Adaptive**: Auto-adjusts based on viewport

### Node Behavior

- **Original Position**: Stored for spring-back
- **Mouse Attraction**: 200px radius
- **Spring Force**: Returns to original position
- **Velocity**: Damped motion

### Connections

- **Max Distance**: 2.5 units
- **Dynamic**: Updates on node movement
- **Opacity**: 0.3 for subtlety
- **Color**: Theme-aware

### Click Ripples

- **Waves**: 3 waves per click
- **Stagger**: 0.3s between waves
- **Duration**: 3 seconds total
- **Decay**: Exponential fade

### FPS Monitoring

- **Target**: 120fps
- **Monitoring**: Last 180 frames
- **Throttle**: Auto-drops to 60fps if needed
- **Frame Time**: Tracks average

### Mouse Interaction

- **Attract Radius**: 200px (converted to 3D space)
- **Attract Strength**: 0.5
- **Smooth Motion**: Damped velocity

## Theme Switching

### Instant Switch (0ms Perceived)

```typescript
// Instant attribute change
document.documentElement.setAttribute('data-theme', theme)
applyTheme(theme) // Updates CSS variables

// Only backgrounds cross-fade (300ms)
.theme-transitioning {
  transition: background-color 0.3s ease;
}
```

### Cross-Fade Strategy

- **UI Elements**: Instant color change
- **Backgrounds**: 300ms cross-fade
- **Wiremap**: Instant color update via postMessage

## Shadows & Depth

### Theme-Aware Shadows

```css
/* Light Mode */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

/* Dark Mode */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Inset Borders

Adds depth perception:

```css
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.3),
  0 0 0 1px rgba(255, 255, 255, 0.05) inset;
```

## Performance Optimizations

### Rendering

- **OffscreenCanvas**: WebGL in worker thread
- **GPU Acceleration**: Hardware-accelerated transforms
- **Frame Throttling**: Auto-throttle to maintain performance
- **Lazy Loading**: Components load on demand

### Memory Management

- **Node Pooling**: Reuse node objects
- **Connection Culling**: Only render nearby connections
- **Texture Caching**: Reuse textures
- **Cleanup**: Proper disposal on unmount

### CSS Optimizations

- **Will-Change**: Hint browser for transforms
- **Contain**: Layout containment
- **Transform**: Use `translate3d` for GPU
- **Backdrop Filter**: Hardware-accelerated blur

## Browser Compatibility

### Required Features

- **Backdrop Filter**: Glassmorphism
- **CSS Custom Properties**: Theming
- **WebGL 2.0**: Wiremap rendering
- **OffscreenCanvas**: Worker rendering

### Fallbacks

- **Backdrop Filter**: Solid background fallback
- **WebGL**: Canvas 2D fallback (simplified)
- **OffscreenCanvas**: Main thread fallback

## Customization

### Wiremap Settings

```typescript
setWiremapNodeCount(80) // Desktop
setWiremapNodeCount(40) // Mobile
setWiremapEnabled(true)
```

### Glass Opacity

Adjust via CSS variables:

```css
--void-glass-bg: rgba(255, 255, 255, 0.9); /* 90% opacity */
```

### Animation Speed

Modify in component:

```typescript
transition={{ duration: 0.016 }} // 16ms for 120fps
```

## Best Practices

1. **Use GPU Acceleration**: Always use `translate3d`
2. **Monitor FPS**: Use `use120fps` hook
3. **Throttle When Needed**: Let auto-throttle work
4. **Clean Up**: Dispose resources on unmount
5. **Test Performance**: Use Chrome DevTools FPS meter

## Troubleshooting

### Low FPS

- Check frame time history
- Reduce node count
- Disable wiremap on low-end devices
- Check for other heavy operations

### Visual Glitches

- Verify backdrop-filter support
- Check CSS variable values
- Ensure proper theme initialization
- Clear browser cache

### Wiremap Not Rendering

- Check OffscreenCanvas support
- Verify Web Worker loading
- Check browser console for errors
- Fallback to main thread if needed

---

**Last Updated**: December 2025
