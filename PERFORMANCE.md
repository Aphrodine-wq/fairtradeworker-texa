# Performance Optimization Guide

This document outlines the performance optimizations implemented in FairTradeWorker and best practices for maintaining optimal performance.

## Current Performance Metrics

### Bundle Sizes (After Optimization)

- **Main bundle**: 105.85 kB (27.80 kB gzipped) - Down from 403.53 kB (116.94 kB gzipped)
- **Vendor React**: 199.66 kB (62.97 kB gzipped)
- **Vendor Icons**: 415.09 kB (95.10 kB gzipped)
- **Vendor Radix**: 96.43 kB (27.37 kB gzipped)
- **CSS**: 591.98 kB (99.48 kB gzipped)

### Performance Targets

Based on `infrastructure/scaling-config.ts`:

- **Page Load (P95)**: < 1000ms
- **API Response (P50)**: < 100ms
- **API Response (P95)**: < 500ms
- **Uptime Target**: 99.9%

## Optimizations Implemented

### 1. Resource Hints

**Location**: `index.html`

- `dns-prefetch` for Google Fonts domains
- `preconnect` for external resources
- `preload` for critical fonts and CSS
- `prefetch` for likely next routes (Login, Signup)

**Impact**: Reduces DNS lookup time and enables parallel resource loading.

### 2. Dynamic Code Splitting

**Location**: `vite.config.ts`

Implemented function-based chunking strategy that automatically splits code by:

- React core libraries
- UI component libraries (Radix, Icons, Forms)
- Heavy dependencies (Charts, Motion)
- Utility libraries

**Impact**:

- Main bundle reduced by 73.8% (403.53 kB → 105.85 kB)
- Improved caching (vendor chunks rarely change)
- Faster initial page load
- Better parallel loading

### 3. Service Worker Optimization

**Location**: `public/sw.js`

Enhanced caching strategies:

- **Cache-First**: Images and static assets (increased to 150 items, 50 for images)
- **Stale-While-Revalidate**: JS/CSS chunks for instant loads
- **Network-First**: HTML and API calls for fresh data

**Impact**: Near-instant repeat visits, offline capability

### 4. Vercel Configuration

**Location**: `vercel.json`

Added comprehensive headers:

- Long-term caching for assets (1 year)
- Security headers (X-Frame-Options, CSP-lite)
- Proper cache invalidation for HTML
- Service worker configuration

**Impact**: Better CDN caching, improved security

### 5. Build Optimizations

**Location**: `vite.config.ts`

- Modern browser targets (ES2020+)
- CSS code splitting and minification
- Tree shaking enabled
- Module preload polyfill disabled (not needed for modern browsers)
- Excluded heavy dependencies from dev pre-bundling

**Impact**: Smaller bundles, faster builds

### 6. Performance Monitoring

**Location**: `src/lib/performance.ts`

Added comprehensive monitoring:

- Performance Observer for Core Web Vitals (LCP, FID, CLS)
- Resource timing analysis
- Memory monitoring (Chrome only)
- Long task detection

**Impact**: Visibility into performance issues, easier debugging

## Best Practices

### For Developers

#### 1. Use Lazy Loading

```tsx
// ✅ Good - Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// ❌ Bad - Import everything upfront
import HeavyComponent from './HeavyComponent'
```

#### 2. Optimize Images

- Use WebP format where possible
- Compress images before committing
- Use appropriate dimensions (don't load 4K images for thumbnails)
- Implement lazy loading for images below the fold

#### 3. Minimize Re-renders

```tsx
// ✅ Good - Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data])

// ✅ Good - Memoize callbacks
const handleClick = useCallback(() => doSomething(), [dependency])

// ❌ Bad - Create new objects/functions every render
const config = { setting: true }
const handleClick = () => doSomething()
```

#### 4. Code Splitting Best Practices

- Split by routes (already implemented via lazy imports in App.tsx)
- Split large libraries (charts, PDF generators)
- Keep shared code in common chunks

#### 5. Avoid Bundle Bloat

```bash
# Analyze bundle before adding new dependencies
npm run build:analyze

# Check dependency size before installing
npx bundle-phobia <package-name>
```

### For Production Deployments

#### 1. Vercel Deployment

The app is configured for optimal Vercel deployment:

- Automatic Brotli/Gzip compression
- Edge network distribution
- Smart CDN caching

#### 2. Environment Variables

Set these for production:

```bash
NODE_ENV=production  # Disables debug logs, enables optimizations
```

#### 3. Monitoring

Enable performance monitoring:

```javascript
// In browser console or localStorage
localStorage.setItem('debug:performance', 'true')
```

Then check console for metrics after page load.

## Performance Budget

### Bundle Size Limits

- **Main JS bundle**: < 150 kB (gzipped)
- **Vendor bundles combined**: < 300 kB (gzipped)
- **CSS bundle**: < 100 kB (gzipped)
- **Individual route chunks**: < 50 kB (gzipped)

### Runtime Limits

- **Initial page load**: < 2s (3G network)
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## Monitoring Commands

```bash
# Build with bundle analysis
npm run build:analyze

# Preview production build locally
npm run preview

# Development with performance monitoring
# (automatically enabled in dev mode)
npm run dev
```

## Future Optimizations

### Planned Improvements

1. **Image CDN**: Implement Cloudflare Images or similar for automatic optimization
2. **Font Subsetting**: Load only required font characters
3. **Critical CSS**: Inline critical CSS for faster First Paint
4. **HTTP/3**: Enable when widely supported
5. **Prefetch Strategy**: Intelligent prefetching based on user behavior
6. **Service Worker Updates**: Background sync for offline actions

### Experimental Features

- **React Server Components**: When available for Vite
- **Partial Hydration**: For static content areas
- **Edge Functions**: Move some processing to edge

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Core Web Vitals](https://web.dev/vitals/)

## Troubleshooting

### Build is slow

1. Check if node_modules is too large (`du -sh node_modules`)
2. Clear build cache: `rm -rf dist node_modules/.vite`
3. Update dependencies: `npm update`

### Bundle is too large

1. Run `npm run build:analyze` to identify large dependencies
2. Check if dependencies can be lazy-loaded
3. Look for duplicate dependencies in the bundle

### Page loads slowly

1. Check Network tab in DevTools
2. Look for render-blocking resources
3. Verify service worker is active
4. Check if resources are being cached

### Memory issues

1. Check console for memory warnings
2. Use Chrome Memory Profiler
3. Look for memory leaks in long-running pages
4. Clear caches: `localStorage.clear()` and reload
