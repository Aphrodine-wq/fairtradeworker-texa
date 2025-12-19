/**
 * Theme system for VOID desktop
 * TypeScript theme objects that map to CSS variables
 */

export type Theme = 'dark' | 'light'

export interface ThemeColors {
  // Surface colors
  surface: string
  surfaceSecondary: string
  border: string
  
  // Text colors
  textPrimary: string
  textSecondary: string
  textMuted: string
  
  // Background colors
  background: string
  backgroundOverlay: string
  
  // Accent colors
  accent: string
  accentSecondary: string
  
  // Wiremap colors
  wiremap: {
    node: string
    line: string
    ripple: string
  }
  
  // Glass panel colors
  glass: {
    background: string
    border: string
    shadow: string
  }
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    surface: '#0a0a0f',               /* Glass base (4% white) */
    surfaceSecondary: '#141419',       /* Secondary panels (8% white) */
    border: '#1a1a24',                 /* 8% white */
    textPrimary: '#ffffff',             /* 100% white - 7.5:1 contrast */
    textSecondary: '#a0a0b0',           /* 65% white - 4.5:1 contrast */
    textMuted: '#6a6a7a',              /* 40% white - 3:1 contrast */
    background: '#000000',              /* Pure OLED black */
    backgroundOverlay: 'rgba(0, 0, 0, 0.4)',
    accent: '#00f5ff',                 /* Electric cyan */
    accentSecondary: '#33f7ff',        /* +20% brightness */
    wiremap: {
      node: '#00f5ff',                  /* Cyan accent */
      line: '#1a1a24',                  /* Subtle connection lines */
      ripple: '#33f7ff',                /* Cyan ripple */
    },
    glass: {
      background: 'rgba(10, 10, 15, 0.9)',
      border: '#1a1a24',
      shadow: 'rgba(0, 0, 0, 0.35)',
    },
  },
  light: {
    surface: '#f8f9fc',                 /* Light glass base */
    surfaceSecondary: '#f0f1f5',       /* Secondary panels */
    border: '#e2e4ea',                 /* Light border */
    textPrimary: '#000000',             /* Pure black - 7.5:1 contrast */
    textSecondary: '#4b5563',          /* Gray - 4.5:1 contrast */
    textMuted: '#9ca3af',              /* Light gray - 3:1 contrast */
    background: '#ffffff',              /* Pure white */
    backgroundOverlay: 'rgba(255, 255, 255, 0.4)',
    accent: '#005ce6',                  /* Deep blue accent */
    accentSecondary: '#0047b3',        /* Darker blue */
    wiremap: {
      node: '#005ce6',                  /* Blue accent */
      line: '#e2e4ea',                  /* Subtle connection lines */
      ripple: '#0047b3',                /* Blue ripple */
    },
    glass: {
      background: 'rgba(248, 249, 252, 0.9)',
      border: '#e2e4ea',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
}

/**
 * Get theme colors for a specific theme
 */
export function getThemeColors(theme: Theme): ThemeColors {
  return themes[theme]
}

/**
 * Apply theme to document root via CSS variables
 * Sets both legacy --void-* variables and new design system variables
 */
export function applyTheme(theme: Theme): void {
  const colors = getThemeColors(theme)
  
  // Set data-theme attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', theme)
  
  // Set CSS variables
  const root = document.documentElement.style
  
  // Legacy --void-* variables (for backward compatibility)
  root.setProperty('--void-surface', colors.surface)
  root.setProperty('--void-surface-secondary', colors.surfaceSecondary)
  root.setProperty('--void-border', colors.border)
  root.setProperty('--void-text-primary', colors.textPrimary)
  root.setProperty('--void-text-secondary', colors.textSecondary)
  root.setProperty('--void-text-muted', colors.textMuted)
  root.setProperty('--void-background', colors.background)
  root.setProperty('--void-background-overlay', colors.backgroundOverlay)
  root.setProperty('--void-accent', colors.accent)
  root.setProperty('--void-accent-secondary', colors.accentSecondary)
  root.setProperty('--void-wiremap-node', colors.wiremap.node)
  root.setProperty('--void-wiremap-line', colors.wiremap.line)
  root.setProperty('--void-wiremap-ripple', colors.wiremap.ripple)
  root.setProperty('--void-glass-background', colors.glass.background)
  root.setProperty('--void-glass-border', colors.glass.border)
  root.setProperty('--void-glass-shadow', colors.glass.shadow)
  
  // New design system variables (scoped to .void-desktop)
  // Set on .void-desktop element if it exists, otherwise on :root
  const voidDesktop = document.querySelector('.void-desktop') as HTMLElement | null
  const targetStyle = voidDesktop?.style || root
  
  targetStyle.setProperty('--bg', colors.background)
  targetStyle.setProperty('--bg-elevated', theme === 'dark' ? '#020204' : '#fefefe')
  targetStyle.setProperty('--surface', colors.surface)
  targetStyle.setProperty('--surface-secondary', colors.surfaceSecondary)
  targetStyle.setProperty('--surface-hover', theme === 'dark' ? '#141419' : '#f0f1f5')
  targetStyle.setProperty('--border', colors.border)
  targetStyle.setProperty('--border-hover', theme === 'dark' ? '#2a2a3a' : '#d0d2da')
  targetStyle.setProperty('--border-active', colors.accent)
  targetStyle.setProperty('--text-primary', colors.textPrimary)
  targetStyle.setProperty('--text-secondary', colors.textSecondary)
  targetStyle.setProperty('--text-tertiary', colors.textMuted)
  targetStyle.setProperty('--text-accent', colors.accent)
  targetStyle.setProperty('--accent', colors.accent)
  targetStyle.setProperty('--accent-hover', colors.accentSecondary)
}

/**
 * Get current theme from localStorage or system preference
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  
  const stored = localStorage.getItem('void-theme') as Theme | null
  if (stored && (stored === 'dark' || stored === 'light')) {
    return stored
  }
  
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return systemPrefersDark ? 'dark' : 'light'
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  const theme = getCurrentTheme()
  applyTheme(theme)
  
  // Also set dark class for compatibility
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
