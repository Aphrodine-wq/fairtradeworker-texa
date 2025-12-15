import { Card } from "@/components/ui/card"
import { Gavel, Handshake, ShieldCheck, FileText } from "@phosphor-icons/react"
import { GlassNav, ThemePersistenceToggle } from "@/components/ui/MarketingSections"

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Terms", href: "#", active: true },
          { label: "Privacy", href: "#" },
          { label: "Contact", href: "#" },
        ]}
        primaryLabel="Post Job"
      >
        <ThemePersistenceToggle />
      </GlassNav>
      <div className="pt-20 pb-16 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Gavel weight="fill" className="text-primary" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: December 12, 2025
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These terms govern your use of FairTradeWorker. By using our platform, you agree to these terms.
          </p>
        </div>

        {/* Key Terms Highlights */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Key Terms at a Glance</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Handshake weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Fair Use</h3>
                <p className="text-sm text-muted-foreground">Use the platform honestly and respectfully</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Your Responsibility</h3>
                <p className="text-sm text-muted-foreground">You're responsible for your account and content</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText weight="fill" className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold">Zero Platform Fees</h3>
                <p className="text-sm text-muted-foreground">No fees for posting jobs or submitting bids</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms Content */}
        <div className="space-y-8 text-foreground">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using FairTradeWorker ("the Platform"), you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree, you may not use the Platform. We reserve the right to 
              modify these terms at any time, and continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. Eligibility and Account Registration</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>To use FairTradeWorker, you must:</p>
              <div className="space-y-2 pl-4">
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Be at least 18 years old</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Provide accurate, complete, and current information during registration</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Maintain the security of your account credentials</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Notify us immediately of any unauthorized account access</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Not share your account with others</p>
                </div>
              </div>
              <p>
                Contractors must additionally provide valid business licenses, insurance information, and other 
                credentials as required by law in their jurisdiction.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. User Roles and Responsibilities</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Homeowners</h3>
                <div className="space-y-2 pl-4">
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Provide accurate project descriptions and requirements</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Review bids fairly and communicate promptly</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Pay contractors according to agreed terms</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Provide honest reviews and ratings</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Contractors</h3>
                <div className="space-y-2 pl-4">
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Maintain current licenses, insurance, and certifications</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Submit accurate and honest bids</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Complete accepted projects professionally and on time</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Comply with all local laws and building codes</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Maintain appropriate insurance coverage</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Operators</h3>
                <div className="space-y-2 pl-4">
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Monitor marketplace metrics in claimed territories</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Support local contractor and homeowner growth</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Act ethically and in good faith</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Platform Fees and Payments</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                <p className="font-semibold text-foreground">Zero Platform Fees Policy</p>
                <p className="mt-2">
                  FairTradeWorker does not charge fees for posting jobs or submitting bids. Contractors keep 
                  100% of what homeowners pay them. This is a core principle of our platform.
                </p>
              </div>
              <p>
                Payments between homeowners and contractors are processed through secure third-party payment 
                providers. Standard payment processing fees may apply as charged by these providers. Users are 
                responsible for any taxes related to their transactions.
              </p>
              <p>
                Optional premium features (such as Pro contractor accounts) may be offered for a fee, but the 
                core marketplace remains free for all users.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Content and Intellectual Property</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Content</h3>
                <p>
                  You retain ownership of content you upload (photos, videos, descriptions). By uploading content, 
                  you grant FairTradeWorker a license to use, display, and process this content for providing 
                  services, including AI analysis and matching.
                </p>
                <p className="mt-2">You represent and warrant that:</p>
                <div className="space-y-2 pl-4 mt-2">
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>You own or have rights to all content you upload</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Your content does not violate any laws or third-party rights</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">•</span>
                    <p>Your content is accurate and not misleading</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Content</h3>
                <p>
                  All Platform features, design, text, graphics, and software are owned by FairTradeWorker and 
                  protected by copyright, trademark, and other intellectual property laws. You may not copy, 
                  modify, or create derivative works without permission.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Prohibited Conduct</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <div className="space-y-2 text-muted-foreground pl-4">
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Post false, misleading, or fraudulent information</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Harass, abuse, or harm other users</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Attempt to circumvent the Platform to avoid fair competition</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Use automated tools to scrape or extract data</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Upload malware, viruses, or malicious code</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Impersonate others or misrepresent your identity</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Violate any applicable laws or regulations</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Create multiple accounts to manipulate the system</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Disputes Between Users</h2>
            <p className="text-muted-foreground">
              FairTradeWorker is a marketplace platform that connects homeowners and contractors. We are not a 
              party to contracts between users. Disputes regarding work quality, payment, or project completion 
              are between the homeowner and contractor. While we may provide tools for dispute resolution and 
              communication, we are not responsible for resolving disputes or enforcing agreements.
            </p>
            <p className="text-muted-foreground">
              Users are encouraged to resolve disputes directly and professionally. Repeated disputes or 
              violations of terms may result in account suspension or termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. Ratings and Reviews</h2>
            <p className="text-muted-foreground">
              Users may rate and review each other after project completion. Reviews must be honest, accurate, 
              and based on actual experiences. Fake reviews, review manipulation, or retaliation through reviews 
              is prohibited and may result in account termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. Account Suspension and Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <div className="space-y-2 text-muted-foreground pl-4">
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Violate these Terms of Service</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Engage in fraudulent or illegal activity</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Receive multiple complaints or negative reports</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">•</span>
                <p>Remain inactive for extended periods</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Users may also terminate their accounts at any time through account settings or by contacting support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">10. Disclaimers and Limitations of Liability</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="font-semibold text-foreground mb-2">AS-IS SERVICE</p>
                <p>
                  The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted 
                  access, error-free operation, or that the Platform will meet your specific requirements.
                </p>
              </div>
              <p>
                FairTradeWorker is not responsible for:
              </p>
              <div className="space-y-2 pl-4">
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Quality of work performed by contractors</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Accuracy of job postings or bids</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Payment disputes between users</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Injuries or damages resulting from work performed</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">•</span>
                  <p>Compliance with local building codes or regulations</p>
                </div>
              </div>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FAIRTRADEWORKER SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">11. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless FairTradeWorker and its officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses (including legal fees) arising from your 
              use of the Platform, violation of these terms, or violation of any rights of another party.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">12. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of the United States and the state in which FairTradeWorker 
              is incorporated, without regard to conflict of law provisions. Any disputes will be resolved through 
              binding arbitration in accordance with the American Arbitration Association rules, except where 
              prohibited by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these Terms of Service at any time. Material changes will be communicated through 
              email or prominent platform notices. Continued use after changes take effect constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">14. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact us:
            </p>
            <Card className="p-4 bg-muted">
              <p className="text-sm space-y-1">
                <strong>Email:</strong> <a href="mailto:legal@fairtradeworker.com" className="text-primary hover:underline">legal@fairtradeworker.com</a><br />
                <strong>Phone:</strong> 1-800-555-1234<br />
                <strong>Mail:</strong> FairTradeWorker, Legal Department, 123 Main Street, Suite 100, City, ST 12345
              </p>
            </Card>
          </section>
        </div>

        {/* Bottom Notice */}
        <Card className="p-6 bg-primary/5 border-primary/20 text-center">
          <h3 className="text-xl font-bold mb-2">Agreement to Terms</h3>
          <p className="text-muted-foreground">
            By using FairTradeWorker, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms of Service and our Privacy Policy.
          </p>
        </Card>
      </div>
    </div>
  )
}
