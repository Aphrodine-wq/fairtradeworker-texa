import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
import { mainCategories } from "@/components/jobs/ServiceCategories"
import { ArrowLeft } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

interface ServiceCategoryDetailProps {
  categoryId?: string
  onNavigate: (page: string) => void
}

export function ServiceCategoryDetail({ categoryId, onNavigate }: ServiceCategoryDetailProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    // Get categoryId from props, sessionStorage, or URL
    const id = categoryId || sessionStorage.getItem('selectedCategory') || null
    setSelectedCategoryId(id)
  }, [categoryId])

  const category = mainCategories.find(c => c.id === selectedCategoryId)

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
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
    sessionStorage.setItem('selectedService', serviceId)
    sessionStorage.setItem('selectedServiceTitle', serviceTitle)
    onNavigate('unified-post-job')
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
            {category.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select a service to get started
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
        >
          {category.services.map((service) => {
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
                  className="cursor-pointer h-full border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors"
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
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
          className="mt-6 text-center"
        >
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 mx-auto text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
