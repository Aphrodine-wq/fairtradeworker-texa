import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Microphone, Camera, VideoCamera, Notebook } from "@phosphor-icons/react"
import { pulseGlowVariants } from "@/lib/animations"

interface PostMyJobButtonProps {
  onNavigate: (page: string) => void
}

type InputMethod = 'audio' | 'photos' | 'video' | 'text'

export function PostMyJobButton({ onNavigate }: PostMyJobButtonProps) {
  const handleMainButtonClick = () => {
    onNavigate('unified-post-job')
  }

  return (
    <div className="flex flex-col items-center justify-center my-8">
      <style>{`
        @keyframes smoothGlowFlicker {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.2), 0 0 16px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.3), 0 0 24px rgba(255, 255, 255, 0.15);
          }
        }
        .post-job-button-glow {
          animation: smoothGlowFlicker 4s ease-in-out infinite;
        }
      `}</style>
      <motion.div
        variants={pulseGlowVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        style={{ willChange: 'transform, box-shadow' }}
      >
        <Button
          size="lg"
          className="post-job-button-glow text-2xl px-14 py-8 h-auto bg-black dark:bg-white text-white dark:text-black font-bold shadow-xl relative overflow-hidden"
          onClick={handleMainButtonClick}
        >
          <motion.span
            className="relative z-10"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Post My Job
          </motion.span>
          {/* Ripple effect background */}
          <motion.div
            className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-md"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: 2,
              opacity: [0, 0.5, 0],
              transition: { duration: 0.6 }
            }}
          />
        </Button>
      </motion.div>
    </div>
  )
}
