import type { VoidTheme } from './types'

// Theme Configuration
export const themes = {
  dark: {
    bg: '#000000',
    surface: '#0a0a0f',
    surfaceHover: '#141419',
    border: '#1a1a24',
    borderHover: '#2a2a3a',
    text: '#ffffff',
    textMuted: '#a0a0b0',
    accent: '#00f0ff',      // Cyan
    accentAlt: '#8b5cf6',   // Violet
    success: '#10b981',     // Emerald
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red
    glow: '0 0 30px rgba(0, 240, 255, 0.4)',
    glowAlt: '0 0 30px rgba(139, 92, 246, 0.4)',
  },
  light: {
    bg: '#ffffff',
    surface: '#f8f9fc',
    surfaceHover: '#f0f1f5',
    border: '#e2e4ea',
    borderHover: '#d0d2da',
    text: '#000000',
    textMuted: '#64748b',
    accent: '#0066cc',      // Deep blue
    accentAlt: '#7c3aed',   // Purple
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    glow: '0 0 30px rgba(0, 102, 204, 0.3)',
    glowAlt: '0 0 30px rgba(124, 58, 237, 0.3)',
  }
} as const

// Grid Configuration
export const GRID_CONFIG = {
  units: 200, // 200x200 grid
  iconSize: { width: 4, height: 4 }, // 4x4 units per icon
  spotifySize: { width: 12, height: 16 }, // 12x16 units for Spotify player
  unitToPixel: (units: number, viewportWidth: number = 1920) => {
    // Scale based on viewport, default to 1920px = 200 units
    return (units / 200) * viewportWidth
  },
  pixelToUnit: (pixels: number, viewportWidth: number = 1920) => {
    return (pixels / viewportWidth) * 200
  }
} as const

// Wiremap Configuration
export const WIREMAP_CONFIG = {
  nodes: {
    count: {
      mobile: 40,
      tablet: 60,
      desktop: 100
    },
    colors: {
      dark: ['#00f0ff', '#8b5cf6', '#10b981'],
      light: ['#0066cc', '#7c3aed', '#059669']
    },
    size: { min: 2, max: 10 },
    pulse: true,
    pulseSpeed: 1200, // ms
    pulseAmplitude: 0.3,
  },
  connections: {
    maxDistance: 200,
    lineWidth: { min: 0.5, max: 2 },
    opacity: { min: 0.1, max: 0.4 },
    animated: true,
    dashArray: [4, 6],
    dashSpeed: 60, // px per second
    gradient: true,
  },
  movement: {
    speed: { x: 0.3, y: 0.3 },
    type: 'organic' as const, // 'linear' | 'wave' | 'chaotic' | 'organic'
    bounds: 'viewport' as const,
    bounce: 0.9,
    friction: 0.98,
  },
  interaction: {
    mouseAttract: true,
    attractRadius: 300,
    attractStrength: 0.05,
    clickRipple: true,
    rippleDuration: 1000,
    ripplePropagation: 3,
    touchSupport: true,
    touchRadius: 150,
  },
  performance: {
    targetFPS: 120,
    lowPower: {
      nodeCount: 30,
      disableAnimations: true,
      renderMode: 'canvas2d' as const
    },
    adaptiveQuality: true,
    useWebGL: true,
    useOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    workerUrl: '/workers/wiremap.js',
  },
  rendering: {
    pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
    antialias: true,
    alpha: true,
    clearColor: 'transparent',
  }
} as const

// Window Configuration
export const WINDOW_CONFIG = {
  minSize: { width: 400, height: 300 },
  defaultSize: { width: 800, height: 600 },
  maxSize: { width: 0, height: 0 }, // 0 = no limit
  snapDistance: 20, // pixels
  animation: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
  }
} as const

// Boot Animation Configuration
export const BOOT_CONFIG = {
  duration: 2000, // ms
  stages: [
    { label: 'Initializing...', progress: 0 },
    { label: 'Loading desktop...', progress: 40 },
    { label: 'Starting services...', progress: 70 },
    { label: 'Ready', progress: 100 },
  ]
} as const

// Voice Configuration
export const VOICE_CONFIG = {
  supportedLanguages: {
    en: { name: 'English', whisperCode: 'en', claudeLang: 'English' },
    es: { name: 'Español', whisperCode: 'es', claudeLang: 'Spanish' },
    fr: { name: 'Français', whisperCode: 'fr', claudeLang: 'French' },
    de: { name: 'Deutsch', whisperCode: 'de', claudeLang: 'German' },
    pt: { name: 'Português', whisperCode: 'pt', claudeLang: 'Portuguese' },
    it: { name: 'Italiano', whisperCode: 'it', claudeLang: 'Italian' },
    nl: { name: 'Nederlands', whisperCode: 'nl', claudeLang: 'Dutch' },
    pl: { name: 'Polski', whisperCode: 'pl', claudeLang: 'Polish' },
    ru: { name: 'Русский', whisperCode: 'ru', claudeLang: 'Russian' },
    ja: { name: '日本語', whisperCode: 'ja', claudeLang: 'Japanese' },
    ko: { name: '한국어', whisperCode: 'ko', claudeLang: 'Korean' },
    zh: { name: '中文', whisperCode: 'zh', claudeLang: 'Chinese' },
    hi: { name: 'हिन्दी', whisperCode: 'hi', claudeLang: 'Hindi' },
    ar: { name: 'العربية', whisperCode: 'ar', claudeLang: 'Arabic' }
  },
  minConfidence: 0.7,
  requiredFields: ['name', 'phone', 'email', 'projectType']
} as const

// Spotify Configuration
export const SPOTIFY_CONFIG = {
  defaultVolume: 0.7,
  crossfadeOptions: [0, 3, 6], // seconds
  audioQuality: ['normal', 'high', 'auto'] as const,
} as const

// Helper to get current theme colors
export const getThemeColors = (theme: VoidTheme) => themes[theme]
