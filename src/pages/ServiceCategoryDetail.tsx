import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
import { mainCategories } from "@/components/jobs/ServiceCategories"
import { ArrowLeft, Check, X } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

interface ServiceCategoryDetailProps {
  categoryId?: string
  onNavigate: (page: string) => void
}

export function ServiceCategoryDetail({ categoryId, onNavigate }: ServiceCategoryDetailProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<Array<{id: string, title: string}>>([])
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before accessing sessionStorage to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    // Get selected categories from sessionStorage (supports multiple)
    try {
      const storedCategories = sessionStorage.getItem('selectedCategories')
      if (storedCategories) {
        try {
          const parsed = JSON.parse(storedCategories)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedCategoryIds(parsed)
            return
          }
        } catch (e) {
          // Fall through to single category logic
        }
      }
      
      // Fallback to single category from props or sessionStorage
      const id = categoryId || sessionStorage.getItem('selectedCategory') || null
      if (id) {
        setSelectedCategoryIds([id])
      }
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      // Fallback to categoryId prop if available
      if (categoryId) {
        setSelectedCategoryIds([categoryId])
      }
    }
  }, [categoryId, isMounted])

  // Get all selected categories
  const selectedCategories = mainCategories.filter(c => selectedCategoryIds.includes(c.id))
  
  useEffect(() => {
    if (!isMounted) return
    
    // Load selected services from sessionStorage
    try {
      const stored = sessionStorage.getItem('selectedServices')
      if (stored) {
        try {
          setSelectedServices(JSON.parse(stored))
        } catch (e) {
          // If parsing fails, check for old single service format
          const oldService = sessionStorage.getItem('selectedService')
          const oldTitle = sessionStorage.getItem('selectedServiceTitle')
          if (oldService && oldTitle) {
            setSelectedServices([{ id: oldService, title: oldTitle }])
          }
        }
      }
    } catch (error) {
      console.error('Error reading services from sessionStorage:', error)
    }
  }, [isMounted])

  // Get all selected categories
  const selectedCategories = mainCategories.filter(c => selectedCategoryIds.includes(c.id))
  
  // Combine all services from selected categories
  const allServices = selectedCategories.flatMap(category => 
    category.services.map(service => ({ ...service, categoryId: category.id, categoryTitle: category.title }))
  )

  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Categories Selected
          </h1>
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  const handleServiceClick = (serviceId: string, serviceTitle: string) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === serviceId)
      let updated
      if (exists) {
        // Remove if already selected
        updated = prev.filter(s => s.id !== serviceId)
      } else {
        // Add if not selected
        updated = [...prev, { id: serviceId, title: serviceTitle }]
      }
      try {
        sessionStorage.setItem('selectedServices', JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving to sessionStorage:', error)
      }
      return updated
    })
  }

  const handleContinue = () => {
    if (selectedServices.length > 0) {
      onNavigate('unified-post-job')
    }
  }

  const handleClearAll = () => {
    setSelectedServices([])
    try {
      sessionStorage.removeItem('selectedServices')
      sessionStorage.removeItem('selectedService')
      sessionStorage.removeItem('selectedServiceTitle')
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
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
            {selectedCategories.length === 1 
              ? selectedCategories[0].title 
              : `${selectedCategories.length} Selected Categories`}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select one or more services for your project
          </p>
          {selectedCategories.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {selectedCategories.map((cat) => (
                <Badge key={cat.id} variant="outline" className="text-sm px-3 py-1">
                  {cat.title}
                </Badge>
              ))}
            </div>
          )}
          {selectedServices.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {selectedServices.map((service) => (
                <Badge key={service.id} variant="secondary" className="text-sm px-3 py-1 flex items-center gap-2">
                  {service.title}
                  <button
                    onClick={() => handleServiceClick(service.id, service.title)}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                    aria-label={`Remove ${service.title}`}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
        >
          {allServices.map((service) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={universalCardHover.hover}
                whileTap={{ scale: 0.98 }}
                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              >
                <Card
                  className={`cursor-pointer h-full border-0 hover:shadow-xl transition-all ${
                    selectedServices.find(s => s.id === service.id) 
                      ? 'ring-2 ring-black dark:ring-white shadow-lg' 
                      : ''
                  }`}
                  onClick={() => handleServiceClick(service.id, service.title)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      style={{ willChange: 'transform' }}
                    >
                      <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3">
                        <Icon 
                          size={32} 
                          weight="fill" 
                          className="text-black dark:text-white" 
                        />
                      </div>
                    </motion.div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {service.title}
                      </h3>
                      {selectedServices.find(s => s.id === service.id) && (
                        <Check size={20} className="text-black dark:text-white" weight="bold" />
                      )}
                    </div>
                    {selectedCategories.length > 1 && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {service.categoryTitle}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {selectedServices.length > 0 && (
            <Button
              onClick={handleContinue}
              size="lg"
              className="px-8"
            >
              Continue with {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''}
            </Button>
          )}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
