import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { safeInput } from "@/lib/utils"
import { CircleNotch, Shield, Lock } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { GlassNav, HeroSection, GlassCard } from "@/components/ui/MarketingSections"

interface LoginPageProps {
  onNavigate: (page: string) => void
  onLogin: (user: User) => void
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [enable2FA, setEnable2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; twoFactor?: string }>({})
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
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
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
      />

      <div className="pt-20 pb-16 px-4">
        <HeroSection
          title="Welcome back"
          subtitle="Log in to manage bids, jobs, invoices, and CRM."
          primaryAction={{ label: "Create an account", onClick: () => onNavigate("signup") }}
        />

        {/* Security Indicator */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield size={20} weight="fill" className="text-[#00FF00]" />
            <span>Secure login with encrypted connection</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8 md:p-10 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Sign In</h2>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
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
                  className={`h-12 text-base ${errors.email ? "border-[#FF0000] focus:border-[#FF0000]" : "focus:border-[#00FF00]"} transition-colors`}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-[#FF0000] font-medium" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                  <button
                    type="button"
                    onClick={() => onNavigate("forgot-password")}
                    className="text-sm text-[#00FF00] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={`h-12 text-base ${errors.password ? "border-[#FF0000] focus:border-[#FF0000]" : "focus:border-[#00FF00]"} transition-colors`}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-[#FF0000] font-medium" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-2fa"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#00FF00]"
                />
                <Label htmlFor="enable-2fa" className="text-sm font-normal cursor-pointer">
                  Use two-factor authentication
                </Label>
              </div>

              {enable2FA && (
                <div className="space-y-2 p-4 bg-[#00FF00]/10 dark:bg-[#00FF00]/5 rounded-lg border border-[#00FF00]/20">
                  <Label htmlFor="twoFactor" className="text-base font-semibold">2FA Code</Label>
                  <Input
                    id="twoFactor"
                    type="text"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setTwoFactorCode(value)
                      if (errors.twoFactor) setErrors((prev) => ({ ...prev, twoFactor: undefined }))
                    }}
                    className={`h-12 text-lg font-mono text-center tracking-widest ${errors.twoFactor ? "border-[#FF0000] focus:border-[#FF0000]" : "focus:border-[#00FF00]"} transition-colors`}
                    disabled={isLoading}
                    maxLength={6}
                    aria-invalid={!!errors.twoFactor}
                    aria-describedby={errors.twoFactor ? "twoFactor-error" : undefined}
                  />
                  {errors.twoFactor && (
                    <p id="twoFactor-error" className="text-sm text-[#FF0000] font-medium" role="alert">
                      {errors.twoFactor}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-[#00FF00] hover:bg-[#00DD00] text-black border-2 border-[#00FF00] shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" weight="bold" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
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
