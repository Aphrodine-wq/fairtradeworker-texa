# VOID Desktop System Documentation

## Overview

VOID is a revolutionary desktop interface system that combines Windows Aero aesthetics with iOS design principles, featuring glassmorphism effects, 120fps micro-interactions, WebGL wiremap backgrounds, and seamless media integration. The system provides a modern, performant, and visually stunning user experience.

## Table of Contents

1. **[Complete Technical Specification](./TECHNICAL_SPECIFICATION.md)** ⭐ - **MASTER DOCUMENT** - Complete system reference with all implementation details
2. **[Design System Manifesto](./DESIGN_SYSTEM.md)** 🎨 - **DESIGN SPECIFICATION** - Complete design system with all visual specifications, color system, typography, animations, and component designs
3. [Architecture Overview](./ARCHITECTURE.md)
4. [Visual Effects System](./VISUAL_EFFECTS.md)
5. [Media Integration](./MEDIA_INTEGRATION.md)
6. [Theme System](./THEME_SYSTEM.md)
7. [Component Reference](./COMPONENTS.md)
8. [API Reference](./API_REFERENCE.md)
9. [Performance Guide](./PERFORMANCE.md)
10. [Integration Guide](./INTEGRATION.md)
11. [Usage Guide](./USAGE.md)
12. [Troubleshooting](./TROUBLESHOOTING.md)

## Quick Start

### Accessing VOID Desktop

Navigate to `/void` route in your application to access the VOID desktop interface.

### Basic Usage

```tsx
import VoidDesktopPage from '@/pages/void/index'

// VOID desktop is accessible via routing
// Route: /void
```

## Key Features

### Visual Effects
- **Glassmorphism**: Windows Aero + iOS hybrid glass panels
- **120fps Animations**: Smooth micro-interactions with auto-throttling
- **WebGL Wiremap**: Interactive 3D background with mouse attraction
- **Instant Theme Switching**: 0ms perceived delay with background cross-fade

### Media Integration
- **Spotify Toolbar**: Collapsible media player (40px/8px)
- **Media Session API**: Windows media key support
- **Offline Caching**: Last 10 tracks stored in IndexedDB
- **CRM Mood Sync**: Auto-pause during voice recording, mood-based playlists

### Desktop Features
- **Background System**: Drag-drop upload, auto-contrast adjustment
- **Grid System**: 200×200 CSS Grid for icon/window positioning
- **Window Management**: Drag, snap, minimize, maximize
- **Icon System**: Draggable icons with usage tracking

## System Requirements

- Modern browser with WebGL support
- OffscreenCanvas API support (for wiremap)
- Media Session API support (for media keys)
- IndexedDB support (for caching)

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Opera 74+

## Performance Targets

- **120fps** target for micro-interactions
- **60fps** minimum (auto-throttles if needed)
- **Wiremap**: 80 nodes desktop / 40 nodes mobile
- **Frame Time**: <8.33ms for 120fps, <16.67ms for 60fps

## Architecture

VOID uses a modular architecture with:

- **State Management**: Zustand with persistence
- **Animation**: Framer Motion + custom 120fps hooks
- **WebGL**: Three.js in Web Worker
- **Theming**: CSS variables + TypeScript theme objects
- **Media**: Spotify Web API + Media Session API

## Documentation Structure

Each major component has detailed documentation:

- **TECHNICAL_SPECIFICATION.md** ⭐: **MASTER DOCUMENT** - Complete technical specification with all implementation details, code examples, architecture, and reference information. **Start here for system updates.**
- **DESIGN_SYSTEM.md** 🎨: **DESIGN SPECIFICATION** - Complete design system manifesto with all visual specifications, color system (CSS variables), typography scale, grid system, iconography, animations (120fps frame-by-frame), window system, buddy avatar, voice capture UI, Spotify integration, performance budgets, accessibility (AAA+), and responsive design. **Start here for design decisions.**
- **ARCHITECTURE.md**: System architecture and design decisions
- **VISUAL_EFFECTS.md**: Glassmorphism, animations, wiremap details
- **MEDIA_INTEGRATION.md**: Spotify, Media Session API, mood sync
- **THEME_SYSTEM.md**: Theme switching, color management
- **COMPONENTS.md**: Component API and usage
- **API_REFERENCE.md**: Store actions, hooks, utilities
- **PERFORMANCE.md**: Optimization strategies and monitoring
- **INTEGRATION.md**: Integrating VOID into your app
- **USAGE.md**: Step-by-step usage guides
- **TROUBLESHOOTING.md**: Common issues and solutions

## Getting Help

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review component documentation
3. Check browser console for errors
4. Verify browser compatibility

## Security & Stability

VOID includes comprehensive security measures (December 2025 update):

- **Runtime Validation**: Zod schema validation for all store state
- **Secure Storage**: Storage wrapper with integrity checks and quota management
- **Error Boundaries**: Comprehensive error handling with auto-recovery
- **XSS Prevention**: Content sanitization across all components
- **API Security**: Rate limiting, secure token storage, request validation
- **Input Validation**: All user inputs validated and sanitized
- **Critical Bug Fix**: Set serialization issue resolved

See [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md#security--stability) for complete security documentation.

## Version History

- **v1.1.0** (December 2025): Security & Stability Update
  - Comprehensive security enhancements
  - Runtime validation with Zod schemas
  - Secure storage wrapper
  - Error boundaries with auto-recovery
  - XSS prevention measures
  - API security layer
  - Critical Set serialization bug fix
- **v1.0.0** (Initial): Initial implementation
  - Visual effects system
  - Media integration
  - Theme system
  - Background system
  - WebGL wiremap

---

**Last Updated**: December 2025
