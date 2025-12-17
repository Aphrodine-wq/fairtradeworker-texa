import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Microphone, Camera, VideoCamera, Notebook, X } from "@phosphor-icons/react"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
import type { User } from "@/lib/types"
import { useState, useEffect } from "react"

interface UnifiedPostJobProps {
  user?: User | null
  onNavigate: (page: string) => void
}

type InputMethod = 'audio' | 'photos' | 'video' | 'text'

const inputMethods: Array<{ 
  method: InputMethod
  icon: typeof Microphone
  label: string
  description: string
}> = [
  { 
    method: 'audio', 
    icon: Microphone, 
    label: 'Voice',
    description: 'Record your job description with voice'
  },
  { 
    method: 'photos', 
    icon: Camera, 
    label: 'Photo',
    description: 'Upload photos of the work needed'
  },
  { 
    method: 'video', 
    icon: VideoCamera, 
    label: 'Video',
    description: 'Record a video showing the project'
  },
  { 
    method: 'text', 
    icon: Notebook, 
    label: 'Text',
    description: 'Type out your job details'
  },
]

export function UnifiedPostJob({ user, onNavigate }: UnifiedPostJobProps) {
  const [selectedServices, setSelectedServices] = useState<Array<{id: string, title: string}>>([])

  useEffect(() => {
    // Load selected services from sessionStorage
    const stored = sessionStorage.getItem('selectedServices')
    if (stored) {
      try {
        setSelectedServices(JSON.parse(stored))
      } catch (e) {
        // Fallback to old single service format
        const oldService = sessionStorage.getItem('selectedService')
        const oldTitle = sessionStorage.getItem('selectedServiceTitle')
        if (oldService && oldTitle) {
          const services = [{ id: oldService, title: oldTitle }]
          setSelectedServices(services)
          sessionStorage.setItem('selectedServices', JSON.stringify(services))
        }
      }
    }
  }, [])

  const handleRemoveService = (serviceId: string) => {
    const updated = selectedServices.filter(s => s.id !== serviceId)
    setSelectedServices(updated)
    if (updated.length > 0) {
      sessionStorage.setItem('selectedServices', JSON.stringify(updated))
    } else {
      sessionStorage.removeItem('selectedServices')
    }
  }

  const handleClearAll = () => {
    setSelectedServices([])
    sessionStorage.removeItem('selectedServices')
    sessionStorage.removeItem('selectedService')
    sessionStorage.removeItem('selectedServiceTitle')
  }

  const handleMethodSelect = (method: InputMethod) => {
    // Route to specific pages for each input method
    sessionStorage.setItem('postJobMethod', method)
    // Keep selectedService in sessionStorage for post-job page
    switch (method) {
      case 'audio':
        onNavigate('post-job-voice')
        break
      case 'photos':
        onNavigate('post-job-photo')
        break
      case 'video':
        onNavigate('post-job-video')
        break
      case 'text':
        onNavigate('post-job-text')
        break
      default:
        onNavigate('post-job')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="text-center mb-8"
          style={{ willChange: 'transform, opacity' }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Post Your Job
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose how you'd like to describe your project
          </p>
          {selectedServices.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {selectedServices.map((service) => (
                <Badge key={service.id} variant="secondary" className="text-sm px-3 py-1 flex items-center gap-2">
                  {service.title}
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                    aria-label={`Remove ${service.title}`}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
        >
          {inputMethods.map(({ method, icon: Icon, label, description }) => (
            <motion.div
              key={method}
              variants={itemVariants}
              whileHover={universalCardHover.hover}
              whileTap={{ scale: 0.98 }}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            >
              <Card
                className="cursor-pointer h-full border-0 hover:shadow-xl transition-shadow"
                onClick={() => handleMethodSelect(method)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3">
                      <Icon 
                        size={32} 
                        weight="fill" 
                        className="text-black dark:text-white" 
                      />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
