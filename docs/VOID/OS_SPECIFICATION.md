# VOID OS — Complete Operating System Specification

**Version**: 2.0.0  
**Status**: Production Architecture  
**Last Updated**: 2024-12-18

---

## Overview

VOID OS is a complete operating system interface built for FairTradeWorker, providing a desktop-like experience in the browser. This specification documents all implemented features, architecture, and APIs.

---

## System Architecture

### Layer Stack (Z-Index)

```
LAYER 7: OVERLAYS (z: 9800-10100)
├── Lock Screen (10000)
├── Modals (9800)
├── Toasts (9900)
└── Boot Screen (10100)

LAYER 6: SYSTEM UI (z: 9300-9700)
├── Spotlight Search (9500)
├── Control Center (9400)
├── Notification Center (9300)
└── Context Menus (9600)

LAYER 5: TOOLBAR (z: 9100)
├── Logo, Search, Clock
├── System Tray
└── Profile Menu

LAYER 4: WINDOWS (z: 1000-9000)
├── Floating Windows
├── Maximized Windows
└── Picture-in-Picture

LAYER 3: WIDGETS (z: 200)
├── Buddy Assistant
├── Mini Spotify
└── Quick Notes

LAYER 2: DESKTOP (z: 10-100)
├── Icon Grid
├── Dock/Taskbar
└── Selection Rectangle

LAYER 1: BACKGROUND (z: 0-1)
├── User Wallpaper
├── Wiremap Canvas
└── Theme Overlay
```

**File**: `src/styles/void-os-layers.css`

---

## Boot Sequence

### Phase 0: Pre-Boot (0-100ms)
- Check localStorage for session
- Validate auth token
- Detect device capabilities
- Load cached theme

### Phase 1: System Init (100-500ms)
- Initialize Zustand stores
- Hydrate from IndexedDB
- Start WebGL wiremap worker
- Preload critical assets

### Phase 2: User Load (500-1000ms)
- Fetch user profile
- Restore window states
- Load notifications
- Sync offline changes

### Phase 3: Desktop Ready (1000-1500ms)
- Render desktop icons
- Initialize Buddy greeting
- Connect media services
- Fade to desktop (300ms)

**Files**:
- `src/lib/void/bootSequence.ts`
- `src/hooks/useBootSequence.ts`
- `src/components/void/VoidBootScreen.tsx`
- `src/styles/void-boot.css`

---

## Virtual File System

### Structure

```
/VOID
├── /Customers
│   ├── /Active
│   ├── /Archived
│   └── /VIP
├── /Leads
│   ├── /Hot
│   ├── /Warm
│   └── /Cold
├── /Documents
│   ├── /Contracts
│   ├── /Invoices
│   └── /Estimates
├── /Projects
├── /Templates
├── /Trash
└── /System
    └── preferences.config
```

### File Types

```typescript
type VoidFileType = 
  | 'contact'      // .contact - Customer/Lead
  | 'project'      // .project - Job record
  | 'invoice'      // .invoice - Invoice
  | 'estimate'     // .estimate - Quote
  | 'contract'     // .contract - Signed contract
  | 'template'     // .template - Reusable
  | 'folder'       // Directory
  | 'smartfolder'  // Saved search
```

**Files**:
- `src/lib/void/fileSystem.ts`
- `src/components/void/VoidFileSystem.tsx`
- `src/styles/void-filesystem.css`

---

## Window Management

### Window States

```typescript
type WindowState = 
  | 'normal'      // Free-floating
  | 'minimized'   // In taskbar
  | 'maximized'   // Full screen
  | 'snapped'     // Edge-snapped
  | 'pip'         // Picture-in-picture
```

### Snap Zones

9 snap zones with visual indicators:
- Top-left, Top-center, Top-right
- Left, Maximize, Right
- Bottom-left, Bottom-center, Bottom-right

**Files**:
- `src/lib/void/windowSnap.ts`
- `src/components/void/VoidWindow.tsx` (modified)
- `src/styles/void-desktop.css` (modified)

---

## Notification System

### Types

```typescript
type NotificationType = 
  | 'info'       // General info
  | 'success'    // Action completed
  | 'warning'    // Needs attention
  | 'error'      // Something failed
  | 'lead'       // New lead
  | 'message'    // Chat/email
  | 'reminder'   // Scheduled
  | 'payment'    // Payment received
```

**Files**:
- `src/lib/void/notifications.ts`
- `src/hooks/useNotifications.ts`
- `src/components/void/VoidToast.tsx`
- `src/components/void/VoidNotificationCenter.tsx`
- `src/styles/void-notifications.css`

---

## System Tray

Icons for:
- Notifications (with unread badge)
- Now playing music
- Connection status
- Theme toggle
- Volume control
- Clock/Calendar
- User profile

**Files**:
- `src/components/void/VoidSystemTray.tsx`
- `src/styles/void-system-tray.css`

---

## Context Menus

Context menus for:
- Desktop (New, Refresh, Arrange, Background, Settings)
- Icons (Open, Pin, Cut/Copy, Delete)
- Windows (Minimize, Maximize, Close, Move to Desktop)

**Files**:
- `src/lib/void/contextMenus.ts`
- `src/components/void/VoidContextMenu.tsx`
- `src/styles/void-context-menu.css`

---

## Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| `⌘ K` | Spotlight Search |
| `⌘ ,` | Settings |
| `⌘ Space` | Toggle Buddy |
| `⌘ ⇧ Space` | Voice Capture |
| `⌘ W` | Close Window |
| `⌘ M` | Minimize |
| `⌘ Tab` | Switch Windows |
| `Escape` | Close Modal |

### CRM Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ ⇧ L` | New Lead |
| `⌘ ⇧ C` | New Customer |
| `⌘ ⇧ P` | New Project |
| `⌘ ⇧ I` | New Invoice |
| `⌘ ⇧ E` | New Estimate |

**File**: `src/hooks/useVoidKeyboard.ts`

---

## Spotlight Search

Universal search with fuzzy matching across:
- Customers
- Leads
- Projects
- Invoices
- Documents
- Actions
- Settings

**Files**:
- `src/lib/void/spotlight.ts`
- `src/hooks/useSpotlight.ts`
- `src/components/void/VoidSpotlight.tsx`
- `src/styles/void-spotlight.css`

---

## Control Center

Quick settings panel with:
- Display brightness slider
- Sound volume slider
- Dark mode toggle
- WiFi toggle
- Do Not Disturb
- Focus Mode
- Wiremap toggle
- Now Playing widget
- Today Stats

**Files**:
- `src/components/void/VoidControlCenter.tsx`
- `src/styles/void-control-center.css`

---

## Lock Screen

Features:
- PIN authentication
- Biometric unlock (WebAuthn placeholder)
- Auto-lock on inactivity
- Dynamic time/date display
- Virtual PIN pad for touch devices

**Files**:
- `src/lib/void/lockScreen.ts`
- `src/hooks/useLockScreen.ts`
- `src/components/void/VoidLockScreen.tsx`
- `src/styles/void-lock.css`

---

## Dock / Taskbar

### macOS-style Dock
Floating dock with app icons and indicators

### Windows-style Taskbar
Integrated taskbar in toolbar

Toggle via Settings → Appearance → Dock Style

**Files**:
- `src/components/void/VoidDock.tsx`
- `src/styles/void-dock.css`

---

## Virtual Desktops

Mission Control interface for:
- Creating new desktops
- Switching between desktops
- Moving windows between desktops
- Desktop-specific wallpapers

**Files**:
- `src/lib/void/virtualDesktops.ts`
- `src/components/void/VoidMissionControl.tsx`
- `src/styles/void-mission-control.css`

---

## Clipboard Manager

Features:
- Automatic clipboard history
- Pinned items
- Search functionality
- Text and image support
- IndexedDB storage

**Files**:
- `src/lib/void/clipboard.ts`
- `src/hooks/useClipboard.ts`
- `src/components/void/VoidClipboardManager.tsx`
- `src/styles/void-clipboard.css`

---

## Settings Architecture

Categories:
- General (Language, Time Format)
- Appearance (Theme, Dock Style, Wiremap)
- Notifications (Enable, Sound, DND)
- Privacy
- Accounts
- Integrations
- Billing
- Team
- Data
- Advanced
- About

**Files**:
- `src/lib/void/settings.ts`
- `src/hooks/useSettings.ts`
- `src/components/void/VoidSettings.tsx`
- `src/styles/void-settings.css`

---

## Offline Mode & Sync

### Sync States

```typescript
type SyncStatus = 'online' | 'offline' | 'syncing' | 'error'
```

### IndexedDB Schema

```
void-offline/
├── customers     // Cached customers
├── leads         // Cached leads
├── projects      // Cached projects
├── invoices      // Cached invoices
├── pendingChanges // Queue of unsynced changes
└── syncMeta      // Last sync timestamp
```

**Files**:
- `src/lib/void/sync.ts`
- `src/hooks/useSync.ts`
- `src/components/void/VoidOfflineIndicator.tsx`
- `src/styles/void-offline.css`

---

## Error Handling

### Error Codes

```typescript
const ERROR_CODES = {
  NETWORK_OFFLINE: 'E001',
  API_ERROR: 'E003',
  AUTH_EXPIRED: 'E100',
  PERMISSION_DENIED: 'E102',
  DATA_NOT_FOUND: 'E200',
  STORAGE_FULL: 'E300',
  RENDER_ERROR: 'E401',
  UNKNOWN_ERROR: 'E999',
}
```

### Crash Screen

Enhanced error boundary with:
- Error code display
- Copy error details
- Recovery options
- Auto-reset for minor errors

**Files**:
- `src/components/void/VoidErrorBoundary.tsx` (enhanced)
- `src/styles/void-error-boundary.css` (enhanced)

---

## Accessibility

Features:
- Reduce Motion
- Reduce Transparency
- Increase Contrast
- Font Scaling (Small/Medium/Large/Extra Large)
- Color Blind Modes (Protanopia, Deuteranopia, Tritanopia)

**Files**:
- `src/lib/void/accessibility.ts`
- `src/hooks/useAccessibility.ts`

---

## Feature Modules

### 1. LIVEWIRE — Activity Feed
Real-time feed of job site activity

### 2. FACELINK — Video Calls
Embedded video calls with transcription

### 3. BLUEPRINT — Floor Planner
Draw floor plans with AI suggestions

### 4. SCOPE — AI Estimator
Chat-based estimate builder

### 5. DISPATCH — Crew Scheduling
Drag-drop crew scheduling

### 6. REPUTATION — Review Management
Multi-platform review management

### 7. CASHFLOW — Invoice Builder
Visual invoice builder

### 8. VAULT — Team Wiki
SOPs, training videos, pricing guides

### 9. FUNNEL — Lead Inbox
Unified lead source with AI scoring

### 10. MILESTONES — Project Timeline
Visual job timeline with profit tracking

**Files**:
- `src/lib/void/modules.ts`
- `src/components/void/modules/*.tsx`
- `src/styles/void-modules.css`

---

## Plugin System

Plugin lifecycle:
- `onInstall`
- `onEnable`
- `onDisable`
- `onUninstall`

Plugin contributions:
- Icons
- Windows
- Shortcuts

**Files**:
- `src/lib/void/plugins.ts`
- `src/components/void/VoidPluginManager.tsx`
- `src/styles/void-plugins.css`

---

## Security

### Authentication
- Email/Password
- Google OAuth
- Microsoft OAuth
- Apple Sign-In
- MFA (TOTP, SMS, Email)

### Session Management
- JWT tokens
- Refresh tokens
- Max sessions: 5
- Auto-logout after inactivity

### Audit Logging
- All CRUD operations logged
- User, timestamp, IP, changes
- 90-day retention

**Files**:
- `src/lib/void/auth.ts`
- `src/lib/void/session.ts`
- `src/lib/void/audit.ts`

---

## State Management

### Zustand Store

All OS state managed in `src/lib/void/store.ts`:

- Icons & Desktop
- Windows
- Theme
- Media
- Voice
- Buddy
- Lock Screen
- Notifications
- Spotlight
- Virtual Desktops
- File System

---

## Performance Budgets

### Load Times

| Metric | Target | Max |
|--------|--------|-----|
| First Paint | 1.0s | 1.5s |
| Interactive | 2.5s | 3.5s |
| Full Load | 3.0s | 4.0s |

### Runtime

| Metric | Target | Max |
|--------|--------|-----|
| Frame Rate | 120fps | 60fps |
| Input Latency | 50ms | 100ms |

### Bundle Sizes

| Chunk | Target | Max |
|-------|--------|-----|
| Initial JS | 150KB | 200KB |
| Route Chunk | 50KB | 100KB |

---

## Summary

This specification covers VOID as a complete operating system with:

1. ✅ Boot & Init — Complete boot sequence
2. ✅ File System — Virtual CRM file organization
3. ✅ Windows — Full window lifecycle, snap zones
4. ✅ Notifications — Toast, center, push
5. ✅ System Tray — Clock, status, toggles
6. ✅ Context Menus — Desktop, icon, window
7. ✅ Shortcuts — Global, navigation, CRM
8. ✅ Spotlight — Universal search
9. ✅ Control Center — Quick settings
10. ✅ Lock Screen — PIN/biometric
11. ✅ Dock/Taskbar — macOS/Windows style
12. ✅ Virtual Desktops — Multiple workspaces
13. ✅ Clipboard — History, pinned
14. ✅ Settings — Full architecture
15. ✅ Offline Mode — IndexedDB, sync
16. ✅ Error Handling — Recovery, crash screen
17. ✅ Accessibility — Full a11y support
18. ✅ Performance — Budgets, monitoring
19. ✅ Features — 10 core modules
20. ✅ Security — Auth, encryption, audit

**Status**: ⚠️ **PROTOTYPE** — See [HARSH_TRUTHS.md](./HARSH_TRUTHS.md) for honest assessment

## ⚠️ Known Issues & Missing Integrations

**CRITICAL**: This specification documents what *should* exist, not what *actually* works. See [HARSH_TRUTHS.md](./HARSH_TRUTHS.md) for reality check.

### Missing Integrations
- ❌ **Context Menus**: `VoidContextMenu` component exists but is NOT integrated into `VoidDesktop` or `VoidWindow`
- ⚠️ **File System**: Exists but only accessible via `openWindow('filesystem')` — no desktop integration
- ⚠️ **Settings**: Only accessible via `⌘,` shortcut — no visible access points
- ⚠️ **Plugin Manager**: Exists but has no entry point in UI
- ⚠️ **Modules**: All 10 modules exist but have no desktop icons or launcher

### Integration Status (v1.2.0)

As of December 2025, core components are integrated into `VOID.tsx`:

- ✅ **BackgroundSystem**: Integrated in Background Layer (z: 0-1)
- ✅ **WiremapBackground**: Conditionally rendered based on `wiremapEnabled`
- ✅ **Theme Initialization**: Automatic via `initTheme()` in `useLayoutEffect`
- ✅ **Layer Structure**: Follows OS specification layer stack
- ✅ **Error Boundaries**: All components wrapped for safety
- ✅ **CSS Imports**: All required stylesheets included

**However**, many features exist as components but are not properly integrated into the user experience. See [HARSH_TRUTHS.md](./HARSH_TRUTHS.md) for complete assessment.

The VOID component is **functional** but **not production-ready** without fixing context menu integration and adding proper access points for all features.
