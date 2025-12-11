import { Wrench, House, Hammer, MapPin, User, SignOut } from "@phosphor-icons/react"
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
import type { User as UserType } from "@/lib/types"

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function Header({ user, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
              <Wrench className="text-primary-foreground" size={24} weight="bold" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg leading-none">FairTradeWorker</span>
              <span className="text-xs text-muted-foreground leading-none">Texas</span>
            </div>
          </button>

          <nav className="flex items-center gap-2">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => onNavigate('login')}>
                  Log In
                </Button>
                <Button onClick={() => onNavigate('signup')}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {user.role === 'homeowner' && (
                  <>
                    <Button variant="ghost" onClick={() => onNavigate('my-jobs')}>
                      My Jobs
                    </Button>
                    <Button onClick={() => onNavigate('post-job')} className="hidden md:flex">
                      <House weight="fill" className="mr-2" />
                      Post Job
                    </Button>
                  </>
                )}
                {user.role === 'contractor' && (
                  <>
                    <Button variant="ghost" onClick={() => onNavigate('browse-jobs')}>
                      Browse Jobs
                    </Button>
                    <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
                      <Hammer weight="fill" className="mr-2" />
                      Dashboard
                    </Button>
                  </>
                )}
                {user.role === 'operator' && (
                  <Button variant="ghost" onClick={() => onNavigate('territory-map')}>
                    <MapPin weight="fill" className="mr-2" />
                    Territory Map
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
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
                          <span className="text-xs font-semibold text-accent">PRO MEMBER</span>
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
                      <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                        <Hammer className="mr-2" size={16} />
                        Dashboard
                      </DropdownMenuItem>
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
