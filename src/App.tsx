import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HomePage } from "@/pages/Home"
import { LoginPage } from "@/pages/Login"
import { SignupPage } from "@/pages/Signup"
import { JobPoster } from "@/components/jobs/JobPoster"
import { BrowseJobs } from "@/components/jobs/BrowseJobs"
import { ContractorDashboard } from "@/components/contractor/ContractorDashboard"
import { ProUpgrade } from "@/components/contractor/ProUpgrade"
import { TerritoryMap } from "@/components/territory/TerritoryMap"
import { useKV } from "@github/spark/hooks"
import type { User, UserRole } from "@/lib/types"

type Page = 'home' | 'login' | 'signup' | 'post-job' | 'browse-jobs' | 'dashboard' | 'pro-upgrade' | 'territory-map'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [currentUser, setCurrentUser] = useKV<User | null>("current-user", null)
  const [preselectedRole, setPreselectedRole] = useState<UserRole | undefined>()

  const handleNavigate = (page: string, role?: string) => {
    if (role) {
      setPreselectedRole(role as UserRole)
    }
    setCurrentPage(page as Page)
    window.scrollTo(0, 0)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} onLogin={handleLogin} preselectedRole={preselectedRole} />
      case 'post-job':
        return currentUser ? <JobPoster user={currentUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />
      case 'browse-jobs':
        return currentUser ? <BrowseJobs user={currentUser} /> : <HomePage onNavigate={handleNavigate} />
      case 'dashboard':
        return currentUser?.role === 'contractor' 
          ? <ContractorDashboard user={currentUser} onNavigate={handleNavigate} />
          : <HomePage onNavigate={handleNavigate} />
      case 'pro-upgrade':
        return currentUser ? <ProUpgrade user={currentUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />
      case 'territory-map':
        return currentUser?.role === 'operator'
          ? <TerritoryMap user={currentUser} />
          : <HomePage onNavigate={handleNavigate} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser || null} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App