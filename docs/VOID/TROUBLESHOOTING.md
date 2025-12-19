# VOID Troubleshooting Guide

## Common Issues

### Theme Not Switching

**Symptoms:**
- Theme toggle doesn't change colors
- Colors remain the same after clicking
- CSS variables not updating

**Solutions:**
1. Check browser console for errors
2. Verify `initTheme()` is called on mount
3. Check `data-theme` attribute is set:
   ```javascript
   document.documentElement.getAttribute('data-theme')
   ```
4. Verify CSS variables are defined:
   ```css
   :root {
     --void-surface: ...;
   }
   ```
5. Clear browser cache and refresh
6. Check if theme is persisted in localStorage:
   ```javascript
   localStorage.getItem('void-theme')
   ```

### Wiremap Not Rendering

**Symptoms:**
- Black screen or no wiremap
- Canvas element exists but empty
- Console errors about Web Worker

**Solutions:**
1. **Check OffscreenCanvas Support:**
   ```javascript
   if (typeof OffscreenCanvas === 'undefined') {
     console.error('OffscreenCanvas not supported')
   }
   ```

2. **Verify Web Worker Loads:**
   - Check Network tab for `wiremapWorker.js`
   - Verify worker file exists
   - Check for CORS errors

3. **Check Browser Console:**
   - Look for worker errors
   - Check for Three.js errors
   - Verify WebGL support

4. **Fallback to Main Thread:**
   ```typescript
   // In WiremapBackground.tsx
   if (!OffscreenCanvas) {
     // Use main thread rendering
   }
   ```

5. **Check WebGL Support:**
   ```javascript
   const canvas = document.createElement('canvas')
   const gl = canvas.getContext('webgl2')
   if (!gl) {
     console.error('WebGL 2.0 not supported')
   }
   ```

### Media Keys Not Working

**Symptoms:**
- Windows media keys don't control playback
- Spacebar doesn't play/pause
- Media Session API not responding

**Solutions:**
1. **Check Media Session API Support:**
   ```javascript
   if (!('mediaSession' in navigator)) {
     console.error('Media Session API not supported')
   }
   ```

2. **Verify Handlers Registered:**
   ```typescript
   // Check if handlers are set
   navigator.mediaSession.setActionHandler('play', () => {})
   ```

3. **Check Metadata:**
   ```typescript
   // Metadata must be set for media keys to work
   navigator.mediaSession.metadata = new MediaMetadata({
     title: 'Track Title',
     artist: 'Artist Name'
   })
   ```

4. **Browser Compatibility:**
   - Chrome/Edge: Full support
   - Firefox: Partial support
   - Safari: Limited support

5. **Test in Chrome/Edge:**
   - Best Media Session API support
   - Verify in different browsers

### Low FPS / Performance Issues

**Symptoms:**
- Animations stutter
- Wiremap lags
- UI feels sluggish
- Frame rate drops below 60fps

**Solutions:**
1. **Check Frame Time:**
   ```typescript
   const { currentFps, isThrottled } = use120fps()
   console.log('FPS:', currentFps, 'Throttled:', isThrottled)
   ```

2. **Reduce Node Count:**
   ```typescript
   setWiremapNodeCount(40) // Reduce from 80
   ```

3. **Disable Wiremap:**
   ```typescript
   setWiremapEnabled(false)
   ```

4. **Check for Heavy Operations:**
   - Profile with Chrome DevTools
   - Identify bottlenecks
   - Optimize or remove heavy operations

5. **Close Unused Windows:**
   - Each window adds rendering load
   - Close windows not in use

6. **Optimize Background:**
   - Use smaller image files
   - Compress images
   - Use WebP format

7. **Check GPU Acceleration:**
   ```css
   /* Ensure GPU acceleration */
   transform: translate3d(0, 0, 0);
   will-change: transform;
   ```

### Spotify Not Playing

**Symptoms:**
- Play button doesn't work
- "Not authenticated" errors
- Playback fails silently

**Solutions:**
1. **Check Authentication:**
   ```typescript
   const config = getSpotifyConfig()
   if (!config || !config.accessToken) {
     // Re-authenticate
     await authenticateSpotify()
   }
   ```

2. **Verify Token Expiration:**
   ```typescript
   // Check if token is expired
   if (config.expiresAt < Date.now()) {
     // Refresh token
     await refreshSpotifyToken(config.refreshToken)
   }
   ```

3. **Check Network Connection:**
   - Verify internet connection
   - Check Spotify API status
   - Test API endpoint

4. **Review Browser Console:**
   - Look for API errors
   - Check for CORS errors
   - Verify OAuth callback

5. **Re-authenticate:**
   ```typescript
   // Clear stored config
   localStorage.removeItem('spotify-config')
   // Re-authenticate
   await authenticateSpotify()
   ```

### Background Not Loading

**Symptoms:**
- Background image doesn't appear
- Drag-drop doesn't work
- Image upload fails

**Solutions:**
1. **Check File Size:**
   - Maximum: 2MB
   - Compress if too large

2. **Verify File Format:**
   - Supported: All image formats
   - Preferred: WebP, AVIF, JPEG, PNG

3. **Check IndexedDB:**
   ```javascript
   // Check if background is stored
   const db = await openDB('void-desktop', 1)
   const background = await db.get('backgrounds', 'current')
   ```

4. **Check Browser Console:**
   - Look for IndexedDB errors
   - Check for file read errors
   - Verify drag-drop events

5. **Try Different Image:**
   - Test with smaller image
   - Try different format
   - Check image is valid

### Glassmorphism Not Working

**Symptoms:**
- No blur effect
- Solid backgrounds instead of glass
- Borders not visible

**Solutions:**
1. **Check Backdrop Filter Support:**
   ```javascript
   const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)')
   if (!supportsBackdropFilter) {
     // Use fallback
   }
   ```

2. **Verify CSS Variables:**
   ```css
   /* Check variables are set */
   .glass-panel {
     background: var(--void-glass-bg);
     backdrop-filter: blur(20px);
   }
   ```

3. **Check Browser Support:**
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Full support (with prefix)

4. **Use Fallback:**
   ```css
   /* Fallback for unsupported browsers */
   .glass-panel {
     background: rgba(255, 255, 255, 0.9);
   }
   ```

### Store State Not Persisting

**Symptoms:**
- Settings reset on refresh
- Theme doesn't persist
- Positions lost

**Solutions:**
1. **Check Persistence Middleware:**
   ```typescript
   // Verify persist is configured
   persist(
     (state) => ({
       theme: state.theme,
       // ... other state
     }),
     { name: 'void-desktop-storage' }
   )
   ```

2. **Check LocalStorage:**
   ```javascript
   // Verify data is stored
   const stored = localStorage.getItem('void-desktop-storage')
   console.log('Stored:', stored)
   ```

3. **Check Storage Quota:**
   - LocalStorage limit: ~5-10MB
   - Check if quota exceeded
   - Clear old data if needed

4. **Verify Storage Key:**
   ```typescript
   // Ensure consistent storage key
   { name: 'void-desktop-storage' }
   ```

## Debugging Tools

### Chrome DevTools

1. **Performance Tab:**
   - Record performance
   - Analyze frame times
   - Identify bottlenecks

2. **Memory Tab:**
   - Check for memory leaks
   - Monitor heap size
   - Analyze object retention

3. **Console:**
   - Check for errors
   - Log state changes
   - Verify API calls

### React DevTools

1. **Profiler:**
   - Profile component renders
   - Identify re-renders
   - Optimize components

2. **Components:**
   - Inspect component state
   - Check props
   - Verify hooks

### Browser Console

```javascript
// Check theme
console.log(document.documentElement.getAttribute('data-theme'))

// Check CSS variables
console.log(getComputedStyle(document.documentElement).getPropertyValue('--void-surface'))

// Check store state
console.log(useVoidStore.getState())

// Check wiremap worker
console.log(workerRef.current)
```

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review browser console for errors
3. Verify browser compatibility
4. Test in different browsers
5. Clear cache and refresh

### Information to Provide

When reporting issues, include:

1. **Browser and Version:**
   - Chrome 120, Firefox 121, etc.

2. **Error Messages:**
   - Copy from browser console
   - Include stack traces

3. **Steps to Reproduce:**
   - Detailed steps
   - Expected vs actual behavior

4. **System Information:**
   - OS version
   - Hardware specs
   - Network conditions

5. **Screenshots:**
   - Visual issues
   - Console errors
   - DevTools panels

## Prevention

### Best Practices

1. **Test in Multiple Browsers:**
   - Chrome, Firefox, Safari, Edge

2. **Monitor Performance:**
   - Use FPS monitoring
   - Check frame times
   - Profile regularly

3. **Handle Errors Gracefully:**
   - Try-catch blocks
   - Fallback options
   - User-friendly messages

4. **Test Edge Cases:**
   - Low-end devices
   - Slow networks
   - Offline mode

5. **Keep Dependencies Updated:**
   - Update libraries
   - Check for fixes
   - Test after updates

---

**Last Updated**: December 2025
