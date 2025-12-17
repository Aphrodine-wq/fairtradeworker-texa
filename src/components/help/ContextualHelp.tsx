import { Question } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContextualHelpProps {
  content: string
  articleId?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function ContextualHelp({ content, articleId, position = 'top' }: ContextualHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Question size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-xs">
          <p className="text-sm">{content}</p>
          {articleId && (
            <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-primary">
              Learn more
            </Button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
