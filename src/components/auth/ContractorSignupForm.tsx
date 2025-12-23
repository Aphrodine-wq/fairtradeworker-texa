import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle, CircleNotch, ShieldCheck } from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"

interface ContractorSignupFormProps {
  onSuccess?: () => void
}

export function ContractorSignupForm({ onSuccess }: ContractorSignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [signups, setSignups] = useLocalKV<any[]>("contractor-signups", [])
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    credentials: '',
    expertise: '',
    experience: [0],
    termsAccepted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save to local storage (simulating DB)
    const newSignup = {
      id: crypto.randomUUID(),
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'pending_verification'
    }
    
    setSignups([...signups, newSignup])
    
    // Simulate email notification
    console.log("Sending confirmation email to:", formData.email)
    console.log("Sending admin notification for new signup:", formData.fullName)

    setIsLoading(false)
    setIsSuccess(true)
    toast.success("Registration successful! Welcome aboard.")
    
    if (onSuccess) onSuccess()
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" weight="fill" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Welcome to the Team!</h3>
          <p className="text-muted-foreground">
            Your account has been created. We've sent a confirmation email to <strong>{formData.email}</strong>.
          </p>
          <div className="p-4 bg-white dark:bg-black rounded-lg border border-border text-left space-y-2 mt-4">
            <p className="text-sm font-medium">Next Steps:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>Check your email for verification link</li>
              <li>Complete your profile with photos</li>
              <li>Verify your insurance to get the Pro badge</li>
            </ul>
          </div>
          <Button className="w-full" onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Pro Account</CardTitle>
        <CardDescription>
          Join 100+ contractors signing up this week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="John Smith" 
              required 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="(555) 123-4567" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Primary Trade</Label>
            <Select 
              value={formData.expertise} 
              onValueChange={v => setFormData({...formData, expertise: v})} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Contractor</SelectItem>
                <SelectItem value="electrician">Electrician</SelectItem>
                <SelectItem value="plumber">Plumber</SelectItem>
                <SelectItem value="hvac">HVAC Technician</SelectItem>
                <SelectItem value="carpenter">Carpenter</SelectItem>
                <SelectItem value="painter">Painter</SelectItem>
                <SelectItem value="landscaper">Landscaper</SelectItem>
                <SelectItem value="roofer">Roofer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentials">License / Certification ID</Label>
            <Input 
              id="credentials" 
              placeholder="e.g. LIC-2024-998877" 
              value={formData.credentials}
              onChange={e => setFormData({...formData, credentials: e.target.value})}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <Label>Years of Experience</Label>
              <span className="text-sm font-medium text-primary">{formData.experience[0]} Years</span>
            </div>
            <Slider 
              value={formData.experience} 
              onValueChange={v => setFormData({...formData, experience: v})}
              max={40} 
              step={1} 
              className="py-2"
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={formData.termsAccepted}
              onCheckedChange={(c) => setFormData({...formData, termsAccepted: c as boolean})}
            />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I agree to the <a href="#" className="text-primary underline hover:text-primary/80">Terms of Service</a> and <a href="#" className="text-primary underline hover:text-primary/80">Privacy Policy</a>.
            </Label>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <CircleNotch className="mr-2 h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Free Account"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-green-500" />
            Your data is encrypted and secure.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
