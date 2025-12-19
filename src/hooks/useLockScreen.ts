/**
 * Hook for VOID OS Lock Screen
 */

import { useState, useEffect, useCallback } from 'react'
import { useVoidStore } from '@/lib/void/store'
import {
  initLockScreen,
  startInactivityTimer,
  stopInactivityTimer,
  validatePin,
  hashPin,
  verifyPin,
  isBiometricAvailable,
  authenticateBiometric,
  formatLockScreenTime,
  type LockScreenConfig,
} from '@/lib/void/lockScreen'

export function useLockScreen(config?: LockScreenConfig) {
  const { isLocked, setLocked, lockScreenPin } = useVoidStore()
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [time, setTime] = useState(formatLockScreenTime())

  // Initialize lock screen
  useEffect(() => {
    initLockScreen(config)
  }, [config])

  // Check biometric availability
  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable)
  }, [])

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatLockScreenTime())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Start inactivity timer when unlocked
  useEffect(() => {
    if (!isLocked && config?.autoLockDelay) {
      startInactivityTimer(() => {
        setLocked(true)
      })

      return () => {
        stopInactivityTimer()
      }
    }
  }, [isLocked, setLocked, config?.autoLockDelay])

  const handlePinInput = useCallback((digit: string) => {
    const maxLength = config?.pinLength || 6
    if (pinInput.length >= maxLength) {
      return
    }

    const newPin = pinInput + digit
    setPinInput(newPin)
    setPinError(false)

    // Auto-submit when PIN is complete
    if (newPin.length === maxLength) {
      setTimeout(() => handleUnlock(newPin), 100)
    }
  }, [pinInput, config?.pinLength, handleUnlock])

  const handlePinBackspace = useCallback(() => {
    setPinInput(prev => prev.slice(0, -1))
    setPinError(false)
  }, [])

  const handleUnlock = useCallback(async (pin?: string) => {
    const pinToVerify = pin || pinInput

    if (!pinToVerify || !validatePin(pinToVerify)) {
      setPinError(true)
      setTimeout(() => setPinInput(''), 500)
      return false
    }

    // Verify PIN (if set)
    if (lockScreenPin) {
      const isValid = verifyPin(pinToVerify, lockScreenPin)
      if (!isValid) {
        setPinError(true)
        setTimeout(() => setPinInput(''), 500)
        return false
      }
    } else {
      // First time setup - store the PIN
      const hashedPin = hashPin(pinToVerify)
      // Store in secure storage (will be implemented)
    }

    // Unlock
    setLocked(false)
    setPinInput('')
    setPinError(false)
    return true
  }, [pinInput, lockScreenPin, setLocked])

  const handleBiometricUnlock = useCallback(async () => {
    const success = await authenticateBiometric()
    if (success) {
      setLocked(false)
      setPinInput('')
      setPinError(false)
      return true
    }
    return false
  }, [setLocked])

  return {
    isLocked,
    pinInput,
    pinError,
    biometricAvailable,
    time,
    handlePinInput,
    handlePinBackspace,
    handleUnlock,
    handleBiometricUnlock,
    setLocked,
  }
}
