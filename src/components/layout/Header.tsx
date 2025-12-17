import { memo, useState, useEffect, useCallback } from "react"
import { Wrench, Hammer, MapPin, SignOut, Users, ChartLine, Camera, Briefcase, Lightning, Sparkle, List, Sliders, Gear } from "@phosphor-icons/react"
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
import { useNavigationPreferences } from "@/hooks/useNavigationPreferences"
import { NavigationCustomizerDialog } from "@/components/navigation/NavigationCustomizerDialog"
import { getNavIcon } from "@/lib/types/navigation"
import { getVisibleNavItems } from "@/lib/utils/navigation-utils"

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

const HeaderComponent = ({ user, onNavigate, onLogout }: HeaderProps) => {
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('home')
  const [customizerOpen, setCustomizerOpen] = useState(false)

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
          ? "bg-white dark:bg-black shadow-sm" 
          : "bg-white dark:bg-black"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 relative">
        <div className="flex h-14 items-center justify-between relative">
          <button 
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-md hover:bg-white dark:hover:bg-black transition-all px-2 py-1 flex-shrink-0"
            aria-label="Go to home"
          >
            <span className="font-heading font-bold text-xl md:text-3xl leading-none text-black dark:text-white">
                FairTradeWorker
              </span>
          </button>

          <nav className={cn(
            "flex items-center gap-1.5 md:absolute md:left-1/2 md:transform md:-translate-x-1/2",
            !user && "hidden md:flex"
          )}>
            {!user ? (
              <>
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('login')} 
                  className="min-h-[44px] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => onNavigate('signup')} 
                  className="min-h-[44px] bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 hover:shadow-md shadow-sm transition-all rounded-md"
                >
                  <Sparkle weight="fill" className="mr-2" size={16} />
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {isMobile ? (
                  <MobileNav 
                    user={user} 
                    onNavigate={onNavigate} 
                    onLogout={onLogout} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    onOpenCustomizer={() => setCustomizerOpen(true)}
                  />
                ) : (
                  <DesktopNav 
                    user={user} 
                    onNavigate={onNavigate} 
                    onLogout={onLogout} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    customizerOpen={customizerOpen}
                    onOpenCustomizer={() => setCustomizerOpen(true)}
                    onCloseCustomizer={() => setCustomizerOpen(false)}
                  />
                )}
              </>
            )}
          </nav>
          
          {/* Mobile-only auth buttons */}
          {!user && (
            <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('login')} 
                className="min-h-[44px] hover:bg-black/5 dark:hover:bg-white/5 text-sm px-3"
              >
                Log In
              </Button>
              <Button 
                onClick={() => onNavigate('signup')} 
                className="min-h-[44px] bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 hover:shadow-md shadow-sm transition-all rounded-md text-sm px-3"
              >
                <Sparkle weight="fill" className="mr-1.5" size={14} />
                Sign Up
              </Button>
            </div>
          )}
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
      isActive && "bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 shadow-sm",
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

const DesktopNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab, customizerOpen = false, onOpenCustomizer, onCloseCustomizer }: NavProps) => {
  const { navigation, savePreferences, resetToDefaults } = useNavigationPreferences(user)
  const visibleNav = getVisibleNavItems(navigation)
  
  // Log navigation changes for debugging
  useEffect(() => {
    console.log('[DesktopNav] Navigation updated:', navigation.length, 'items')
  }, [navigation])

  const handleNav = useCallback((page: string, tab: string) => {
    setActiveTab(tab)
    onNavigate(page)
  }, [setActiveTab, onNavigate])

  const handleSavePreferences = useCallback((prefs: any) => {
    console.log('[DesktopNav] Saving preferences:', prefs)
    savePreferences(prefs.items)
    // Force a small delay to ensure localStorage is updated before navigation refreshes
    setTimeout(() => {
      console.log('[DesktopNav] Preferences saved, navigation should update')
    }, 100)
  }, [savePreferences])

  return (
    <>
      <div className="flex items-center gap-0.5">
        {visibleNav.map((item) => {
          const Icon = getNavIcon(item.iconName)
          const isActive = activeTab === item.id || activeTab === item.page
          
          if (item.category === 'action') {
            return (
              <Button
                key={item.id}
                onClick={() => handleNav(item.page, item.id)}
                className="min-h-[44px] ml-1 bg-foreground text-background hover:bg-foreground/90 transition-all font-bold px-4"
              >
                {Icon && <Icon weight="fill" className="mr-1.5" size={16} />}
                {item.label}
              </Button>
            )
          }
          
          return (
            <NavButton
              key={item.id}
              onClick={() => handleNav(item.page, item.id)}
              isActive={isActive}
              icon={Icon ? <Icon size={16} weight={isActive ? 'fill' : 'regular'} /> : undefined}
            >
              {item.label}
            </NavButton>
          )
        })}
      </div>
      
      
      {/* divider removed per request */}
      
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
          {onOpenCustomizer && (
            <>
              <DropdownMenuItem 
                onClick={onOpenCustomizer}
                className="cursor-pointer"
              >
                <Sliders className="mr-2 h-4 w-4" />
                <span>Customize Navigation</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem 
            onClick={() => onNavigate('settings')}
            className="cursor-pointer"
          >
            <Gear className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <SignOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Navigation Customizer Dialog */}
      {customizerOpen && (
        <NavigationCustomizerDialog
          user={user!}
          open={customizerOpen}
          onOpenChange={(open) => {
            if (!open && onCloseCustomizer) {
              onCloseCustomizer()
            }
          }}
          currentNav={navigation}
          onSave={handleSavePreferences}
          onReset={resetToDefaults}
        />
      )}
    </>
  )
})

DesktopNav.displayName = 'DesktopNav'

const MobileNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab, onOpenCustomizer }: NavProps) => {
  const [open, setOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const { navigation, savePreferences, resetToDefaults } = useNavigationPreferences(user)
  const visibleNav = getVisibleNavItems(navigation)
  
  const handleNav = useCallback((page: string, tab: string) => {
    setActiveTab(tab)
    onNavigate(page)
    setOpen(false)
  }, [setActiveTab, onNavigate])

  const handleOpenCustomizerClick = useCallback(() => {
    setOpen(false) // Close mobile menu
    if (onOpenCustomizer) {
      onOpenCustomizer()
    } else {
      setCustomizerOpen(true)
    }
  }, [onOpenCustomizer])

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

            {visibleNav.map((item) => {
              const Icon = getNavIcon(item.iconName)
              const isActive = activeTab === item.id || activeTab === item.page
              
              if (item.category === 'action') {
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleNav(item.page, item.id)}
                    className="justify-start min-h-[44px] bg-foreground text-background hover:bg-foreground/90 mt-2"
                  >
                    {Icon && <Icon size={20} className="mr-3" weight="fill" />}
                    {item.label}
                  </Button>
                )
              }
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  onClick={() => handleNav(item.page, item.id)}
                  className="justify-start min-h-[44px]"
                >
                  {Icon && <Icon size={20} className="mr-3" weight={isActive ? 'fill' : 'regular'} />}
                  {item.label}
                </Button>
              )
            })}

            <SheetClose asChild>
              <Button
                variant="ghost"
                onClick={handleOpenCustomizerClick}
                className="justify-start min-h-[44px] mt-2"
              >
                <Sliders size={20} className="mr-3" />
                Customize Navigation
              </Button>
            </SheetClose>

            <div className="h-px bg-border my-4" />

            <SheetClose asChild>
              <Button
                variant="ghost"
                onClick={() => onNavigate('settings')}
                className="justify-start min-h-[44px]"
              >
                <Gear size={20} className="mr-3" />
                Settings
              </Button>
            </SheetClose>

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
      
      {/* Mobile Navigation Customizer Dialog */}
      <NavigationCustomizerDialog
        user={user!}
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        currentNav={navigation}
        onSave={handleSavePreferences}
        onReset={resetToDefaults}
      />
    </>
  )
})

MobileNav.displayName = 'MobileNav'

export const Header = memo(HeaderComponent)
