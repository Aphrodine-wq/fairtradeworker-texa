import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Sparkle } from "@phosphor-icons/react"
import { containerVariants, itemVariants } from "@/lib/animations"

interface CareersProps {
  onNavigate?: (page: string) => void
}

export function CareersPage({ onNavigate }: CareersProps) {
  const openPositions = [
    {
      id: 'senior-frontend',
      title: 'Senior Frontend Developer',
      location: 'Remote / Austin, TX',
      type: 'Full-time',
      department: 'Engineering',
      description: 'Build beautiful, performant user interfaces for FairTradeWorker. Work with React, TypeScript, and modern web technologies.',
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      location: 'Remote / Austin, TX',
      type: 'Full-time',
      department: 'Product',
      description: 'Shape the future of FairTradeWorker. Work closely with contractors and homeowners to build features that matter.',
    },
    {
      id: 'customer-success',
      title: 'Customer Success Manager',
      location: 'Remote',
      type: 'Full-time',
      department: 'Customer Success',
      description: 'Help contractors succeed on our platform. Build relationships and ensure customer satisfaction.',
    },
  ]

  const benefits = [
    { icon: '💰', title: 'Competitive Salary', description: 'We pay top of market' },
    { icon: '🏥', title: 'Health Insurance', description: 'Full medical, dental, vision' },
    { icon: '🏖️', title: 'Unlimited PTO', description: 'Take time when you need it' },
    { icon: '💻', title: 'Remote First', description: 'Work from anywhere' },
    { icon: '📚', title: 'Learning Budget', description: '$2,000/year for growth' },
    { icon: '⚡', title: 'Equity', description: 'Own a piece of the company' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-8"
        >
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join the FairTradeWorker Team
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            We're building the future of fair trade in construction. Help us create a platform that puts contractors first.
          </p>
        </motion.div>

        {/* Why Work Here */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <Card className="glass-card border-0 p-8 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Why FairTradeWorker?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We're eliminating fees and unfair practices in construction. Every feature we build helps contractors keep more of what they earn.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Our Culture</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We move fast, ship often, and care deeply about our users. We're a small, passionate team building something meaningful.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Benefits & Perks</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-lg glass-card border-0"
                >
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Open Positions</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {openPositions.map((position) => (
              <motion.div
                key={position.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="glass-card border-0 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{position.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase size={16} />
                            {position.department}
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          // In a real app, this would open an application form or external link
                          window.open(`mailto:careers@fairtradeworker.com?subject=Application: ${position.title}`, '_blank')
                        }}
                        className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{position.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Don't See a Role? */}
        <Card className="glass-card border-0 p-8 text-center">
          <CardContent>
            <Sparkle size={48} className="mx-auto mb-4 text-black dark:text-white" weight="duotone" />
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">Don't See a Role That Fits?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
            </p>
            <Button
              onClick={() => {
                window.open('mailto:careers@fairtradeworker.com?subject=General Application', '_blank')
              }}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              Send Us Your Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
