# VOID Design System - The Complete Manifesto

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production Specification

---

## Table of Contents

1. [Foundational Philosophy](#1-foundational-philosophy)
2. [Color System: Absolute Control](#2-color-system-absolute-control)
3. [Typography: Exhaustive Specification](#3-typography-exhaustive-specification)
4. [Grid & Layout: Sub-Pixel Surgical](#4-grid--layout-sub-pixel-surgical)
5. [Iconography: Exhaustive Spec](#5-iconography-exhaustive-spec)
6. [Animation & Motion: 120fps Frame-by-Frame](#6-animation--motion-120fps-frame-by-frame)
7. [Window System: Aero Onyx](#7-window-system-aero-onyx)
8. [Buddy Avatar: Professional AI](#8-buddy-avatar-professional-ai)
9. [Voice Capture UI: Cinematic Precision](#9-voice-capture-ui-cinematic-precision)
10. [Spotify Integration: Ambient Control](#10-spotify-integration-ambient-control)
11. [Performance Budget: 120fps Locked](#11-performance-budget-120fps-locked)
12. [Accessibility: AAA+ Compliance](#12-accessibility-aaa-compliance)
13. [Responsive & Adaptive: 2K to 4K](#13-responsive--adaptive-2k-to-4k)

---

## 1. Foundational Philosophy

### Core Tenets (Non-Negotiable)

#### Surgical Minimalism
Every element must justify its existence. No decorative elements without function. Every pixel serves a purpose.

#### Predictable Luxury
Interactions should feel like a $15,000 workstation: familiar yet breathtakingly precise. Users should feel confident, not overwhelmed.

#### Performance as Design
120fps is not a target; it's the baseline. Stuttering is a design flaw. Every animation must respect the frame budget.

#### Contextual Intelligence
The UI should anticipate needs without being intrusive. Think "invisible butler" - present when needed, invisible when not.

#### Absolute Contrast
Text must achieve 7.5:1 contrast ratio on all backgrounds (exceeding WCAG AAA). No exceptions.

### Design DNA: MacOS + Windows Hybrid

#### MacOS Contributions
- **Magnetic easing curves**: Smooth, natural motion that feels organic
- **Purposeful motion blur**: Subtle depth cues during transitions
- **Vibrant accent saturation**: Rich, saturated colors for interactive elements
- **Soft depth shadows**: Layered shadows that create hierarchy

#### Windows Contributions
- **Rigid 0.5fr grid alignment**: Precise, mathematical positioning
- **Functional iconography**: Clear, recognizable icons with consistent weight
- **Snap-to behaviors**: Magnetic alignment and snapping
- **Flat color fills**: Solid backgrounds with clear boundaries
- **System-level efficiency**: Fast, responsive, no unnecessary animations

#### VOID's Mutation
- **True black/white foundation**: Pure OLED black (#000000) and pure white (#FFFFFF)
- **Cyan-only accent**: Single accent color (#00f5ff) for all interactive elements
- **Glassmorphism with dual-border technique**: Inner and outer borders for depth
- **1px gutters**: Minimal spacing between grid elements

---

## 2. Color System: Absolute Control

### Dynamic CSS Variables (Runtime-Only)

All colors are defined as CSS custom properties for runtime theme switching.

#### Dark Mode (Default)

```css
:root {
  /* === BACKGROUND LAYERS === */
  --bg: #000000;                    /* Pure OLED black */
  --bg-elevated: #020204;           /* Nano-elevated (1% white) */
  --surface: #0a0a0f;               /* Glass base (4% white) */
  --surface-hover: #141419;         /* Hover state (8% white) */
  
  /* === BORDERS & SEPARATORS === */
  --border: #1a1a24;                /* 8% white */
  --border-hover: #2a2a3a;          /* 12% white */
  --border-active: #00f5ff;         /* Accent on interaction */
  
  /* === TEXT HIERARCHY (7.5:1 contrast) === */
  --text-primary: #ffffff;          /* 100% white */
  --text-secondary: #a0a0b0;        /* 65% white */
  --text-tertiary: #6a6a7a;         /* 40% white (disabled) */
  --text-accent: #00f5ff;           /* Accent for links */
  
  /* === ACCENTS (Cyan Only) === */
  --accent: #00f5ff;                /* Electric cyan */
  --accent-hover: #33f7ff;          /* +20% brightness */
  --accent-glow: 0 0 40px rgba(0, 245, 255, 0.6);
  --accent-glow-subtle: 0 0 20px rgba(0, 245, 255, 0.3);
  
  /* === STATE COLORS (Windows Palette) === */
  --success: #10b981;               /* Emerald 500 */
  --warning: #f59e0b;               /* Amber 500 */
  --error: #ef4444;                 /* Red 500 */
  
  /* === SHADOWS (Dual-Layer) === */
  --shadow-ambient: 0 8px 32px rgba(0,0,0,0.35);
  --shadow-directional: 0 4px 16px rgba(0,0,0,0.2);
  --shadow-hover: 0 12px 48px rgba(0,0,0,0.45);
  
  /* === RADIUS (4px base unit) === */
  --radius-sm: 8px;   /* Buttons, inputs */
  --radius-md: 12px;  /* Cards, windows */
  --radius-lg: 16px;  /* Large panels */
  --radius-xl: 24px;  /* Modals */
  
  /* === BLUR === */
  --blur-sm: 12px;
  --blur-md: 20px;    /* Standard glass */
  --blur-lg: 32px;
  
  /* === TRANSITIONS (120fps) === */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap: cubic-bezier(0.2, 0, 0, 1);
  --ease-linear: linear;
}
```

#### Light Mode Overrides

```css
[data-theme="light"] {
  --bg: #ffffff;
  --bg-elevated: #fefefe;
  --surface: #f8f9fc;
  --surface-hover: #f0f1f5;
  
  --border: #e2e4ea;
  --border-hover: #d0d2da;
  
  --text-primary: #000000;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;
  
  --accent: #005ce6;
  --accent-hover: #0047b3;
  --accent-glow: 0 0 40px rgba(0, 92, 230, 0.4);
}
```

### Color Usage Matrix (Strict)

| Element | Color Variable | Use Case | Contrast Ratio |
|---------|---------------|----------|----------------|
| Primary text | `--text-primary` | Headings, labels | 7.5:1 |
| Body text | `--text-secondary` | Descriptions | 4.5:1 |
| Disabled text | `--text-tertiary` | Inactive states | 3:1 |
| Interactive | `--accent` | Links, buttons | 7.5:1 |
| Success text | `--success` | Confirmations | 7.5:1 |
| Warning text | `--warning` | Alerts | 7.5:1 |
| Error text | `--error` | Errors | 7.5:1 |
| Borders | `--border` | Separators | 3:1 |
| Hover borders | `--border-hover` | Interactive | 4.5:1 |

### Accent Usage Rule

**Only for interactive elements** (buttons, links, active states, focus rings). Never for static decoration.

---

## 3. Typography: Exhaustive Specification

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

### Type Scale (4px Base Unit)

```typescript
const typography = {
  // === DISPLAY ===
  'display-1': { 
    size: '36px', 
    lineHeight: '44px', 
    weight: 700 
  }, // Logo
  'display-2': { 
    size: '28px', 
    lineHeight: '36px', 
    weight: 600 
  }, // Headings
  
  // === HEADINGS ===
  'heading-1': { 
    size: '22px', 
    lineHeight: '28px', 
    weight: 600 
  },
  'heading-2': { 
    size: '18px', 
    lineHeight: '24px', 
    weight: 500 
  },
  'heading-3': { 
    size: '15px', 
    lineHeight: '20px', 
    weight: 600 
  },
  
  // === BODY ===
  'body-large': { 
    size: '16px', 
    lineHeight: '24px', 
    weight: 400 
  }, // Rare
  'body-regular': { 
    size: '15px', 
    lineHeight: '22px', 
    weight: 400 
  },
  'body-small': { 
    size: '13px', 
    lineHeight: '18px', 
    weight: 400 
  },
  'body-caption': { 
    size: '11px', 
    lineHeight: '16px', 
    weight: 500 
  },
  
  // === UI ===
  'button': { 
    size: '14px', 
    lineHeight: '20px', 
    weight: 500 
  },
  'input': { 
    size: '15px', 
    lineHeight: '22px', 
    weight: 400 
  },
  'label': { 
    size: '13px', 
    lineHeight: '18px', 
    weight: 500 
  },
  'mono': { 
    size: '13px', 
    lineHeight: '18px', 
    weight: 400, 
    family: 'SF Mono, Monaco, monospace' 
  },
};
```

### Text Color Application

```tsx
// Primary text (headings, labels)
<span className="text-[--text-primary] font-semibold text-[22px] leading-[28px]">

// Secondary text (descriptions)
<p className="text-[--text-secondary] text-[15px] leading-[22px]">

// Tertiary (metadata, disabled)
<small className="text-[--text-tertiary] text-[11px] leading-[16px]">
```

---

## 4. Grid & Layout: Sub-Pixel Surgical

### Desktop Canvas: 400×400 Micro-Grid

```css
/* Root container */
.void-desktop {
  display: grid;
  grid-template-columns: repeat(400, 0.5fr); /* 0.5fr = 2px increments */
  grid-template-rows: repeat(400, 0.5fr);
  gap: 1px; /* 1px gutters */
  padding: 32px 40px;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg);
}

/* Icon base (1×1 grid unit = 0.5×0.5fr) */
.void-icon {
  grid-column: span 1;
  grid-row: span 1;
  place-self: center; /* Perfect centering */
  width: 100%;
  height: 100%;
  min-width: 48px; /* Minimum touch target */
  min-height: 48px;
}
```

### Icon Positioning (Exact)

```typescript
const iconPositions = {
  customers: { column: 4, row: 10 },   // 1×1
  leads: { column: 4, row: 14 },       // 1×1
  pipeline: { column: 4, row: 18 },    // 1×1
  contacts: { column: 8, row: 10 },    // 1×1
  documents: { column: 8, row: 14 },   // 1×1
  'ai-hub': { column: 8, row: 18 },    // 1×1
  automation: { column: 12, row: 10 }, // 1×1
  integrations: { column: 12, row: 14 }, // 1×1
  analytics: { column: 12, row: 18 },   // 1×1
  'voice-capture': { column: 16, row: 22, size: 2 }, // 2×2 (prominent)
  spotify: { column: 360, row: 340, size: { w: 24, h: 32 } }, // 24×32
};
```

### Toolbar: Fixed 48px Header

```css
.void-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  display: grid;
  grid-template-columns: 48px 1fr auto auto auto auto auto;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: var(--surface) / 80%;
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

/* Individual toolbar items */
.toolbar-logo { width: 32px; height: 32px; }
.toolbar-search { min-width: 320px; max-width: 640px; }
.toolbar-datetime { width: 120px; text-align: center; }
.toolbar-theme { width: 40px; height: 40px; }
.toolbar-notifications { width: 40px; height: 40px; }
.toolbar-profile { width: 40px; height: 40px; }
.toolbar-spotify { width: 200px; height: 36px; }
```

---

## 5. Iconography: Exhaustive Spec

### Icon System

- **Library**: Lucide React (outline style)
- **Base size**: 24×24px viewBox
- **Stroke width**: 1.5px (uniform)
- **Stroke linecap**: round
- **Stroke linejoin**: round
- **Color**: currentColor (inherits from parent)
- **Weight**: Consistent optical weight (verified via Figma plugin)

### Icon Sizes per Context

```tsx
// Desktop icons (48×48px container)
<div className="w-12 h-12 text-[--text-secondary] hover:text-[--accent]">
  <CustomersIcon size={24} />
</div>

// Toolbar icons (20×20px)
<div className="w-5 h-5 text-[--text-secondary]">
  <SearchIcon size={20} />
</div>

// Button icons (16×16px)
<div className="w-4 h-4 text-[--text-primary]">
  <PlusIcon size={16} />
</div>

// Status icons (12×12px)
<div className="w-3 h-3 text-[--success]">
  <CheckIcon size={12} />
</div>
```

### Icon Metadata (Required)

```typescript
interface IconMetadata {
  name: string;
  gridPosition: { column: number; row: number };
  label: string;
  labelFont: 'body-small';
  labelColor: '--text-secondary';
  labelPosition: 'bottom'; // Below icon
  hoverScale: 1.08;
  hoverColor: '--accent';
  focusRing: '2px solid --accent';
  accessibility: {
    role: 'button',
    ariaLabel: 'Open Customers Window',
    keyboardShortcut: '⌘+1',
  },
}
```

---

## 6. Animation & Motion: 120fps Frame-by-Frame

### Frame Budget: 8.33ms per Frame

```typescript
const animationRules = {
  // === DURATION HIERARCHY ===
  durations: {
    micro: 80,    // Button press, instant feedback
    fast: 120,    // Hover, drag start
    normal: 200,  // Window open/close
    slow: 300,    // Panel expand, page transitions
  },
  
  // === EASING CURVES (MACOS/WINDOWS HYBRID) ===
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Material Design
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',   // MacOS bounce
    snap: 'cubic-bezier(0.2, 0, 0, 1)',            // Windows snap
    linear: 'linear',
  },
  
  // === PERFORMANCE REQUIREMENTS ===
  performance: {
    willChange: true,        // CSS will-change: transform
    gpuLayer: true,         // Force GPU layer
    frameBudget: 8.33,      // ms per frame
    dropThreshold: 110,     // Alert if FPS drops below
  },
};
```

### Micro-Interaction Timeline

```tsx
// ICON HOVER (120ms total)
<motion.div
  initial={{ scale: 1, filter: 'brightness(1)', boxShadow: 'none' }}
  whileHover={{
    scale: 1.08,
    filter: 'brightness(1.15)',
    boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.4)',
    transition: {
      duration: 0.12,
      ease: animationRules.easings.standard,
      willChange: 'transform, filter',
    },
  }}
/>

// BUTTON CLICK (80ms total)
<motion.button
  whileTap={{
    scale: 0.96,
    transition: {
      duration: 0.08,
      ease: animationRules.easings.standard,
    },
  }}
/>

// WINDOW DRAG START (80ms)
<motion.div
  whileDrag={{
    scale: 1.05,
    rotate: 1.5,
    zIndex: 100,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    transition: {
      duration: 0.08,
      ease: animationRules.easings.snap,
    },
  }}
/>

// WINDOW DROP (180ms)
<motion.div
  animate={{
    scale: [1.05, 0.95, 1],
    rotate: [1.5, 0],
    transition: {
      duration: 0.18,
      ease: animationRules.easings.bounce,
      times: [0, 0.6, 1],
    },
  }}
/>

// THEME TOGGLE (250ms)
<motion.button
  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
  transition={{ duration: 0.25, ease: animationRules.easings.standard }}
/>

// BUDDY MESSAGE APPEAR (300ms staggered)
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.3,
    ease: animationRules.easings.bounce,
    staggerChildren: 0.05,
  }}
/>
```

### Animation State Machine per Component

```typescript
// Every animated component must define:
interface AnimationSpec {
  component: string;
  states: {
    idle: AnimationState;
    hover: AnimationState;
    active: AnimationState;
    disabled: AnimationState;
  };
  transitions: {
    'idle -> hover': Transition;
    'hover -> active': Transition;
    'active -> idle': Transition;
  };
}

// Example: Icon
const iconAnimationSpec: AnimationSpec = {
  component: 'DesktopIcon',
  states: {
    idle: { scale: 1, filter: 'brightness(1)', boxShadow: 'none' },
    hover: { scale: 1.08, filter: 'brightness(1.12)', boxShadow: '--accent-glow-subtle' },
    active: { scale: 0.96, filter: 'brightness(0.9)' },
    disabled: { scale: 1, filter: 'brightness(0.6)', opacity: 0.5 },
  },
  transitions: {
    'idle -> hover': { duration: 120, ease: '--ease-standard' },
    'hover -> active': { duration: 80, ease: '--ease-standard' },
    'active -> idle': { duration: 100, ease: '--ease-bounce' },
  },
};
```

---

## 7. Window System: Aero Onyx

### Window Anatomy (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Title Bar - 32px]                                         │
│  ├─ Icon (16px left, center vertical)                     │
│  ├─ Title (15px medium, 16px padding left)                │
│  ├─ Controls (12px diameter, 8px gap, 16px right)        │
│  │  ├─ Minimize (🟡) - hover scale 1.15, tooltip "Minimize" │
│  │  ├─ Maximize (🟢) - hover scale 1.15, tooltip "Maximize" │
│  │  └─ Close (🔴) - hover scale 1.15 + red glow            │
│  └─ Border bottom (1px solid --border)                    │
│                                                             │
│  [Content - Fluid]                                          │
│  ├─ Padding: 16px all sides                               │
│  ├─ Scroll container (if needed)                          │
│  └─ Background: --surface / 90% + blur                    │
│                                                             │
│  [Resize Handles]                                           │
│  ├─ Left edge: 4px hot zone, cursor: ew-resize           │
│  ├─ Right edge: 4px hot zone, cursor: ew-resize          │
│  ├─ Top edge: 4px hot zone, cursor: ns-resize            │
│  ├─ Bottom edge: 4px hot zone, cursor: ns-resize          │
│  ├─ Corners: 12px diagonal hot zone, cursor: nwse/ne/sw  │
│  └─ Min window size: 400×300px (enforced)                 │
│                                                             │
│  [Drop Shadow]                                              │
│  ├─ Default: 0 8px 32px rgba(0,0,0,0.3)                   │
│  ├─ Active: 0 12px 48px rgba(0,0,0,0.4)                   │
│  └─ Maximized: none (flat against grid)                   │
└─────────────────────────────────────────────────────────────┘
```

### Window States & Animations

```typescript
const windowStates = {
  hidden: {
    scale: 0.88,
    opacity: 0,
    filter: 'blur(12px)',
    y: 16,
    boxShadow: 'none',
  },
  visible: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    boxShadow: 'var(--shadow-ambient)',
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 350,
      mass: 0.8,
      willChange: 'transform, filter, opacity',
    },
  },
  exit: {
    scale: 0.88,
    opacity: 0,
    filter: 'blur(12px)',
    y: -16,
    transition: {
      duration: 150,
      ease: 'easeIn',
    },
  },
  minimize: {
    scale: 0.4,
    opacity: 0.6,
    y: 200,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: {
      type: 'snap',
      duration: 180,
    },
  },
  maximize: {
    scale: 1,
    borderRadius: 0,
    boxShadow: 'none',
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 400,
    },
  },
};
```

### Z-Index Management

```typescript
const zIndexLayers = {
  background: 0,      // User background
  overlay: 1,         // Dark overlay
  wiremap: 2,         // Animated nodes
  desktop: 10,        // Icons
  widgets: 20,        // Buddy, Spotify
  windows: 30,        // Floating windows
  windowsActive: 31,  // Active window (+1)
  toolbar: 100,       // Fixed header
  dropdowns: 200,     // Tooltips, menus
  modals: 1000,       // Dialogs
  toasts: 2000,       // Notifications
  voiceOverlay: 3000, // Fullscreen voice
};
```

---

## 8. Buddy Avatar: Professional AI

### Visual Design: Minimalist Glass Face

```tsx
// BuddyAvatar.tsx - Professional, non-holographic
export const BuddyAvatar = () => {
  const { state, context } = useBuddyStore();
  
  return (
    <motion.div
      className="relative w-16 h-16 cursor-pointer select-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        // Subtle breathing when idle
        scale: state.isIdle ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 3,
        repeat: state.isIdle ? Infinity : 0,
        ease: 'easeInOut',
      }}
      style={{ willChange: 'transform' }}
      aria-label="Buddy AI Assistant"
    >
      {/* Glass container */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[--surface]/50 via-[--surface]/30 to-transparent backdrop-blur-xl border border-[--border] overflow-hidden">
        
        {/* Animated accent gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-[--accent]/30"
          animate={{
            opacity: state.isActive ? [0.3, 0.6, 0.3] : 0.2,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Tech grid pattern (subtle) */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--accent) 2px, var(--accent) 4px)',
          backgroundSize: '8px 8px',
        }} />
        
        {/* Face elements */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {/* Eyes: Professional dots */}
          <div className="flex gap-3 mb-1.5">
            <motion.div 
              className="w-2 h-2 rounded-full bg-[--text-primary]"
              animate={{ 
                scaleY: getBlinkState(state.blinkTimer), // Blinks every 4s
                backgroundColor: state.isProcessing ? 'var(--accent)' : 'var(--text-primary)',
              }}
              transition={{ duration: 0.12, ease: 'easeInOut' }}
            />
            <motion.div 
              className="w-2 h-2 rounded-full bg-[--text-primary]"
              animate={{ scaleY: getBlinkState(state.blinkTimer) }}
            />
          </div>
          
          {/* Mouth: Minimal line with emotion */}
          <motion.div
            className="border-b-2 border-[--text-primary] rounded-full"
            animate={{
              borderColor: state.emotion === 'error' ? 'var(--error)' : 'var(--text-primary)',
              width: state.emotion === 'happy' ? 12 : state.emotion === 'thinking' ? 0 : 8,
              borderWidth: state.emotion === 'happy' ? 3 : 2,
              opacity: state.emotion === 'thinking' ? 0.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          />
          
          {/* Processing indicator (three dots) */}
          <AnimatePresence>
            {state.isProcessing && (
              <motion.div
                className="absolute top-2 right-2 flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-[--accent]"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Status notification dot */}
      <AnimatePresence>
        {state.hasUnread && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-3 h-3"
          >
            <div className="absolute inset-0 rounded-full bg-[--accent]" />
            <motion.div
              className="absolute inset-0 rounded-full bg-[--accent]"
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Blink helper
const getBlinkState = (timer: number) => {
  const cycle = timer % 4000; // 4s cycle
  return cycle > 3800 && cycle < 3900 ? 0.1 : 1; // 100ms blink
};
```

### Buddy Panel: Executive Brief

```
┌─────────────────────────────────────────────────────┐
│  ┌─────┐  Morning, Alex. Streak: 15 days 🔥        │ ✕
│  │ ◉ ◉ │  $47k pipeline. Q4 target: 74% complete.  │
│  │  ▽  │  Ready to prioritize today's leads?       │
│  └─────┘                                            │
├─────────────────────────────────────────────────────┤
│ 📋 AI-PRIORITIZED (Last updated: 09:42)             │
│ ▸ Miller Contract (Due: 2h) - "Final review"        │
│   Confidence: 94% → [Open] [Snooze 1h]             │
│                                                      │
│ ▸ 5 leads need follow-up (Avg delay: 72h)           │
│   Impact: High → [Draft Batch] [View List]         │
│                                                      │
│ ▸ Invoice #1234 overdue 3 days (Send reminder?)     │
│   Value: $8,400 → [Send] [Mark Paid]               │
├─────────────────────────────────────────────────────┤
│ ⚡ SUGGESTED ACTIONS                                │
│ [Focus Mode] [Call Sarah Miller] [Review Pipeline] │
├─────────────────────────────────────────────────────┤
│ 🏆 INSIGHTS & METRICS                               │
│ • Efficiency: +28% WoW (Avg response: 4.2h)        │
│ • Focus peak: 10-11 AM (Protect this block)        │
│ • Weather: Rain → 2 site visits delayed            │
├─────────────────────────────────────────────────────┤
│ 🎵 AMBIENCE CONTROL                                 │
│ Lo-fi Focus :: 65% [⏸] [⏭] [🔊] [⟳ Auto]         │
└─────────────────────────────────────────────────────┘
```

---

## 9. Voice Capture UI: Cinematic Precision

### State Machine (5 States)

#### State 0: Permission Request

```tsx
<div className="fixed inset-0 bg-[--bg]/90 backdrop-blur-2xl z-[3000] flex items-center justify-center">
  <motion.div
    initial={{ scale: 0.9, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    className="void-glass p-8 max-w-md text-center"
  >
    <div className="text-4xl mb-4">🎤</div>
    <h2 className="text-[--text-primary] text-[18px] mb-2">Allow Microphone Access</h2>
    <p className="text-[--text-secondary] text-[15px] mb-6">
      VOID processes audio in real-time. Nothing is stored without permission.
    </p>
    <div className="flex gap-3">
      <button className="flex-1 void-button-secondary">Cancel</button>
      <button className="flex-1 void-button-primary">Allow Access</button>
    </div>
  </motion.div>
</div>
```

#### State 1: Listening (Active)

```tsx
<div className="fixed inset-0 bg-[--bg]/95 backdrop-blur-2xl z-[3000] flex flex-col items-center justify-center">
  {/* Pulsing rings */}
  {[1, 2, 3].map(i => (
    <motion.div
      key={i}
      className="absolute rounded-full border-2 border-[--accent]"
      animate={{
        scale: [1, 1.5 + i * 0.3, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
      style={{ width: 200 + i * 40, height: 200 + i * 40 }}
    />
  ))}
  
  {/* Waveform */}
  <canvas ref={waveformRef} className="relative z-10 w-96 h-24" />
  
  {/* Controls */}
  <div className="mt-8 flex items-center gap-4 text-[--text-secondary]">
    <span>Language: EN ▾</span>
    <span>Confidence: 94%</span>
    <button className="void-button-ghost">Pause</button>
    <button className="void-button-ghost">Cancel</button>
  </div>
</div>
```

#### State 2: Processing

```tsx
<div className="fixed inset-0 bg-[--bg]/95 backdrop-blur-2xl z-[3000] flex items-center justify-center">
  <div className="text-center">
    {/* Buddy avatar processing */}
    <BuddyAvatar state="processing" />
    <h2 className="text-[--text-primary] mt-4 mb-2">Processing Audio</h2>
    <p className="text-[--text-secondary]">Claude 3.5 is extracting entities...</p>
    <progress className="void-progress mt-4" value={progress} max={100} />
  </div>
</div>
```

#### State 3: Review & Edit

```tsx
<div className="fixed inset-0 bg-[--bg]/90 backdrop-blur-xl z-[3000] flex items-center justify-center p-8">
  <motion.div
    className="void-glass max-w-4xl max-h-[80vh] overflow-y-auto"
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
  >
    <div className="p-6 border-b border-[--border]">
      <h2 className="text-[18px] text-[--text-primary]">Review Extracted Data</h2>
      <p className="text-[--text-secondary]">Confidence scores below 75% are highlighted.</p>
    </div>
    
    <div className="p-6">
      {/* Entity table */}
      <EntityEditor entities={extractedEntities} />
    </div>
    
    <div className="p-6 border-t border-[--border] flex justify-end gap-3">
      <button className="void-button-ghost">Re-record</button>
      <button className="void-button-secondary">Cancel</button>
      <button className="void-button-primary">Save to CRM</button>
    </div>
  </motion.div>
</div>
```

#### State 4: Success

```tsx
<div className="fixed inset-0 bg-[--bg]/90 backdrop-blur-xl z-[3000] flex items-center justify-center">
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="text-center"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="text-6xl mb-4"
    >
      ✓
    </motion.div>
    <h2 className="text-[18px] text-[--text-primary] mb-2">Lead Saved!</h2>
    <p className="text-[--text-secondary] mb-6">Sarah Johnson - Kitchen Remodel ($18k)</p>
    <div className="flex gap-3">
      <button className="void-button-secondary">Add Another</button>
      <button className="void-button-primary">View Details</button>
    </div>
  </motion.div>
</div>
```

---

## 10. Spotify Integration: Ambient Control

### Toolbar Strip (Collapsible)

```typescript
const spotifyStrip = {
  minimized: {
    height: 8px,
    content: 'marquee-track-name',
    hover: 'expand',
  },
  expanded: {
    height: 36px,
    components: ['album-art', 'track-info', 'controls', 'volume'],
  },
  controls: {
    previous: { icon: 'SkipBack', size: 16 },
    playPause: { icon: 'Play/Pause', size: 20 },
    next: { icon: 'SkipForward', size: 16 },
    like: { icon: 'Heart', size: 16 },
  },
  animations: {
    expand: { duration: 200, ease: '--ease-standard' },
    collapse: { duration: 150, ease: '--ease-standard' },
  },
};
```

### Now Playing Widget

```tsx
<div className="void-glass p-3 flex items-center gap-3">
  {/* Album art */}
  <div className="w-10 h-10 rounded-lg overflow-hidden">
    <img src={albumArt} className="w-full h-full object-cover" />
  </div>
  
  {/* Track info */}
  <div className="flex-1 min-w-0">
    <div className="text-[13px] text-[--text-primary] truncate">{trackName}</div>
    <div className="text-[11px] text-[--text-secondary] truncate">{artistName}</div>
  </div>
  
  {/* Controls */}
  <div className="flex items-center gap-2">
    <button className="void-icon-button"><SkipBack size={16} /></button>
    <button className="void-icon-button-primary"><Play size={20} /></button>
    <button className="void-icon-button"><SkipForward size={16} /></button>
  </div>
  
  {/* Volume */}
  <div className="flex items-center gap-2">
    <Volume2 size={14} className="text-[--text-secondary]" />
    <input type="range" className="void-slider w-16" value={volume} />
  </div>
</div>
```

---

## 11. Performance Budget: 120fps Locked

### Per-Component Budget

```typescript
const performanceBudget = {
  icon: {
    render: 0.5,      // ms
    hover: 1.0,       // ms
    drag: 2.0,        // ms
    total: 3.5,       // ms
  },
  window: {
    open: 8.0,        // ms
    drag: 4.0,        // ms per frame
    resize: 6.0,      // ms per frame
    total: 18.0,      // ms
  },
  buddy: {
    update: 3.0,      // ms
    animate: 2.0,     // ms per frame
    total: 5.0,       // ms
  },
  wiremap: {
    render: 4.0,      // ms per frame (60 nodes)
    interaction: 1.0, // ms per mouse move
    total: 5.0,       // ms
  },
  background: {
    static: 1.0,      // ms
    video: 3.0,       // ms per frame
    shader: 5.0,      // ms per frame
    total: 5.0,       // ms
  },
};

// Total per frame: 36.5ms / 8.33ms target = 4.4x over budget
// Solution: Layer culling, async ops, GPU offload
```

### Layer Culling Strategy

```typescript
const layerCulling = {
  offScreen: {
    threshold: 100, // px beyond viewport
    action: 'unmount',
    delay: 2000,    // ms before unmount
  },
  idle: {
    threshold: 5000, // ms inactive
    action: 'reduce-fps',
    targetFPS: 30,
  },
  lowBattery: {
    threshold: 20, // percent
    action: 'disable-wiremap',
    fallback: 'static-gradient',
  },
};
```

---

## 12. Accessibility: AAA+ Compliance

### WCAG 2.2 Level AAA Checklist

✅ **Contrast**: All text ≥ 7.5:1 (exceeds AAA)  
✅ **Focus visible**: 2px solid `--accent` ring on all interactables  
✅ **Keyboard navigation**: Tab order logical, Shift+Tab reverse  
✅ **Screen readers**: `aria-label`, `aria-live` for dynamic content  
✅ **Motion**: `prefers-reduced-motion` disables non-essential animations  
✅ **Touch**: 48×48px minimum touch targets (icons are 48px)  
✅ **Voice**: Full keyboard alternative for voice capture (Ctrl+Shift+V to start, Escape to cancel)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 13. Responsive & Adaptive: 2K to 4K

### Breakpoint System

```typescript
const breakpoints = {
  mobile: { max: 768, grid: '100x100', icons: 2 },
  tablet: { min: 769, max: 1024, grid: '200x200', icons: 1 },
  desktop: { min: 1025, max: 1920, grid: '400x400', icons: 1 },
  '2k': { min: 1921, max: 2560, grid: '500x500', icons: 0.5 },
  '4k': { min: 2561, grid: '600x600', icons: 0.5 },
};

// Grid density adapts, icon size stays 48px physical
```

### Adaptive Quality

```typescript
const adaptiveQuality = {
  nodes: {
    mobile: 40,
    tablet: 60,
    desktop: 80,
    '2k': 100,
    '4k': 120,
  },
  blur: {
    mobile: 12,
    desktop: 20,
  },
  shadows: {
    mobile: 'simple',
    desktop: 'dual-layer',
  },
};
```

---

## Implementation Checklist

### CSS Variables
- [ ] All dark mode variables defined
- [ ] All light mode overrides defined
- [ ] All easing curves defined
- [ ] All radius values defined
- [ ] All blur values defined

### Typography
- [ ] Font stack implemented
- [ ] All type scale sizes defined
- [ ] Line heights calculated
- [ ] Font weights specified

### Grid System
- [ ] 400×400 grid implemented
- [ ] All icon positions defined
- [ ] Toolbar layout specified
- [ ] Responsive breakpoints defined

### Components
- [ ] Window system implemented
- [ ] Buddy avatar implemented
- [ ] Voice capture states implemented
- [ ] Spotify integration implemented

### Performance
- [ ] Frame budgets defined
- [ ] Layer culling implemented
- [ ] GPU acceleration enabled
- [ ] FPS monitoring active

### Accessibility
- [ ] Contrast ratios verified (7.5:1)
- [ ] Keyboard navigation implemented
- [ ] Screen reader support added
- [ ] Reduced motion support added

---

**Document Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained By**: VOID Design Team

---

*This document is the complete design system specification for VOID. All implementations must adhere to these specifications. For technical implementation details, see [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md).*
