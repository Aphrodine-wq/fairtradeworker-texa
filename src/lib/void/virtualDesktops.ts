/**
 * VOID OS Virtual Desktops
 * Multiple desktop workspaces with window assignment
 */

export interface VirtualDesktop {
  id: string
  name: string
  windows: string[] // window IDs
  wallpaper?: string
  createdAt: number
}

/**
 * Create a new virtual desktop
 */
export function createDesktop(name: string): VirtualDesktop {
  return {
    id: `desktop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name,
    windows: [],
    createdAt: Date.now(),
  }
}

/**
 * Get default desktops
 */
export function getDefaultDesktops(): VirtualDesktop[] {
  return [
    createDesktop('Desktop 1'),
    createDesktop('Desktop 2'),
    createDesktop('Desktop 3'),
  ]
}

/**
 * Switch to a desktop
 */
export function switchDesktop(
  desktopId: string,
  desktops: VirtualDesktop[],
  currentDesktopId: string
): string {
  // Validate desktop exists
  const desktop = desktops.find(d => d.id === desktopId)
  if (!desktop) {
    return currentDesktopId
  }
  return desktopId
}

/**
 * Move window to desktop
 */
export function moveWindowToDesktop(
  windowId: string,
  targetDesktopId: string,
  desktops: VirtualDesktop[]
): VirtualDesktop[] {
  return desktops.map(desktop => {
    // Remove window from all desktops
    const windows = desktop.windows.filter(id => id !== windowId)
    
    // Add to target desktop
    if (desktop.id === targetDesktopId && !windows.includes(windowId)) {
      return {
        ...desktop,
        windows: [...windows, windowId],
      }
    }
    
    return {
      ...desktop,
      windows,
    }
  })
}

/**
 * Get windows for a desktop
 */
export function getDesktopWindows(
  desktopId: string,
  desktops: VirtualDesktop[],
  allWindows: Array<{ id: string }>
): Array<{ id: string }> {
  const desktop = desktops.find(d => d.id === desktopId)
  if (!desktop) {
    return []
  }
  
  return allWindows.filter(w => desktop.windows.includes(w.id))
}
