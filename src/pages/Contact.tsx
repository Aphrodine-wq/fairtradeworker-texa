import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  EnvelopeSimple, 
  Phone, 
  ChatCircleDots, 
  Question,
  House,
  Hammer,
  MapTrifold
} from "@phosphor-icons/react"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { safeInput } from "@/lib/utils"
import { CircleNotch } from "@phosphor-icons/react"

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    userType?: string
    subject?: string
    message?: string
  }>({})

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.userType) {
      newErrors.userType = "Please select your role"
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters"
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = "Message is too long (max 2000 characters)"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, validateEmail])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Message sent successfully!", {
        description: "Our support team will get back to you within 24 hours."
      })
      
      setFormData({
        name: "",
        email: "",
        userType: "",
        subject: "",
        message: ""
      })
      setErrors({})
    } catch (error) {
      console.error("Contact form error:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: safeInput(value)
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }, [errors])

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Customer Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions or need help? We're here to support you. Choose your preferred way to reach us.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <EnvelopeSimple weight="fill" className="text-primary-foreground" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Email Support</h3>
            <p className="text-muted-foreground">
              Send us an email and we'll respond within 24 hours.
            </p>
            <a 
              href="mailto:support@fairtradeworker.com" 
              className="text-primary hover:underline font-medium inline-block"
            >
              support@fairtradeworker.com
            </a>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Phone weight="fill" className="text-secondary-foreground" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Phone Support</h3>
            <p className="text-muted-foreground">
              Call us Monday-Friday, 9am-5pm EST.
            </p>
            <a 
              href="tel:+18005551234" 
              className="text-primary hover:underline font-medium inline-block"
            >
              1-800-555-1234
            </a>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <ChatCircleDots weight="fill" className="text-accent-foreground" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Live Chat</h3>
            <p className="text-muted-foreground">
              Chat with our team in real-time during business hours.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => toast.info("Live chat will be available soon!")}
            >
              Start Chat
            </Button>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Send us a Message</h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.name && formData.name.trim().length < 2) {
                        setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }))
                      }
                    }}
                    placeholder="John Smith"
                    className={errors.name ? "border-[#FF0000]" : ""}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.email && !validateEmail(formData.email)) {
                        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
                      }
                    }}
                    placeholder="john@example.com"
                    className={errors.email ? "border-[#FF0000]" : ""}
                    disabled={isSubmitting}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">I am a... *</Label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  onBlur={() => {
                    if (!formData.userType) {
                      setErrors(prev => ({ ...prev, userType: "Please select your role" }))
                    }
                  }}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.userType ? "border-[#FF0000]" : ""}`}
                  disabled={isSubmitting}
                  required
                  aria-invalid={!!errors.userType}
                >
                  <option value="">Select user type</option>
                  <option value="homeowner">Homeowner</option>
                  <option value="contractor">Contractor</option>
                  <option value="operator">Operator</option>
                  <option value="other">Other</option>
                </select>
                {errors.userType && (
                  <p className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.userType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.subject && formData.subject.trim().length < 3) {
                      setErrors(prev => ({ ...prev, subject: "Subject must be at least 3 characters" }))
                    }
                  }}
                  placeholder="How can we help you?"
                  className={errors.subject ? "border-[#FF0000]" : ""}
                  disabled={isSubmitting}
                  required
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                />
                {errors.subject && (
                  <p id="subject-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.message && formData.message.trim().length < 10) {
                      setErrors(prev => ({ ...prev, message: "Message must be at least 10 characters" }))
                    } else if (formData.message && formData.message.trim().length > 2000) {
                      setErrors(prev => ({ ...prev, message: "Message is too long (max 2000 characters)" }))
                    }
                  }}
                  placeholder="Please describe your question or issue in detail..."
                  rows={6}
                  className={errors.message ? "border-[#FF0000]" : ""}
                  disabled={isSubmitting}
                  required
                  maxLength={2000}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.message}
                  </p>
                )}
                {!errors.message && formData.message.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.message.length}/2000 characters
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full md:w-auto px-8 border-2 border-black dark:border-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" weight="bold" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Question weight="fill" className="text-primary" size={32} />
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <House weight="fill" className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">For Homeowners</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: Is it really free to post jobs?</span><br />
                  A: Yes! There are absolutely no fees for homeowners to post jobs or receive bids.
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: How does AI scoping work?</span><br />
                  A: Upload photos, videos, or voice notes. Our AI analyzes them and provides an instant project scope and estimate.
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Hammer weight="fill" className="text-secondary" size={24} />
                <h3 className="text-lg font-semibold">For Contractors</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: Are there any platform fees?</span><br />
                  A: No! Contractors keep 100% of what they earn. No subscription, no per-lead fees.
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: How do I get more visibility?</span><br />
                  A: High performance scores (based on accepted bids and accuracy) rank you higher in bid lists.
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <MapTrifold weight="fill" className="text-accent" size={24} />
                <h3 className="text-lg font-semibold">For Operators</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: What does an operator do?</span><br />
                  A: Operators claim territories and help grow the marketplace by tracking metrics and supporting local contractors.
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Q: How do I claim a territory?</span><br />
                  A: Sign up as an operator and view the territory map to see available areas.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Support */}
        <Card className="p-8 bg-primary/5 border-primary/20 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Need More Help?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our support team is available Monday through Friday, 9am-5pm EST. 
              We typically respond to emails within 24 hours and phone calls are answered during business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => window.location.href = 'mailto:support@fairtradeworker.com'}>
                <EnvelopeSimple weight="fill" className="mr-2" size={20} />
                Email Us
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'tel:+18005551234'}>
                <Phone weight="fill" className="mr-2" size={20} />
                Call Us
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
