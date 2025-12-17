import { useState, useEffect, lazy, Suspense, memo, useMemo, useCallback, Component, ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { DemoModeBanner } from "@/components/layout/DemoModeBanner"
import { Footer } from "@/components/layout/Footer"
import { OfflineIndicator } from "@/components/layout/OfflineIndicator"
import { useLocalKV } from "@/hooks/useLocalKV"
import { useServiceWorker, useOfflineQueue } from "@/hooks/useServiceWorker"
import { useIOSOptimizations } from "@/hooks/use-mobile"
import { initializeDemoData } from "@/lib/demoData"
import type { User, UserRole, Job, Invoice, Territory } from "@/lib/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const retryImport = <T,>(importFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  return importFn().catch((error) => {
    // Check if it's a chunk loading error (stale chunk reference)
    const isChunkLoadError = error.message?.includes('Failed to fetch dynamically imported module') ||
                             error.message?.includes('Loading chunk') ||
                             error.message?.includes('Loading CSS chunk') ||
                             error.name === 'ChunkLoadError' ||
                             (error as any).type === 'chunkLoadError'
    
    if (retries === 0) {
      // If it's a chunk loading error and we've exhausted retries, reload the page
      // This happens when a new deployment has different chunk hashes
      if (isChunkLoadError && typeof window !== 'undefined') {
        console.warn('Chunk load failed after retries. Reloading page to fetch fresh chunks...', error)
        window.location.reload()
        // Return a never-resolving promise to prevent rendering during reload
        return new Promise(() => {})
      }
      throw error
    }
    
    // For chunk load errors, use longer delay to allow CDN cache to clear
    const retryDelay = isChunkLoadError ? delay * 1.5 : delay
    
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(retryImport(importFn, retries - 1, retryDelay))
      }, retryDelay)
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
const WorkflowAutomation = lazy(() => retryImport(() =>
  import("@/components/contractor/WorkflowAutomation")
    .then(m => ({ default: m.WorkflowAutomation }))
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
const UnifiedPostJob = lazy(() => retryImport(() => import("@/pages/UnifiedPostJob").then(m => ({ default: m.UnifiedPostJob }))))
const ServiceCategoryDetail = lazy(() => retryImport(() => import("@/pages/ServiceCategoryDetail").then(m => ({ default: m.ServiceCategoryDetail }))))
const AdminDashboard = lazy(() => retryImport(() => import("@/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard }))))
const DonatePage = lazy(() => retryImport(() => import("@/pages/DonatePage").then(m => ({ default: m.DonatePage }))))
const HelpCenter = lazy(() => retryImport(() => import("@/pages/HelpCenter").then(m => ({ default: m.HelpCenter }))))
const HomeownerProUpgrade = lazy(() => retryImport(() => import("@/components/homeowner/HomeownerProUpgrade").then(m => ({ default: m.HomeownerProUpgrade }))))
const AboutPage = lazy(() => retryImport(() =>
  import("@/pages/About").then(m => ({ default: m.AboutPage }))
))
const ContactPage = lazy(() => retryImport(() =>
  import("@/pages/Contact").then(m => ({ default: m.ContactPage }))
))
const PrivacyPage = lazy(() => retryImport(() =>
  import("@/pages/Privacy").then(m => ({ default: m.PrivacyPage }))
))
const TermsPage = lazy(() => retryImport(() =>
  import("@/pages/Terms").then(m => ({ default: m.TermsPage }))
))
const PricingPage = lazy(() => retryImport(() =>
  import("@/pages/Pricing").then(m => ({ default: m.PricingPage }))
))
const SettingsPage = lazy(() => retryImport(() =>
  import("@/pages/Settings").then(m => ({ default: m.SettingsPage }))
))
const FreeToolsPage = lazy(() => retryImport(() =>
  import("@/pages/FreeToolsPage").then(m => ({ default: m.FreeToolsPage }))
))
const BusinessTools = lazy(() => retryImport(() =>
  import("@/pages/BusinessTools").then(m => ({ default: m.BusinessTools }))
))
const TaxHelper = lazy(() => retryImport(() =>
  import("@/components/contractor/TaxHelper").then(m => ({ default: m.TaxHelper }))
))
const DocumentManager = lazy(() => retryImport(() =>
  import("@/components/contractor/DocumentManager").then(m => ({ default: m.DocumentManager }))
))
const NotificationCenter = lazy(() => retryImport(() =>
  import("@/components/contractor/NotificationCenter").then(m => ({ default: m.NotificationCenter }))
))
const ReportingSuite = lazy(() => retryImport(() =>
  import("@/components/contractor/ReportingSuite").then(m => ({ default: m.ReportingSuite }))
))
const InventoryManagement = lazy(() => retryImport(() =>
  import("@/components/contractor/InventoryManagement").then(m => ({ default: m.InventoryManagement }))
))
const QualityAssurance = lazy(() => retryImport(() =>
  import("@/components/contractor/QualityAssurance").then(m => ({ default: m.QualityAssurance }))
))
const ComplianceTracker = lazy(() => retryImport(() =>
  import("@/components/contractor/ComplianceTracker").then(m => ({ default: m.ComplianceTracker }))
))
const CommunicationHub = lazy(() => retryImport(() =>
  import("@/components/contractor/CommunicationHub").then(m => ({ default: m.CommunicationHub }))
))
const EnhancedSchedulingCalendar = lazy(() => retryImport(() =>
  import("@/components/contractor/EnhancedSchedulingCalendar").then(m => ({ default: m.EnhancedSchedulingCalendar }))
))
const PaymentProcessing = lazy(() => retryImport(() =>
  import("@/components/contractor/PaymentProcessing").then(m => ({ default: m.PaymentProcessing }))
))
const EnhancedExpenseTracking = lazy(() => retryImport(() =>
  import("@/components/contractor/EnhancedExpenseTracking").then(m => ({ default: m.EnhancedExpenseTracking }))
))
const ReceptionistCRM = lazy(() => retryImport(() =>
  import("@/components/contractor/ReceptionistCRM").then(m => ({ default: m.ReceptionistCRM }))
))
const BidOptimizer = lazy(() => retryImport(() =>
  import("@/components/contractor/BidOptimizer").then(m => ({ default: m.BidOptimizer }))
))
const ChangeOrderBuilder = lazy(() => retryImport(() =>
  import("@/components/contractor/ChangeOrderBuilder").then(m => ({ default: m.ChangeOrderBuilder }))
))
const CrewDispatcher = lazy(() => retryImport(() =>
  import("@/components/contractor/CrewDispatcher").then(m => ({ default: m.CrewDispatcher }))
))
const LeadImportAutoBid = lazy(() => retryImport(() =>
  import("@/components/contractor/LeadImportAutoBid").then(m => ({ default: m.LeadImportAutoBid }))
))
const QuoteTemplateBuilder = lazy(() => retryImport(() =>
  import("@/components/contractor/QuoteTemplateBuilder").then(m => ({ default: m.QuoteTemplateBuilder }))
))
const SeasonalDemandForecast = lazy(() => retryImport(() =>
  import("@/components/contractor/SeasonalDemandForecast").then(m => ({ default: m.SeasonalDemandForecast }))
))
const PriorityJobAlerts = lazy(() => retryImport(() =>
  import("@/components/contractor/PriorityJobAlerts").then(m => ({ default: m.PriorityJobAlerts }))
))
const MultiJobInvoicing = lazy(() => retryImport(() =>
  import("@/components/contractor/MultiJobInvoicing").then(m => ({ default: m.MultiJobInvoicing }))
))
const AdvancedBidAnalytics = lazy(() => retryImport(() =>
  import("@/components/contractor/AdvancedBidAnalytics").then(m => ({ default: m.AdvancedBidAnalytics }))
))
const CustomFieldsTags = lazy(() => retryImport(() =>
  import("@/components/contractor/CustomFieldsTags").then(m => ({ default: m.CustomFieldsTags }))
))
const ExportEverything = lazy(() => retryImport(() =>
  import("@/components/contractor/ExportEverything").then(m => ({ default: m.ExportEverything }))
))
const ProfitCalculator = lazy(() => retryImport(() =>
  import("@/components/contractor/ProfitCalculator").then(m => ({ default: m.ProfitCalculator }))
))
const InsuranceCertVerification = lazy(() => retryImport(() =>
  import("@/components/contractor/InsuranceCertVerification").then(m => ({ default: m.InsuranceCertVerification }))
))
const ProOnlyFilters = lazy(() => retryImport(() =>
  import("@/components/contractor/ProOnlyFilters").then(m => ({ default: m.ProOnlyFilters }))
))
const BidBoostHistory = lazy(() => retryImport(() =>
  import("@/components/contractor/BidBoostHistory").then(m => ({ default: m.BidBoostHistory }))
))
const CustomBranding = lazy(() => retryImport(() =>
  import("@/components/contractor/CustomBranding").then(m => ({ default: m.CustomBranding }))
))
const ProSupportChat = lazy(() => retryImport(() =>
  import("@/components/contractor/ProSupportChat").then(m => ({ default: m.ProSupportChat }))
))
const CalendarSync = lazy(() => retryImport(() =>
  import("@/components/contractor/CalendarSync").then(m => ({ default: m.CalendarSync }))
))
const ReceptionistUpsell = lazy(() => retryImport(() =>
  import("@/components/contractor/ReceptionistUpsell").then(m => ({ default: m.ReceptionistUpsell }))
))
const ClientPortal = lazy(() => retryImport(() =>
  import("@/components/contractor/ClientPortal").then(m => ({ default: m.ClientPortal }))
))
const ClientPaymentPortalPage = lazy(() => retryImport(() =>
  import("@/pages/ClientPaymentPortal").then(m => ({ default: m.ClientPaymentPortalPage }))
))

// New Zero-Cost Defensible Feature Set Components
const VoiceBidRecorder = lazy(() => retryImport(() =>
  import("@/components/contractor/VoiceBidRecorder").then(m => ({ default: m.VoiceBidRecorder }))
))
const NeighborhoodJobAlerts = lazy(() => retryImport(() =>
  import("@/components/contractor/NeighborhoodJobAlerts").then(m => ({ default: m.NeighborhoodJobAlerts }))
))
const SkillTradingMarketplace = lazy(() => retryImport(() =>
  import("@/components/contractor/SkillTradingMarketplace").then(m => ({ default: m.SkillTradingMarketplace }))
))
const SmartMaterialCalculator = lazy(() => retryImport(() =>
  import("@/components/contractor/SmartMaterialCalculator").then(m => ({ default: m.SmartMaterialCalculator }))
))
const OfflineFieldMode = lazy(() => retryImport(() =>
  import("@/components/contractor/OfflineFieldMode").then(m => ({ default: m.OfflineFieldMode }))
))
const ProjectStoryGenerator = lazy(() => retryImport(() =>
  import("@/components/viral/ProjectStoryGenerator").then(m => ({ default: m.ProjectStoryGenerator }))
))
const SeasonalMaintenanceClubs = lazy(() => retryImport(() =>
  import("@/components/homeowner/SeasonalMaintenanceClubs").then(m => ({ default: m.SeasonalMaintenanceClubs }))
))
const SMSPhotoScope = lazy(() => retryImport(() =>
  import("@/components/homeowner/SMSPhotoScope").then(m => ({ default: m.SMSPhotoScope }))
))

type Page = 'home' | 'login' | 'signup' | 'post-job' | 'unified-post-job' | 'service-category' | 'my-jobs' | 'browse-jobs' | 'dashboard' | 'crm' | 'invoices' | 'pro-upgrade' | 'homeowner-pro-upgrade' | 'territory-map' | 'revenue-dashboard' | 'project-milestones' | 'photo-scoper' | 'admin-dashboard' | 'about' | 'contact' | 'privacy' | 'terms' | 'pricing' | 'settings' | 'free-tools' | 'business-tools' | 'tax-helper' | 'documents' | 'calendar' | 'communication' | 'notifications' | 'leads' | 'reports' | 'inventory' | 'quality' | 'compliance' | 'automation' | 'expenses' | 'payments' | 'receptionist' | 'bid-optimizer' | 'change-order' | 'crew-dispatcher' | 'lead-import' | 'quote-builder' | 'seasonal-forecast' | 'priority-alerts' | 'multi-invoice' | 'bid-analytics' | 'custom-fields' | 'export' | 'client-portal' | 'client-payment-portal' | 'profit-calc' | 'insurance-verify' | 'pro-filters' | 'bid-boost-history' | 'custom-branding' | 'pro-support' | 'calendar-sync' | 'receptionist-upsell' | 'voice-bids' | 'neighborhood-alerts' | 'skill-trading' | 'material-calc' | 'offline-mode' | 'project-stories' | 'seasonal-clubs' | 'sms-scope' | 'donate' | 'help'
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
    
    // Check if it's a chunk loading error
    const isChunkLoadError = error.message?.includes('Failed to fetch dynamically imported module') ||
                             error.message?.includes('Loading chunk') ||
                             error.message?.includes('Loading CSS chunk') ||
                             error.name === 'ChunkLoadError'
    
    // If it's a chunk load error, reload the page to get fresh chunks
    if (isChunkLoadError && typeof window !== 'undefined') {
      console.warn('Chunk load error in ErrorBoundary, reloading page...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Something went wrong</h2>
            <p className="text-black dark:text-white mb-6">
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
    <div className="flex items-center justify-center min-h-[400px] opacity-0">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>()
  const [currentUser, setCurrentUser] = useLocalKV<User | null>("current-user", null)
  const [isDemoMode, setIsDemoMode] = useLocalKV<boolean>("is-demo-mode", false)
  const [preselectedRole, setPreselectedRole] = useState<UserRole | undefined>()
  const [jobs, setJobs] = useLocalKV<Job[]>("jobs", [])
  const [invoices, setInvoices] = useLocalKV<Invoice[]>("invoices", [])
  const [territories, setTerritories] = useLocalKV<Territory[]>("territories", [])
  const [bidTemplates, setBidTemplates] = useLocalKV<import("@/lib/types").BidTemplate[]>("bidTemplates", [])
  
  const { isOnline } = useServiceWorker()
  const { processQueue, queue } = useOfflineQueue()
  
  // Initialize iOS optimizations
  useIOSOptimizations()

  useEffect(() => {
    let mounted = true
    const initData = async () => {
      // Check if we already have jobs (from localStorage via useLocalKV)
      if (jobs.length === 0) {
        const demoData = initializeDemoData()
        if (demoData && mounted) {
          const { jobs: demoJobs, invoices: demoInvoices, territories: demoTerritories, bidTemplates: demoTemplates } = demoData
          setJobs(demoJobs)
          setInvoices(demoInvoices)
          setTerritories(demoTerritories)
          if (demoTemplates && bidTemplates.length === 0) {
            setBidTemplates(demoTemplates)
          }
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
    // Handle service-category paths
    if (page.startsWith('service-category/')) {
      const categoryId = page.split('/')[1]
      sessionStorage.setItem('selectedCategory', categoryId)
      setCurrentPage('service-category' as Page)
    } else {
      setCurrentPage(page as Page)
    }
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


  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} onLogin={handleLogin} preselectedRole={preselectedRole} />
      case 'post-job':
        return currentUser ? <JobPoster user={currentUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'unified-post-job':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UnifiedPostJob user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'service-category':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ServiceCategoryDetail onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'my-jobs':
        return currentUser?.role === 'homeowner'
          ? <MyJobs user={currentUser} onNavigate={handleNavigate} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'browse-jobs':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') 
          ? <BrowseJobs user={currentUser} /> 
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
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
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator')
          ? <Suspense fallback={<LoadingFallback />}><EnhancedCRM user={currentUser} onNavigate={handleNavigate} /></Suspense>
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'invoices':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator')
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
      case 'about':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage />
          </Suspense>
        )
      case 'contact':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContactPage />
          </Suspense>
        )
      case 'privacy':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPage />
          </Suspense>
        )
      case 'terms':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TermsPage />
          </Suspense>
        )
      case 'pricing':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PricingPage user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'settings':
        return currentUser ? (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'donate':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DonatePage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'help':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HelpCenter onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'admin-dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'homeowner-pro-upgrade':
        return currentUser?.role === 'homeowner' ? (
          <Suspense fallback={<LoadingFallback />}>
            <HomeownerProUpgrade user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'free-tools':
        // Show FreeToolsPage for homeowners, BusinessTools for contractors/operators
        if (currentUser?.role === 'homeowner') {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <FreeToolsPage user={currentUser} onNavigate={handleNavigate} />
            </Suspense>
          )
        }
        // Contractors/operators see free tools in BusinessTools
        if (currentUser?.role === 'contractor' || currentUser?.role === 'operator') {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <BusinessTools user={currentUser} onNavigate={handleNavigate} />
            </Suspense>
          )
        }
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'business-tools':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessTools user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'tax-helper':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <TaxHelper user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'documents':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentManager user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'notifications':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <NotificationCenter user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'reports':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ReportingSuite user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'inventory':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <InventoryManagement user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'quality':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <QualityAssurance user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'compliance':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ComplianceTracker user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'automation':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <WorkflowAutomation user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'communication':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <CommunicationHub user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'calendar':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedSchedulingCalendar user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'leads':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedCRM user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'expenses':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedExpenseTracking user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'payments':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <PaymentProcessing user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'receptionist':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ReceptionistCRM user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'bid-optimizer':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <BidOptimizer user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'change-order':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ChangeOrderBuilder user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'crew-dispatcher':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <CrewDispatcher user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'lead-import':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <LeadImportAutoBid user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'quote-builder':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <QuoteTemplateBuilder user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'seasonal-forecast':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <SeasonalDemandForecast user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'priority-alerts':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <PriorityJobAlerts user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'multi-invoice':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <MultiJobInvoicing user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'bid-analytics':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <AdvancedBidAnalytics user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'custom-fields':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <CustomFieldsTags user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'export':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ExportEverything user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'profit-calc':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ProfitCalculator user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'insurance-verify':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <InsuranceCertVerification user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'pro-filters':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ProOnlyFilters user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'client-portal':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ClientPortal user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'calendar-sync':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <CalendarSync user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'receptionist-upsell':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <ReceptionistUpsell user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      
      // New Zero-Cost Defensible Feature Set Routes
      case 'voice-bids':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <VoiceBidRecorder user={currentUser} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'neighborhood-alerts':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <NeighborhoodJobAlerts userId={currentUser.id} userZipCode="78749" />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'skill-trading':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <SkillTradingMarketplace userId={currentUser.id} userRating={4.8} userSkills={['plumbing', 'hvac']} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'material-calc':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <SmartMaterialCalculator />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'offline-mode':
        return (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <OfflineFieldMode userId={currentUser.id} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'project-stories':
        return currentUser ? (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectStoryGenerator userId={currentUser.id} userRole={currentUser.role} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'seasonal-clubs':
        return currentUser?.role === 'homeowner' ? (
          <Suspense fallback={<LoadingFallback />}>
            <SeasonalMaintenanceClubs userId={currentUser.id} userRole="homeowner" userZipCode="78749" userNeighborhood="Oak Hill" />
          </Suspense>
        ) : (currentUser?.role === 'contractor' || currentUser?.role === 'operator') ? (
          <Suspense fallback={<LoadingFallback />}>
            <SeasonalMaintenanceClubs userId={currentUser.id} userRole="contractor" userZipCode="78749" userNeighborhood="Oak Hill" />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'sms-scope':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SMSPhotoScope userPhone={currentUser?.phone} />
          </Suspense>
        )
      case 'client-payment-portal':
        return currentUser?.role === 'homeowner' ? (
          <Suspense fallback={<LoadingFallback />}>
            <ClientPaymentPortalPage user={currentUser} onNavigate={handleNavigate} />
          </Suspense>
        ) : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      default:
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
    }
  }, [currentPage, currentUser, preselectedRole, selectedJob, handleNavigate, handleLogin, handleDemoLogin])

  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      {currentUser?.isPro && (
        <ErrorBoundary onReset={() => setCurrentPage('home')}>
          <Suspense fallback={null}>
            <AutomationRunner user={currentUser} />
          </Suspense>
        </ErrorBoundary>
      )}
      <Header user={currentUser || null} onNavigate={handleNavigate} onLogout={handleLogout} />
      {isDemoMode && currentUser && (
        <DemoModeBanner 
          userName={currentUser.fullName} 
          userRole={currentUser.role}
        />
      )}
      <OfflineIndicator />
      <main className="flex-1 pt-16 w-full bg-white dark:bg-black overflow-x-hidden">
        <ErrorBoundary onReset={() => setCurrentPage('home')}>
          <Suspense fallback={<LoadingFallback />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer onNavigate={handleNavigate} />
      <Toaster position="top-center" />
    </div>
  )
}

export default App
