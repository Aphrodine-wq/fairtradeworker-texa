# Centering and Theme Updates

## Overview
Applied consistent centering across all pages and synchronized theme toggle animation with dark mode transition.

## Changes Made

### 1. Theme Toggle Animation Sync
- **File**: `src/index.css`
- **Change**: Updated global transition duration from 150ms to 5s to match theme toggle animation
- **Impact**: Light/dark mode transitions now smoothly animate over 5 seconds, synchronized with the theme toggle button animation

### 2. Page Centering
- Applied consistent `max-w-7xl mx-auto` or appropriate max-width with centered alignment to page containers
- **Files Updated**:
  - `src/pages/BusinessTools.tsx` - Added `max-w-7xl mx-auto` to main container
  - All pages now have proper centered layout structure

### 3. Pricing Fix
- **File**: `src/components/ui/MarketingSections.tsx`
- **Change**: Updated Contractor Pro pricing from $29/month to $59/month
- **Impact**: Home screen pricing now matches actual subscription price

## Technical Details

### Theme Transition
The global CSS transition now uses:
```css
transition-duration: 5s;
```

This ensures all color transitions (background-color, border-color, color, fill, stroke, box-shadow) animate smoothly over 5 seconds when toggling between light and dark modes.

### Centering Pattern
Pages follow this pattern:
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
  {/* Page content */}
</div>
```

This provides:
- Maximum content width for readability
- Centered alignment
- Responsive padding

## User Experience
- Smooth, synchronized theme transitions
- Consistent, centered page layouts
- Accurate pricing information displayed
- Professional, polished appearance across all pages
