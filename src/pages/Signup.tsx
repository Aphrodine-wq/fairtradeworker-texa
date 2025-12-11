import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import type { User, UserRole } from "@/lib/types"

interface SignupPageProps {
  onNavigate: (page: string) => void
  onLogin: (user: User) => void
  preselectedRole?: UserRole
}

export function SignupPage({ onNavigate, onLogin, preselectedRole }: SignupPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole | "">(preselectedRole || "")
  const [users, setUsers] = useKV<User[]>("users", [])

  useEffect(() => {
    if (preselectedRole) {
      setRole(preselectedRole)
    }
  }, [preselectedRole])

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!role) {
      toast.error("Please select your role")
      return
    }

    const existingUser = (users || []).find(u => u.email === email)
    if (existingUser) {
      toast.error("Account already exists. Please log in.")
      return
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      role: role as UserRole,
      isPro: false,
      createdAt: new Date().toISOString()
    }

    setUsers((currentUsers) => [...(currentUsers || []), newUser])
    toast.success("Account created successfully!")
    onLogin(newUser)
    onNavigate('home')
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join FairTradeWorker Texas today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-primary hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
