import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IconData, WindowData, GridPosition, SortOption, VoiceState, VoicePermission, ExtractedEntities, BuddyState, BuddyMessage } from './types'

interface VoidStore {
  // Icons
  icons: IconData[]
  iconPositions: Record<string, GridPosition>
  pinnedIcons: Set<string>
  iconUsage: Record<string, number> // Track usage for sorting
  
  // Windows
  windows: WindowData[]
  activeWindowId: string | null
  nextZIndex: number
  
  // Desktop
  sortOption: SortOption | null
  
  // Voice
  voiceState: VoiceState
  voicePermission: VoicePermission
  voiceRecording: Blob | null
  voiceTranscript: string
  extractedEntities: ExtractedEntities | null
  
  // Buddy
  buddyState: BuddyState
  buddyMessages: BuddyMessage[]
  
  // Actions
  updateIconPosition: (id: string, position: GridPosition) => void
  pinIcon: (id: string) => void
  unpinIcon: (id: string) => void
  sortIcons: (option: SortOption) => void
  openWindow: (menuId: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
      updateWindowSize: (id: string, size: { width: number; height: number }) => void
      focusWindow: (id: string) => void
      recordIconUsage: (id: string) => void
      
      // Voice actions
      setVoiceState: (state: VoiceState) => void
      setVoicePermission: (permission: VoicePermission) => void
      setVoiceRecording: (blob: Blob | null) => void
      setVoiceTranscript: (text: string) => void
      setExtractedEntities: (entities: ExtractedEntities | null) => void
      
      // Buddy actions
      setBuddyCollapsed: (collapsed: boolean) => void
      setBuddyPosition: (position: BuddyState['position']) => void
      setBuddyDocked: (docked: boolean) => void
      setBuddyEmotion: (emotion: BuddyState['emotion']) => void
      addBuddyMessage: (message: BuddyMessage) => void
      updateBuddyLastMessageTime: (time: number) => void
}

// Default icon definitions
const defaultIcons: Omit<IconData, 'position' | 'gridSize'>[] = [
  { id: 'customers', label: 'Customers', icon: () => null, pinned: false, type: 'folder', menuId: 'customers' },
  { id: 'leads', label: 'Leads', icon: () => null, pinned: false, type: 'folder', menuId: 'leads' },
  { id: 'pipeline', label: 'Pipeline', icon: () => null, pinned: false, type: 'folder', menuId: 'pipeline' },
  { id: 'contacts', label: 'Contacts', icon: () => null, pinned: false, type: 'folder', menuId: 'contacts' },
  { id: 'documents', label: 'Documents', icon: () => null, pinned: false, type: 'folder', menuId: 'documents' },
  { id: 'ai-hub', label: 'AI Hub', icon: () => null, pinned: false, type: 'tool', menuId: 'ai' },
  { id: 'automation', label: 'Automation', icon: () => null, pinned: false, type: 'tool', menuId: 'automation' },
  { id: 'integrations', label: 'Integrations', icon: () => null, pinned: false, type: 'tool', menuId: 'integrations' },
  { id: 'analytics', label: 'Analytics', icon: () => null, pinned: false, type: 'tool', menuId: 'analytics' },
  { id: 'email', label: 'Email', icon: () => null, pinned: false, type: 'tool', menuId: 'email' },
  { id: 'billing', label: 'Billing', icon: () => null, pinned: false, type: 'tool', menuId: 'billing' },
  { id: 'calendar', label: 'Calendar', icon: () => null, pinned: false, type: 'tool', menuId: 'calendar' },
  { id: 'marketplace', label: 'Marketplace', icon: () => null, pinned: false, type: 'tool', menuId: 'marketplace' },
  { id: 'settings', label: 'Settings', icon: () => null, pinned: false, type: 'system', menuId: 'settings' },
  { id: 'voice-capture', label: 'Voice Capture', icon: () => null, pinned: false, type: 'tool', menuId: 'voice' },
]

// Initialize icons in a grid layout (starting at row 2, col 2)
const initializeIcons = (): { icons: IconData[]; positions: Record<string, GridPosition> } => {
  const icons: IconData[] = []
  const positions: Record<string, GridPosition> = {}
  
  defaultIcons.forEach((icon, index) => {
    // Special positioning for voice icon (2×2, place at row 10, col 10)
    if (icon.id === 'voice-capture') {
      const iconData: IconData = {
        ...icon,
        position: { row: 10, col: 10 },
      }
      icons.push(iconData)
      positions[icon.id] = { row: 10, col: 10 }
      return
    }
    
    const row = 2 + Math.floor(index / 5) // 5 icons per row
    const col = 2 + (index % 5)
    
    const iconData: IconData = {
      ...icon,
      position: { row, col },
    }
    
    icons.push(iconData)
    positions[icon.id] = { row, col }
  })
  
  return { icons, positions }
}

const { icons: initialIcons, positions: initialPositions } = initializeIcons()

export const useVoidStore = create<VoidStore>()(
  persist(
    (set, get) => ({
      // Initial state
      icons: initialIcons,
      iconPositions: initialPositions,
      pinnedIcons: new Set<string>(),
      iconUsage: {},
      windows: [],
      activeWindowId: null,
      nextZIndex: 1000,
      sortOption: null,
      
      // Voice initial state
      voiceState: 'idle',
      voicePermission: 'prompt',
      voiceRecording: null,
      voiceTranscript: '',
      extractedEntities: null,
      
      // Buddy initial state
      buddyState: {
        collapsed: false,
        position: 'top-left',
        docked: false,
        lastMessageTime: 0,
        emotion: 'neutral',
      },
      buddyMessages: [],
      
      // Icon actions
      updateIconPosition: (id: string, position: GridPosition) => {
        set({
          iconPositions: {
            ...get().iconPositions,
            [id]: position,
          },
          icons: get().icons.map(icon =>
            icon.id === id ? { ...icon, position } : icon
          ),
        })
      },
      
      pinIcon: (id: string) => {
        const pinned = new Set(get().pinnedIcons)
        pinned.add(id)
        set({
          pinnedIcons: pinned,
          icons: get().icons.map(icon =>
            icon.id === id ? { ...icon, pinned: true } : icon
          ),
        })
      },
      
      unpinIcon: (id: string) => {
        const pinned = new Set(get().pinnedIcons)
        pinned.delete(id)
        set({
          pinnedIcons: pinned,
          icons: get().icons.map(icon =>
            icon.id === id ? { ...icon, pinned: false } : icon
          ),
        })
      },
      
      sortIcons: (option: SortOption) => {
        const { icons, iconPositions } = get()
        const sorted = [...icons].sort((a, b) => {
          if (option === 'name') {
            return a.label.localeCompare(b.label)
          } else if (option === 'date') {
            // Sort by creation order (index in array)
            return icons.indexOf(a) - icons.indexOf(b)
          } else if (option === 'usage') {
            const usageA = get().iconUsage[a.id] || 0
            const usageB = get().iconUsage[b.id] || 0
            return usageB - usageA // Most used first
          }
          return 0
        })
        
        // Recalculate positions
        const newPositions: Record<string, GridPosition> = {}
        sorted.forEach((icon, index) => {
          const row = 2 + Math.floor(index / 5)
          const col = 2 + (index % 5)
          newPositions[icon.id] = { row, col }
        })
        
        set({
          icons: sorted.map((icon, index) => ({
            ...icon,
            position: newPositions[icon.id],
          })),
          iconPositions: newPositions,
          sortOption: option,
        })
      },
      
      recordIconUsage: (id: string) => {
        set({
          iconUsage: {
            ...get().iconUsage,
            [id]: (get().iconUsage[id] || 0) + 1,
          },
        })
      },
      
      // Window actions
      openWindow: (menuId: string) => {
        const state = get()
        const existing = state.windows.find(w => w.menuId === menuId && !w.minimized)
        
        if (existing) {
          set({
            activeWindowId: existing.id,
            windows: state.windows.map(w =>
              w.id === existing.id
                ? { ...w, zIndex: state.nextZIndex, minimized: false }
                : w
            ),
            nextZIndex: state.nextZIndex + 1,
          })
        } else {
          const newWindow: WindowData = {
            id: `window-${menuId}-${Date.now()}`,
            title: menuId.charAt(0).toUpperCase() + menuId.slice(1).replace(/-/g, ' '),
            menuId,
            position: {
              x: Math.max(0, (window.innerWidth - 800) / 2),
              y: Math.max(0, (window.innerHeight - 600) / 2),
            },
            size: { width: 800, height: 600 },
            minimized: false,
            maximized: false,
            zIndex: state.nextZIndex,
            content: null,
          }
          
          set({
            windows: [...state.windows, newWindow],
            activeWindowId: newWindow.id,
            nextZIndex: state.nextZIndex + 1,
          })
        }
      },
      
      closeWindow: (id: string) => {
        set({
          windows: get().windows.filter(w => w.id !== id),
          activeWindowId: get().windows.find(w => w.id !== id && w.id !== get().activeWindowId)
            ? get().activeWindowId
            : null,
        })
      },
      
      minimizeWindow: (id: string) => {
        set({
          windows: get().windows.map(w =>
            w.id === id ? { ...w, minimized: true } : w
          ),
        })
      },
      
      maximizeWindow: (id: string) => {
        const state = get()
        set({
          windows: state.windows.map(w =>
            w.id === id
              ? {
                  ...w,
                  maximized: !w.maximized,
                  position: !w.maximized ? { x: 24, y: 24 } : w.position,
                  size: !w.maximized
                    ? { width: window.innerWidth - 48, height: window.innerHeight - 48 - 48 } // Account for toolbar and taskbar
                    : { width: 800, height: 600 },
                }
              : w
          ),
        })
      },
      
      updateWindowPosition: (id: string, position: { x: number; y: number }) => {
        set({
          windows: get().windows.map(w =>
            w.id === id ? { ...w, position } : w
          ),
        })
      },
      
      updateWindowSize: (id: string, size: { width: number; height: number }) => {
        set({
          windows: get().windows.map(w =>
            w.id === id ? { ...w, size } : w
          ),
        })
      },
      
      focusWindow: (id: string) => {
        const state = get()
        set({
          activeWindowId: id,
          windows: state.windows.map(w =>
            w.id === id ? { ...w, zIndex: state.nextZIndex } : w
          ),
          nextZIndex: state.nextZIndex + 1,
        })
      },
      
      // Voice actions
      setVoiceState: (state: VoiceState) => {
        set({ voiceState: state })
      },
      
      setVoicePermission: (permission: VoicePermission) => {
        set({ voicePermission: permission })
      },
      
      setVoiceRecording: (blob: Blob | null) => {
        set({ voiceRecording: blob })
      },
      
      setVoiceTranscript: (text: string) => {
        set({ voiceTranscript: text })
      },
      
      setExtractedEntities: (entities: ExtractedEntities | null) => {
        set({ extractedEntities: entities })
      },
      
      // Buddy actions
      setBuddyCollapsed: (collapsed: boolean) => {
        set({
          buddyState: {
            ...get().buddyState,
            collapsed,
          },
        })
      },
      
      setBuddyPosition: (position: BuddyState['position']) => {
        set({
          buddyState: {
            ...get().buddyState,
            position,
          },
        })
      },
      
      setBuddyDocked: (docked: boolean) => {
        set({
          buddyState: {
            ...get().buddyState,
            docked,
          },
        })
      },
      
      setBuddyEmotion: (emotion: BuddyState['emotion']) => {
        set({
          buddyState: {
            ...get().buddyState,
            emotion,
          },
        })
      },
      
      addBuddyMessage: (message: BuddyMessage) => {
        set({
          buddyMessages: [...get().buddyMessages, message],
          buddyState: {
            ...get().buddyState,
            lastMessageTime: Date.now(),
          },
        })
      },
      
      updateBuddyLastMessageTime: (time: number) => {
        set({
          buddyState: {
            ...get().buddyState,
            lastMessageTime: time,
          },
        })
      },
    }),
    {
      name: 'void-desktop-storage',
      partialize: (state) => ({
        iconPositions: state.iconPositions,
        pinnedIcons: Array.from(state.pinnedIcons),
        iconUsage: state.iconUsage,
        sortOption: state.sortOption,
        voicePermission: state.voicePermission,
        buddyState: state.buddyState,
      }),
    }
  )
)
