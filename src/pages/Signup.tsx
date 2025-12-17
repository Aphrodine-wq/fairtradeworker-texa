import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { safeInput } from "@/lib/utils"
import { CircleNotch } from "@phosphor-icons/react"
import type { User, UserRole } from "@/lib/types"
import { GlassNav, HeroSection, GlassCard } from "@/components/ui/MarketingSections"

interface SignupPageProps {
  onNavigate: (page: string) => void
  onLogin: (user: User) => void
  preselectedRole?: UserRole
}

export function SignupPage({ onNavigate, onLogin, preselectedRole }: SignupPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<UserRole | "">(preselectedRole || "")
  const [enable2FA, setEnable2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    phone?: string
    role?: string
  }>({})
  const [users, setUsers] = useKV<User[]>("users", [])

  useEffect(() => {
    if (preselectedRole) {
      setRole(preselectedRole)
    }
  }, [preselectedRole])

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}

    if (!fullName.trim()) newErrors.fullName = "Full name is required"
    else if (fullName.trim().length < 2) newErrors.fullName = "Name must be at least 2 characters"

    if (!email.trim()) newErrors.email = "Email is required"
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address"

    if (!password.trim()) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
    else if (password.length > 128) newErrors.password = "Password is too long (max 128 characters)"
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and a number"
    }

    if (!confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (phone.trim() && !/^[\d\s\-\(\)]+$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!role) newErrors.role = "Please select your role"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fullName, email, password, confirmPassword, phone, role, validateEmail])

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const sanitizedEmail = safeInput(email.trim().toLowerCase())
        const existingUser = (users || []).find((u) => u.email.toLowerCase() === sanitizedEmail)
        if (existingUser) {
          toast.error("Account already exists. Please log in.")
          setErrors({ email: "An account with this email already exists" })
          setIsLoading(false)
          return
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: sanitizedEmail,
          fullName: safeInput(fullName.trim()),
          role: role as UserRole,
          isPro: false,
          performanceScore: 0,
          bidAccuracy: 0,
          isOperator: false,
          referralEarnings: 0,
          contractorInviteCount: 0,
          createdAt: new Date().toISOString(),
        }
        setUsers((currentUsers) => [...(currentUsers || []), newUser])
        toast.success(`Welcome to FairTradeWorker, ${newUser.fullName}!`)
        onLogin(newUser)
        onNavigate("home")
      } catch (error) {
        console.error("Signup error:", error)
        toast.error("Failed to create account. Please try again.")
        setIsLoading(false)
      }
    },
    [email, password, fullName, role, users, validateForm, setUsers, onLogin, onNavigate]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Signup", href: "#", active: true },
          { label: "Login", href: "#" },
        ]}
        primaryLabel="Post Job" />

      <div className="pt-20 pb-16 px-4">
        <HeroSection
          title="Create your free account"
          subtitle="Join our marketplace where contractors keep 100% of earnings and homeowners get transparent bids."
          primaryAction={{ label: "Already registered? Log in", onClick: () => onNavigate("login") }}
        />

        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-6 md:p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  onBlur={() => {
                    if (fullName && fullName.trim().length < 2) {
                      setErrors((prev) => ({ ...prev, fullName: "Name must be at least 2 characters" }))
                    }
                  }}
                  className={errors.fullName ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

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
                  onBlur={() => {
                    if (password && password.length < 6) {
                      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }))
                    }
                  }}
                  className={errors.password ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  required
                  minLength={6}
                  maxLength={128}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.password}
                  </p>
                )}
                {!errors.password && password.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Strength: {password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) ? "Strong" : password.length >= 6 ? "Medium" : "Weak"}
                    </p>
                    <div className="flex gap-1">
                      {[
                        password.length >= 8,
                        /[a-z]/.test(password),
                        /[A-Z]/.test(password),
                        /\d/.test(password)
                      ].map((met, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  className={errors.confirmPassword ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  required
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    const formatted = value.length <= 10 
                      ? value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3').replace(/(\d{3})(\d{3})/, '($1) $2-').replace(/(\d{3})/, '($1')
                      : phone
                    setPhone(formatted)
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  className={errors.phone ? "border-[#FF0000]" : ""}
                  disabled={isLoading}
                  maxLength={14}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value as UserRole)
                    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role" className={errors.role ? "border-[#FF0000]" : ""} aria-invalid={!!errors.role}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homeowner">Homeowner</SelectItem>
                    <SelectItem value="contractor">Contractor/Subcontractor</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-2fa-signup"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="h-4 w-4 rounded border-black dark:border-white"
                />
                <Label htmlFor="enable-2fa-signup" className="text-sm font-normal cursor-pointer">
                  Enable two-factor authentication for extra security
                </Label>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/50">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Security:</strong> We use industry-standard encryption and security practices. 
                  {enable2FA && " 2FA will be set up after account creation."}
                </p>
              </div>

              <Button type="submit" className="w-full border-2 border-black dark:border-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" weight="bold" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <button type="button" onClick={() => onNavigate("login")} className="text-primary hover:underline font-medium">
                  Log in
                </button>
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
