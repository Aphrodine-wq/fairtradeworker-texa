// Placeholder - Will be implemented in Phase 4 of desktop system
export function VoidToolbar({ user, onNavigate }: { user: any; onNavigate?: (page: string) => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[var(--void-surface)] border-b border-[var(--void-border)] z-50 flex items-center justify-between px-4">
      <div className="text-xl font-bold" style={{ fontFamily: 'var(--void-font-display)' }}>
        VOID
      </div>
      <div className="text-sm text-[var(--void-text-muted)]">
        {user?.fullName || 'User'}
      </div>
    </div>
  )
}
