import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  trigger?: boolean
  onComplete?: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  delay: number
}

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
]

export function Confetti({ trigger = false, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3
      }))
      
      setPieces(newPieces)

      // Auto hide after animation
      const timer = setTimeout(() => {
        setShow(false)
        setPieces([])
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: piece.rotation,
                scale: 1,
                opacity: 1
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                scale: [1, 1.2, 0.8],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 2.5,
                delay: piece.delay,
                ease: "easeIn"
              }}
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                backgroundColor: piece.color,
                borderRadius: "2px"
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

interface CheckmarkAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function CheckmarkAnimation({ show, onComplete }: CheckmarkAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="bg-green-500 rounded-full p-6 shadow-2xl"
          >
            <motion.svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M16 32L28 44L48 20"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
