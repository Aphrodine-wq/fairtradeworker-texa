import { memo, useState, useEffect } from "react"
import { Wrench, House, Hammer, MapPin, SignOut, Users, Receipt, ChartLine, Camera, List, Briefcase, Lightning, Sparkle, X, CaretDown } from "@phosphor-icons/react"
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
  const [activeTab, setActiveTab] = useState<string>('home')

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
        "fixed top-0 z-50 w-full transition-all duration-200",
        scrolled 
          ? "bg-background/98 backdrop-blur-2xl border-b border-border/60 shadow-2xl shadow-primary/5" 
          : "bg-background/85 backdrop-blur-xl border-b border-border/40"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-14 items-center justify-between">
          <motion.button 
            onClick={() => {
              onNavigate('home')
              setActiveTab('home')
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl group relative overflow-hidden px-2 py-1"
            aria-label="Go to home"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"
            />
            <motion.div 
              className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-sm group-hover:shadow-md transition-all"
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Wrench className="text-white" size={20} weight="bold" />
            </motion.div>
            <div className="hidden sm:flex flex-col items-start relative">
              <span className="font-heading font-bold text-base leading-none bg-gradient-to-r from-blue-600 via-gray-900 to-blue-600 bg-clip-text text-transparent">
                FairTradeWorker
              </span>
              <span className="text-[10px] text-muted-foreground/80 leading-none font-semibold tracking-wide mt-0.5">
                HOME SERVICES
              </span>
            </div>
          </motion.button>

          <nav className="flex items-center gap-1.5">
            {!user ? (
              <>
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('login')} 
                  className="min-h-[44px] hover:bg-muted/60 font-semibold"
                >
                  Log In
                </Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button 
                    onClick={() => onNavigate('signup')} 
                    className="min-h-[44px] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:shadow-md hover:shadow-blue-500/30 transition-all font-bold relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <Sparkle weight="fill" className="mr-2 relative z-10" size={16} />
                    <span className="relative z-10">Sign Up</span>
                  </Button>
                </motion.div>
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
    </motion.header>
  )
}

interface NavProps extends HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const NavButton = memo(({ onClick, children, variant = "ghost", className = "", icon, isActive = false }: any) => (
  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
    <Button 
      variant={variant}
      onClick={onClick} 
      className={
        "min-h-[44px] relative overflow-hidden group transition-all font-semibold px-3",
        isActive && "bg-blue-50 text-blue-600",
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-blue-50 rounded-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon && icon}
        {children}
      </span>
    </Button>
  </motion.div>
))

NavButton.displayName = 'NavButton'

const DesktopNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab }: NavProps) => {
  const handleNav = (page: string, tab: string) => {
    setActiveTab(tab)
    onNavigate(page)
  }

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
              onClick={() => handleNav('photo-scoper', 'scoper')} 
              isActive={activeTab === 'scoper'}
              icon={<Camera size={16} weight={activeTab === 'scoper' ? 'fill' : 'regular'} />}
            >
              Scoper
            </NavButton>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="ml-1">
              <Button 
                onClick={() => handleNav('post-job', 'post')} 
                className="min-h-[44px] bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-md transition-all font-bold relative overflow-hidden group px-4"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <Lightning weight="fill" className="mr-1.5 relative z-10" size={16} />
                <span className="relative z-10">Post Job</span>
              </Button>
            </motion.div>
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
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px] relative hover:bg-muted/60">
              <Avatar className="ring-2 ring-blue-500/20 ring-offset-1 ring-offset-background transition-all hover:ring-blue-500/40">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-sm">
                  {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user!.isPro && (
                <motion.div 
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkle size={8} weight="fill" className="text-white" />
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit"
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

const MobileNav = memo(({ user, onNavigate, onLogout, activeTab, setActiveTab }: NavProps) => {
  const [open, setOpen] = useState(false)

  const handleNavigation = (page: string, tab: string) => {
    setOpen(false)
    setActiveTab(tab)
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
                <Avatar className="ring-2 ring-blue-500/20 ring-offset-2 ring-offset-background w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg">
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
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-1"
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
                onClick={() => handleNavigation('dashboard', 'dashboard')} 
                className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
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
                    onClick={() => handleNavigation('my-jobs', 'jobs')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Briefcase className="mr-3" size={20} />
                    My Jobs
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('photo-scoper', 'scoper')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Camera className="mr-3" size={20} />
                    Scope Generator
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    onClick={() => handleNavigation('post-job', 'post')} 
                    className="w-full justify-start h-12 text-base bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg"
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
                    onClick={() => handleNavigation('browse-jobs', 'browse')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Hammer className="mr-3" size={20} />
                    Browse Jobs
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('crm', 'crm')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Users className="mr-3" size={20} />
                    CRM
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('invoices', 'invoices')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Receipt className="mr-3" size={20} />
                    Invoices
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('photo-scoper', 'scoper')} 
                    className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Camera className="mr-3" size={20} />
                    Scope Generator
                  </Button>
                </motion.div>
              </>
            )}
            
            {user!.role === 'operator' && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('territory-map', 'territory')} 
                  className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
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
                  onClick={() => handleNavigation('revenue-dashboard', 'revenue')} 
                  className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-200"
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
