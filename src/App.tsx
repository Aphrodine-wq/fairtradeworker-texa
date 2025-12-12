import { useState, useEffect, lazy, Suspense, memo, useMemo, useCallback, Component, ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { DemoModeBanner } from "@/components/layout/DemoModeBanner"
import { Footer } from "@/components/layout/Footer"
import { OfflineIndicator } from "@/components/layout/OfflineIndicator"
import { Breadcrumb, getBreadcrumbs } from "@/components/layout/Breadcrumb"
import { useKV } from "@github/spark/hooks"
import { useServiceWorker, useOfflineQueue } from "@/hooks/useServiceWorker"
import { initializeDemoData } from "@/lib/demoData"
import type { User, UserRole, Job, Invoice, Territory } from "@/lib/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const retryImport = <T,>(importFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  return importFn().catch((error) => {
    if (retries === 0) throw error
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(retryImport(importFn, retries - 1, delay))
      }, delay)
    })
  })
}

const HomePage = lazy(() => retryImport(() => import("@/pages/Home").then(m => ({ default: m.HomePage }))))
const LoginPage = lazy(() => retryImport(() => import("@/pages/Login").then(m => ({ default: m.LoginPage }))))
const SignupPage = lazy(() => retryImport(() => import("@/pages/Signup").then(m => ({ default: m.SignupPage }))))
const MyJobs = lazy(() => retryImport(() => import("@/pages/MyJobs").then(m => ({ default: m.MyJobs }))))
const JobPoster = lazy(() => retryImport(() => import("@/components/jobs/JobPoster").then(m => ({ default: m.JobPoster }))))
const BrowseJobs = lazy(() => retryImport(() => import("@/components/jobs/BrowseJobs").then(m => ({ default: m.BrowseJobs }))))

const AutomationRunner = lazy(() => retryImport(() =>
  import("@/components/contractor/AutomationRunner")
    .then(m => ({ default: m.AutomationRunner }))
))
const HomeownerDashboard = lazy(() => retryImport(() =>
  import("@/pages/HomeownerDashboard").then(m => ({ default: m.HomeownerDashboard }))
))
const ContractorDashboardNew = lazy(() => retryImport(() =>
  import("@/pages/ContractorDashboardNew").then(m => ({ default: m.ContractorDashboardNew }))
))
const OperatorDashboard = lazy(() => retryImport(() =>
  import("@/pages/OperatorDashboard").then(m => ({ default: m.OperatorDashboard }))
))
const ContractorDashboard = lazy(() => retryImport(() =>
  import("@/components/contractor/ContractorDashboard").then(m => ({ default: m.ContractorDashboard }))
))
const EnhancedCRM = lazy(() => retryImport(() =>
  import("@/components/contractor/EnhancedCRM").then(m => ({ default: m.EnhancedCRM }))
))
const InvoiceManager = lazy(() => retryImport(() =>
  import("@/components/contractor/InvoiceManager").then(m => ({ default: m.InvoiceManager }))
))
const ProUpgrade = lazy(() => retryImport(() =>
  import("@/components/contractor/ProUpgrade").then(m => ({ default: m.ProUpgrade }))
))
const TerritoryMap = lazy(() => retryImport(() =>
  import("@/components/territory/TerritoryMap").then(m => ({ default: m.TerritoryMap }))
))
const CompanyRevenueDashboard = lazy(() => retryImport(() =>
  import("@/components/contractor/CompanyRevenueDashboard").then(m => ({ default: m.CompanyRevenueDashboard }))
))
const ProjectMilestones = lazy(() => retryImport(() =>
  import("@/pages/ProjectMilestones").then(m => ({ default: m.ProjectMilestones }))
))
const PhotoScoperPage = lazy(() => retryImport(() =>
  import("@/pages/PhotoScoper").then(m => ({ default: m.PhotoScoperPage }))
))

type Page = 'home' | 'login' | 'signup' | 'post-job' | 'my-jobs' | 'browse-jobs' | 'dashboard' | 'crm' | 'invoices' | 'pro-upgrade' | 'territory-map' | 'revenue-dashboard' | 'project-milestones' | 'photo-scoper'
type NavigationState = { page: Page; jobId?: string }

class ErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An error occurred while loading this page'}
            </p>
            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onReset()
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>()
  const [currentUser, setCurrentUser] = useKV<User | null>("current-user", null)
  const [isDemoMode, setIsDemoMode] = useKV<boolean>("is-demo-mode", false)
  const [preselectedRole, setPreselectedRole] = useState<UserRole | undefined>()
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [invoices, setInvoices] = useKV<Invoice[]>("invoices", [])
  const [territories, setTerritories] = useKV<Territory[]>("territories", [])
  
  const { isOnline } = useServiceWorker()
  const { processQueue, queue } = useOfflineQueue()

  useEffect(() => {
    let mounted = true
    const initData = async () => {
      const existingJobs = await window.spark.kv.get<Job[]>("jobs")
      if (!existingJobs || existingJobs.length === 0) {
        const demoData = initializeDemoData()
        if (demoData && mounted) {
          const { jobs: demoJobs, invoices: demoInvoices, territories: demoTerritories } = demoData
          setJobs(demoJobs)
          setInvoices(demoInvoices)
          setTerritories(demoTerritories)
        }
      }
    }
    initData()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue()
      toast.success('Syncing offline changes...')
    }
  }, [isOnline, queue.length])

  const handleNavigate = useCallback((page: string, role?: string, jobId?: string) => {
    if (role) {
      setPreselectedRole(role as UserRole)
    }
    if (jobId) {
      setSelectedJobId(jobId)
    }
    setCurrentPage(page as Page)
    window.scrollTo({ top: 0, behavior: 'instant' } as ScrollToOptions)
  }, [])

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user)
    setIsDemoMode(false)
  }, [setCurrentUser, setIsDemoMode])

  const handleDemoLogin = useCallback((demoUser: User) => {
    setCurrentUser(demoUser)
    setIsDemoMode(true)
    
    const roleMessages = {
      homeowner: 'You can post jobs and receive bids from contractors.',
      contractor: 'You can browse jobs and submit bids. Check out your dashboard!',
      operator: 'You can view and claim territories on the map.',
    }
    
    toast.success(`Demo mode activated as ${demoUser.fullName}`, {
      description: roleMessages[demoUser.role],
    })
    
    if (demoUser.role === 'contractor') {
      setCurrentPage('dashboard')
    } else if (demoUser.role === 'operator') {
      setCurrentPage('dashboard')
    } else if (demoUser.role === 'homeowner') {
      setCurrentPage('dashboard')
    } else {
      setCurrentPage('home')
    }
  }, [setCurrentUser, setIsDemoMode])

  const handleLogout = useCallback(() => {
    setCurrentUser(null)
    setIsDemoMode(false)
    setCurrentPage('home')
  }, [setCurrentUser, setIsDemoMode])

  const selectedJob = useMemo(() => {
    return selectedJobId ? (jobs || []).find(j => j.id === selectedJobId) : null
  }, [selectedJobId, jobs])

  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(currentPage, currentUser ?? null, {
      jobTitle: selectedJob?.title
    })
  }, [currentPage, currentUser, selectedJob?.title])

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} onLogin={handleLogin} preselectedRole={preselectedRole} />
      case 'post-job':
        return currentUser ? <JobPoster user={currentUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'my-jobs':
        return currentUser?.role === 'homeowner'
          ? <MyJobs user={currentUser} onNavigate={handleNavigate} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'browse-jobs':
        return currentUser ? <BrowseJobs user={currentUser} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'dashboard':
        if (!currentUser) return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
        
        if (currentUser.role === 'homeowner') {
          return <Suspense fallback={<LoadingFallback />}><HomeownerDashboard user={currentUser} onNavigate={handleNavigate} /></Suspense>
        } else if (currentUser.role === 'contractor') {
          return <Suspense fallback={<LoadingFallback />}><ContractorDashboardNew user={currentUser} onNavigate={handleNavigate} /></Suspense>
        } else if (currentUser.role === 'operator') {
          return <Suspense fallback={<LoadingFallback />}><OperatorDashboard user={currentUser} onNavigate={handleNavigate} /></Suspense>
        }
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'crm':
        return currentUser?.role === 'contractor'
          ? <Suspense fallback={<LoadingFallback />}><EnhancedCRM user={currentUser} /></Suspense>
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'invoices':
        return currentUser?.role === 'contractor'
          ? <Suspense fallback={<LoadingFallback />}><InvoiceManager user={currentUser} onNavigate={handleNavigate} /></Suspense>
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'pro-upgrade':
        return currentUser ? <Suspense fallback={<LoadingFallback />}><ProUpgrade user={currentUser} onNavigate={handleNavigate} /></Suspense> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'territory-map':
        return currentUser?.role === 'operator'
          ? <Suspense fallback={<LoadingFallback />}><TerritoryMap user={currentUser} /></Suspense>
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'revenue-dashboard':
        return currentUser ? <Suspense fallback={<LoadingFallback />}><CompanyRevenueDashboard user={currentUser} /></Suspense> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'project-milestones':
        if (!currentUser || !selectedJob) return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectMilestones 
              job={selectedJob} 
              user={currentUser} 
              onBack={() => setCurrentPage('my-jobs')}
            />
          </Suspense>
        )
      case 'photo-scoper':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PhotoScoperPage />
          </Suspense>
        )
      default:
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
    }
  }, [currentPage, currentUser, preselectedRole, selectedJob, handleNavigate, handleLogin, handleDemoLogin])

  return (
    <div className="flex flex-col min-h-screen">
      <ErrorBoundary onReset={() => setCurrentPage('home')}>
        <Suspense fallback={null}>
          <AutomationRunner user={currentUser ?? null} />
        </Suspense>
      </ErrorBoundary>
      <Header user={currentUser || null} onNavigate={handleNavigate} onLogout={handleLogout} />
      {isDemoMode && currentUser && (
        <DemoModeBanner 
          userName={currentUser.fullName} 
          userRole={currentUser.role}
        />
      )}
      <OfflineIndicator />
      <main className="flex-1 pt-16">
        {currentPage !== 'home' && breadcrumbs.length > 0 && (
          <div className="container mx-auto px-4 md:px-8 pt-6">
            <Breadcrumb items={breadcrumbs} onNavigate={handleNavigate} />
          </div>
        )}
        <ErrorBoundary onReset={() => setCurrentPage('home')}>
          <Suspense fallback={<LoadingFallback />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App