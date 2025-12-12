import { memo } from "react"
import { Wrench, House, Hammer, MapPin, SignOut, Users, Receipt, ChartLine, Camera, List } from "@phosphor-icons/react"
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

interface HeaderProps {
  user: UserType | null
  onNavigate: (page: string) => void
  onLogout: () => void
}

const HeaderComponent = ({ user, onNavigate, onLogout }: HeaderProps) => {
  const isMobile = useIsMobile()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-100 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="Go to home"
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
    </header>
  )
}

const DesktopNav = memo(({ user, onNavigate, onLogout }: HeaderProps) => (
  <>
    {user!.role === 'homeowner' && (
      <>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="min-h-[44px]">
          Dashboard
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('my-jobs')} className="min-h-[44px]">
          My Jobs
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('photo-scoper')} className="min-h-[44px]">
          <Camera className="mr-2" size={18} />
          Photo Scoper
        </Button>
        <Button onClick={() => onNavigate('post-job')} className="min-h-[44px]">
          <House weight="fill" className="mr-2" />
          Post Job
        </Button>
      </>
    )}
    {user!.role === 'contractor' && (
      <>
        <Button variant="ghost" onClick={() => onNavigate('browse-jobs')} className="min-h-[44px]">
          Browse Jobs
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('photo-scoper')} className="min-h-[44px]">
          <Camera className="mr-2" size={18} />
          Photo Scoper
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="min-h-[44px]">
          <Hammer weight="fill" className="mr-2" />
          Dashboard
        </Button>
      </>
    )}
    {user!.role === 'operator' && (
      <>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="min-h-[44px]">
          Dashboard
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('territory-map')} className="min-h-[44px]">
          <MapPin weight="fill" className="mr-2" />
          Territory Map
        </Button>
      </>
    )}
    
    <ThemeToggle />
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px]">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{user!.fullName}</p>
            <p className="text-xs text-muted-foreground">{user!.email}</p>
            {user!.isPro && (
              <span className="text-xs font-semibold text-primary">PRO MEMBER</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
          <ChartLine className="mr-2" size={16} />
          Dashboard
        </DropdownMenuItem>
        {user!.role === 'homeowner' && (
          <>
            <DropdownMenuItem onClick={() => onNavigate('my-jobs')}>
              <House className="mr-2" size={16} />
              My Jobs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('photo-scoper')}>
              <Camera className="mr-2" size={16} />
              Photo Scoper
            </DropdownMenuItem>
          </>
        )}
        {user!.role === 'contractor' && (
          <>
            <DropdownMenuItem onClick={() => onNavigate('crm')}>
              <Users className="mr-2" size={16} />
              CRM
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('invoices')}>
              <Receipt className="mr-2" size={16} />
              Invoices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('photo-scoper')}>
              <Camera className="mr-2" size={16} />
              Photo Scoper
            </DropdownMenuItem>
          </>
        )}
        {user!.role === 'operator' && (
          <DropdownMenuItem onClick={() => onNavigate('territory-map')}>
            <MapPin className="mr-2" size={16} />
            Territory Map
          </DropdownMenuItem>
        )}
        {user!.isOperator && user!.role !== 'operator' && (
          <DropdownMenuItem onClick={() => onNavigate('revenue-dashboard')}>
            <ChartLine className="mr-2" size={16} />
            Revenue Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <SignOut className="mr-2" size={16} />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
))

DesktopNav.displayName = 'DesktopNav'

const MobileNav = memo(({ user, onNavigate, onLogout }: HeaderProps) => (
  <>
    <ThemeToggle />
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
          <List size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user!.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="font-semibold">{user!.fullName}</p>
                <p className="text-xs text-muted-foreground">{user!.email}</p>
                {user!.isPro && (
                  <span className="text-xs font-semibold text-primary mt-1">PRO MEMBER</span>
                )}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          <Button variant="outline" onClick={() => onNavigate('dashboard')} className="w-full justify-start">
            <ChartLine className="mr-2" size={18} />
            Dashboard
          </Button>
          {user!.role === 'homeowner' && (
            <>
              <Button variant="outline" onClick={() => onNavigate('my-jobs')} className="w-full justify-start">
                <House className="mr-2" size={18} />
                My Jobs
              </Button>
              <Button variant="outline" onClick={() => onNavigate('photo-scoper')} className="w-full justify-start">
                <Camera className="mr-2" size={18} />
                Photo Scoper
              </Button>
              <Button onClick={() => onNavigate('post-job')} className="w-full justify-start">
                <House weight="fill" className="mr-2" />
                Post Job
              </Button>
            </>
          )}
          {user!.role === 'contractor' && (
            <>
              <Button variant="outline" onClick={() => onNavigate('browse-jobs')} className="w-full justify-start">
                <Hammer className="mr-2" size={18} />
                Browse Jobs
              </Button>
              <Button variant="outline" onClick={() => onNavigate('crm')} className="w-full justify-start">
                <Users className="mr-2" size={18} />
                CRM
              </Button>
              <Button variant="outline" onClick={() => onNavigate('invoices')} className="w-full justify-start">
                <Receipt className="mr-2" size={18} />
                Invoices
              </Button>
              <Button variant="outline" onClick={() => onNavigate('photo-scoper')} className="w-full justify-start">
                <Camera className="mr-2" size={18} />
                Photo Scoper
              </Button>
            </>
          )}
          {user!.role === 'operator' && (
            <Button variant="outline" onClick={() => onNavigate('territory-map')} className="w-full justify-start">
              <MapPin weight="fill" className="mr-2" />
              Territory Map
            </Button>
          )}
          {user!.isOperator && user!.role !== 'operator' && (
            <Button variant="outline" onClick={() => onNavigate('revenue-dashboard')} className="w-full justify-start">
              <ChartLine className="mr-2" size={18} />
              Revenue Dashboard
            </Button>
          )}
          <Button variant="destructive" onClick={onLogout} className="w-full justify-start mt-4">
            <SignOut className="mr-2" size={18} />
            Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  </>
))

MobileNav.displayName = 'MobileNav'

export const Header = memo(HeaderComponent)
Header.displayName = 'Header'
