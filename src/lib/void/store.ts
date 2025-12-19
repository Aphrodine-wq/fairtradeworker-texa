import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IconData, WindowData, GridPosition, SortOption, VoiceState, VoicePermission, ExtractedEntities, BuddyState, BuddyMessage, Notification, VirtualDesktop, VoidFile } from './types'
import type { Theme } from '@/lib/themes'
import type { Track } from '@/lib/music/types'
import { arrayToSet, validateVolume, validateGridPosition, validateWindowSize, sanitizeString, validateWithFallback, ThemeSchema, VoiceStateSchema, VoicePermissionSchema, BuddyStateSchema, BuddyMessageSchema } from './validation'
import { createFileSystem } from './fileSystem'
import { getDefaultDesktops } from './virtualDesktops'

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
  
  // Theme
  theme: Theme
  
  // Desktop slice
  desktopBackground: string | null
  wiremapEnabled: boolean
  wiremapNodeCount: number
  
  // Media slice
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  
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
      togglePip: (id: string) => void
      updateWindowPosition: (id: string, position: { x: number; y: number }) => void
      updateWindowSize: (id: string, size: { width: number; height: number }) => void
      focusWindow: (id: string) => void
      recordIconUsage: (id: string) => void
      groupWindows: (windowIds: string[]) => void
      ungroupWindows: (groupId: string) => void
      cascadeWindows: () => void
      tileWindows: () => void
      
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
      updateBuddyStats: (stats: Partial<BuddyState['stats']>) => void
      setBuddyMood: (mood: BuddyState['mood']) => void
      updateBuddyStreak: (streak: Partial<BuddyState['streak']>) => void
      
      // Theme actions
      setTheme: (theme: Theme) => void
      
      // Desktop slice actions
      setDesktopBackground: (background: string | null) => void
      setWiremapEnabled: (enabled: boolean) => void
      setWiremapNodeCount: (count: number) => void
      
  // Media slice actions
  setCurrentTrack: (track: Track | null) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setIsMuted: (muted: boolean) => void
  
  // Lock screen
  isLocked: boolean
  lockScreenPin: string | null
  setLocked: (locked: boolean) => void
  setLockScreenPin: (pin: string | null) => void
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  
  // Spotlight
  spotlightOpen: boolean
  spotlightQuery: string
  setSpotlightOpen: (open: boolean) => void
  setSpotlightQuery: (query: string) => void
  
  // Virtual Desktops
  virtualDesktops: VirtualDesktop[]
  activeDesktopId: string
  createDesktop: (desktop: VirtualDesktop) => void
  switchDesktop: (id: string) => void
  moveWindowToDesktop: (windowId: string, desktopId: string) => void
  
  // File System
  fileSystem: VoidFile[]
  currentPath: string | null
  createFile: (file: Omit<VoidFile, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteFile: (id: string) => void
  moveFile: (id: string, newParentId: string | null) => void
  setCurrentPath: (path: string | null) => void
  copyFile: (id: string, newParentId?: string | null) => void
  renameFile: (id: string, newName: string) => void
  searchFiles: (query: string) => VoidFile[]
}

// Default icon definitions
const defaultIcons: Omit<IconData, 'position' | 'gridSize'>[] = [
  // Existing icons
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
  // Module icons
  { id: 'livewire', label: 'Livewire', icon: () => null, pinned: false, type: 'module', menuId: 'livewire' },
  { id: 'facelink', label: 'Facelink', icon: () => null, pinned: false, type: 'module', menuId: 'facelink' },
  { id: 'blueprint', label: 'Blueprint', icon: () => null, pinned: false, type: 'module', menuId: 'blueprint' },
  { id: 'scope', label: 'Scope', icon: () => null, pinned: false, type: 'module', menuId: 'scope' },
  { id: 'dispatch', label: 'Dispatch', icon: () => null, pinned: false, type: 'module', menuId: 'dispatch' },
  { id: 'reputation', label: 'Reputation', icon: () => null, pinned: false, type: 'module', menuId: 'reputation' },
  { id: 'cashflow', label: 'Cashflow', icon: () => null, pinned: false, type: 'module', menuId: 'cashflow' },
  { id: 'vault', label: 'Vault', icon: () => null, pinned: false, type: 'module', menuId: 'vault' },
  { id: 'funnel', label: 'Funnel', icon: () => null, pinned: false, type: 'module', menuId: 'funnel' },
  { id: 'milestones', label: 'Milestones', icon: () => null, pinned: false, type: 'module', menuId: 'milestones' },
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

// Store version for migration
const STORE_VERSION = '1.0.0'

// Migration function for future schema changes
function migrateStoreState(state: any, version: string): any {
  // Future migrations can be added here
  // Example:
  // if (version === '1.0.0') {
  //   // Migrate to 1.1.0
  //   return { ...state, newField: defaultValue }
  // }
  return state
}

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
      theme: 'light' as Theme,
      
      // Desktop slice initial state
      desktopBackground: null,
      wiremapEnabled: true,
      wiremapNodeCount: 80,
      
      // Media slice initial state
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      isMuted: false,
      
      // Lock screen initial state
      isLocked: false,
      lockScreenPin: null,
      
      // Notifications initial state
      notifications: [],
      unreadCount: 0,
      
      // Spotlight initial state
      spotlightOpen: false,
      spotlightQuery: '',
      
      // Virtual Desktops initial state
      virtualDesktops: getDefaultDesktops(),
      activeDesktopId: getDefaultDesktops()[0]?.id || 'desktop-1',
      
      // Voice initial state
      voiceState: 'idle',
      voicePermission: 'prompt',
      voiceRecording: null,
      voiceTranscript: '',
      extractedEntities: null,
      
      // Buddy initial state
      buddyState: {
        collapsed: false,
        position: 'top-center',
        docked: false,
        lastMessageTime: 0,
        emotion: 'neutral',
        mood: 'sassy',
        stats: {
          windowsOpened: 0,
          windowsClosed: 0,
          totalClicks: 0,
          idleMinutes: 0,
          errors: 0,
          filesCreated: 0,
          settingsOpened: 0,
          startTime: Date.now(),
        },
        streak: {
          current: 0,
          longest: 0,
          lastInteraction: Date.now(),
          broken: false,
        },
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
                  pip: false, // Exit PiP when maximizing
                  position: !w.maximized ? { x: 24, y: 24 } : w.position,
                  size: !w.maximized
                    ? { width: window.innerWidth - 48, height: window.innerHeight - 48 - 48 } // Account for toolbar and taskbar
                    : { width: 800, height: 600 },
                }
              : w
          ),
        })
      },
      
      togglePip: (id: string) => {
        const state = get()
        set({
          windows: state.windows.map(w =>
            w.id === id
              ? {
                  ...w,
                  pip: !w.pip,
                  maximized: false, // Exit maximize when entering PiP
                  // PiP windows are smaller and positioned bottom-right
                  position: !w.pip
                    ? { x: window.innerWidth - 320, y: window.innerHeight - 240 - 48 }
                    : w.position,
                  size: !w.pip
                    ? { width: 300, height: 200 }
                    : w.size,
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
      
      // Window management enhancements
      groupWindows: (windowIds: string[]) => {
        // Group windows together (future enhancement)
        console.log('[VOID] Grouping windows:', windowIds)
      },
      
      ungroupWindows: (groupId: string) => {
        // Ungroup windows (future enhancement)
        console.log('[VOID] Ungrouping windows:', groupId)
      },
      
      cascadeWindows: () => {
        const state = get()
        const visibleWindows = state.windows.filter(w => !w.minimized)
        const offset = 30
        const startX = 50
        const startY = 50
        
        set({
          windows: state.windows.map((window, index) => {
            if (window.minimized) return window
            const windowIndex = visibleWindows.findIndex(w => w.id === window.id)
            return {
              ...window,
              position: {
                x: startX + (windowIndex * offset),
                y: startY + (windowIndex * offset),
              },
            }
          }),
        })
      },
      
      tileWindows: () => {
        const state = get()
        const visibleWindows = state.windows.filter(w => !w.minimized)
        if (visibleWindows.length === 0) return
        
        const cols = Math.ceil(Math.sqrt(visibleWindows.length))
        const rows = Math.ceil(visibleWindows.length / cols)
        const windowWidth = Math.max(400, (window.innerWidth - 100) / cols)
        const windowHeight = Math.max(300, (window.innerHeight - 100) / rows)
        
        set({
          windows: state.windows.map((window) => {
            if (window.minimized) return window
            const index = visibleWindows.findIndex(w => w.id === window.id)
            if (index === -1) return window
            
            const col = index % cols
            const row = Math.floor(index / cols)
            return {
              ...window,
              position: {
                x: 50 + (col * windowWidth) + (col * 10),
                y: 50 + (row * windowHeight) + (row * 10),
              },
              size: {
                width: windowWidth - 10,
                height: windowHeight - 10,
              },
            }
          }),
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
      
      updateBuddyStats: (stats: Partial<BuddyState['stats']>) => {
        const currentStats = get().buddyState.stats || {
          windowsOpened: 0,
          windowsClosed: 0,
          totalClicks: 0,
          idleMinutes: 0,
          errors: 0,
          filesCreated: 0,
          settingsOpened: 0,
          startTime: Date.now(),
        }
        set({
          buddyState: {
            ...get().buddyState,
            stats: { ...currentStats, ...stats },
          },
        })
      },
      
      setBuddyMood: (mood: BuddyState['mood']) => {
        set({
          buddyState: {
            ...get().buddyState,
            mood,
          },
        })
      },
      
      updateBuddyStreak: (streak: Partial<BuddyState['streak']>) => {
        const currentStreak = get().buddyState.streak || {
          current: 0,
          longest: 0,
          lastInteraction: Date.now(),
          broken: false,
        }
        set({
          buddyState: {
            ...get().buddyState,
            streak: { ...currentStreak, ...streak },
          },
        })
      },
      
      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme })
      },
      
      // Desktop slice actions
      setDesktopBackground: (background: string | null) => {
        set({ desktopBackground: background })
      },
      setWiremapEnabled: (enabled: boolean) => {
        set({ wiremapEnabled: enabled })
      },
      setWiremapNodeCount: (count: number) => {
        set({ wiremapNodeCount: count })
      },
      
      // Media slice actions
      setCurrentTrack: (track: Track | null) => {
        set({ currentTrack: track })
      },
      setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing })
      },
      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) })
      },
      setIsMuted: (muted: boolean) => {
        set({ isMuted: muted })
      },
      
      // Lock screen actions
      setLocked: (locked: boolean) => {
        set({ isLocked: locked })
      },
      setLockScreenPin: (pin: string | null) => {
        set({ lockScreenPin: pin })
      },
      
      // Notification actions
      addNotification: (notification: Notification) => {
        set((state) => {
          const newNotifications = [notification, ...state.notifications].slice(0, 100) // Limit to 100
          const newUnreadCount = newNotifications.filter(n => !n.read).length
          return {
            notifications: newNotifications,
            unreadCount: newUnreadCount,
          }
        })
      },
      markAsRead: (id: string) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          }
        })
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },
      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },
      
      // Spotlight actions
      setSpotlightOpen: (open: boolean) => {
        set({ spotlightOpen: open })
      },
      setSpotlightQuery: (query: string) => {
        set({ spotlightQuery: query })
      },
      
      // Virtual Desktop actions
      createDesktop: (desktop: VirtualDesktop) => {
        set((state) => ({
          virtualDesktops: [...state.virtualDesktops, desktop],
        }))
      },
      switchDesktop: (id: string) => {
        const state = get()
        const desktop = state.virtualDesktops.find(d => d.id === id)
        if (desktop) {
          set({ activeDesktopId: id })
        }
      },
      moveWindowToDesktop: (windowId: string, desktopId: string) => {
        set((state) => ({
          virtualDesktops: state.virtualDesktops.map(desktop => {
            // Remove from all desktops
            const windows = desktop.windows.filter(id => id !== windowId)
            
            // Add to target desktop
            if (desktop.id === desktopId && !windows.includes(windowId)) {
              return {
                ...desktop,
                windows: [...windows, windowId],
              }
            }
            
            return {
              ...desktop,
              windows,
            }
          }),
        }))
      },
      
      // File System actions
      createFile: (file: Omit<VoidFile, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newFile: VoidFile = {
          ...file,
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({
          fileSystem: [...state.fileSystem, newFile],
        }))
      },
      deleteFile: (id: string) => {
        set((state) => ({
          fileSystem: state.fileSystem.filter(f => f.id !== id),
        }))
      },
      moveFile: (id: string, newParentId: string | null) => {
        set((state) => {
          const file = state.fileSystem.find(f => f.id === id)
          if (!file) return state
          
          const newParent = newParentId ? state.fileSystem.find(f => f.id === newParentId) : null
          const newPath = newParent ? `${newParent.path}/${file.name}` : `/VOID/${file.name}`
          
          return {
            fileSystem: state.fileSystem.map(f =>
              f.id === id
                ? { ...f, parentId: newParentId, path: newPath, updatedAt: Date.now() }
                : f
            ),
          }
        })
      },
      setCurrentPath: (path: string | null) => {
        set({ currentPath: path })
      },
      
      // Enhanced file operations
      copyFile: (id: string, newParentId?: string | null) => {
        const state = get()
        const file = state.fileSystem.find(f => f.id === id)
        if (!file) return
        
        const newFile: VoidFile = {
          ...file,
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: `${file.name} (copy)`,
          parentId: newParentId ?? file.parentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({
          fileSystem: [...state.fileSystem, newFile],
        }))
      },
      
      renameFile: (id: string, newName: string) => {
        set((state) => ({
          fileSystem: state.fileSystem.map(f =>
            f.id === id
              ? { ...f, name: newName, updatedAt: Date.now() }
              : f
          ),
        }))
      },
      
      searchFiles: (query: string) => {
        const state = get()
        const lowerQuery = query.toLowerCase()
        return state.fileSystem.filter(f =>
          f.name.toLowerCase().includes(lowerQuery) ||
          (f.metadata && JSON.stringify(f.metadata).toLowerCase().includes(lowerQuery))
        )
      },
    }),
    {
      name: 'void-desktop-storage',
      partialize: (state) => ({
        _version: STORE_VERSION,
        iconPositions: state.iconPositions,
        pinnedIcons: Array.from(state.pinnedIcons),
        iconUsage: state.iconUsage,
        sortOption: state.sortOption,
        theme: state.theme,
        desktopBackground: state.desktopBackground,
        wiremapEnabled: state.wiremapEnabled,
        wiremapNodeCount: state.wiremapNodeCount,
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        volume: state.volume,
        isMuted: state.isMuted,
        voicePermission: state.voicePermission,
        buddyState: state.buddyState,
        isLocked: state.isLocked,
        lockScreenPin: state.lockScreenPin,
        notifications: state.notifications.slice(0, 50), // Persist last 50
        virtualDesktops: state.virtualDesktops,
        activeDesktopId: state.activeDesktopId,
        fileSystem: state.fileSystem,
        currentPath: state.currentPath,
      }),
      merge: (persistedState: any, currentState: VoidStore): VoidStore => {
        // Check version and migrate if needed
        const version = persistedState?._version || '0.0.0'
        let migratedState = migrateStoreState(persistedState, version)
        
        // Remove version metadata
        delete migratedState._version
        
        const merged = { ...currentState, ...migratedState }
        
        // Convert array back to Set for pinnedIcons with validation
        merged.pinnedIcons = arrayToSet(merged.pinnedIcons)
        
        // Validate and sanitize all fields with safe defaults
        if (!Array.isArray(merged.icons)) {
          merged.icons = currentState.icons
        } else {
          // Validate each icon
          merged.icons = merged.icons.filter((icon: any) => {
            return icon && typeof icon.id === 'string' && icon.id.length > 0
          }).slice(0, 100) // Limit to 100 icons
        }
        
        if (typeof merged.iconPositions !== 'object' || merged.iconPositions === null) {
          merged.iconPositions = currentState.iconPositions
        } else {
          // Validate icon positions
          const validPositions: Record<string, GridPosition> = {}
          for (const [id, pos] of Object.entries(merged.iconPositions)) {
            const validPos = validateGridPosition(pos)
            if (validPos && typeof id === 'string' && id.length > 0) {
              validPositions[id] = validPos
            }
          }
          merged.iconPositions = validPositions
        }
        
        if (typeof merged.iconUsage !== 'object' || merged.iconUsage === null) {
          merged.iconUsage = currentState.iconUsage
        } else {
          // Validate icon usage counts
          const validUsage: Record<string, number> = {}
          for (const [id, count] of Object.entries(merged.iconUsage)) {
            if (typeof id === 'string' && typeof count === 'number' && count >= 0 && count < 1000000) {
              validUsage[id] = Math.floor(count)
            }
          }
          merged.iconUsage = validUsage
        }
        
        if (!Array.isArray(merged.windows)) {
          merged.windows = currentState.windows
        } else {
          // Validate windows
          merged.windows = merged.windows
            .filter((w: any) => w && typeof w.id === 'string' && w.id.length > 0)
            .map((w: any) => {
              const validSize = validateWindowSize(w.size)
              return {
                ...w,
                size: validSize || { width: 800, height: 600 },
                position: validateGridPosition(w.position) || { row: 0, col: 0 },
                zIndex: typeof w.zIndex === 'number' && w.zIndex >= 0 ? Math.floor(w.zIndex) : currentState.nextZIndex,
              }
            })
            .slice(0, 50) // Limit to 50 windows
        }
        
        if (typeof merged.nextZIndex !== 'number' || merged.nextZIndex < 0) {
          merged.nextZIndex = currentState.nextZIndex
        } else {
          merged.nextZIndex = Math.max(1000, Math.min(1000000, Math.floor(merged.nextZIndex)))
        }
        
        merged.volume = validateVolume(merged.volume)
        
        if (typeof merged.wiremapNodeCount !== 'number' || merged.wiremapNodeCount < 1) {
          merged.wiremapNodeCount = currentState.wiremapNodeCount
        } else {
          merged.wiremapNodeCount = Math.max(1, Math.min(200, Math.floor(merged.wiremapNodeCount)))
        }
        
        // Validate theme with schema
        merged.theme = validateWithFallback(
          ThemeSchema,
          merged.theme,
          currentState.theme,
          false
        )
        
        // Validate voice state
        merged.voiceState = validateWithFallback(
          VoiceStateSchema,
          merged.voiceState,
          currentState.voiceState,
          false
        )
        
        // Validate voice permission
        merged.voicePermission = validateWithFallback(
          VoicePermissionSchema,
          merged.voicePermission,
          currentState.voicePermission,
          false
        )
        
        // Validate buddy state
        merged.buddyState = validateWithFallback(
          BuddyStateSchema,
          merged.buddyState,
          currentState.buddyState,
          false
        )
        
        // Validate buddy messages
        if (Array.isArray(merged.buddyMessages)) {
          merged.buddyMessages = merged.buddyMessages
            .map((msg: any) => validateWithFallback(
              BuddyMessageSchema,
              msg,
              null,
              false
            ))
            .filter((msg: any) => msg !== null)
            .slice(0, 100)
        } else {
          merged.buddyMessages = currentState.buddyMessages
        }
        
        // Sanitize voice transcript
        if (typeof merged.voiceTranscript === 'string') {
          merged.voiceTranscript = sanitizeString(merged.voiceTranscript, 10000)
        } else {
          merged.voiceTranscript = currentState.voiceTranscript
        }
        
        // Validate buddy state
        if (typeof merged.buddyState !== 'object' || merged.buddyState === null) {
          merged.buddyState = currentState.buddyState
        } else {
          merged.buddyState = {
            collapsed: typeof merged.buddyState.collapsed === 'boolean' ? merged.buddyState.collapsed : currentState.buddyState.collapsed,
            position: merged.buddyState.position || currentState.buddyState.position,
            docked: typeof merged.buddyState.docked === 'boolean' ? merged.buddyState.docked : currentState.buddyState.docked,
            lastMessageTime: typeof merged.buddyState.lastMessageTime === 'number' && merged.buddyState.lastMessageTime >= 0
              ? Math.floor(merged.buddyState.lastMessageTime)
              : currentState.buddyState.lastMessageTime,
            emotion: ['neutral', 'happy', 'thinking', 'excited', 'error'].includes(merged.buddyState.emotion)
              ? merged.buddyState.emotion
              : currentState.buddyState.emotion,
          }
        }
        
        // Validate buddy messages
        if (!Array.isArray(merged.buddyMessages)) {
          merged.buddyMessages = currentState.buddyMessages
        } else {
          merged.buddyMessages = merged.buddyMessages
            .filter((msg: any) => msg && typeof msg.id === 'string' && typeof msg.message === 'string')
            .map((msg: any) => ({
              ...msg,
              message: sanitizeString(msg.message, 1000),
            }))
            .slice(0, 100) // Limit to 100 messages
        }
        
        // Validate notifications
        if (!Array.isArray(merged.notifications)) {
          merged.notifications = currentState.notifications
        } else {
          merged.notifications = merged.notifications
            .filter((n: any) => n && typeof n.id === 'string' && typeof n.type === 'string')
            .slice(0, 100)
        }
        
        // Calculate unread count
        merged.unreadCount = Array.isArray(merged.notifications)
          ? merged.notifications.filter((n: any) => !n.read).length
          : 0
        
        // Validate spotlight state
        if (typeof merged.spotlightOpen !== 'boolean') {
          merged.spotlightOpen = currentState.spotlightOpen
        }
        if (typeof merged.spotlightQuery !== 'string') {
          merged.spotlightQuery = currentState.spotlightQuery
        }
        
        // Validate virtual desktops
        if (!Array.isArray(merged.virtualDesktops)) {
          merged.virtualDesktops = currentState.virtualDesktops
        } else {
          merged.virtualDesktops = merged.virtualDesktops
            .filter((d: any) => d && typeof d.id === 'string' && typeof d.name === 'string')
            .slice(0, 10) // Limit to 10 desktops
        }
        
        // Validate active desktop
        if (typeof merged.activeDesktopId !== 'string') {
          merged.activeDesktopId = currentState.activeDesktopId
        } else {
          // Ensure active desktop exists
          const desktopExists = merged.virtualDesktops.some((d: any) => d.id === merged.activeDesktopId)
          if (!desktopExists && merged.virtualDesktops.length > 0) {
            merged.activeDesktopId = merged.virtualDesktops[0].id
          } else if (!desktopExists) {
            merged.activeDesktopId = currentState.activeDesktopId
          }
        }
        
        // Validate file system
        if (!Array.isArray(merged.fileSystem)) {
          merged.fileSystem = currentState.fileSystem
        } else {
          merged.fileSystem = merged.fileSystem
            .filter((f: any) => f && typeof f.id === 'string' && typeof f.name === 'string')
        }
        
        // Validate current path
        if (typeof merged.currentPath !== 'string' && merged.currentPath !== null) {
          merged.currentPath = currentState.currentPath
        }
        
        return merged
      },
    }
  )
)
