import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  VoidStore,
  VoidWindow,
  VoidIcon,
  GridPosition,
  BackgroundConfig,
  VoidTheme,
  SpotifyState,
  BuddyState,
  VoiceState,
  ExtractedEntities,
} from './types'
import { GRID_CONFIG, WINDOW_CONFIG } from './config'

// Default background
const defaultBackground: BackgroundConfig = {
  type: 'default',
  brightness: 1,
  contrast: 1,
  overlayOpacity: 0.3,
}

// Default Spotify state
const defaultSpotifyState: SpotifyState = {
  connected: false,
  service: 'spotify',
  playing: false,
  currentTrack: null,
  queue: [],
  volume: 0.7,
  shuffle: false,
  repeat: 'off',
  expanded: false,
  position: null,
}

// Default Buddy state
const defaultBuddyState: BuddyState = {
  emotion: 'neutral',
  collapsed: false,
  position: { x: 20, y: 20 }, // Top-left default
  messages: [],
}

// Generate default icon positions (20 menu icons in a grid)
const generateDefaultIcons = (): { icons: VoidIcon[]; positions: Record<string, GridPosition> } => {
  const menuIds = [
    'customers', 'leads', 'ai', 'automation', 'integrations',
    'sales', 'pipeline', 'social-media', 'analytics', 'contacts',
    'workflows', 'marketing', 'email', 'billing', 'documents',
    'events', 'settings', 'support', 'calendar', 'marketplace'
  ]
  
  const icons: VoidIcon[] = []
  const positions: Record<string, GridPosition> = {}
  
  // Place icons in a grid starting at (10, 10)
  const startX = 10
  const startY = 10
  const spacing = 20 // Grid units between icons
  const cols = 5
  
  menuIds.forEach((menuId, index) => {
    const x = startX + (index % cols) * spacing
    const y = startY + Math.floor(index / cols) * spacing
    
    const label = menuId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    icons.push({
      id: `icon-${menuId}`,
      menuId,
      type: 'menu',
      label,
      icon: () => null, // Will be resolved by component using iconMap
      position: { x, y },
      size: GRID_CONFIG.iconSize,
      pinned: false,
      hidden: false,
    })
    
    positions[`icon-${menuId}`] = { x, y }
  })
  
  return { icons, positions }
}

const { icons: defaultIcons, positions: defaultPositions } = generateDefaultIcons()

export const useVoidStore = create<VoidStore>()(
  persist(
    (set, get) => ({
      // Windows
      windows: [],
      activeWindowId: null,
      nextZIndex: 1000,
      
      // Desktop
      icons: defaultIcons,
      iconPositions: defaultPositions,
      pinnedIcons: [],
      hiddenIcons: [],
      
      // Background
      background: defaultBackground,
      backgroundHistory: [],
      
      // Theme
      theme: 'dark',
      
      // Spotify
      spotifyState: defaultSpotifyState,
      spotifyConnected: false,
      
      // Buddy
      buddyState: defaultBuddyState,
      
      // Voice
      voiceState: 'idle',
      voicePermission: 'prompt',
      extractedEntities: null,
      
      // Boot
      bootComplete: false,
      
      // Window Actions
      openWindow: (menuId: string) => {
        const state = get()
        const existingWindow = state.windows.find(w => w.menuId === menuId && !w.minimized)
        
        if (existingWindow) {
          // Focus existing window
          set({
            activeWindowId: existingWindow.id,
            windows: state.windows.map(w =>
              w.id === existingWindow.id
                ? { ...w, zIndex: state.nextZIndex, minimized: false }
                : w
            ),
            nextZIndex: state.nextZIndex + 1,
          })
        } else {
          // Create new window
          const newWindow: VoidWindow = {
            id: `window-${menuId}-${Date.now()}`,
            menuId,
            title: menuId.charAt(0).toUpperCase() + menuId.slice(1).replace(/-/g, ' '),
            position: {
              x: Math.max(0, (window.innerWidth - WINDOW_CONFIG.defaultSize.width) / 2),
              y: Math.max(0, (window.innerHeight - WINDOW_CONFIG.defaultSize.height) / 2),
            },
            size: WINDOW_CONFIG.defaultSize,
            minimized: false,
            maximized: false,
            zIndex: state.nextZIndex,
            content: null, // Will be set by component
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
          activeWindowId: get().windows.find(w => w.id === id && w.id !== get().activeWindowId)
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
                  position: !w.maximized
                    ? { x: 0, y: 0 }
                    : {
                        x: Math.max(0, (window.innerWidth - WINDOW_CONFIG.defaultSize.width) / 2),
                        y: Math.max(0, (window.innerHeight - WINDOW_CONFIG.defaultSize.height) / 2),
                      },
                  size: !w.maximized
                    ? { width: window.innerWidth, height: window.innerHeight }
                    : WINDOW_CONFIG.defaultSize,
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
            w.id === id
              ? { ...w, zIndex: state.nextZIndex }
              : w
          ),
          nextZIndex: state.nextZIndex + 1,
        })
      },
      
      // Icon Actions
      updateIconPosition: (id: string, position: GridPosition) => {
        set({
          iconPositions: {
            ...get().iconPositions,
            [id]: position,
          },
        })
      },
      
      pinIcon: (id: string) => {
        set({
          pinnedIcons: [...get().pinnedIcons, id],
        })
      },
      
      unpinIcon: (id: string) => {
        set({
          pinnedIcons: get().pinnedIcons.filter(i => i !== id),
        })
      },
      
      hideIcon: (id: string) => {
        set({
          hiddenIcons: [...get().hiddenIcons, id],
        })
      },
      
      showIcon: (id: string) => {
        set({
          hiddenIcons: get().hiddenIcons.filter(i => i !== id),
        })
      },
      
      // Background Actions
      setBackground: (background: BackgroundConfig) => {
        const state = get()
        set({
          background,
          backgroundHistory: [...state.backgroundHistory.slice(-9), background], // Keep last 10
        })
      },
      
      // Theme Actions
      setTheme: (theme: VoidTheme) => {
        set({ theme })
        // Update CSS variables
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },
      
      // Spotify Actions
      setSpotifyState: (state: Partial<SpotifyState>) => {
        set({
          spotifyState: {
            ...get().spotifyState,
            ...state,
          },
        })
      },
      
      // Buddy Actions
      setBuddyState: (state: Partial<BuddyState>) => {
        set({
          buddyState: {
            ...get().buddyState,
            ...state,
          },
        })
      },
      
      // Voice Actions
      setVoiceState: (state: VoiceState) => {
        set({ voiceState: state })
      },
      
      setVoicePermission: (permission: 'granted' | 'denied' | 'prompt') => {
        set({ voicePermission: permission })
      },
      
      setExtractedEntities: (entities: ExtractedEntities | null) => {
        set({ extractedEntities: entities })
      },
      
      // Boot Actions
      completeBoot: () => {
        set({ bootComplete: true })
      },
    }),
    {
      name: 'void-crm-storage',
      partialize: (state) => ({
        // Persist only essential state
        iconPositions: state.iconPositions,
        pinnedIcons: state.pinnedIcons,
        hiddenIcons: state.hiddenIcons,
        background: state.background,
        theme: state.theme,
        spotifyState: state.spotifyState,
        buddyState: state.buddyState,
        bootComplete: state.bootComplete,
      }),
    }
  )
)
