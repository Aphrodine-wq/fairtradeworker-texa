# Full Infrastructure Architecture

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: 🏗️ **COMPREHENSIVE SYSTEM WIREFRAME**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [AI Architecture](#ai-architecture)
3. [VOID OS Architecture](#void-os-architecture)
4. [FTW System Architecture](#ftw-system-architecture)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Storage Architecture](#storage-architecture)
7. [State Management](#state-management)
8. [API Integration Layer](#api-integration-layer)
9. [Component Relationships](#component-relationships)
10. [AI Provider Routing](#ai-provider-routing)
11. [Budget Management System](#budget-management-system)
12. [RAG & Embeddings Pipeline](#rag--embeddings-pipeline)
13. [Buddy Learning System](#buddy-learning-system)
14. [Integration Points](#integration-points)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   VOID OS    │  │  FTW Web App  │  │   Mobile App (iOS)   │  │
│  │  (Desktop)   │  │  (Dashboard)  │  │   (React Native)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                      │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  VOID Zustand    │              │  FTW Zustand     │        │
│  │  Store           │              │  Store           │        │
│  └──────────────────┘              └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  VOID Hooks  │  │  FTW Hooks   │  │   AI Services       │  │
│  │  & Utils     │  │  & Utils     │  │   (Routing/Scoping) │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  useLocalKV  │  │  IndexedDB   │  │   Vector DB         │  │
│  │  (localStorage│  │  (Buddy/Media│  │   (RAG Context)     │  │
│  │   + Spark KV)│  │   Learning)  │  │   (Pinecone/Qdrant) │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  AI Providers│  │  Twilio      │  │   Stripe/Payments   │  │
│  │  (Claude/    │  │  (Voice/SMS) │  │   (Subscriptions)   │  │
│  │   Groq/      │  │              │  │                      │  │
│  │   Together)  │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Architecture

### AI Provider Routing System

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI REQUEST ENTRY POINT                        │
│                      (Job Scoping, CRM, etc.)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLASSIFICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  classifyJob(description)                               │   │
│  │  ├─> Rule-based classification (fallback)              │   │
│  │  ├─> Open-source LLM routing (Groq/Together/Fireworks)  │   │
│  │  └─> Returns: intent, complexity, trades, requiresSonnet│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   SIMPLE JOB PATH     │   │   COMPLEX JOB PATH     │
    │   (Haiku - $0.00025)  │   │   (Sonnet - $0.003)    │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAG CONTEXT RETRIEVAL                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  getJobContext(description)                             │   │
│  │  ├─> embedText(description) → Vector embedding         │   │
│  │  ├─> queryVector(indexJobScopes) → Similar jobs         │   │
│  │  ├─> queryVector(indexMaterials) → Material pricing     │   │
│  │  └─> queryVector(indexContractors) → Suggested contractors│ │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUDGET CONTROLLER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  smartCallWithBudget(isSimple, callFn)                   │   │
│  │  ├─> canCallHaiku() → Check budget (67% allocation)     │   │
│  │  ├─> canCallSonnet() → Check budget (33% allocation)    │   │
│  │  ├─> recordHaikuCall() → Track cost ($0.00025)          │   │
│  │  └─> recordSonnetCall() → Track cost ($0.003)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   CLAUDE HAIKU        │   │   CLAUDE SONNET        │
    │   (Simple Jobs)       │   │   (Complex Jobs)       │
    │                       │   │                       │
    │   Provider:           │   │   Provider:           │
    │   Anthropic API       │   │   Anthropic API       │
    │   Model:              │   │   Model:              │
    │   claude-3-haiku      │   │   claude-3-5-sonnet   │
    │                       │   │                       │
    │   Fallback:           │   │   Fallback:           │
    │   Spark LLM           │   │   Spark LLM           │
    │   (gpt-4o-mini)       │   │   (gpt-4o)            │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE PARSING                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  parseHaikuResponse() / parseSonnetResponse()             │   │
│  │  ├─> Extract scope, price range, materials, time        │   │
│  │  ├─> Cache result (LRU eviction, 200 max entries)       │   │
│  │  └─> Return ScopeResult                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### AI Provider Configuration

```typescript
// src/lib/ai/providers.ts

ProviderConfig {
  routing: {
    provider: 'groq' | 'together' | 'fireworks'
    model: 'mixtral-8x7b-32768' (default)
    baseUrl: process.env.FTW_ROUTING_URL
    apiKey: process.env.FTW_ROUTING_KEY
  }
  
  embeddings: {
    provider: 'together' | 'fireworks'
    model: 'togethercomputer/m2-bert-80M-8k-retrieval'
    baseUrl: process.env.FTW_EMBED_URL
    apiKey: process.env.FTW_EMBED_KEY
  }
  
  background: {
    provider: 'together' | 'fireworks'
    model: 'accounts/fireworks/models/mistral-7b-instruct-v0p2'
    baseUrl: process.env.FTW_BG_URL
    apiKey: process.env.FTW_BG_KEY
  }
  
  scoping: {
    provider: 'anthropic'
    model: 'claude-3-5-sonnet-20241022'
    apiKey: process.env.CLAUDE_API_KEY
    maxTokens: 500
  }
  
  vector: {
    provider: 'pinecone' | 'qdrant' | 'weaviate' | 'chroma'
    apiKey: process.env.FTW_VECTOR_KEY
    baseUrl: process.env.FTW_VECTOR_URL
    indexJobScopes: 'ftw-job-scopes'
    indexMaterials: 'ftw-materials'
    indexContractors: 'ftw-contractors'
  }
}
```

### AI Feature Flags

```typescript
ProviderSwitches {
  enableRouting: boolean      // Job classification
  enableEmbeddings: boolean   // Vector embeddings
  enableRag: boolean          // RAG context retrieval
  enableBackground: boolean   // Background LLM (CRM/follow-ups)
  enableMatching: boolean     // Contractor matching
}
```

---

## VOID OS Architecture

### Component Hierarchy

```
VOID.tsx (Root Component)
│
├── VoidBootScreen (Initial boot animation)
│
├── VoidLockScreen (PIN/authentication)
│
├── VoidDesktop (Main desktop environment)
│   ├── VoidIcon (Desktop icons)
│   ├── VoidContextMenu (Right-click menus)
│   └── BackgroundSystem (Custom backgrounds)
│
├── VoidWindowManager (Window management)
│   └── VoidWindow (Individual windows)
│       ├── VoidWindowTitleBar
│       ├── VoidWindowContent
│       └── VoidContextMenu (Window menus)
│
├── VoidBuddy (AI Assistant)
│   ├── VoidBuddyIcon (Avatar)
│   └── VoidBuddyPanel (Message panel)
│       ├── Messages Section
│       ├── Stats Section
│       ├── Mini Games Section
│       └── Suggested Actions
│
├── VoidToolbar (Top toolbar)
│   ├── Logo
│   ├── Settings Button
│   └── Module Launcher
│
├── VoidTaskbar (Bottom taskbar)
│   └── Window Thumbnails
│
├── VoidSystemTray (System tray icons)
│   ├── Theme Toggle
│   ├── Settings
│   ├── Plugins
│   └── Notification Center
│
├── VoidSpotlight (Command palette)
│
├── VoidMissionControl (Window overview)
│
├── VoidClipboardManager (Clipboard history)
│
├── VoidNotificationCenter (Notifications)
│
├── VoidControlCenter (System controls)
│
├── VoidVoiceCapture (Voice input)
│
├── WiremapBackground (WebGL background)
│
└── VoidErrorBoundary (Error handling)
```

### VOID State Management (Zustand)

```typescript
// src/lib/void/store.ts

VoidStore {
  // Desktop State
  icons: IconData[]
  iconPositions: Record<string, GridPosition>
  pinnedIcons: Set<string>
  windows: WindowData[]
  activeWindowId: string | null
  desktopBackground: string | null
  wiremapEnabled: boolean
  
  // Theme State
  theme: Theme
  
  // Media State
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  
  // Voice State
  voiceState: VoiceState
  voiceTranscript: string
  extractedEntities: ExtractedEntities | null
  
  // Buddy State
  buddyState: BuddyState {
    collapsed: boolean
    position: 'top-center' | 'top-left' | ...
    emotion: 'neutral' | 'happy' | 'thinking' | 'excited' | 'error'
    mood: 'sassy' | 'annoyed' | 'proud' | 'concerned' | 'neutral'
    stats: {
      windowsOpened: number
      windowsClosed: number
      totalClicks: number
      idleMinutes: number
      errors: number
      filesCreated: number
      settingsOpened: number
      startTime: number
    }
    streak: {
      current: number
      longest: number
      lastInteraction: number
      broken: boolean
    }
  }
  buddyMessages: BuddyMessage[]
  
  // Lock Screen
  isLocked: boolean
  lockScreenPin: string | null
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // Spotlight
  spotlightOpen: boolean
  spotlightQuery: string
  
  // Virtual Desktops
  virtualDesktops: VirtualDesktop[]
  activeDesktopId: string
  
  // File System
  fileSystem: VoidFile[]
  currentPath: string | null
}
```

### VOID Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Zustand Store Action
    │
    ├─> Update State
    │
    ├─> Persist to localStorage (via persist middleware)
    │
    └─> Trigger Re-render (React)
            │
            ▼
    Component Updates UI
```

---

## FTW System Architecture

### Core Data Models

```typescript
// src/lib/types.ts

Job {
  id: string
  homeownerId: string
  contractorId?: string
  title: string
  description: string
  photos?: string[]
  aiScope: {
    scope: string
    priceLow: number
    priceHigh: number
    materials: string[]
    confidenceScore?: number
  }
  size: 'small' | 'medium' | 'large'
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  bids: Bid[]
  createdAt: string
}

CRMCustomer {
  id: string
  contractorId: string
  name: string
  email?: string
  phone?: string
  status: 'lead' | 'active' | 'completed' | 'advocate'
  source: 'bid' | 'manual_invite' | 'referral'
  lifetimeValue: number
  lastContact: string
  notes?: string
}

CRMInteraction {
  id: string
  customerId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'bid' | 'payment'
  title: string
  description?: string
  date: string
  outcome?: 'positive' | 'neutral' | 'negative'
}
```

### FTW Component Structure

```
App.tsx (Root)
│
├── Header (Navigation)
│
├── Routes
│   ├── Home (Landing)
│   ├── ContractorDashboard
│   │   ├── CRMDashboard
│   │   ├── EnhancedCRMDashboard
│   │   ├── JobPoster
│   │   ├── BrowseJobs
│   │   ├── InvoiceManager
│   │   └── [50+ contractor tools]
│   │
│   ├── HomeownerDashboard
│   │   ├── MyJobs
│   │   ├── JobPoster
│   │   └── [Homeowner tools]
│   │
│   ├── OperatorDashboard
│   │   └── TerritoryMap
│   │
│   └── /void (VOID OS)
│       └── VOID.tsx
│
└── Footer
```

### FTW Data Storage

```
useLocalKV<T>(key, initialValue, options?)
│
├─> localStorage (primary)
│   └─> Encrypted (optional)
│       └─> Compressed (optional)
│
└─> Spark KV (fallback if available)
    └─> Cloud sync (future)
```

**Storage Keys:**
- `jobs` → Job[]
- `crm-customers` → CRMCustomer[]
- `crm-interactions` → CRMInteraction[]
- `invoices` → Invoice[]
- `territories` → Territory[]
- `users` → User[]

---

## Data Flow Diagrams

### Job Creation & AI Scoping Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER POSTS JOB (JobPoster.tsx)                              │
│     Input: title, description, photos, audio                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. AI SCOPE GENERATION (fakeAIScope)                           │
│     ├─> Check cache (COMMON_JOB_PATTERNS)                       │
│     ├─> Check runtime cache (JOB_TYPE_CACHE)                    │
│     └─> If not cached:                                           │
│         ├─> classifyJob(description)                            │
│         ├─> getJobContext(description) [RAG]                     │
│         ├─> smartCallWithBudget(isSimple, getJobScope)           │
│         └─> callClaudeHaiku() or callClaudeSonnet()             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. PARSE RESPONSE                                               │
│     ├─> Extract scope, price range, materials                   │
│     ├─> Cache result (LRU eviction)                             │
│     └─> Return ScopeResult                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CREATE JOB OBJECT                                           │
│     Job {                                                        │
│       id: uuidv4()                                              │
│       title, description, photos                                │
│       aiScope: { scope, priceLow, priceHigh, materials }        │
│       status: 'open'                                            │
│     }                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. SAVE TO STORAGE                                             │
│     setJobs([...jobs, newJob])                                  │
│     └─> useLocalKV('jobs', []) → localStorage                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. UPDATE UI                                                   │
│     ├─> Show job in BrowseJobs                                   │
│     ├─> Show in MyJobs (homeowner)                              │
│     └─> Trigger notifications (contractors)                      │
└─────────────────────────────────────────────────────────────────┘
```

### CRM Automation Flow (Buddy)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. NEW JOB/BID DETECTED                                        │
│     Event: Job created or Bid placed                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. BUDDY CRM ENGINE                                            │
│     buddyCRM.autoCreateCustomer(leadData)                       │
│     ├─> Extract customer info from job/bid                      │
│     ├─> scoreLeadWithContext(signals)                            │
│     └─> Create CRMCustomer if score > threshold                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. AUTO FOLLOW-UP SCHEDULING                                   │
│     buddyCRM.checkFollowUps()                                   │
│     ├─> Check lastContact date                                  │
│     ├─> Generate follow-up message (AI)                          │
│     └─> Schedule follow-up task                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BUDDY NOTIFICATION                                          │
│     addBuddyMessage({                                           │
│       message: "New hot lead! Sarah Miller - 87% score."        │
│       emotion: 'excited'                                        │
│     })                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### AI Receptionist Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. INBOUND CALL (Twilio)                                       │
│     POST /api/receptionist/inbound                              │
│     { From, To, CallSid, RecordingUrl }                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. TRANSCRIPTION                                               │
│     ├─> Use Twilio transcription if available                  │
│     └─> Or: Whisper API (OpenAI)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. GPT EXTRACTION                                             │
│     GPT-4o extracts:                                            │
│     ├─> callerName, callerPhone                                 │
│     ├─> issueType, urgency                                      │
│     ├─> propertyAddress, description                            │
│     └─> confidence score                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CRM LOOKUP                                                  │
│     Query CRM for callerPhone (last 90 days)                    │
│     ├─> If returning customer: personalize greeting             │
│     └─> If new: standard greeting                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. CREATE JOB                                                  │
│     Job {                                                        │
│       contractorId: matched from To number                     │
│       homeownerId: extracted or create new                     │
│       title, description from extraction                        │
│       status: 'open' (private job)                              │
│     }                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. SMS RESPONSE                                                │
│     Twilio SMS to caller:                                       │
│     "Thanks for calling! We've created your job request..."     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Storage Architecture

### Storage Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE HIERARCHY                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: useLocalKV (localStorage + Spark KV)
├─> Primary: Browser localStorage
│   ├─> Encrypted (optional)
│   ├─> Compressed (optional)
│   └─> Debounced writes (300ms)
│
└─> Fallback: Spark KV (if available)
    └─> Cloud sync (future)

Storage Keys:
├─> jobs → Job[]
├─> crm-customers → CRMCustomer[]
├─> crm-interactions → CRMInteraction[]
├─> invoices → Invoice[]
├─> territories → Territory[]
└─> users → User[]

─────────────────────────────────────────────────────────────────

Layer 2: IndexedDB (Buddy Learning + Media)
├─> void-buddy-learning
│   └─> learning-data store
│       ├─> activityPatterns
│       ├─> leadSources
│       ├─> followUpTiming
│       └─> preferences
│
└─> void-desktop (Backgrounds)
    └─> backgrounds store
        └─> User-uploaded backgrounds

─────────────────────────────────────────────────────────────────

Layer 3: Vector Database (RAG Context)
├─> Pinecone / Qdrant / Weaviate / Chroma
│   ├─> ftw-job-scopes index
│   │   └─> Similar job scopes for RAG
│   │
│   ├─> ftw-materials index
│   │   └─> Material pricing data
│   │
│   └─> ftw-contractors index
│       └─> Contractor profiles for matching
│
└─> Embeddings generated via:
    └─> togethercomputer/m2-bert-80M-8k-retrieval
        └─> Or: accounts/fireworks/models/mistral-7b-instruct-v0p2

─────────────────────────────────────────────────────────────────

Layer 4: Zustand Persist (VOID State)
├─> void-desktop-storage
│   ├─> Icon positions
│   ├─> Pinned icons
│   ├─> Theme preference
│   ├─> Desktop background
│   ├─> Wiremap settings
│   └─> Media preferences
│
└─> spotify-tracks-cache
    └─> Last 10 tracks (IndexedDB)
```

---

## State Management

### VOID Store (Zustand)

```typescript
// src/lib/void/store.ts

VoidStore {
  // Desktop
  icons: IconData[]
  iconPositions: Record<string, GridPosition>
  windows: WindowData[]
  activeWindowId: string | null
  
  // Theme
  theme: Theme
  
  // Media
  currentTrack: Track | null
  isPlaying: boolean
  
  // Voice
  voiceState: VoiceState
  voiceTranscript: string
  
  // Buddy
  buddyState: BuddyState
  buddyMessages: BuddyMessage[]
  
  // Actions
  openWindow(menuId: string)
  closeWindow(id: string)
  setTheme(theme: Theme)
  addBuddyMessage(message: BuddyMessage)
  // ... 50+ actions
}
```

### FTW Store (Zustand - iOS App)

```typescript
// ios-app/src/store/index.ts

AppState {
  currentUser: User | null
  jobs: Job[]
  invoices: Invoice[]
  territories: Territory[]
  crmCustomers: CRMCustomer[]
  
  // Actions
  addJob(job: Job)
  updateJob(jobId: string, updates: Partial<Job>)
  addCRMCustomer(customer: CRMCustomer)
  // ...
}
```

### FTW Data Hooks (Web App)

```typescript
// Web app uses useLocalKV directly (no central store)

useLocalKV<Job[]>('jobs', [])
useLocalKV<CRMCustomer[]>('crm-customers', [])
useLocalKV<CRMInteraction[]>('crm-interactions', [])
// ...
```

---

## API Integration Layer

### External APIs

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL API INTEGRATIONS                    │
└─────────────────────────────────────────────────────────────────┘

1. Anthropic (Claude AI)
   ├─> Endpoint: https://api.anthropic.com/v1/messages
   ├─> Models: claude-3-haiku, claude-3-5-sonnet
   ├─> Usage: Job scoping (primary)
   └─> Cost: $0.00025 (Haiku) / $0.003 (Sonnet) per call

2. Groq / Together / Fireworks (Open-source LLMs)
   ├─> Endpoint: Configurable (baseUrl)
   ├─> Models: mixtral-8x7b, mistral-7b, etc.
   ├─> Usage: Job classification, routing, embeddings
   └─> Cost: Free tier available

3. Vector DB (Pinecone / Qdrant / Weaviate / Chroma)
   ├─> Endpoint: Configurable (baseUrl)
   ├─> Usage: RAG context retrieval
   └─> Cost: Varies by provider

4. Twilio (Voice & SMS)
   ├─> Endpoint: Twilio API
   ├─> Usage: AI Receptionist, SMS notifications
   └─> Cost: $0.0085/min (voice) + $0.0075/SMS

5. Stripe (Payments)
   ├─> Endpoint: Stripe API
   ├─> Usage: Pro subscriptions, payments
   └─> Cost: 2.9% + $0.30 per transaction

6. Spotify (Media)
   ├─> Endpoint: Spotify Web API
   ├─> Usage: Music playback in VOID
   └─> Cost: Free (with ads) or Premium subscription
```

### Internal API Routes (Vercel)

```
/api/receptionist/inbound     → Twilio webhook handler
/api/receptionist/sms         → SMS webhook handler
/api/ai/scope                 → Job scoping (legacy)
/api/ai/extract               → Data extraction
/api/ai/chat                  → Conversational AI
/api/export/pdf               → PDF generation
/api/export/csv               → CSV export
```

---

## Component Relationships

### VOID ↔ FTW Integration

```
┌─────────────────────────────────────────────────────────────────┐
│              VOID OS ↔ FTW INTEGRATION POINTS                   │
└─────────────────────────────────────────────────────────────────┘

1. VOID as FTW Module
   ├─> Route: /void
   ├─> Component: VOID.tsx
   └─> Access: Via FTW navigation

2. FTW Components in VOID
   ├─> VOID can open FTW modules as windows
   │   └─> openWindow('customers') → CRMDashboard
   │
   └─> VOID icons can launch FTW features
       └─> Icon click → openWindow(menuId)

3. Shared State
   ├─> User data: Passed as prop to VOID
   ├─> Jobs: Accessed via useLocalKV (shared storage)
   └─> CRM: Accessed via useLocalKV (shared storage)

4. Buddy CRM Automation
   ├─> Buddy monitors FTW data (jobs, customers)
   ├─> Buddy triggers CRM actions
   └─> Buddy displays CRM insights in panel
```

### Component Dependency Graph

```
VOID.tsx
├─> VoidDesktop
│   └─> VoidIcon (uses iconMap.tsx)
│
├─> VoidWindowManager
│   └─> VoidWindow
│       └─> Window Content (FTW components)
│
├─> VoidBuddy
│   ├─> VoidBuddyIcon
│   └─> VoidBuddyPanel
│       ├─> Uses buddyPersonality.ts
│       ├─> Uses buddyLearning.ts
│       └─> Uses useBuddyReactions.ts
│
└─> WiremapBackground
    └─> wiremapWorker.ts (Web Worker)
```

---

## AI Provider Routing

### Routing Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│              AI PROVIDER ROUTING DECISION TREE                  │
└─────────────────────────────────────────────────────────────────┘

Request: Job Scoping
│
├─> Check Cache
│   ├─> COMMON_JOB_PATTERNS → Return cached
│   └─> JOB_TYPE_CACHE → Return cached
│
├─> Classification
│   ├─> classifyJob(description)
│   │   ├─> Rule-based (fallback)
│   │   └─> Open-source LLM (Groq/Together/Fireworks)
│   │       └─> Returns: intent, complexity, requiresSonnet
│   │
│   └─> Determine Path
│       ├─> Simple → Haiku path
│       └─> Complex → Sonnet path
│
├─> RAG Context (if enabled)
│   ├─> embedText(description)
│   │   └─> Embeddings provider (Together/Fireworks)
│   │
│   └─> queryVector()
│       ├─> Similar scopes
│       ├─> Material pricing
│       └─> Suggested contractors
│
├─> Budget Check
│   ├─> smartCallWithBudget(isSimple, callFn)
│   │   ├─> canCallHaiku() → Check 67% budget
│   │   └─> canCallSonnet() → Check 33% budget
│   │
│   └─> If budget OK → Proceed
│       └─> If budget exceeded → Error
│
└─> AI Call
    ├─> Simple Path
    │   ├─> callClaudeHaiku()
    │   │   ├─> Try: Anthropic API (claude-3-haiku)
    │   │   └─> Fallback: Spark LLM (gpt-4o-mini)
    │   │
    │   └─> recordHaikuCall() → Track cost
    │
    └─> Complex Path
        ├─> callClaudeSonnet()
        │   ├─> Try: Anthropic API (claude-3-5-sonnet)
        │   └─> Fallback: Spark LLM (gpt-4o)
        │
        └─> recordSonnetCall() → Track cost
```

### Provider Fallback Chain

```
Primary: Anthropic Claude
    │
    ├─> If API key missing → Fallback to Spark LLM
    │
    └─> If Spark LLM unavailable → Fallback to rule-based

Routing/Classification:
    Primary: Groq / Together / Fireworks
    │
    └─> If unavailable → Rule-based classification

Embeddings:
    Primary: Together / Fireworks
    │
    └─> If unavailable → Skip RAG context

Vector DB:
    Primary: Pinecone / Qdrant / Weaviate / Chroma
    │
    └─> If unavailable → Empty RAG context
```

---

## Budget Management System

### Budget Allocation

```
Monthly Budget: $120
│
├─> Haiku Allocation: 67% ($80.40)
│   ├─> Cost per call: $0.00025
│   └─> Max calls: ~321,600/month
│
└─> Sonnet Allocation: 33% ($39.60)
    ├─> Cost per call: $0.003
    └─> Max calls: ~13,200/month
```

### Budget Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUDGET TRACKING                               │
└─────────────────────────────────────────────────────────────────┘

1. Budget Reset
   ├─> Check: daysSinceReset >= 30
   └─> Reset: haikuSpent, sonnetSpent, call counts

2. Before AI Call
   ├─> smartCallWithBudget(isSimple, callFn)
   ├─> Check: canCallHaiku() or canCallSonnet()
   └─> If budget OK → Proceed, else → Error

3. After AI Call
   ├─> recordHaikuCall() → haikuSpent += $0.00025
   └─> recordSonnetCall() → sonnetSpent += $0.003

4. Budget Status
   ├─> getBudgetStatus()
   ├─> Returns: spent, remaining, percentage, call counts
   └─> Used for: Dashboard display, warnings
```

---

## RAG & Embeddings Pipeline

### RAG Context Retrieval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAG PIPELINE                                  │
└─────────────────────────────────────────────────────────────────┘

1. Input: Job Description
   │
   ▼
2. Generate Embedding
   ├─> embedText(description)
   ├─> Provider: Together / Fireworks
   ├─> Model: m2-bert-80M-8k-retrieval
   └─> Returns: Vector (number[])
   │
   ▼
3. Vector Search (Parallel)
   ├─> queryVector(indexJobScopes)
   │   ├─> Collection: 'ftw-job-scopes'
   │   ├─> Filter: { status: 'completed' }
   │   ├─> topK: 5
   │   └─> Returns: Similar job scopes
   │
   ├─> queryVector(indexMaterials)
   │   ├─> Collection: 'ftw-materials'
   │   ├─> topK: 10
   │   └─> Returns: Material pricing data
   │
   └─> queryVector(indexContractors)
       ├─> Collection: 'ftw-contractors'
       ├─> topK: 8
       └─> Returns: Suggested contractors
   │
   ▼
4. Build RAG Context
   ├─> RAGContext {
   │   ├─> similarScopes: RetrievedDocument[]
   │   ├─> materialPricing: RetrievedDocument[]
   │   ├─> suggestedContractors: RetrievedDocument[]
   │   ├─> averagePrice: number (computed)
   │   └─> typicalTimeframe: string (computed)
   │   }
   │
   ▼
5. Inject into Prompt
   └─> createStandardPromptWithContext() or
       createDetailedPromptWithContext()
       └─> Includes RAG context in Claude prompt
```

### Vector Database Schema

```
Index: ftw-job-scopes
├─> Vector: 768-dim embedding (or provider-specific)
├─> Metadata:
│   ├─> title: string
│   ├─> content: string (scope text)
│   ├─> finalPrice: number
│   ├─> durationDays: number
│   └─> status: 'completed'
│
└─> Query: Similarity search by job description embedding

Index: ftw-materials
├─> Vector: 768-dim embedding
├─> Metadata:
│   ├─> item: string
│   ├─> price: number
│   └─> category: string
│
└─> Query: Similarity search for material pricing

Index: ftw-contractors
├─> Vector: 768-dim embedding
├─> Metadata:
│   ├─> name: string
│   ├─> specialty: string[]
│   └─> rating: number
│
└─> Query: Similarity search for contractor matching
```

---

## Buddy Learning System

### Learning Data Structure

```typescript
// src/lib/void/buddyLearning.ts

LearningData {
  activityPatterns: {
    timeOfDay: Record<string, number>      // Hour (0-23) → count
    dayOfWeek: Record<string, number>      // Day (0-6) → count
  }
  
  leadSources: Record<string, {
    count: number
    winRate: number
  }>
  
  followUpTiming: Record<string, number>   // Hours → success rate
  
  preferences: {
    preferredCallTimes: number[]
    autoDraftEmails: boolean
  }
  
  lastUpdated: number
}
```

### Learning Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUDDY LEARNING PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

1. Activity Recording
   ├─> recordActivity(userId, hour, dayOfWeek)
   ├─> Updates: activityPatterns.timeOfDay[hour]++
   └─> Updates: activityPatterns.dayOfWeek[day]++

2. Lead Source Tracking
   ├─> recordLeadSource(userId, source, won)
   ├─> Updates: leadSources[source].count++
   └─> Updates: leadSources[source].winRate (moving average)

3. Follow-Up Timing
   ├─> recordFollowUp(userId, hours, success)
   └─> Updates: followUpTiming[hours] (success rate)

4. Optimal Time Calculation
   ├─> getOptimalCallTimes(userId)
   ├─> Analyzes: activityPatterns.timeOfDay
   └─> Returns: Top 6 hours by activity

5. Storage
   ├─> IndexedDB: 'void-buddy-learning'
   ├─> Store: 'learning-data'
   └─> Key: userId
```

### Learning Integration Points

```
Buddy Learning ← Used by:
├─> Buddy CRM Automation
│   └─> Optimal follow-up timing
│
├─> Buddy Personality
│   └─> Personalized messages based on patterns
│
└─> Future: AI Receptionist
    └─> Optimal call scheduling
```

---

## Integration Points

### VOID ↔ FTW Data Sharing

```
┌─────────────────────────────────────────────────────────────────┐
│              VOID ↔ FTW DATA INTEGRATION                        │
└─────────────────────────────────────────────────────────────────┘

1. Shared Storage (useLocalKV)
   ├─> Jobs: useLocalKV<Job[]>('jobs', [])
   │   └─> Both VOID and FTW read/write
   │
   ├─> CRM: useLocalKV<CRMCustomer[]>('crm-customers', [])
   │   └─> Both VOID and FTW read/write
   │
   └─> User: Passed as prop to VOID
       └─> Single source of truth

2. VOID Windows Opening FTW Components
   ├─> openWindow('customers') → CRMDashboard
   ├─> openWindow('jobs') → BrowseJobs
   └─> openWindow('invoices') → InvoiceManager

3. Buddy Monitoring FTW Data
   ├─> useBuddyReactions hook
   │   ├─> Monitors: window opens/closes
   │   ├─> Monitors: settings opens
   │   └─> Monitors: global errors
   │
   └─> Buddy CRM Automation (future)
       ├─> Monitors: new jobs
       ├─> Monitors: new bids
       └─> Triggers: CRM actions

4. Theme Synchronization
   ├─> VOID theme → FTW theme (via CSS variables)
   └─> Shared: data-theme attribute
```

### Component Communication

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT COMMUNICATION PATTERNS                   │
└─────────────────────────────────────────────────────────────────┘

1. Parent → Child (Props)
   ├─> VOID → VoidBuddy: user, onNavigate
   └─> VoidBuddy → VoidBuddyPanel: stats, mood, streak

2. Child → Parent (Callbacks)
   ├─> VoidBuddyPanel → VoidBuddy: onMessageClick
   └─> VoidWindow → VOID: onClose, onMinimize

3. Global State (Zustand)
   ├─> useVoidStore() → All VOID components
   └─> useLocalKV() → All FTW components

4. Event System (Future)
   └─> Custom event emitter for cross-component communication
```

---

## Performance Architecture

### Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING PIPELINE                            │
└─────────────────────────────────────────────────────────────────┘

1. Main Thread (UI Updates)
   ├─> React components
   ├─> User input handling
   └─> State updates

2. Web Worker (Heavy Computation)
   ├─> Wiremap rendering (WebGL)
   ├─> OffscreenCanvas
   └─> Three.js scene management

3. CSS Animations (GPU-Accelerated)
   ├─> transform: translate3d()
   ├─> will-change: transform
   └─> 120fps target (auto-throttle to 60fps if needed)

4. Request Animation Frame (RAF)
   ├─> Animation monitoring
   ├─> FPS tracking
   └─> Auto-throttling
```

### Optimization Strategies

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIMIZATION STRATEGIES                       │
└─────────────────────────────────────────────────────────────────┘

1. Code Splitting
   ├─> Route-based splitting
   ├─> Component lazy loading
   └─> Dynamic imports

2. Caching
   ├─> AI scope cache (LRU, 200 entries)
   ├─> Classification cache
   └─> Decryption cache (5min TTL)

3. Debouncing
   ├─> useLocalKV writes (300ms)
   └─> Search inputs (300ms)

4. Memoization
   ├─> React.memo for components
   ├─> useMemo for computed values
   └─> useCallback for event handlers

5. Worker Offloading
   ├─> WebGL rendering in worker
   └─> Heavy computation in worker
```

---

## Security Architecture

### Data Encryption

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

1. Storage Encryption
   ├─> useLocalKV with encrypt: true
   ├─> encryptData() / decryptData()
   └─> AES encryption (browser-native)

2. API Security
   ├─> API keys in environment variables
   ├─> HTTPS only
   └─> Rate limiting (per-user, per-endpoint)

3. OAuth Tokens
   ├─> Secure storage (Spotify tokens)
   ├─> Auto-refresh
   └─> Same-origin only

4. IndexedDB
   ├─> Same-origin only
   └─> No cross-site access

5. Content Security Policy (CSP)
   └─> Compatible with Web Workers
```

---

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT                            │
└─────────────────────────────────────────────────────────────────┘

1. Frontend (Vercel)
   ├─> Static assets (Vite build)
   ├─> Serverless functions (/api/*)
   └─> Edge functions (future)

2. Environment Variables
   ├─> VITE_CLAUDE_API_KEY
   ├─> FTW_ROUTING_KEY
   ├─> FTW_EMBED_KEY
   ├─> FTW_BG_KEY
   ├─> FTW_VECTOR_KEY
   └─> TWILIO_* (for receptionist)

3. Build Process
   ├─> npm run build
   ├─> Vite bundles React app
   └─> Output: dist/ directory

4. CDN
   └─> Vercel Edge Network (global CDN)
```

---

## Future Enhancements

### Planned Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE ENHANCEMENTS                           │
└─────────────────────────────────────────────────────────────────┘

1. Cloud Sync
   ├─> Supabase / Firebase integration
   ├─> Real-time sync across devices
   └─> Offline-first with sync

2. Advanced AI
   ├─> Local LLM support (Ollama)
   ├─> Self-hosted vector DB
   └─> Custom model fine-tuning

3. Multi-User
   ├─> Team collaboration
   ├─> Shared CRM data
   └─> Role-based access

4. Mobile Apps
   ├─> React Native (iOS in progress)
   ├─> Android (planned)
   └─> PWA enhancements

5. Plugin System
   ├─> VOID plugin API
   ├─> Third-party integrations
   └─> Custom modules
```

---

## Summary

This document provides a comprehensive wireframe of the entire system architecture, covering:

- **AI Architecture**: Provider routing, classification, RAG, embeddings
- **VOID OS**: Component hierarchy, state management, data flows
- **FTW System**: Data models, component structure, storage
- **Integration**: How VOID and FTW work together
- **Storage**: Multi-layer storage architecture
- **Performance**: Optimization strategies
- **Security**: Encryption and security layers

This serves as the definitive reference for understanding the complete infrastructure of both VOID OS and FairTradeWorker systems.

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: ✅ **COMPREHENSIVE WIREFRAME COMPLETE**
