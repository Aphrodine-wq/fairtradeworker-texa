import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnvelopeSimple, DeviceMobile, PaperPlaneRight, CircleNotch } from "@phosphor-icons/react"
import { toast } from "sonner"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { safeInput } from "@/lib/utils"
import type { User, CRMCustomer } from "@/lib/types"

interface InstantInviteProps {
  user: User
}

export function InstantInvite({ user }: InstantInviteProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
  }>({})

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [])

  const validatePhone = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10 || cleaned.length === 11
  }, [])

  const handleSendEmailInvite = useCallback(async () => {
    setErrors({})
    
    // Validation
    if (!name.trim()) {
      setErrors({ name: "Customer name is required" })
      toast.error("Please enter customer's name")
      return
    } else if (name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" })
      toast.error("Name must be at least 2 characters")
      return
    }
    
    if (!email.trim()) {
      setErrors({ email: "Email is required" })
      toast.error("Please enter an email address")
      return
    } else if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" })
      toast.error("Please enter a valid email address")
      return
    }

    // Check for duplicate
    const existingCustomer = (customers || []).find(
      c => c.email?.toLowerCase() === email.trim().toLowerCase()
    )
    if (existingCustomer) {
      setErrors({ email: "Customer with this email already exists" })
      toast.error("Customer with this email already exists")
      return
    }

    setIsSending(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const newCustomer: CRMCustomer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        contractorId: user.id,
        name: safeInput(name.trim()),
        email: safeInput(email.trim().toLowerCase()),
        invitedVia: 'email',
        invitedAt: new Date().toISOString(),
        status: 'lead',
        source: 'manual_invite',
        lifetimeValue: 0,
        lastContact: new Date().toISOString(),
        tags: [],
        createdAt: new Date().toISOString()
      }

      setCustomers((current) => [...(current || []), newCustomer])

      toast.success("Email invite sent!", {
        description: `Invite sent to ${email} – homeowner joins in 2 clicks!`,
      })

      setName("")
      setEmail("")
      setErrors({})
    } catch (error) {
      console.error("Error sending email invite:", error)
      toast.error("Failed to send invite. Please try again.")
    } finally {
      setIsSending(false)
    }
  }, [name, email, customers, validateEmail, setCustomers, user.id])

  const handleSendSMSInvite = useCallback(async () => {
    setErrors({})
    
    // Validation
    if (!name.trim()) {
      setErrors({ name: "Customer name is required" })
      toast.error("Please enter customer's name")
      return
    } else if (name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" })
      toast.error("Name must be at least 2 characters")
      return
    }
    
    if (!phone.trim()) {
      setErrors({ phone: "Phone number is required" })
      toast.error("Please enter a phone number")
      return
    } else if (!validatePhone(phone)) {
      setErrors({ phone: "Please enter a valid 10-digit phone number" })
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    // Check for duplicate
    const cleanedPhone = phone.replace(/\D/g, '')
    const existingCustomer = (customers || []).find(
      c => c.phone?.replace(/\D/g, '') === cleanedPhone
    )
    if (existingCustomer) {
      setErrors({ phone: "Customer with this phone number already exists" })
      toast.error("Customer with this phone number already exists")
      return
    }

    setIsSending(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const newCustomer: CRMCustomer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        contractorId: user.id,
        name: safeInput(name.trim()),
        phone: safeInput(phone.trim()),
        invitedVia: 'sms',
        invitedAt: new Date().toISOString(),
        status: 'lead',
        source: 'manual_invite',
        lifetimeValue: 0,
        lastContact: new Date().toISOString(),
        tags: [],
        createdAt: new Date().toISOString()
      }

      setCustomers((current) => [...(current || []), newCustomer])

      toast.success("SMS invite sent!", {
        description: `Text sent to ${phone} – homeowner joins in 2 clicks!`,
      })

      setName("")
      setPhone("")
      setErrors({})
    } catch (error) {
      console.error("Error sending SMS invite:", error)
      toast.error("Failed to send invite. Please try again.")
    } finally {
      setIsSending(false)
    }
  }, [name, phone, customers, validatePhone, setCustomers, user.id])

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PaperPlaneRight weight="duotone" size={24} className="text-primary" />
          Instant Customer Invite
        </CardTitle>
        <CardDescription>
          Add homeowners to your CRM instantly – perfect for in-person sign-ups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <DeviceMobile weight="duotone" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <EnvelopeSimple weight="duotone" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="sms-name">Customer Name *</Label>
              <Input
                id="sms-name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => {
                  setName(safeInput(e.target.value))
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                }}
                onBlur={() => {
                  if (name && name.trim().length < 2) {
                    setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }))
                  }
                }}
                className={errors.name ? "border-[#FF0000]" : ""}
                disabled={isSending}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "sms-name-error" : undefined}
              />
              {errors.name && (
                <p id="sms-name-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-phone">Phone Number *</Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => {
                  // Format phone number
                  const value = e.target.value.replace(/\D/g, '')
                  let formatted = value
                  if (value.length > 0) {
                    if (value.length <= 3) {
                      formatted = `(${value}`
                    } else if (value.length <= 6) {
                      formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`
                    } else {
                      formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
                    }
                  }
                  setPhone(formatted.slice(0, 14))
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
                }}
                onBlur={() => {
                  if (phone && !validatePhone(phone)) {
                    setErrors(prev => ({ ...prev, phone: "Please enter a valid 10-digit phone number" }))
                  }
                }}
                className={errors.phone ? "border-[#FF0000]" : ""}
                disabled={isSending}
                maxLength={14}
                required
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "sms-phone-error" : undefined}
              />
              {errors.phone && (
                <p id="sms-phone-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>
            <Button
              onClick={handleSendSMSInvite}
              disabled={isSending}
              className="w-full border-2 border-black dark:border-white"
            >
              {isSending ? (
                <>
                  <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                  Sending...
                </>
              ) : (
                <>
                  <DeviceMobile weight="bold" className="mr-2" size={18} />
                  Send SMS Invite
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-name">Customer Name *</Label>
              <Input
                id="email-name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => {
                  setName(safeInput(e.target.value))
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                }}
                onBlur={() => {
                  if (name && name.trim().length < 2) {
                    setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }))
                  }
                }}
                className={errors.name ? "border-[#FF0000]" : ""}
                disabled={isSending}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "email-name-error" : undefined}
              />
              {errors.name && (
                <p id="email-name-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address *</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(safeInput(e.target.value))
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                }}
                onBlur={() => {
                  if (email && !validateEmail(email)) {
                    setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
                  }
                }}
                className={errors.email ? "border-[#FF0000]" : ""}
                disabled={isSending}
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-address-error" : undefined}
              />
              {errors.email && (
                <p id="email-address-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <Button
              onClick={handleSendEmailInvite}
              className="w-full border-2 border-black dark:border-white"
              size="lg"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeSimple weight="bold" className="mr-2" />
                  Send Email Invite
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
