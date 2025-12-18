# CRM Void (Current Behavior)

This page describes how CRM Void actually behaves in the product today. No lore, just what ships.

---

## What you see

- Full-screen fixed canvas with a starfield background (light: black stars on white; dark: colored stars on near-black). Nebulae and shooting stars render in dark mode only.
- Center header text “CRM Void System” near the top; a clock in the top-right; the CRM bento grid pinned top-left.
- Seven main menu circles orbiting around center, evenly spaced on a radius of ~350px. Each opens a ring of sub-menus when active.
- Body scroll is locked while CRM Void is open to keep the experience focused.

---

## Main menus (7)

- **Jobs**: Browse Jobs, Post Job, My Jobs, Bid Management, Job Analytics, Route Builder, Job Calendar, Find Opportunities.
- **Teams**: Crew Dispatcher, Team Calendar, Collaboration Hub, Task Assignment, Team Analytics, Communication, Skill Trading, Team Settings.
- **Customer Intake**: Import Customer Data, Add Customer, Customer List, CRM Pipeline, Customer Analytics, Follow-up Sequences, Lead Management, Relationship Tracking.
- **AI**: AI Scoping, Bid Intelligence, Smart Replies, AI Insights, Voice Assistant, Auto Categorization, Predictive Analytics, AI Receptionist.
- **Office**: Document Manager, Invoice Manager, Expense Tracking, Calendar Sync, Client Portal, Compliance Tracker, Quality Assurance, Tax Helper.
- **Pro Tools**: Advanced Analytics, Custom Branding, Priority Support, Export Everything, Advanced Workflows, Pro Support Chat, Priority Job Alerts, Advanced CRM.
- **Leads**: Quick Capture, Manual Entry, View Captured Leads, Sync to CRM, Lead Templates, Lead Analytics, Export Leads, Lead Settings.

All sub-menus close automatically after navigation.

---

## Interaction model

- **Toggle**: Clicking a main menu opens its sub-menus; clicking again closes it. ESC also closes the active menu. Clicking anywhere outside menus closes them after a brief guard delay.
- **Sub-menu actions**: Selecting a sub-menu triggers navigation via `onNavigate` and immediately closes the menu set.
- **Voice intake**: `Import Customer Data` opens the Voice Intake modal with the CentralVoiceHub; it closes on backdrop click or the close button.
- **Lead capture panel**: When the Leads menu is active, the LeadCaptureMenu overlays centered in the viewport (scrollable if tall).

---

## Drag & pin behavior

- **All elements are draggable**: Main menu circles, Voice Intake Hub, Music Player, Clock, and Bento Grid
- **Collision detection**: Menus automatically push apart when overlapping to prevent stacking
- **Boundary constraints**: All draggable elements are constrained to viewport bounds to prevent items flying off screen
- **Position persistence**: All positions persist in localStorage:
  - `crm-void-menu-positions`: `{ [menuId]: { x: number; y: number } }`
  - `crm-void-voice-intake-position`: `{ x: number; y: number }`
  - `crm-void-music-player-position`: `{ x: number; y: number }`
  - `crm-void-clock-position`: `{ x: number; y: number }`
  - `crm-void-bento-grid-position`: `{ x: number; y: number }`
- Pins are stored in `crm-void-pinned-menus` and add a subtle ring. Pins persist across reloads and survive drags.
- **Default layout**: Linear horizontal layout with 160px spacing, positioned above center to avoid overlap
- **Menu stacking prevention**: Automatic collision resolution ensures menus never stack on top of each other

---

## Visuals & styling

- **Modern menu design**: Larger menu buttons (24x24, up from 20x20) with rounded-2xl corners and gradient backgrounds when active
- Menu and submenu buttons use borderless glass styling with soft shadows (`bg-white/90` light, `bg-black/90` dark) and hover shadows instead of borders.
- **Enhanced animations**: Modern hover effects with scale and subtle rotation, active state pulsing icons and labels
- Sub-menu clusters are pulled tighter (translate distance ~180px) for compact orbit rings.
- Active main menus show a soft expanding pulse behind the circle; sub-menus animate in with a short spring and exit quickly.
- **Music Player**: Modern, larger design (320-400px width) with gradient play button, improved controls, and full drag-and-drop support
- **Improved shadows**: Deeper shadows for better depth perception

---

## Background system (canvas)

- Stars: count scales with viewport area (~width × height / 1200); sizes 0.8–3px; twinkle via per-star sine offsets; slight parallax from a z-based projection.
- Colors: dark mode uses a small palette of soft whites/warm/cool tints; light mode draws black stars on white.
- Nebulae: multiple colored blobs (purple, blue, pink, teal) drawn only in dark mode; radial gradients with mild opacity and elliptical stretch.
- Shooting stars: up to 5 instances; rare random activation in dark mode; short white streaks that fade and reset.
- Resizes: canvas resizes with the window and re-seeds stars/nebulae/shooting stars; animation runs via `requestAnimationFrame` with cleanup on unmount.

---

## Motion & performance

- Framer Motion drives all menu animations and drag. Drag uses `dragMomentum={false}` and `dragElastic={0.1}` for control.
- GPU-friendly transforms (`translate3d`/`translateZ(0)`) are applied on menu and submenu elements; shadows instead of borders keep the UI lightweight.
- Body overflow is disabled while active to prevent background scroll jank.

---

## Persistence keys

- `crm-void-menu-positions`: `{ [menuId]: { x: number; y: number } }` - Main menu positions
- `crm-void-pinned-menus`: `MainMenuId[]` - Pinned menu IDs
- `crm-void-voice-intake-position`: `{ x: number; y: number } | null` - Voice hub position
- `crm-void-music-player-position`: `{ x: number; y: number } | null` - Music player position
- `crm-void-clock-position`: `{ x: number; y: number } | null` - Clock position
- `crm-void-bento-grid-position`: `{ x: number; y: number } | null` - Bento grid position

---

## Not in this build

- No planetary/solar-system UI layers beyond the seven draggable menu circles.
- No auto-playing cinematic entrance; menus render immediately with standard fades/springs.

At the center: **a pulsing ring of light**. Your voice hub. Your command center.

Floating around you in a perfect orbital dance: **nine sections**, each a gateway to your business tools.

### The Void Aesthetic

```
┌─────────────────────────────────────────────────────────────┐
│                    ✦  ·  ✧    ·    ✦                        │
│         ·    ✧         ·        ·      ✦    ·               │
│    ✦        ·    [Business Tools]    ·        ✧             │
│         [Kanban]    ·    ·    ·    [Pro Tools🔒]            │
│    ·         ·    ╭─────────────╮    ·         ·            │
│  [Customers]      │   🎤 ADD    │      [AI Insights]        │
│    ✧         ·    │  CUSTOMER   │    ·         ✦            │
│         [Reports] ·  ╰─────────────╯  · [Customize]         │
│    ·        ✦    [Settings]    [Documents]    ·             │
│         ·    ✧         ·        ·      ✦    ·               │
│                    ✦  ·  ✧    ·    ✦                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎤 Central Voice Hub

The heart of CRM Void is **voice-first customer intake**.

### How It Works

1. **Click the central hub** or say "Add Customer"
2. The ring **pulses blue** as it listens
3. Speak naturally: *"John Smith, 555-123-4567, needs bathroom remodel, budget around 15K"*
4. **Whisper AI** transcribes in real-time
5. Customer created. Email/SMS toggles auto-enabled.

### Voice States

| State | Visual | Sound |
|-------|--------|-------|
| **Idle** | Soft purple glow | Silent |
| **Listening** | Pulsing blue rings | Soft hum |
| **Processing** | Spinning animation | Processing tone |
| **Success** | Green flash + checkmark | Confirmation chime |

### Fallback: Text Mode

Don't want to speak? Click the **keyboard icon** to type instead. Same result, different input.

---

## 🪐 Orbiting Sections

Nine tools orbit the central hub, each accessible with a single click.

### The Orbital Layout

| Section | Angle | What It Does |
|---------|-------|--------------|
| 📊 **Business Tools** | 0° (Top) | Revenue metrics, cash flow, business health |
| 📋 **Kanban** | 40° | Drag-and-drop project pipeline |
| ⚡ **Pro Tools** | 80° | Advanced features (🔒 Pro subscription required) |
| 👥 **Customers** | 120° | Full customer list with search & filters |
| 🧠 **AI Insights** | 160° | AI-powered business recommendations |
| 📈 **Reports** | 200° | Analytics, charts, export options |
| 🎨 **Customize** | 240° | Rearrange your orbital layout |
| ⚙️ **Settings** | 280° | Notifications, integrations, preferences |
| 📄 **Documents** | 320° | Contracts, invoices, estimates |

### The Lock System

**Pro Tools** shows a subtle lock icon for non-Pro users. Click it and you'll see:

> *"Pro Tools require an active Pro subscription. Upgrade to unlock advanced CRM features, priority support, and more."*
>
> **[Upgrade to Pro - $59/mo]**

---

## ✨ Visual Details

### Background System (Updated December 2025)

**VoidBackground Component**:
- **Starfield**: 
  - Light mode: Black stars (`rgba(0, 0, 0, 0.8)`) on white background
  - Dark mode: White stars (`rgba(255, 255, 255, 0.8)`) on black background
  - Dynamic count: 200-300 stars based on viewport size
  - Parallax: Stars move subtly with cursor movement
  - Twinkling: Random opacity changes for depth
- **Nebula**: 
  - Purple-blue gradient (`rgba(138, 43, 226, 0.3)` to `rgba(30, 144, 255, 0.2)`)
  - Center-positioned with radial gradient
  - Animated opacity pulsing (0.2 to 0.4)
  - Size: 800px × 600px elliptical
- **Shooting Stars**:
  - Probability: 0.001 per frame
  - Trail length: 50-100px
  - Speed: 5-10px per frame
  - White color with gradient fade
  - Duration: 20-40 frames
- **Canvas Optimization**: 
  - `requestAnimationFrame` for 60fps
  - Proper cleanup on unmount
  - Resize handling
  - Theme-aware color switching

### Decorative Planets (New - December 2025)

**6 Orbital Planets**:
- **Implementation**: `useState` for angles, `useEffect` with `requestAnimationFrame`
- **Animation**: Continuous 360° rotation at 0.02° per frame
- **Properties**:
  - Size: 40-80px diameter (varied)
  - Colors: RGBA with alpha (0.3-0.6) for translucency
  - Colors: Purple, Blue, Cyan, Pink, Orange, Green
  - Position: Orbital radius 400-500px from center
  - Z-index: 5 (behind sections, above background)
  - Blur: `blur-sm` for soft appearance
- **Performance**: Optimized with `useRef` to prevent memory leaks
- **Visual Effect**: Creates depth and cosmic atmosphere

### Startup Animation (Updated December 2025)

**CRMVoidSolarSystem**:
- **Double-Play Prevention**: `hasPlayedRef` prevents React StrictMode double execution
- **Duration**: Extended from 4 seconds to 7 seconds
- **Implementation**:
  ```typescript
  const hasPlayedRef = useRef(false)
  useEffect(() => {
    if (hasPlayedRef.current) return
    hasPlayedRef.current = true
    const timer = setTimeout(() => setShowWelcome(false), 7000)
    return () => clearTimeout(timer)
  }, [])
  ```

### Section Panels Styling (Updated December 2025)

**Unified Glass-Card Design**:
- **Main Panel**: `glass-card border-0`, `bg-white/95 dark:bg-black/95 backdrop-blur-lg`, `shadow-xl hover:shadow-2xl`
- **Tool Buttons**: `glass-card hover:shadow-xl`, `bg-white/90 dark:bg-black/90 backdrop-blur-sm`, `hover:scale-[1.02]`
- **Customer Tabs**: Inactive tabs use glass-card, active tabs have `shadow-md`
- **Settings Cards**: `glass-card border-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm`
- **Consistency**: Matches UnifiedPostJob menu styling exactly

### Customize Mode Exit (Updated December 2025)

**Multiple Exit Methods**:
1. ESC key handler (keyboard shortcut)
2. "Exit Customize Mode" button in header
3. Click outside customize area
4. Close button (X) in top-right

**Implementation**: `useEffect` with `window.addEventListener('keydown')` for ESC key

### Starfield Animation

The background isn't static. It's a living canvas:

- **200+ stars** generated with varying sizes (0.5px - 2.5px)
- **Parallax movement** - stars drift as you move your cursor
- **Random twinkle** - stars fade in and out organically
- **Nebula glow** - a soft radial gradient adds depth

### Connection Lines

When you hover an orbital section, a **faint line connects** it to the center hub—showing the relationship between you and your tools.

### Micro-Interactions

| Action | Animation |
|--------|-----------|
| Hover section | Scale up 1.1x, glow intensifies |
| Click section | Panel slides in from that direction |
| Drag section | Ghost trail, snap-to-angle |
| Close panel | Fade + scale down |

---

## 🧭 Interaction Updates (Dec 2025)

- **Free-drag orbit menus**: Grab any main circle and move it anywhere. Positions persist automatically via `crm-void-menu-positions` in local storage, so your layout survives refreshes.
- **Pin states that stick**: Toggle the pin on any menu; pinned status is stored in `crm-void-pinned-menus` and shows a subtle ring. Pins survive drags and reloads.
- **Sub-menu flow fixes**: All sub-menus now close after navigation; the Lead Capture microphone no longer blocks the rest of the submenu. The `Import Customer Data` submenu opens the Voice Intake modal without dropping clicks.
- **Borderless glass UI**: Main and sub-menu buttons use seamless glass cards (no black borders), with integrated labels—no more floating title chips. Hover shadows give depth instead of outlines.
- **Escape & click-away safety**: ESC closes active menus; clicking outside any menu/sub-menu collapses it. Body scroll is locked while CRM Void is active to keep focus in the experience.
- **GPU-accelerated motion**: Animations run with translate3d layers and reduced-motion fallbacks to maintain 60fps on low-power devices.

---

## 🔧 Customization Mode

Click **"Customize"** and the void transforms:

1. **Drag any section** to a new orbital position
2. Watch the **connection lines** update in real-time
3. Click **"Save Layout"** to persist your arrangement
4. Your layout syncs across devices via `useKV`

### Layout Persistence

```typescript
// Your custom layout is stored like this:
{
  "business-tools": { angle: 0, radius: 200 },
  "kanban": { angle: 45, radius: 180 },
  "customers": { angle: 135, radius: 220 },
  // ... etc
}
```

---

## 📊 Stats Footer

At the bottom of the void, real-time stats float like a distant space station:

```
👥 47 Customers  •  📁 12 Active Projects  •  💰 $156,420 Pipeline
```

Always visible. Always updating.

---

## 🖥️ Fullscreen Mode

Click the **expand icon** in the top-right corner to enter **true fullscreen mode**.

The void expands. The stars grow. Your CRM becomes an immersive experience.

Perfect for:

- Client presentations
- Focus work sessions
- Showing off to other contractors

---

## 🛠️ Technical Architecture

### Components

```
src/components/contractor/CRMVoid/
├── index.ts              # Barrel export
├── CRMVoid.tsx           # Main orchestrator (380 lines)
├── VoidBackground.tsx    # Canvas starfield (150 lines)
├── CentralVoiceHub.tsx   # Voice intake hub (290 lines)
├── OrbitingSection.tsx   # Floating buttons (120 lines)
└── SectionPanels.tsx     # Full-screen panels (450 lines)
```

### Dependencies Used

| Package | Purpose |
|---------|---------|
| **Framer Motion** | All animations, gestures, and transitions |
| **Canvas API** | Starfield rendering (no Three.js needed) |
| **MediaRecorder API** | Voice capture for Whisper |
| **useKV** | Layout persistence |

### Performance

- **60 FPS** starfield animation via `requestAnimationFrame`
- **Lazy-loaded panels** - sections don't render until opened
- **GPU-accelerated** transforms via `will-change: transform`
- **~85KB gzipped** total bundle addition

---

## 🪐 PLANETARY SYSTEM (New!)

### The Solar System Vision

CRM Void has evolved into a **full solar system**. You are no longer just at the center—you ARE the sun. Your business tools are now **living planets** that orbit around you, each with unique characteristics, colors, and purposes.

### The Planets

| Planet | Name | Purpose | Color | Special Feature |
|--------|------|---------|-------|-----------------|
| ☀️ **Sun** | Command Center | Voice hub & control | Orange/Gold | Pulsing glow, central hub |
| ⚡ **Mercury** | Quick Actions | Fast tasks & shortcuts | Gray/Silver | Fastest orbit (8 seconds) |
| 💛 **Venus** | Relationships | Customers & leads | Gold/Yellow | Customer connections |
| 🌍 **Earth** | Home Base | Dashboard overview | Blue | Has a moon! |
| 🔴 **Mars** | Projects | Active work & jobs | Red | Project battleground |
| 💰 **Jupiter** | Finance | Money & invoices | Tan/Brown | Largest planet |
| 📊 **Saturn** | Analytics | Reports & insights | Beige | Has rings! |
| 🔗 **Uranus** | Integrations | Apps & connections | Cyan | Pro feature 🔒 |
| 🌊 **Neptune** | Archive | History & storage | Deep Blue | Distant orbit |

### Orbital Mechanics

Each planet orbits the sun at its own speed:

```
Mercury: 8 seconds per orbit   (closest, fastest)
Venus:   12 seconds
Earth:   20 seconds
Mars:    28 seconds
Jupiter: 45 seconds
Saturn:  60 seconds
Uranus:  80 seconds
Neptune: 100 seconds per orbit (furthest, slowest)
```

### Planetary Connections

When you click a planet, **connection lines** appear showing relationships:

- **Sun** → Connects to ALL planets (you're the center)
- **Venus (Customers)** → Earth, Mars (dashboard, projects)
- **Mars (Projects)** → Jupiter, Venus (finance, customers)
- **Jupiter (Finance)** → Saturn, Mars (analytics, projects)
- **Saturn (Analytics)** → Jupiter, Earth (finance, dashboard)

### Control Panel

At the bottom of the screen, you have orbital controls:

| Control | Function |
|---------|----------|
| ⏪ | Slow down orbital speed |
| ⏸️/▶️ | Pause/Resume orbits |
| ⏩ | Speed up orbital speed |
| 👁️ | Toggle orbit paths visibility |
| 🪐 | Jump to Command Center |

Speed multiplier ranges from **0.25x to 8x**.

### Visual Enhancements

The cosmic background now includes:

- **Multiple nebulae** - Purple, blue, pink, and cyan gas clouds
- **Shooting stars** - Random meteor streaks across the sky
- **Star colors** - Stars now have subtle color variations (white, warm, cool)
- **Parallax depth** - Stars move at different speeds for 3D effect
- **Planet glow** - Active planets emit a radiant glow

### Planetary Panels

Each planet opens a unique panel with relevant tools:

**Mercury (Quick Actions)**
- Add Customer
- New Invoice
- Create Estimate
- Schedule Job
- Send Message
- Log Time

**Venus (Relationships)**
- Recent contacts list
- Customer status indicators
- Pipeline values
- Quick access to customer details

**Earth (Home Base)**
- Active projects count
- Pipeline value
- Monthly revenue
- Pending tasks
- Trend indicators

**Mars (Projects)**
- Active project cards
- Project stages (Planning → In Progress → Completed)
- Client associations
- Kanban board access

**Jupiter (Finance)**
- Revenue received
- Pending payments
- Overdue amounts
- Invoice/Estimate quick links

**Saturn (Analytics)**
- Revenue trend chart
- Visual data representation
- Report generation

**Uranus (Integrations)** 🔒
- QuickBooks connection
- Google Calendar sync
- Stripe setup
- Zapier automations
- *Requires Pro subscription*

**Neptune (Archive)**
- Archived projects count
- Past customers database
- Historical data access

---

## 🛠️ Technical Architecture (Updated)

### Components

```
src/components/contractor/CRMVoid/
├── index.ts                  # Barrel exports
├── CRMVoid.tsx              # Original orbital view
├── CRMVoidSolarSystem.tsx   # NEW: Full planetary system
├── VoidBackground.tsx       # Enhanced with nebulae & shooting stars
├── VoidPlanet.tsx           # NEW: Individual planet component
├── PlanetarySystem.tsx      # NEW: Orbital animation manager
├── PlanetPanels.tsx         # NEW: Planet-specific panels
├── CentralVoiceHub.tsx      # Voice intake hub
├── OrbitingSection.tsx      # Original floating buttons
└── SectionPanels.tsx        # Original section panels
```

### New Dependencies

| Package | Purpose |
|---------|---------|
| **Framer Motion** | Planet animations & orbital motion |
| **Canvas API** | Nebulae, shooting stars, enhanced starfield |
| **requestAnimationFrame** | Smooth 60fps orbital animation |

---

## 🎯 Why This Matters

Traditional CRMs are **boring**. They're spreadsheets with extra steps. They feel like work.

**CRM Void** feels like the future.

When a contractor opens their CRM and sees the void—stars drifting, planets orbiting, their business floating in space—they don't feel like they're doing paperwork.

They feel like they're commanding a starship.

And that **emotional shift** is everything. It's the difference between dreading your CRM and actually wanting to open it.

---

## 🚀 What's Next

Potential enhancements for future versions:

- **Voice commands anywhere**: "Show me last month's revenue"
- **Customer constellations**: Visualize customer relationships as star clusters
- **Achievement system**: Unlock new nebula colors as you grow
- **Sound design**: Ambient space audio, hover sounds
- **VR mode**: Full WebXR support for headsets
- **Asteroid belt**: Completed tasks floating as debris
- **Comet mode**: Urgent tasks streak across the system
- **Planet customization**: Choose your own planet colors

---

## 📸 Screenshots

*Coming soon after first user sessions*

---

## 🌟 Credits

Designed and built for **FairTradeWorker** - December 2025

*"The void doesn't judge. It just holds your data in infinite space."*

---

```
                    ✦
         ✧              ·    ✦
    ·         ☀️              ·
        ·    ⚡ ·    ·    ✧
   💛         🌍    ·         ✦
        ·    ·    🔴    ·
    ✧    ·    💰    ·    ·
         ·    ·    📊    ✧
    ·         🔗    ·         ·
        ✦    ·    🌊    ·
              ✧         ✦
