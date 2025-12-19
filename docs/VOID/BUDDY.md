# VOID OS — Buddy AI Assistant

**Version**: 1.3.0  
**Last Updated**: December 2025  
**Status**: ✅ **PRODUCTION-READY**

---

## Overview

Buddy is VOID OS's intelligent AI assistant that provides contextual help, insights, and proactive suggestions. Buddy appears as a friendly, minimalist avatar positioned on the desktop and maintains an always-open panel displaying messages, priorities, suggested actions, insights, and more.

---

## Features

### Core Capabilities

- **Always-On Panel**: Buddy's panel is always visible below the icon, providing constant access to information
- **Contextual Awareness**: Buddy monitors user activity and provides relevant suggestions
- **Message System**: Displays all Buddy messages in a dedicated section
- **Priority Tracking**: Shows important items that need attention
- **Suggested Actions**: Quick action buttons for common tasks
- **Insights**: Displays performance metrics and trends
- **Soundscape**: Shows current ambient sound settings
- **Emotion States**: Buddy's avatar reflects different emotional states (neutral, happy, thinking, excited, error)

### Visual Design

- **Minimalist Avatar**: Professional, non-holographic design with simple eyes and mouth
- **Glass Morphism**: Modern glass-panel design with backdrop blur
- **Smooth Animations**: Subtle breathing animation when idle, blink animations, hover effects
- **Status Indicators**: Notification dot for new messages, processing indicator for active tasks

---

## Components

### VoidBuddy

**Location**: `src/components/void/VoidBuddy.tsx`

Main component that orchestrates Buddy's positioning and renders both the icon and panel.

**Props**:
- `userName: string` - User's name for personalized greetings

**Positioning**:
- Supports preset positions: `'top-left'`, `'top-right'`, `'top-center'`, `'bottom-left'`, `'bottom-right'`
- Supports custom pixel positions via `{ x: number, y: number }`
- Default position: `'top-center'` (centered horizontally, 80px from top)
- Panel is always visible below the icon

**Key Features**:
- Uses `useBuddyContext()` hook to initialize context checking
- Calculates position based on `buddyState.position` from store
- Always renders both icon and panel (no collapse/expand)

### VoidBuddyIcon

**Location**: `src/components/void/VoidBuddyIcon.tsx`

Renders the visual avatar representation of Buddy.

**Features**:
- **Blink Animation**: Random blinks every 3-5 seconds
- **Breathing Animation**: Subtle scale animation when idle
- **Hover Effects**: Scale up on hover, accent border animation
- **Emotion States**: Visual changes based on `buddyState.emotion`
  - `neutral`: Default state
  - `happy`: Wider mouth
  - `thinking`: Eyes change to accent color, mouth hidden
  - `excited`: Enhanced animations
  - `error`: Red mouth color
- **Processing Indicator**: Three animated dots when `emotion === 'thinking'`
- **New Message Indicator**: Pulsing dot when new messages arrive

**Visual Elements**:
- Glass container with backdrop blur
- Animated accent gradient border
- Subtle tech grid pattern overlay
- Two dot eyes (blink animation)
- Minimal mouth line (changes with emotion)

### VoidBuddyPanel

**Location**: `src/components/void/VoidBuddyPanel.tsx`

Renders the always-open panel displaying Buddy's information.

**Props**:
- `userName: string` - User's name for personalized greetings
- `onClose?: () => void` - Optional close handler (currently unused as panel is always open)

**Sections**:

1. **Messages** (💬 MESSAGES)
   - Displays all `buddyMessages` from store
   - Scrollable list with max height
   - Falls back to greeting message if no messages exist
   - Shows streak count

2. **Priorities** (📋 PRIORITIES)
   - Lists important items needing attention
   - Currently shows mock data (e.g., "Sarah Miller (no response 48h)", "Johnson quote (due 3pm)")

3. **Suggested Actions** (⚡ SUGGESTED ACTIONS)
   - Quick action buttons: "Draft Email", "Schedule", "Snooze"
   - Currently placeholder buttons

4. **Insights** (🏆 INSIGHTS)
   - Performance metrics and trends
   - Currently shows mock data (e.g., "$18k this week (+15% WoW)", "Avg call: 7min (efficiency +25%)")

5. **Soundscape** (🎵 SOUNDSCAPE)
   - Current ambient sound setting
   - Currently shows "Rain + Lo-fi"

**Styling**:
- Glass morphism design
- 360px width × 480px height
- Smooth spring animations on mount
- Scrollable content area

---

## State Management

### Store Integration

Buddy state is managed in the Zustand store (`src/lib/void/store.ts`):

```typescript
buddyState: {
  collapsed: boolean        // Currently unused (panel always open)
  position: 'top-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | { x: number, y: number }
  docked: boolean           // Whether Buddy is docked to a specific location
  lastMessageTime: number   // Timestamp of last message read
  emotion: BuddyEmotion     // Current emotional state
}

buddyMessages: BuddyMessage[]  // Array of all Buddy messages
```

### Available Actions

```typescript
setBuddyCollapsed(collapsed: boolean): void
setBuddyPosition(position: BuddyState['position']): void
setBuddyDocked(docked: boolean): void
setBuddyEmotion(emotion: BuddyEmotion): void
addBuddyMessage(message: BuddyMessage): void
updateBuddyLastMessageTime(time: number): void
```

### Types

```typescript
type BuddyEmotion = 'neutral' | 'happy' | 'thinking' | 'excited' | 'error'

interface BuddyMessage {
  id: string
  message: string
  timestamp: number
  type?: 'info' | 'warning' | 'success' | 'error'
}
```

---

## Hooks

### useBuddyContext

**Location**: `src/hooks/useBuddyContext.ts`

Monitors user activity and context to provide relevant Buddy suggestions.

**Functionality**:
- Checks current window/application context
- Monitors user interactions
- Triggers contextual messages based on activity
- Updates Buddy's emotional state based on context

---

## Positioning

### Preset Positions

Buddy supports five preset positions:

1. **`'top-center'`** (Default)
   - Centered horizontally
   - 80px from top
   - Transform: `translateX(-50%)`

2. **`'top-left'`**
   - 80px from top
   - 20px from left

3. **`'top-right'`**
   - 80px from top
   - 20px from right

4. **`'bottom-left'`**
   - 60px from bottom
   - 20px from left

5. **`'bottom-right'`**
   - 60px from bottom
   - 20px from right

### Custom Positions

Buddy can also be positioned at custom pixel coordinates:

```typescript
setBuddyPosition({ x: 500, y: 300 })
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ Space` | Toggle Buddy (future feature) |

---

## Integration

### In VOID.tsx

Buddy is integrated in the main VOID component:

```tsx
<VoidErrorBoundary>
  <VoidBuddy userName={user.fullName || 'there'} />
</VoidErrorBoundary>
```

**Layer**: Above desktop, below windows (z-index: 50)

### Error Handling

Buddy is wrapped in `VoidErrorBoundary` to prevent crashes from affecting the entire OS.

---

## Customization

### Changing Position

```typescript
import { useVoidStore } from '@/lib/void/store'

const { setBuddyPosition } = useVoidStore()

// Set to top-right
setBuddyPosition('top-right')

// Set to custom position
setBuddyPosition({ x: 400, y: 200 })
```

### Adding Messages

```typescript
import { useVoidStore } from '@/lib/void/store'

const { addBuddyMessage } = useVoidStore()

addBuddyMessage({
  id: `msg-${Date.now()}`,
  message: 'Welcome to VOID OS!',
  timestamp: Date.now(),
  type: 'info'
})
```

### Changing Emotion

```typescript
import { useVoidStore } from '@/lib/void/store'

const { setBuddyEmotion } = useVoidStore()

// Set to thinking state
setBuddyEmotion('thinking')

// Set back to neutral
setBuddyEmotion('neutral')
```

---

## Future Enhancements

### Planned Features

- [ ] Interactive message system (click to respond)
- [ ] Voice interaction with Buddy
- [ ] Customizable panel sections
- [ ] Integration with CRM data for real priorities
- [ ] Machine learning for personalized insights
- [ ] Action button functionality
- [ ] Soundscape controls
- [ ] Collapse/expand functionality (optional)
- [ ] Multiple Buddy instances (experimental)

### Known Limitations

- Priority list uses mock data
- Suggested actions are placeholder buttons
- Insights use mock data
- Soundscape is static
- No message interaction (read-only)
- No voice input/output

---

## Design Philosophy

Buddy is designed to be:

1. **Non-Intrusive**: Always visible but not distracting
2. **Contextual**: Provides relevant information based on user activity
3. **Professional**: Minimalist design that fits the VOID OS aesthetic
4. **Helpful**: Proactive suggestions without being annoying
5. **Accessible**: Clear visual indicators and proper ARIA labels

---

## Accessibility

- **ARIA Labels**: Icon has `aria-label="Buddy AI Assistant"`
- **Keyboard Navigation**: Future support for keyboard shortcuts
- **Screen Reader Support**: Messages and sections are properly structured
- **Color Contrast**: All text meets WCAG AA standards
- **Focus Indicators**: Hover and focus states clearly visible

---

## Performance

- **Optimized Animations**: Uses `willChange` for smooth animations
- **Lazy Rendering**: Panel content only renders when visible
- **Efficient State Updates**: Zustand store ensures minimal re-renders
- **Frame Budget**: All animations target 60fps

---

## Related Documentation

- [OS_SPECIFICATION.md](./OS_SPECIFICATION.md) - Complete VOID OS specification
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system including Buddy avatar specs
- [API_REFERENCE.md](./API_REFERENCE.md) - Store API including Buddy actions
- [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md) - Technical details

---

**Last Updated**: December 2025 (v1.3.0)
