import { useState, useEffect } from "react"
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface LightboxProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 glass-overlay backdrop-blur-xs flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white dark:text-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white rounded-none border-2 border-white dark:border-black h-12 w-12"
            onClick={onClose}
          >
            <X size={28} weight="bold" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white dark:text-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white rounded-none border-2 border-white dark:border-black h-12 w-12"
                onClick={handlePrevious}
              >
                <CaretLeft size={32} weight="bold" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white dark:text-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white rounded-none border-2 border-white dark:border-black h-12 w-12"
                onClick={handleNext}
              >
                <CaretRight size={32} weight="bold" />
              </Button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-none border-2 border-white dark:border-black"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              />
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          )}

          <div className="absolute bottom-6 left-6">
            <div className="flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-150 ${
                    idx === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
