# VOID Performance Guide

## Performance Targets

### Frame Rate

- **Target**: 120fps (8.33ms per frame)
- **Minimum**: 60fps (16.67ms per frame)
- **Auto-Throttle**: Drops to 60fps if frame time > 8.33ms for >3s

### Wiremap Performance

- **Desktop**: 80 nodes, target 120fps
- **Mobile**: 40 nodes, target 60fps
- **Frame Time**: <8.33ms average
- **Throttle**: Auto-throttles to 60fps if needed

### Memory Usage

- **Wiremap Worker**: ~10-20MB
- **Track Cache**: ~1-2MB (10 tracks)
- **Background Image**: ~2MB max
- **Total**: ~15-25MB typical

## Optimization Strategies

### 1. GPU Acceleration

Always use GPU-accelerated transforms:

```css
transform: translate3d(0, 0, 0);
will-change: transform, opacity;
backface-visibility: hidden;
```

### 2. Worker Offloading

Heavy computation in Web Worker:

- WebGL rendering (wiremap)
- Node position calculations
- Connection updates

### 3. Lazy Loading

Components load on demand:

```typescript
const VoidDesktopPage = lazy(() => 
  import('@/pages/void/index')
)
```

### 4. Frame Throttling

Auto-throttle to maintain performance:

```typescript
const { isThrottled, effectiveFps } = use120fps()
// Automatically throttles if frame time > 8.33ms
```

### 5. Code Splitting

Route-based code splitting:

```typescript
// Only loads when /void route is accessed
const VoidDesktopPage = lazy(() => 
  import('@/pages/void/index')
)
```

## Monitoring Performance

### FPS Monitoring

Use `use120fps` hook:

```typescript
const { currentFps, isThrottled } = use120fps({
  onFpsChange: (fps) => {
    if (fps < 60) {
      console.warn('Low FPS:', fps)
    }
  }
})
```

### Chrome DevTools

1. Open DevTools (F12)
2. Performance tab
3. Record performance
4. Check FPS meter
5. Analyze frame times

### Frame Time Analysis

```typescript
// In wiremap worker
const frameTime = deltaTime * 1000
frameTimeHistory.push(frameTime)

if (frameTimeHistory.length > 180) {
  frameTimeHistory.shift()
}

const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length
```

## Performance Bottlenecks

### Common Issues

1. **Too Many Nodes**: Reduce `wiremapNodeCount`
2. **Heavy Animations**: Use GPU acceleration
3. **Large Backgrounds**: Compress images
4. **Memory Leaks**: Clean up on unmount
5. **Synchronous Operations**: Move to async

### Solutions

#### Reduce Node Count

```typescript
// Desktop: 80 → 60
setWiremapNodeCount(60)

// Mobile: 40 → 30
setWiremapNodeCount(30)
```

#### Disable Wiremap

```typescript
// On low-end devices
setWiremapEnabled(false)
```

#### Optimize Backgrounds

```typescript
// Compress before storing
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'webp'
})
```

## Memory Management

### Cleanup

Always clean up resources:

```typescript
useEffect(() => {
  const worker = new Worker(...)
  
  return () => {
    worker.terminate()
    // Clean up other resources
  }
}, [])
```

### IndexedDB Limits

- **Background**: 2MB max
- **Tracks**: 10 tracks max
- **Auto-cleanup**: Removes oldest when limit reached

### Worker Memory

- **Dispose**: Properly dispose Three.js objects
- **Pooling**: Reuse node objects
- **Culling**: Only render visible connections

## Rendering Optimizations

### CSS Optimizations

```css
/* Use contain for isolation */
.void-desktop {
  contain: layout style;
}

/* Use will-change sparingly */
.animated-element {
  will-change: transform;
}

/* Remove will-change when done */
.animated-element.done {
  will-change: auto;
}
```

### Canvas Optimizations

```typescript
// Use OffscreenCanvas for worker rendering
const offscreen = canvas.transferControlToOffscreen()

// Set pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Limit resolution
renderer.setSize(width, height)
```

### Animation Optimizations

```typescript
// Use spring physics for smooth animations
const scale = useSpring(1, {
  stiffness: 300,
  damping: 30,
  mass: 0.8
})

// Use GPU transforms
style={{ transform: 'translate3d(0, 0, 0)' }}
```

## Network Performance

### Lazy Loading

```typescript
// Load Spotify SDK only when needed
const [isInitialized, setIsInitialized] = useState(false)

useEffect(() => {
  if (!isInitialized && userClicksToolbar) {
    initializeSpotify().then(() => {
      setIsInitialized(true)
    })
  }
}, [isInitialized])
```

### Caching

```typescript
// Cache tracks in IndexedDB
await cacheTrack(track)

// Use cached tracks when offline
const cachedTracks = await getCachedTracks()
```

## Mobile Optimization

### Adaptive Settings

```typescript
const isMobile = useIsMobile()

// Reduce node count on mobile
const nodeCount = isMobile ? 40 : 80

// Disable wiremap on very low-end devices
if (isMobile && performance.memory?.usedJSHeapSize > 50_000_000) {
  setWiremapEnabled(false)
}
```

### Touch Optimizations

```typescript
// Larger touch targets
<button className="min-h-[44px] min-w-[44px]">
  {/* Content */}
</button>

// Reduce animations on mobile
const animationDuration = isMobile ? 0.2 : 0.016
```

## Profiling

### Performance Profiling

1. **Chrome DevTools Performance Tab**
   - Record performance
   - Analyze frame times
   - Identify bottlenecks

2. **React DevTools Profiler**
   - Profile component renders
   - Identify re-renders
   - Optimize components

3. **Memory Profiling**
   - Check for memory leaks
   - Monitor heap size
   - Analyze object retention

### Metrics to Monitor

- **FPS**: Should stay >60fps
- **Frame Time**: Should be <16.67ms
- **Memory**: Should be stable
- **CPU**: Should be <50% on modern hardware

## Best Practices

1. **Monitor FPS**: Use `use120fps` hook
2. **Throttle When Needed**: Let auto-throttle work
3. **Clean Up**: Dispose resources on unmount
4. **Lazy Load**: Load components on demand
5. **Optimize Images**: Compress backgrounds
6. **Use Workers**: Offload heavy computation
7. **GPU Acceleration**: Always use `translate3d`
8. **Code Split**: Route-based splitting
9. **Cache Strategically**: Use IndexedDB for offline
10. **Profile Regularly**: Use DevTools

## Troubleshooting

### Low FPS

1. Check frame time history
2. Reduce node count
3. Disable wiremap
4. Check for other heavy operations
5. Profile with DevTools

### High Memory

1. Check for memory leaks
2. Clear IndexedDB caches
3. Reduce background image size
4. Dispose Three.js objects
5. Profile memory usage

### Stuttering

1. Check frame times
2. Verify GPU acceleration
3. Reduce animation complexity
4. Check for layout thrashing
5. Profile rendering

---

**Last Updated**: December 2025
