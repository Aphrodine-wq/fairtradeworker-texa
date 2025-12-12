import { memo, useState, useEffect, useCallback } from "react"
import { Wrench, Hammer, MapPin, SignOut, Users, ChartLine, Camera, Briefcase, Lightning, Sparkle, List } from "@phosphor-icons/react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

const HeaderComponent = ({ user, onNavigate, onLogout }: HeaderProps) => {
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('home')

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleHomeClick = useCallback(() => {
    onNavigate('home')
    setActiveTab('home')
  }, [onNavigate])

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-150",
        scrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" 
          : "bg-background/90 backdrop-blur-sm border-b border-border/50"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-14 items-center justify-between">
          <button 
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg hover:opacity-90 transition-opacity px-2 py-1"
            aria-label="Go to home"
          >
            <div className="flex items-center justify-center w-9 h-9 bg-foreground rounded-lg shadow-sm">
              <Wrench className="text-background" size={20} weight="bold" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-heading font-bold text-base leading-none text-foreground">
                FairTradeWorker
              </span>
              <span className="text-[10px] text-muted-foreground leading-none font-semibold tracking-wide mt-0.5">
                HOME SERVICES
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-1.5">
            {!user ? (
              <>
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('login')} 
                  className="min-h-[44px] hover:bg-muted font-semibold"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => onNavigate('signup')} 
                  className="min-h-[44px] bg-foreground text-background hover:bg-foreground/90 transition-all font-bold"
                >
                  <Sparkle weight="fill" className="mr-2" size={16} />
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {isMobile ? (
                  <MobileNav user={user} onNavigate={onNavigate} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
                ) : (
                  <DesktopNav user={user} onNavigate={onNavigate} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

interface NavProps extends HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const NavButton = memo(({ onClick, children, variant = "ghost", className = "", icon, isActive = false }: any) => (
  <Button 
    variant={variant}
    onClick={onClick} 
    className={cn(
      "min-h-[44px] relative transition-all font-semibold px-3",
      isActive && "bg-foreground/10 text-foreground",
      className
    )}
  >
    <span className="flex items-center gap-1.5">
      {icon && icon}
      {children}
    </span>
  </Button>
))

NavButton.displayName = 'NavButton'

const DesktopNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab }: NavProps) => {
  const handleNav = useCallback((page: string, tab: string) => {
    setActiveTab(tab)
    onNavigate(page)
  }, [setActiveTab, onNavigate])

  return (
    <>
      <div className="flex items-center gap-0.5">
        {user!.role === 'homeowner' && (
          <>
            <NavButton 
              onClick={() => handleNav('dashboard', 'dashboard')} 
              isActive={activeTab === 'dashboard'}
              icon={<ChartLine size={16} weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />}
            >
              Dashboard
            </NavButton>
            <NavButton 
              onClick={() => handleNav('my-jobs', 'jobs')} 
              isActive={activeTab === 'jobs'}
              icon={<Briefcase size={16} weight={activeTab === 'jobs' ? 'fill' : 'regular'} />}
            >
              My Jobs
            </NavButton>
            <NavButton 
              onClick={() => handleNav('free-tools', 'tools')} 
              isActive={activeTab === 'tools'}
              icon={<Sparkle size={16} weight={activeTab === 'tools' ? 'fill' : 'regular'} />}
            >
              Free Tools
            </NavButton>
            <NavButton 
              onClick={() => handleNav('photo-scoper', 'scoper')} 
              isActive={activeTab === 'scoper'}
              icon={<Camera size={16} weight={activeTab === 'scoper' ? 'fill' : 'regular'} />}
            >
              Scoper
            </NavButton>
            <Button 
              onClick={() => handleNav('post-job', 'post')} 
              className="min-h-[44px] ml-1 bg-foreground text-background hover:bg-foreground/90 transition-all font-bold px-4"
            >
              <Lightning weight="fill" className="mr-1.5" size={16} />
              Post Job
            </Button>
          </>
        )}
        {user!.role === 'contractor' && (
          <>
            <NavButton 
              onClick={() => handleNav('browse-jobs', 'browse')} 
              isActive={activeTab === 'browse'}
              icon={<Hammer size={16} weight={activeTab === 'browse' ? 'fill' : 'regular'} />}
            >
              Browse
            </NavButton>
            <NavButton 
              onClick={() => handleNav('dashboard', 'dashboard')} 
              isActive={activeTab === 'dashboard'}
              icon={<ChartLine size={16} weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />}
            >
              Dashboard
            </NavButton>
            <NavButton 
              onClick={() => handleNav('crm', 'crm')} 
              isActive={activeTab === 'crm'}
              icon={<Users size={16} weight={activeTab === 'crm' ? 'fill' : 'regular'} />}
            >
              CRM
            </NavButton>
            <NavButton 
              onClick={() => handleNav('free-tools', 'tools')} 
              isActive={activeTab === 'tools'}
              icon={<Sparkle size={16} weight={activeTab === 'tools' ? 'fill' : 'regular'} />}
            >
              Free Tools
            </NavButton>
            <NavButton 
              onClick={() => handleNav('photo-scoper', 'scoper')} 
              isActive={activeTab === 'scoper'}
              icon={<Camera size={16} weight={activeTab === 'scoper' ? 'fill' : 'regular'} />}
            >
              Scoper
            </NavButton>
          </>
        )}
        {user!.role === 'operator' && (
          <>
            <NavButton 
              onClick={() => handleNav('dashboard', 'dashboard')} 
              isActive={activeTab === 'dashboard'}
              icon={<ChartLine size={16} weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />}
            >
              Dashboard
            </NavButton>
            <NavButton 
              onClick={() => handleNav('browse-jobs', 'jobs')} 
              isActive={activeTab === 'jobs'}
              icon={<Briefcase size={16} weight={activeTab === 'jobs' ? 'fill' : 'regular'} />}
            >
              Browse Jobs
            </NavButton>
            <NavButton 
              onClick={() => handleNav('territory-map', 'territory')} 
              isActive={activeTab === 'territory'}
              icon={<MapPin size={16} weight={activeTab === 'territory' ? 'fill' : 'regular'} />}
            >
              Territories
            </NavButton>
          </>
        )}
      </div>
      
      <div className="h-5 w-px bg-border/50 mx-1.5" />
      
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px] hover:bg-muted">
            <Avatar className="ring-2 ring-foreground/20 ring-offset-1 ring-offset-background transition-all hover:ring-foreground/40">
              <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user!.isPro && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-foreground rounded-full border-2 border-background flex items-center justify-center">
                <Sparkle size={8} weight="fill" className="text-background" />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-base">{user!.fullName}</p>
              <p className="text-xs text-muted-foreground font-normal">{user!.email}</p>
              {user!.isPro && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-foreground/10 px-2 py-1 rounded-md w-fit">
                  <Sparkle size={12} weight="fill" />
                  PRO MEMBER
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <SignOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
})

DesktopNav.displayName = 'DesktopNav'

const MobileNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab }: NavProps) => {
  const [open, setOpen] = useState(false)
  
  const handleNav = useCallback((page: string, tab: string) => {
    setActiveTab(tab)
    onNavigate(page)
    setOpen(false)
  }, [setActiveTab, onNavigate])

  return (
    <>
      <ThemeToggle />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
            <List size={24} weight="bold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-6">
            <div className="flex items-center gap-3 p-3 border rounded-lg mb-4">
              <Avatar className="ring-2 ring-foreground/20">
                <AvatarFallback className="bg-foreground text-background font-bold">
                  {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <p className="font-semibold text-sm">{user!.fullName}</p>
                <p className="text-xs text-muted-foreground">{user!.email}</p>
              </div>
              {user!.isPro && (
                <div className="flex items-center gap-1 text-xs font-bold text-foreground bg-foreground/10 px-2 py-1 rounded">
                  <Sparkle size={10} weight="fill" />
                  PRO
                </div>
              )}
            </div>

            {user!.role === 'homeowner' && (
              <>
                <Button 
                  variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('dashboard', 'dashboard')}
                  className="justify-start min-h-[44px]"
                >
                  <ChartLine size={20} className="mr-3" weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === 'jobs' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('my-jobs', 'jobs')}
                  className="justify-start min-h-[44px]"
                >
                  <Briefcase size={20} className="mr-3" weight={activeTab === 'jobs' ? 'fill' : 'regular'} />
                  My Jobs
                </Button>
                <Button 
                  variant={activeTab === 'tools' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('free-tools', 'tools')}
                  className="justify-start min-h-[44px]"
                >
                  <Sparkle size={20} className="mr-3" weight={activeTab === 'tools' ? 'fill' : 'regular'} />
                  Free Tools
                </Button>
                <Button 
                  variant={activeTab === 'scoper' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('photo-scoper', 'scoper')}
                  className="justify-start min-h-[44px]"
                >
                  <Camera size={20} className="mr-3" weight={activeTab === 'scoper' ? 'fill' : 'regular'} />
                  Photo Scoper
                </Button>
                <Button 
                  onClick={() => handleNav('post-job', 'post')}
                  className="justify-start min-h-[44px] bg-foreground text-background hover:bg-foreground/90 mt-2"
                >
                  <Lightning size={20} className="mr-3" weight="fill" />
                  Post New Job
                </Button>
              </>
            )}

            {user!.role === 'contractor' && (
              <>
                <Button 
                  variant={activeTab === 'browse' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('browse-jobs', 'browse')}
                  className="justify-start min-h-[44px]"
                >
                  <Hammer size={20} className="mr-3" weight={activeTab === 'browse' ? 'fill' : 'regular'} />
                  Browse Jobs
                </Button>
                <Button 
                  variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('dashboard', 'dashboard')}
                  className="justify-start min-h-[44px]"
                >
                  <ChartLine size={20} className="mr-3" weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === 'crm' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('crm', 'crm')}
                  className="justify-start min-h-[44px]"
                >
                  <Users size={20} className="mr-3" weight={activeTab === 'crm' ? 'fill' : 'regular'} />
                  CRM
                </Button>
                <Button 
                  variant={activeTab === 'tools' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('free-tools', 'tools')}
                  className="justify-start min-h-[44px]"
                >
                  <Sparkle size={20} className="mr-3" weight={activeTab === 'tools' ? 'fill' : 'regular'} />
                  Free Tools
                </Button>
                <Button 
                  variant={activeTab === 'scoper' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('photo-scoper', 'scoper')}
                  className="justify-start min-h-[44px]"
                >
                  <Camera size={20} className="mr-3" weight={activeTab === 'scoper' ? 'fill' : 'regular'} />
                  Photo Scoper
                </Button>
              </>
            )}

            {user!.role === 'operator' && (
              <>
                <Button 
                  variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('dashboard', 'dashboard')}
                  className="justify-start min-h-[44px]"
                >
                  <ChartLine size={20} className="mr-3" weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === 'territory' ? 'secondary' : 'ghost'} 
                  onClick={() => handleNav('territory-map', 'territory')}
                  className="justify-start min-h-[44px]"
                >
                  <MapPin size={20} className="mr-3" weight={activeTab === 'territory' ? 'fill' : 'regular'} />
                  Territory Map
                </Button>
              </>
            )}

            <div className="h-px bg-border my-4" />
            
            <Button 
              variant="ghost" 
              onClick={onLogout}
              className="justify-start min-h-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <SignOut size={20} className="mr-3" />
              Log Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
})

MobileNav.displayName = 'MobileNav'

export const Header = memo(HeaderComponent)
