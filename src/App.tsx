import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { DemoModeBanner } from "@/components/layout/DemoModeBanner"
import { Footer } from "@/components/layout/Footer"
import { HomePage } from "@/pages/Home"
import { LoginPage } from "@/pages/Login"
import { SignupPage } from "@/pages/Signup"
import { MyJobs } from "@/pages/MyJobs"
import { JobPoster } from "@/components/jobs/JobPoster"
import { BrowseJobs } from "@/components/jobs/BrowseJobs"
import { ContractorDashboard } from "@/components/contractor/ContractorDashboard"
import { EnhancedCRM } from "@/components/contractor/EnhancedCRM"
import { InvoiceManager } from "@/components/contractor/InvoiceManager"
import { ProUpgrade } from "@/components/contractor/ProUpgrade"
import { TerritoryMap } from "@/components/territory/TerritoryMap"
import { CompanyRevenueDashboard } from "@/components/contractor/CompanyRevenueDashboard"
import { useKV } from "@github/spark/hooks"
import { initializeDemoData } from "@/lib/demoData"
import type { User, UserRole, Job, Invoice, Territory } from "@/lib/types"
import { toast } from "sonner"

type Page = 'home' | 'login' | 'signup' | 'post-job' | 'my-jobs' | 'browse-jobs' | 'dashboard' | 'crm' | 'invoices' | 'pro-upgrade' | 'territory-map' | 'revenue-dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [currentUser, setCurrentUser] = useKV<User | null>("current-user", null)
  const [isDemoMode, setIsDemoMode] = useKV<boolean>("is-demo-mode", false)
  const [preselectedRole, setPreselectedRole] = useState<UserRole | undefined>()
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [invoices, setInvoices] = useKV<Invoice[]>("invoices", [])
  const [territories, setTerritories] = useKV<Territory[]>("territories", [])

  useEffect(() => {
    const demoData = initializeDemoData()
    if (demoData) {
      setJobs(demoData.jobs)
      setInvoices(demoData.invoices)
      setTerritories(demoData.territories)
    }
  }, [])

  const handleNavigate = (page: string, role?: string) => {
    if (role) {
      setPreselectedRole(role as UserRole)
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
          ? <MyJobs user={currentUser} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'browse-jobs':
        return currentUser ? <BrowseJobs user={currentUser} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'dashboard':
        return currentUser?.role === 'contractor' 
          ? <ContractorDashboard user={currentUser} onNavigate={handleNavigate} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'crm':
        return currentUser?.role === 'contractor'
          ? <EnhancedCRM user={currentUser} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'invoices':
        return currentUser?.role === 'contractor'
          ? <InvoiceManager user={currentUser} onNavigate={handleNavigate} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'pro-upgrade':
        return currentUser ? <ProUpgrade user={currentUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'territory-map':
        return currentUser?.role === 'operator'
          ? <TerritoryMap user={currentUser} />
          : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      case 'revenue-dashboard':
        return currentUser ? <CompanyRevenueDashboard user={currentUser} /> : <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
      default:
        return <HomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser || null} onNavigate={handleNavigate} onLogout={handleLogout} />
      {isDemoMode && currentUser && (
        <DemoModeBanner 
          userName={currentUser.fullName} 
          userRole={currentUser.role}
        />
      )}
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App