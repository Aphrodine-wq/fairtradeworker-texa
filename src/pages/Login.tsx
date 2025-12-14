import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import type { User } from "@/lib/types"

interface LoginPageProps {
  onNavigate: (page: string) => void
  onLogin: (user: User) => void
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [users] = useKV<User[]>("users", [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = (users || []).find(u => u.email === email)
    if (!user) {
      toast.error("Account not found. Please sign up first.")
      return
    }
    
    toast.success("Welcome back!")
    onLogin(user)
    onNavigate('home')
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 p-[1pt]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription>
            Enter your email to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Log In
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
