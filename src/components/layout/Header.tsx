import { memo, useState, useEffect } from "react"
import { Wrench, House, Hammer, MapPin, SignOut, Users, Receipt, ChartLine, Camera, List, Briefcase, Lightning, Sparkle, X } from "@phosphor-icons/react"
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
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

const HeaderComponent = ({ user, onNavigate, onLogout }: HeaderProps) => {
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg" 
          : "bg-background/80 backdrop-blur-md border-b border-border/30"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.button 
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg group"
            aria-label="Go to home"
          >
            <motion.div 
              className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-200"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Wrench className="text-primary-foreground" size={26} weight="bold" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-bold text-lg leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                FairTradeWorker
              </span>
              <span className="text-xs text-muted-foreground leading-tight font-medium">
                Texas
              </span>
            </div>
          </motion.button>

          <nav className="flex items-center gap-2">
            {!user ? (
              <>
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('login')} 
                  className="min-h-[44px] hover:bg-accent/10"
                >
                  Log In
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => onNavigate('signup')} 
                    className="min-h-[44px] bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-shadow"
                  >
                    <Sparkle weight="fill" className="mr-2" size={18} />
                    Sign Up
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {isMobile ? (
                  <MobileNav user={user} onNavigate={onNavigate} onLogout={onLogout} />
                ) : (
                  <DesktopNav user={user} onNavigate={onNavigate} onLogout={onLogout} />
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

const NavButton = memo(({ onClick, children, variant = "ghost", className = "", icon }: any) => (
  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
    <Button 
      variant={variant}
      onClick={onClick} 
      className={cn("min-h-[44px] relative overflow-hidden group", className)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"
        layoutId="navHover"
      />
      <span className="relative flex items-center gap-2">
        {icon && icon}
        {children}
      </span>
    </Button>
  </motion.div>
))

NavButton.displayName = 'NavButton'

const DesktopNav = memo(({ user, onNavigate, onLogout }: HeaderProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <>
      <div className="flex items-center gap-1">
        {user!.role === 'homeowner' && (
          <>
            <NavButton onClick={() => onNavigate('dashboard')}>
              <ChartLine size={18} weight={hoveredItem === 'dashboard' ? 'fill' : 'regular'} 
                onMouseEnter={() => setHoveredItem('dashboard')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Dashboard
            </NavButton>
            <NavButton onClick={() => onNavigate('my-jobs')}>
              <Briefcase size={18} weight={hoveredItem === 'jobs' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('jobs')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              My Jobs
            </NavButton>
            <NavButton onClick={() => onNavigate('photo-scoper')}>
              <Camera size={18} weight={hoveredItem === 'scoper' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('scoper')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Scoper
            </NavButton>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => onNavigate('post-job')} 
                className="min-h-[44px] bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              >
                <Lightning weight="fill" className="mr-2" size={18} />
                Post Job
              </Button>
            </motion.div>
          </>
        )}
        {user!.role === 'contractor' && (
          <>
            <NavButton onClick={() => onNavigate('browse-jobs')}>
              <Hammer size={18} weight={hoveredItem === 'browse' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('browse')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Browse Jobs
            </NavButton>
            <NavButton onClick={() => onNavigate('dashboard')}>
              <ChartLine size={18} weight={hoveredItem === 'dashboard' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('dashboard')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Dashboard
            </NavButton>
            <NavButton onClick={() => onNavigate('crm')}>
              <Users size={18} weight={hoveredItem === 'crm' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('crm')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              CRM
            </NavButton>
            <NavButton onClick={() => onNavigate('photo-scoper')}>
              <Camera size={18} weight={hoveredItem === 'scoper' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('scoper')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Scoper
            </NavButton>
          </>
        )}
        {user!.role === 'operator' && (
          <>
            <NavButton onClick={() => onNavigate('dashboard')}>
              <ChartLine size={18} weight={hoveredItem === 'dashboard' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('dashboard')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Dashboard
            </NavButton>
            <NavButton onClick={() => onNavigate('territory-map')}>
              <MapPin size={18} weight={hoveredItem === 'territory' ? 'fill' : 'regular'}
                onMouseEnter={() => setHoveredItem('territory')}
                onMouseLeave={() => setHoveredItem(null)}
              />
              Territories
            </NavButton>
          </>
        )}
      </div>
      
      <div className="h-6 w-px bg-border/50 mx-2" />
      
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px] relative">
              <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all hover:ring-primary/40">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                  {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user!.isPro && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkle size={10} weight="fill" className="text-primary-foreground" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-base">{user!.fullName}</p>
              <p className="text-xs text-muted-foreground font-normal">{user!.email}</p>
              {user!.isPro && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md w-fit"
                >
                  <Sparkle size={12} weight="fill" />
                  PRO MEMBER
                </motion.div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onNavigate('dashboard')} className="cursor-pointer py-2.5 rounded-md">
            <ChartLine className="mr-3" size={18} />
            <span className="font-medium">Dashboard</span>
          </DropdownMenuItem>
          {user!.role === 'homeowner' && (
            <>
              <DropdownMenuItem onClick={() => onNavigate('my-jobs')} className="cursor-pointer py-2.5 rounded-md">
                <House className="mr-3" size={18} />
                <span className="font-medium">My Jobs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('photo-scoper')} className="cursor-pointer py-2.5 rounded-md">
                <Camera className="mr-3" size={18} />
                <span className="font-medium">Photo Scoper</span>
              </DropdownMenuItem>
            </>
          )}
          {user!.role === 'contractor' && (
            <>
              <DropdownMenuItem onClick={() => onNavigate('crm')} className="cursor-pointer py-2.5 rounded-md">
                <Users className="mr-3" size={18} />
                <span className="font-medium">CRM</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('invoices')} className="cursor-pointer py-2.5 rounded-md">
                <Receipt className="mr-3" size={18} />
                <span className="font-medium">Invoices</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('photo-scoper')} className="cursor-pointer py-2.5 rounded-md">
                <Camera className="mr-3" size={18} />
                <span className="font-medium">Photo Scoper</span>
              </DropdownMenuItem>
            </>
          )}
          {user!.role === 'operator' && (
            <DropdownMenuItem onClick={() => onNavigate('territory-map')} className="cursor-pointer py-2.5 rounded-md">
              <MapPin className="mr-3" size={18} />
              <span className="font-medium">Territory Map</span>
            </DropdownMenuItem>
          )}
          {user!.isOperator && user!.role !== 'operator' && (
            <DropdownMenuItem onClick={() => onNavigate('revenue-dashboard')} className="cursor-pointer py-2.5 rounded-md">
              <ChartLine className="mr-3" size={18} />
              <span className="font-medium">Revenue Dashboard</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer py-2.5 rounded-md text-destructive focus:text-destructive">
            <SignOut className="mr-3" size={18} />
            <span className="font-medium">Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
})

DesktopNav.displayName = 'DesktopNav'

const MobileNav = memo(({ user, onNavigate, onLogout }: HeaderProps) => {
  const [open, setOpen] = useState(false)

  const handleNavigation = (page: string) => {
    setOpen(false)
    onNavigate(page)
  }

  return (
    <>
      <ThemeToggle />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] relative">
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <List size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent className="w-[85vw] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-1"
              >
                <Avatar className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                    {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <p className="font-bold text-base">{user!.fullName}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user!.email}</p>
                  {user!.isPro && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mt-1"
                    >
                      <Sparkle size={12} weight="fill" />
                      PRO
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </SheetTitle>
          </SheetHeader>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-2 mt-8"
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                variant="outline" 
                onClick={() => handleNavigation('dashboard')} 
                className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
              >
                <ChartLine className="mr-3" size={20} />
                Dashboard
              </Button>
            </motion.div>
            
            {user!.role === 'homeowner' && (
              <>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('my-jobs')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Briefcase className="mr-3" size={20} />
                    My Jobs
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('photo-scoper')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Camera className="mr-3" size={20} />
                    Photo Scoper
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    onClick={() => handleNavigation('post-job')} 
                    className="w-full justify-start h-12 text-base bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                  >
                    <Lightning weight="fill" className="mr-3" size={20} />
                    Post Job
                  </Button>
                </motion.div>
              </>
            )}
            
            {user!.role === 'contractor' && (
              <>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('browse-jobs')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Hammer className="mr-3" size={20} />
                    Browse Jobs
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('crm')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Users className="mr-3" size={20} />
                    CRM
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('invoices')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Receipt className="mr-3" size={20} />
                    Invoices
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('photo-scoper')} 
                    className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Camera className="mr-3" size={20} />
                    Photo Scoper
                  </Button>
                </motion.div>
              </>
            )}
            
            {user!.role === 'operator' && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('territory-map')} 
                  className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                >
                  <MapPin weight="fill" className="mr-3" size={20} />
                  Territory Map
                </Button>
              </motion.div>
            )}
            
            {user!.isOperator && user!.role !== 'operator' && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('revenue-dashboard')} 
                  className="w-full justify-start h-12 text-base hover:bg-primary/5 hover:border-primary/20"
                >
                  <ChartLine className="mr-3" size={20} />
                  Revenue Dashboard
                </Button>
              </motion.div>
            )}
            
            <div className="h-px bg-border my-2" />
            
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }} 
                className="w-full justify-start h-12 text-base"
              >
                <SignOut className="mr-3" size={20} />
                Log Out
              </Button>
            </motion.div>
          </motion.div>
        </SheetContent>
      </Sheet>
    </>
  )
})

MobileNav.displayName = 'MobileNav'

export const Header = memo(HeaderComponent)
Header.displayName = 'Header'
