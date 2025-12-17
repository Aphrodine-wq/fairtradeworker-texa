import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, UserCircle } from "@phosphor-icons/react"
import { GlassNav } from "@/components/ui/MarketingSections"

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Privacy", href: "#", active: true },
          { label: "Terms", href: "#" },
          { label: "Contact", href: "#" },
        ]}
        primaryLabel="Post Job" />

      <div className="w-full pt-20 pb-16 px-4 md:px-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield weight="fill" className="text-primary" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: December 12, 2025
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At FairTradeWorker, we take your privacy seriously. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
        </div>

        {/* Key Principles */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Our Privacy Principles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Lock weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Secure by Default</h3>
                <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Transparent</h3>
                <p className="text-sm text-muted-foreground">We're clear about what data we collect and why</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Minimal Collection</h3>
                <p className="text-sm text-muted-foreground">We only collect data necessary for the service</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCircle weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Your Control</h3>
                <p className="text-sm text-muted-foreground">You can access, update, or delete your data anytime</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Policy Content */}
        <div className="space-y-8 text-foreground">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
                <p>
                  When you create an account, we collect your name, email address, phone number, 
                  and user type (homeowner, contractor, or operator). Contractors may also provide 
                  business information, licenses, and insurance details.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Job and Project Data</h3>
                <p>
                  Homeowners may upload photos, videos, voice recordings, and project descriptions. 
                  This data is used to generate AI-powered project scopes and match jobs with contractors.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Usage Information</h3>
                <p>
                  We collect information about how you use the platform, including pages visited, 
                  features used, bids submitted, and jobs posted. This helps us improve the service 
                  and provide better recommendations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Payment Information</h3>
                <p>
                  Payment processing is handled by secure third-party providers. We do not store 
                  complete credit card numbers. We receive transaction confirmations and payment status updates.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Provide Services:</strong> Connect homeowners with contractors, process bids, and facilitate project completion</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">AI Processing:</strong> Analyze uploaded media to generate project scopes and price estimates</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Improve Platform:</strong> Analyze usage patterns to enhance features and user experience</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Communication:</strong> Send important updates, notifications, and support messages</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Security:</strong> Detect and prevent fraud, abuse, and security threats</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Legal Compliance:</strong> Meet regulatory requirements and respond to legal requests</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Information Sharing</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">We do not sell your personal information.</strong> We may share information in these specific circumstances:
              </p>
              <div className="space-y-3 pl-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">With Other Users</h3>
                  <p>
                    Homeowners and contractors can see relevant profile information when engaging in job postings 
                    and bidding. This includes name, ratings, reviews, and portfolio items.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Service Providers</h3>
                  <p>
                    We work with trusted third parties for payment processing, AI analysis, cloud hosting, 
                    and customer support. These partners are contractually obligated to protect your data.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Legal Requirements</h3>
                  <p>
                    We may disclose information if required by law, court order, or to protect rights, 
                    property, or safety of FairTradeWorker, our users, or others.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Business Transfers</h3>
                  <p>
                    If FairTradeWorker is involved in a merger, acquisition, or sale, your information 
                    may be transferred as part of that transaction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your information:
            </p>
            <div className="space-y-2 text-muted-foreground pl-4">
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Encryption of data in transit (HTTPS/TLS) and at rest</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Regular security audits and vulnerability assessments</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Access controls and authentication requirements</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Secure backup systems and disaster recovery plans</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Employee training on data protection best practices</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Your Rights and Choices</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <div className="space-y-2 text-muted-foreground pl-4">
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Access:</strong> Request a copy of your personal data</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p><strong className="text-foreground">Export:</strong> Download your data in a portable format</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              To exercise these rights, contact us at <a href="mailto:privacy@fairtradeworker.com" className="text-primary hover:underline">privacy@fairtradeworker.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze usage, and remember 
              your preferences. You can control cookie settings through your browser, but some features may 
              not function properly if cookies are disabled.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as necessary to provide services, comply with legal obligations, 
              resolve disputes, and enforce agreements. When you delete your account, we remove personal information 
              within 30 days, though some data may be retained for legal or security purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              FairTradeWorker is not intended for users under 18 years of age. We do not knowingly collect 
              information from children. If you believe we have collected information from a child, please 
              contact us immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of material changes by 
              email or through a prominent notice on the platform. Continued use after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <Card className="p-4 bg-muted">
              <p className="text-sm space-y-1">
                <strong>Email:</strong> <a href="mailto:privacy@fairtradeworker.com" className="text-primary hover:underline">privacy@fairtradeworker.com</a><br />
                <strong>Phone:</strong> 1-800-555-1234<br />
                <strong>Mail:</strong> FairTradeWorker, Privacy Department, 123 Main Street, Suite 100, City, ST 12345
              </p>
            </Card>
          </section>
        </div>

        {/* Bottom CTA */}
        <Card className="p-6 bg-primary/5 border-primary/20 text-center">
          <h3 className="text-xl font-bold mb-2">Your Privacy Matters</h3>
          <p className="text-muted-foreground">
            We're committed to protecting your data and being transparent about our practices. 
            If you have any concerns, please don't hesitate to reach out.
          </p>
        </Card>
      </div>
    </div>
  )
}
