import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { safeInput } from "@/lib/utils"
import { CircleNotch } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { GlassNav, HeroSection, GlassCard, ThemePersistenceToggle } from "@/components/ui/MarketingSections"

interface LoginPageProps {
  onNavigate: (page: string) => void
  onLogin: (user: User) => void
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [users] = useKV<User[]>("users", [])

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address"
    if (!password.trim()) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, password, validateEmail])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const sanitizedEmail = safeInput(email.trim().toLowerCase())
        const user = (users || []).find((u) => u.email.toLowerCase() === sanitizedEmail)
        if (!user) {
          toast.error("Account not found. Please sign up first.")
          setErrors({ email: "No account found with this email" })
          setIsLoading(false)
          return
        }
        toast.success(`Welcome back, ${user.fullName}!`)
        onLogin(user)
        onNavigate("home")
      } catch (error) {
        console.error("Login error:", error)
        toast.error("An error occurred. Please try again.")
        setIsLoading(false)
      }
    },
    [email, password, users, validateForm, onLogin, onNavigate]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Login", href: "#", active: true },
          { label: "Signup", href: "#" },
        ]}
        primaryLabel="Post Job"
      >
        <ThemePersistenceToggle />
      </GlassNav>

      <div className="pt-20 pb-16 px-4">
        <HeroSection
          title="Welcome back"
          subtitle="Log in to manage bids, jobs, invoices, and CRM with zero platform fees."
          primaryAction={{ label: "Create an account", onClick: () => onNavigate("signup") }}
        />

        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  onBlur={() => {
                    if (email && !validateEmail(email)) {
                      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
                    }
                  }}
                  className={errors.email ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={errors.password ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full border-2 border-black dark:border-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" weight="bold" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <button type="button" onClick={() => onNavigate("signup")} className="text-primary hover:underline font-medium">
                  Sign up
                </button>
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
