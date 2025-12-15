/**
 * Dialog wrapper for Navigation Customizer
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NavigationCustomizer } from './NavigationCustomizer'
import { useNavigationPreferences } from '@/hooks/useNavigationPreferences'
import type { User } from '@/lib/types'
import type { NavigationPreferences } from '@/lib/types/navigation'

interface NavigationCustomizerDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNav?: any[]  // Optional - will use hook if not provided
  onSave?: (preferences: NavigationPreferences) => void
  onReset?: () => void
}

export function NavigationCustomizerDialog({
  user,
  open,
  onOpenChange,
  currentNav: propNav,
  onSave: propOnSave,
  onReset: propOnReset
}: NavigationCustomizerDialogProps) {
  const { navigation, savePreferences, resetToDefaults } = useNavigationPreferences(user)
  
  const currentNav = propNav || navigation
  const handleSave = (prefs: NavigationPreferences) => {
    if (propOnSave) {
      propOnSave(prefs)
    } else {
      savePreferences(prefs.items)
    }
    onOpenChange(false)
  }
  
  const handleReset = () => {
    if (propOnReset) {
      propOnReset()
    } else {
      resetToDefaults()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-black dark:border-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Customize Navigation</DialogTitle>
        </DialogHeader>
        <NavigationCustomizer
          user={user}
          currentNav={currentNav}
          onSave={handleSave}
          onReset={handleReset}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
