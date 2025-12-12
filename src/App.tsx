import { useState, useEffect, lazy, Suspense, memo } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { DemoModeBanner } from "@/components/layout/DemoModeBanner"
import { Footer } from "@/components/layout/Footer"
import { useKV } from "@github/spark/hooks"
import { initializeDemoData } from "@/lib/demoData"
import type { User, UserRole, Job, Invoice, Territory } from "@/lib/types"
import { toast } from "sonner"

const HomePage = lazy(() => import("@/pages/Home").then(m => ({ default: m.HomePage })))
const LoginPage = lazy(() => import("@/pages/Login").then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import("@/pages/Signup").then(m => ({ default: m.SignupPage })))
const MyJobs = lazy(() => import("@/pages/MyJobs").then(m => ({ default: m.MyJobs })))
const JobPoster = lazy(() => import("@/components/jobs/JobPoster").then(m => ({ default: m.JobPoster })))
const BrowseJobs = lazy(() => import("@/components/jobs/BrowseJobs").then(m => ({ default: m.BrowseJobs })))
const AutomationRunner = lazy(() => import("@/components/contractor/AutomationRunner").then(m => ({ default: m.AutomationRunner })))

const ContractorDashboard = lazy(() => 
  import("@/components/contractor/ContractorDashboard")
    .then(m => ({ default: m.ContractorDashboard }))
    .catch(err => {
      console.error("Failed to load ContractorDashboard:", err)
      throw err
    })
)
const EnhancedCRM = lazy(() => 
  import("@/components/contractor/EnhancedCRM")
    .then(m => ({ default: m.EnhancedCRM }))
    .catch(err => {
      console.error("Failed to load EnhancedCRM:", err)
      throw err
    })
)
const InvoiceManager = lazy(() => 
  import("@/components/contractor/InvoiceManager")
    .then(m => ({ default: m.InvoiceManager }))
    .catch(err => {
      console.error("Failed to load InvoiceManager:", err)
      throw err
    })
)
const ProUpgrade = lazy(() => 
  import("@/components/contractor/ProUpgrade")
    .then(m => ({ default: m.ProUpgrade }))
    .catch(err => {
      console.error("Failed to load ProUpgrade:", err)
      throw err
    })
)
const TerritoryMap = lazy(() => 
  import("@/components/territory/TerritoryMap")
    .then(m => ({ default: m.TerritoryMap }))
    .catch(err => {
      console.error("Failed to load TerritoryMap:", err)
      throw err
    })
)
const CompanyRevenueDashboard = lazy(() => 
  import("@/components/contractor/CompanyRevenueDashboard")
    .then(m => ({ default: m.CompanyRevenueDashboard }))
    .catch(err => {
      console.error("Failed to load CompanyRevenueDashboard:", err)
      throw err
    })
)
const ProjectMilestones = lazy(() => 
  import("@/pages/ProjectMilestones")
    .then(m => ({ default: m.ProjectMilestones }))
    .catch(err => {
      console.error("Failed to load ProjectMilestones:", err)
      throw err
    })
)

type Page = 'home' | 'login' | 'signup' | 'post-job' | 'my-jobs' | 'browse-jobs' | 'dashboard' | 'crm' | 'invoices' | 'pro-upgrade' | 'territory-map' | 'revenue-dashboard' | 'project-milestones'
type NavigationState = { page: Page; jobId?: string }

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

  useEffect(() => {
    let mounted = true
    const initData = async () => {
      const demoData = initializeDemoData()
      if (demoData && mounted) {
        const { jobs: demoJobs, invoices: demoInvoices, territories: demoTerritories } = demoData
        setJobs(demoJobs)
        setInvoices(demoInvoices)
        setTerritories(demoTerritories)
      }
    }
    initData()
    return () => { mounted = false }
  }, [])

  const handleNavigate = (page: string, role?: string, jobId?: string) => {
    if (role) {
      setPreselectedRole(role as UserRole)
    }
    if (jobId) {
      setSelectedJobId(jobId)
    }
    setCurrentPage(page as Page)
    window.scrollTo(0, 0)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsDemoMode(false)
  }

  const handleDemoLogin = (demoUser: User) => {
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
      setCurrentPage('territory-map')
    } else if (demoUser.role === 'homeowner') {
      setCurrentPage('my-jobs')
    } else {
      setCurrentPage('home')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsDemoMode(false)
    setCurrentPage('home')
  }

  const renderPage = () => {
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
        return currentUser?.role === 'contractor' 
          ? <Suspense fallback={<LoadingFallback />}><ContractorDashboard user={currentUser} onNavigate={handleNavigate} /></Suspense>
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
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
        if (!currentUser || !selectedJobId) return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
        const selectedJob = (jobs || []).find(j => j.id === selectedJobId)
        if (!selectedJob) return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectMilestones 
              job={selectedJob} 
              user={currentUser} 
              onBack={() => setCurrentPage('my-jobs')}
            />
          </Suspense>
        )
      default:
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <AutomationRunner user={currentUser ?? null} />
      </Suspense>
      <Header user={currentUser || null} onNavigate={handleNavigate} onLogout={handleLogout} />
      {isDemoMode && currentUser && (
        <DemoModeBanner 
          userName={currentUser.fullName} 
          userRole={currentUser.role}
        />
      )}
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App