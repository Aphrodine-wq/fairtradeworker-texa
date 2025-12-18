import { memo } from "react"
import { CaretRight, House } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

interface BreadcrumbItem {
  label: string
  page?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (page: string) => void
  className?: string
}

const BreadcrumbComponent = ({ items, onNavigate, className }: BreadcrumbProps) => {
  if (items.length === 0) return null

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground/60",
        className
      )}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isClickable = !isLast && item.page

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <CaretRight 
                  size={10} 
                  weight="bold" 
                  className="text-muted-foreground/30" 
                  aria-hidden="true"
                />
              )}
              
              {isClickable ? (
                <motion.button
                  onClick={() => onNavigate(item.page!)}
                  whileHover={{ opacity: 0.7 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-0.5 px-1 py-0.5 rounded transition-colors text-muted-foreground/70 hover:text-foreground/80 font-normal group"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && (
                    <span className="text-muted-foreground/50 group-hover:text-foreground/70 transition-colors">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-xs">{item.label}</span>
                </motion.button>
              ) : (
                <span 
                  className={cn(
                    "flex items-center gap-0.5 px-1 py-0.5 text-xs",
                    isLast 
                      ? "text-foreground/70 font-medium" 
                      : "text-muted-foreground/60 font-normal"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && (
                    <span className={isLast ? "text-foreground/60" : "text-muted-foreground/40"}>
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export const Breadcrumb = memo(BreadcrumbComponent)

export function getBreadcrumbs(
  page: string,
  user: User | null,
  extras?: { jobTitle?: string; contractorName?: string }
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  const homeIcon = <House size={14} weight="fill" />

  switch (page) {
    case 'home':
      breadcrumbs.push({ label: 'Home', icon: homeIcon })
      break

    case 'login':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Login' }
      )
      break

    case 'signup':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Sign Up' }
      )
      break

    case 'dashboard':
      if (user) {
        breadcrumbs.push(
          { label: 'Home', page: 'home', icon: homeIcon },
          { label: 'Dashboard' }
        )
      }
      break

    case 'post-job':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Post Job' }
      )
      break

    case 'my-jobs':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'My Jobs' }
      )
      break

    case 'browse-jobs':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Browse Jobs' }
      )
      break

    case 'crm':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Void' }
      )
      break

    case 'invoices':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Invoices' }
      )
      break

    case 'pro-upgrade':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Pro Upgrade' }
      )
      break

    case 'territory-map':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Territory Map' }
      )
      break

    case 'revenue-dashboard':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Revenue Dashboard' }
      )
      break

    case 'project-milestones':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'My Jobs', page: 'my-jobs' },
        { label: extras?.jobTitle || 'Project Milestones' }
      )
      break

    case 'photo-scoper':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Photo Scoper' }
      )
      break

    case 'pricing':
      breadcrumbs.push(
        { label: 'Home', page: 'home', icon: homeIcon },
        { label: 'Pricing' }
      )
      break

    default:
      breadcrumbs.push({ label: 'Home', icon: homeIcon })
  }

  return breadcrumbs
}
