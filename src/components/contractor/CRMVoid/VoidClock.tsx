import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

export function VoidClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const month = time.getMonth()
  const day = time.getDay()
  const date = time.getDate()
  const hours = time.getHours()
  const hoursForClock = hours % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const hourRotation = ((hoursForClock / 12) * 360)
  const minuteRotation = ((minutes / 60) * 360)
  const secondRotation = ((seconds / 60) * 360)

  const timeString = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`
  const dateString = `${days[day]}, ${months[month]} ${date}`

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-6",
        "backdrop-blur-[12px]",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.04)]",
        "min-w-[200px]"
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Analog Clock */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full bg-white/20 dark:bg-black/20" />
        
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) - 90
          const rad = (angle * Math.PI) / 180
          const x = 50 + 40 * Math.cos(rad)
          const y = 50 + 40 * Math.sin(rad)
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-black/60 dark:bg-white/60"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )
        })}

        {/* Hour hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-black dark:bg-white"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourRotation}deg)`,
            transformOrigin: '50% 100%',
            width: '3px',
            height: '30px',
            borderRadius: '3px',
            zIndex: 3
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-black dark:bg-white"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)`,
            transformOrigin: '50% 100%',
            width: '2px',
            height: '40px',
            borderRadius: '2px',
            zIndex: 2
          }}
        />

        {/* Second hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-red-500"
          style={{
            transform: `translate(-50%, -100%) rotate(${secondRotation}deg)`,
            transformOrigin: '50% 100%',
            width: '1px',
            height: '45px',
            borderRadius: '1px',
            zIndex: 1
          }}
        />

        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black dark:bg-white z-10" />
      </div>

      {/* Digital Time */}
      <div className="text-center">
        <motion.div
          key={timeString}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-black dark:text-white mb-2"
        >
          {timeString}
        </motion.div>
        <motion.div
          key={dateString}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-black/70 dark:text-white/70"
        >
          {dateString}
        </motion.div>
      </div>
    </motion.div>
  )
}
