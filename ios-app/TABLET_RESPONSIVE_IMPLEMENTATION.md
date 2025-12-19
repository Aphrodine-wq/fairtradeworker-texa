# Tablet Responsive Implementation

This document describes the tablet-responsive layout implementation for the FairTradeWorker iOS app.

## Overview

The FairTradeWorker app is built with Expo and React Native, and now features fully responsive layouts optimized for both iPhone and iPad devices. All screens automatically adapt their layout based on the device screen width.

## Implementation Details

### Responsive Breakpoint

- **Breakpoint**: 768px width
- **Phone**: < 768px
- **Tablet**: >= 768px

### Core Infrastructure

#### 1. `useResponsive` Hook

Located in `src/hooks/useResponsive.ts`, this hook provides device detection:

```typescript
const { isTablet, isPhone, width, height } = useResponsive();
```

Returns:
- `isTablet`: boolean - true if width >= 768px
- `isPhone`: boolean - true if width < 768px
- `deviceType`: 'phone' | 'tablet'
- `width`: number - current window width
- `height`: number - current window height

#### 2. Theme Constants

Extended `src/constants/theme.ts` with:

**Tablet Spacing:**
```typescript
Spacing.tablet = {
  xs: 6, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64
}
```

**Layout Constants:**
```typescript
Layout = {
  tabletBreakpoint: 768,
  maxContentWidth: {
    phone: '100%',
    tablet: 1200
  },
  gridColumns: {
    phone: 1,
    tablet: 2,
    tabletLarge: 3
  }
}
```

## Screen-by-Screen Responsive Behavior

### Tab Screens

#### 1. Home Screen (`app/(tabs)/index.tsx`)
**Phone:**
- Single column layout
- Stacked sections (hero, demo, how it works)

**Tablet:**
- Centered content (max-width: 1200px)
- 2-column layout for demo mode + how it works sections
- Horizontal button layouts
- Larger font sizes

#### 2. Browse Jobs (`app/(tabs)/browse.tsx`)
**Phone:**
- Single column job list
- Netflix-style horizontal carousels

**Tablet:**
- 2-column grid for job cards
- Wider spacing between cards
- Same carousel layouts for categories

#### 3. Dashboard (`app/(tabs)/dashboard.tsx`)
**Phone:**
- Stacked stats cards
- Vertical job list

**Tablet:**
- Stats in horizontal row
- 2-column grid for job cards (48% width each)
- Centered content (max-width: 1200px)

#### 4. Profile (`app/(tabs)/profile.tsx`)
**Phone:**
- Stacked sections (stats, company info, menu)

**Tablet:**
- 2-column layout:
  - Left: Stats and company info
  - Right: Menu items
- Centered content (max-width: 1200px)

### Modal Screens

#### 5. Login (`app/login.tsx`)
**Phone:**
- Full-width card

**Tablet:**
- Centered card (max-width: 480px)
- Vertically centered on screen

#### 6. Signup (`app/signup.tsx`)
**Phone:**
- Full-width card

**Tablet:**
- Centered card (max-width: 520px)
- Vertically centered on screen

#### 7. Post Job (`app/post-job.tsx`)
**Phone:**
- Full-width form

**Tablet:**
- Centered form container (max-width: 600px)
- Better spacing for photo upload grid

#### 8. Job Details (`app/job/[id].tsx`)
**Phone:**
- Stacked layout (header, photos, description, scope, bids)

**Tablet:**
- 2-column split layout:
  - Left column (60%): Job info, photos, description, AI scope
  - Right column (40%): Bids section
- Centered content (max-width: 1200px)

## Responsive Patterns Used

### 1. Conditional Styles
```typescript
const { isTablet } = useResponsive();

<View style={[styles.content, isTablet && styles.contentTablet]}>
```

### 2. Conditional Layouts
```typescript
<View style={isTablet ? styles.twoColumnContainer : null}>
  <View style={isTablet ? styles.column : null}>
    {/* Left column */}
  </View>
  <View style={isTablet ? styles.column : null}>
    {/* Right column */}
  </View>
</View>
```

### 3. FlatList Grid
```typescript
<FlatList
  numColumns={isTablet ? 2 : 1}
  key={isTablet ? 'tablet' : 'phone'}
  columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
/>
```

### 4. Max-Width Containers
```typescript
contentTablet: {
  alignItems: 'center',
  maxWidth: Layout.maxContentWidth.tablet,
}
```

## App Configuration

### `app.json` Changes
```json
{
  "expo": {
    "orientation": "default",  // Changed from "portrait"
    "ios": {
      "supportsTablet": true   // Already enabled
    }
  }
}
```

This allows:
- Portrait and landscape on iPad
- Portrait only on iPhone (iOS default behavior)

## Testing

To test tablet layouts:

1. **iOS Simulator:**
   ```bash
   npm run ios
   # Select iPad Air or iPad Pro from simulator
   ```

2. **Physical Device:**
   - Install on iPad via TestFlight or Expo Go
   - Rotate device to test portrait/landscape

3. **Responsive Testing:**
   - Test at 768px boundary
   - Verify all screens adapt correctly
   - Check both orientations on tablet

## Best Practices

1. **Always use `useResponsive` hook** for device detection
2. **Use theme spacing constants** (`Spacing.tablet.*`)
3. **Apply max-width constraints** for centered tablet content
4. **Test on actual devices** when possible
5. **Maintain phone layouts** as the baseline (no breaking changes)

## Future Enhancements

Potential improvements:
- [ ] Landscape-specific layouts for iPhone
- [ ] Extra-large iPad Pro optimizations (>1024px)
- [ ] Split-view multitasking support
- [ ] Keyboard shortcuts for iPad
- [ ] Mouse/trackpad hover states

## File Structure

```
ios-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          ✅ Tablet responsive
│   │   ├── browse.tsx         ✅ Tablet responsive
│   │   ├── dashboard.tsx      ✅ Tablet responsive
│   │   └── profile.tsx        ✅ Tablet responsive
│   ├── job/
│   │   └── [id].tsx           ✅ Tablet responsive
│   ├── login.tsx              ✅ Tablet responsive
│   ├── signup.tsx             ✅ Tablet responsive
│   └── post-job.tsx           ✅ Tablet responsive
└── src/
    ├── hooks/
    │   ├── useResponsive.ts   ✨ New
    │   └── index.ts           ✨ New
    └── constants/
        └── theme.ts           ✅ Extended
```

## Summary

✅ All screens are now fully responsive for iPad
✅ Phone layouts remain unchanged
✅ Consistent breakpoint at 768px
✅ Reusable responsive utilities
✅ Proper orientation support
✅ Production-ready implementation
