import { Wrench, House, Hammer, MapPin, User, SignOut, Users, Receipt } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import type { User as UserType } from "@/lib/types"

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function Header({ user, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur-12 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px]"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-sm">
              <Wrench className="text-primary-foreground" size={24} weight="bold" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-bold text-lg leading-none">FairTradeWorker</span>
              <span className="text-xs text-muted-foreground leading-none">Texas</span>
            </div>
          </button>

          <nav className="flex items-center gap-2">
            {!user ? (
              <>
                <ThemeToggle />
                <Button variant="ghost" onClick={() => onNavigate('login')} className="min-h-[44px]">
                  Log In
                </Button>
                <Button onClick={() => onNavigate('signup')} className="min-h-[44px]">
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {user.role === 'homeowner' && (
                  <>
                    <Button variant="ghost" onClick={() => onNavigate('my-jobs')} className="hidden sm:flex min-h-[44px]">
                      My Jobs
                    </Button>
                    <Button onClick={() => onNavigate('post-job')} className="hidden md:flex min-h-[44px]">
                      <House weight="fill" className="mr-2" />
                      Post Job
                    </Button>
                  </>
                )}
                {user.role === 'contractor' && (
                  <>
                    <Button variant="ghost" onClick={() => onNavigate('browse-jobs')} className="hidden sm:flex min-h-[44px]">
                      Browse Jobs
                    </Button>
                    <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="hidden md:flex min-h-[44px]">
                      <Hammer weight="fill" className="mr-2" />
                      Dashboard
                    </Button>
                  </>
                )}
                {user.role === 'operator' && (
                  <Button variant="ghost" onClick={() => onNavigate('territory-map')} className="hidden sm:flex min-h-[44px]">
                    <MapPin weight="fill" className="mr-2" />
                    Territory Map
                  </Button>
                )}
                
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px]">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.isPro && (
                          <span className="text-xs font-semibold text-primary">PRO MEMBER</span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'homeowner' && (
                      <DropdownMenuItem onClick={() => onNavigate('my-jobs')}>
                        <House className="mr-2" size={16} />
                        My Jobs
                      </DropdownMenuItem>
                    )}
                    {user.role === 'contractor' && (
                      <>
                        <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                          <Hammer className="mr-2" size={16} />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('crm')}>
                          <Users className="mr-2" size={16} />
                          CRM
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('invoices')}>
                          <Receipt className="mr-2" size={16} />
                          Invoices
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === 'operator' && (
                      <DropdownMenuItem onClick={() => onNavigate('territory-map')}>
                        <MapPin className="mr-2" size={16} />
                        Territory Map
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onLogout}>
                      <SignOut className="mr-2" size={16} />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
