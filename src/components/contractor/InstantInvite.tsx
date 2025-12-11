import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnvelopeSimple, DeviceMobile, PaperPlaneRight } from "@phosphor-icons/react"
import { toast } from "sonner"
import { useKV } from "@github/spark/hooks"
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10 || cleaned.length === 11
  }

  const handleSendEmailInvite = async () => {
    if (!name.trim()) {
      toast.error("Please enter customer's name")
      return
    }
    
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSending(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const newCustomer: CRMCustomer = {
      id: `customer-${Date.now()}-${Math.random()}`,
      contractorId: user.id,
      name: name.trim(),
      email: email.trim(),
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
    setIsSending(false)
  }

  const handleSendSMSInvite = async () => {
    if (!name.trim()) {
      toast.error("Please enter customer's name")
      return
    }
    
    if (!phone.trim() || !validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsSending(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const newCustomer: CRMCustomer = {
      id: `customer-${Date.now()}-${Math.random()}`,
      contractorId: user.id,
      name: name.trim(),
      phone: phone.trim(),
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
    setIsSending(false)
  }

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
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <EnvelopeSimple weight="duotone" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <DeviceMobile weight="duotone" />
              SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-name">Customer Name</Label>
              <Input
                id="email-name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSending}
              />
            </div>
            <Button
              onClick={handleSendEmailInvite}
              className="w-full"
              size="lg"
              disabled={isSending}
            >
              <EnvelopeSimple weight="bold" className="mr-2" />
              {isSending ? "Sending..." : "Send Email Invite"}
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="sms-name">Customer Name</Label>
              <Input
                id="sms-name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSending}
              />
            </div>
            <Button
              onClick={handleSendSMSInvite}
              className="w-full"
              size="lg"
              disabled={isSending}
            >
              <DeviceMobile weight="bold" className="mr-2" />
              {isSending ? "Sending..." : "Send SMS Invite"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
