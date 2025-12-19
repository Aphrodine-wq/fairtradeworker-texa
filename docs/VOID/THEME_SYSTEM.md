# VOID Theme System

## Overview

The VOID theme system provides instant theme switching (0ms perceived delay) with TypeScript theme objects that map to CSS variables, ensuring consistent theming across all components.

## Architecture

### Theme Objects (`lib/themes.ts`)

TypeScript objects define all theme colors:

```typescript
export const themes: Record<Theme, ThemeColors> = {
  dark: {
    surface: 'rgba(20, 20, 20, 0.9)',
    border: 'rgba(255, 255, 255, 0.1)',
    wiremap: { node: '#4A90E2', line: '#2E5C8A' },
    // ... more colors
  },
  light: {
    surface: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.1)',
    wiremap: { node: '#2563EB', line: '#1E40AF' },
    // ... more colors
  }
}
```

### CSS Variables

Automatically synced from theme objects:

```css
:root {
  --void-surface: rgba(255, 255, 255, 0.9);
  --void-border: rgba(0, 0, 0, 0.1);
  --void-wiremap-node: #2563EB;
  --void-wiremap-line: #1E40AF;
}

[data-theme="dark"] {
  --void-surface: rgba(20, 20, 20, 0.9);
  --void-border: rgba(255, 255, 255, 0.1);
  --void-wiremap-node: #4A90E2;
  --void-wiremap-line: #2E5C8A;
}
```

## Instant Theme Switching

### 0ms Perceived Delay

Theme toggle uses instant attribute change:

```typescript
// Instant switch (0ms perceived delay)
document.documentElement.setAttribute('data-theme', theme)
applyTheme(theme) // Updates CSS variables instantly

// Only backgrounds cross-fade (300ms)
document.documentElement.classList.add('theme-transitioning')
setTimeout(() => {
  document.documentElement.classList.remove('theme-transitioning')
}, 300)
```

### Implementation

```typescript
const toggleTheme = () => {
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
  
  // Instant switch
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

## Theme Colors

### Surface Colors

- **surface**: Main glass panel background
- **surfaceSecondary**: Secondary panels
- **border**: Border color with opacity

### Text Colors

- **textPrimary**: Main text (95% opacity)
- **textSecondary**: Secondary text (70% opacity)
- **textMuted**: Muted text (50% opacity)

### Background Colors

- **background**: Main background
- **backgroundOverlay**: Overlay for contrast

### Accent Colors

- **accent**: Primary accent color
- **accentSecondary**: Secondary accent

### Wiremap Colors

- **node**: Node color
- **line**: Connection line color
- **ripple**: Click ripple color

### Glass Colors

- **background**: Glass background
- **border**: Glass border
- **shadow**: Glass shadow

## Theme Application

### `applyTheme()` Function

```typescript
export function applyTheme(theme: Theme): void {
  const colors = getThemeColors(theme)
  
  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', theme)
  
  // Set CSS variables
  const root = document.documentElement.style
  root.setProperty('--void-surface', colors.surface)
  root.setProperty('--void-border', colors.border)
  // ... more variables
}
```

### Initialization

```typescript
export function initTheme(): void {
  const theme = getCurrentTheme()
  applyTheme(theme)
  
  // Also set dark class for compatibility
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
}
```

## Theme Detection

### System Preference

```typescript
export function getCurrentTheme(): Theme {
  const stored = localStorage.getItem('void-theme') as Theme | null
  if (stored && (stored === 'dark' || stored === 'light')) {
    return stored
  }
  
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return systemPrefersDark ? 'dark' : 'light'
}
```

### Storage

- **Key**: `void-theme`
- **Values**: `'dark'` | `'light'`
- **Fallback**: System preference

## Component Integration

### Using Theme Colors

```typescript
import { getThemeColors } from '@/lib/themes'

const colors = getThemeColors(theme)
// Use colors.wiremap.node, colors.surface, etc.
```

### CSS Variables

```css
.my-component {
  background: var(--void-surface);
  border: 1px solid var(--void-border);
  color: var(--void-text-primary);
}
```

### Wiremap Integration

```typescript
// Update wiremap colors when theme changes
useEffect(() => {
  const colors = getThemeColors(theme)
  workerRef.current?.postMessage({
    type: 'theme',
    theme: {
      node: colors.wiremap.node,
      line: colors.wiremap.line,
      ripple: colors.wiremap.ripple,
    },
  })
}, [theme])
```

## Theme Toggle Component

### Usage

```tsx
import { VoidThemeToggle } from '@/components/void/ThemeToggle'

<VoidThemeToggle />
```

### Features

- **Instant Switch**: 0ms perceived delay
- **Icon Animation**: Smooth rotation
- **Hover Effects**: Scale animation
- **Accessibility**: ARIA labels

## Background Cross-Fade

### CSS Transition

Only backgrounds transition (300ms):

```css
.theme-transitioning {
  transition: background-color 0.3s ease, background-image 0.3s ease;
}

.theme-transitioning * {
  transition: background-color 0.3s ease, background-image 0.3s ease;
}
```

### Why Only Backgrounds?

- **UI Elements**: Instant color change feels snappy
- **Backgrounds**: Smooth transition prevents jarring switch
- **Performance**: Minimal repaints

## Store Integration

### Theme State

```typescript
const { theme, setTheme } = useVoidStore()

// Get current theme
const currentTheme = theme

// Set theme
setTheme('dark')
```

### Persistence

Theme preference persisted in Zustand store:

```typescript
partialize: (state) => ({
  // ... other state
  theme: state.theme,
})
```

## Custom Themes

### Adding New Themes

1. Add theme object to `themes`:

```typescript
export const themes = {
  dark: { /* ... */ },
  light: { /* ... */ },
  custom: {
    surface: 'rgba(100, 50, 200, 0.9)',
    // ... define all colors
  }
}
```

2. Update `Theme` type:

```typescript
export type Theme = 'dark' | 'light' | 'custom'
```

3. Add CSS variables:

```css
[data-theme="custom"] {
  --void-surface: rgba(100, 50, 200, 0.9);
  /* ... more variables */
}
```

## Best Practices

1. **Use CSS Variables**: Always use `var(--void-*)` in CSS
2. **Type Safety**: Use `getThemeColors()` in TypeScript
3. **Instant Switch**: Don't add transitions to UI elements
4. **Background Only**: Only backgrounds should cross-fade
5. **Wiremap Sync**: Always update wiremap colors on theme change

## Troubleshooting

### Theme Not Applying

- Check `data-theme` attribute is set
- Verify CSS variables are defined
- Check browser DevTools for variable values
- Ensure `applyTheme()` is called

### Colors Not Updating

- Verify theme object has all required colors
- Check CSS variable names match
- Ensure components use CSS variables
- Clear browser cache

### Flash on Load

- Call `initTheme()` before first render
- Use inline script in `<head>`
- Set `data-theme` attribute early

---

**Last Updated**: December 2025
