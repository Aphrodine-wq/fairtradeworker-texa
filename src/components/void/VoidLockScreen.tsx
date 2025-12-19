/**
 * VOID OS Lock Screen
 * Secure lock screen with PIN and biometric authentication
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Lock, Delete } from 'lucide-react'
import { useLockScreen } from '@/hooks/useLockScreen'
import { useVoidStore } from '@/lib/void/store'
import '@/styles/void-lock.css'

interface VoidLockScreenProps {
  config?: {
    autoLockDelay?: number
    pinLength?: number
    enableBiometric?: boolean
  }
}

export function VoidLockScreen({ config }: VoidLockScreenProps) {
  const { isLocked } = useVoidStore()
  const {
    pinInput,
    pinError,
    biometricAvailable,
    time,
    handlePinInput,
    handlePinBackspace,
    handleUnlock,
    handleBiometricUnlock,
  } = useLockScreen(config)

  const [showPinPad, setShowPinPad] = useState(false)

  if (!isLocked) {
    return null
  }

  const pinLength = config?.pinLength || 6
  const pinDots = Array.from({ length: pinLength }, (_, i) => i < pinInput.length)

  return (
    <AnimatePresence>
      <motion.div
        className="void-overlay-lock void-lock-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="void-lock-content">
          {/* Lock Icon */}
          <motion.div
            className="void-lock-icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Lock className="void-lock-icon-svg" />
          </motion.div>

          {/* Time & Date */}
          <motion.div
            className="void-lock-time"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="void-lock-time-text">{time.time}</div>
            <div className="void-lock-date-text">{time.date}</div>
          </motion.div>

          {/* PIN Input */}
          <motion.div
            className="void-lock-pin-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="void-lock-pin-dots">
              {pinDots.map((filled, index) => (
                <div
                  key={index}
                  className={`void-lock-pin-dot ${filled ? 'filled' : ''} ${pinError ? 'error' : ''}`}
                />
              ))}
            </div>
            {pinError && (
              <motion.div
                className="void-lock-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Incorrect PIN
              </motion.div>
            )}
          </motion.div>

          {/* Biometric Option */}
          {biometricAvailable && (
            <motion.button
              className="void-lock-biometric"
              onClick={handleBiometricUnlock}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fingerprint className="void-lock-biometric-icon" />
              <span>Use Face ID / Touch ID</span>
            </motion.button>
          )}

          {/* Notification Badge (if notifications exist) */}
          <motion.div
            className="void-lock-notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Will be populated when notification system is implemented */}
          </motion.div>

          {/* PIN Pad Toggle (for mobile) */}
          <button
            className="void-lock-pinpad-toggle"
            onClick={() => setShowPinPad(!showPinPad)}
          >
            {showPinPad ? 'Hide' : 'Show'} PIN Pad
          </button>
        </div>

        {/* PIN Pad (for touch devices) */}
        {showPinPad && (
          <motion.div
            className="void-lock-pinpad-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <PinPad onDigit={handlePinInput} onBackspace={handlePinBackspace} />
          </motion.div>
        )}

        {/* Hidden PIN Input for keyboard entry */}
        <input
          type="password"
          className="void-lock-hidden-input"
          value={pinInput}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, pinLength)
            // Process each digit
            const currentLength = pinInput.length
            if (value.length > currentLength) {
              // New digits added
              const newDigits = value.slice(currentLength)
              newDigits.split('').forEach(digit => handlePinInput(digit))
            } else if (value.length < currentLength) {
              // Digits removed
              const removedCount = currentLength - value.length
              for (let i = 0; i < removedCount; i++) {
                handlePinBackspace()
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              handlePinBackspace()
            } else if (e.key === 'Enter' && pinInput.length === pinLength) {
              handleUnlock()
            } else if (/^\d$/.test(e.key)) {
              handlePinInput(e.key)
            }
          }}
          autoFocus
          autoComplete="off"
        />
      </motion.div>
    </AnimatePresence>
  )
}

// PIN Pad Component (for touch devices)
function PinPad({ onDigit, onBackspace }: { onDigit: (digit: string) => void; onBackspace: () => void }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace']

  return (
    <div className="void-lock-pinpad">
      {digits.map((digit, index) => {
        if (digit === '') {
          return <div key={index} className="void-lock-pinpad-empty" />
        }
        if (digit === 'backspace') {
          return (
            <button
              key={index}
              className="void-lock-pinpad-button"
              onClick={onBackspace}
              aria-label="Backspace"
            >
              <Delete className="void-lock-pinpad-icon" />
            </button>
          )
        }
        return (
          <button
            key={index}
            className="void-lock-pinpad-button"
            onClick={() => onDigit(digit)}
          >
            {digit}
          </button>
        )
      })}
    </div>
  )
}
