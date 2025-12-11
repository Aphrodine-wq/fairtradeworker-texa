import { Info, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DemoModeBannerProps {
  userName: string
  userRole: string
}

export function DemoModeBanner({ userName, userRole }: DemoModeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-primary border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-4 py-3 min-h-[48px]">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-foreground/10 flex-shrink-0">
              <Info weight="fill" size={18} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <p className="text-sm font-semibold text-primary-foreground">
                Demo Mode Active
              </p>
              <p className="text-xs md:text-sm text-primary-foreground/90">
                Exploring as <span className="font-medium">{userName}</span> ({userRole})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-primary-foreground/10 text-primary-foreground min-w-[44px] min-h-[44px]"
            onClick={() => setIsVisible(false)}
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
