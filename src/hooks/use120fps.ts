import { useEffect, useRef, useState } from 'react'

interface Use120FpsOptions {
  targetFps?: number
  throttleThreshold?: number
  onFpsChange?: (fps: number) => void
}

/**
 * Hook for 120fps animations with auto-throttling
 * Automatically throttles to 60fps if frame time exceeds threshold
 */
export function use120fps(options: Use120FpsOptions = {}) {
  const {
    targetFps = 120,
    throttleThreshold = 8.33, // 120fps = 8.33ms per frame
    onFpsChange,
  } = options

  const frameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(performance.now())
  const frameTimeHistoryRef = useRef<number[]>([])
  const [currentFps, setCurrentFps] = useState(targetFps)
  const [isThrottled, setIsThrottled] = useState(false)

  useEffect(() => {
    let frameCount = 0
    let lastFpsCheck = performance.now()

    const animate = (timestamp: number) => {
      frameRef.current = requestAnimationFrame(animate)

      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Track frame time history (last 60 frames)
      frameTimeHistoryRef.current.push(deltaTime)
      if (frameTimeHistoryRef.current.length > 60) {
        frameTimeHistoryRef.current.shift()
      }

      // Calculate average frame time over last 60 frames
      const avgFrameTime = frameTimeHistoryRef.current.reduce((a, b) => a + b, 0) / frameTimeHistoryRef.current.length

      // Check if we need to throttle
      const shouldThrottle = avgFrameTime > throttleThreshold
      if (shouldThrottle !== isThrottled) {
        setIsThrottled(shouldThrottle)
      }

      // Calculate current FPS
      frameCount++
      const timeSinceLastCheck = timestamp - lastFpsCheck
      if (timeSinceLastCheck >= 1000) {
        const fps = Math.round((frameCount * 1000) / timeSinceLastCheck)
        setCurrentFps(fps)
        onFpsChange?.(fps)
        frameCount = 0
        lastFpsCheck = timestamp
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [targetFps, throttleThreshold, isThrottled, onFpsChange])

  /**
   * Get the effective frame rate (120fps or throttled to 60fps)
   */
  const getEffectiveFps = () => {
    return isThrottled ? 60 : targetFps
  }

  /**
   * Get frame delay in milliseconds
   */
  const getFrameDelay = () => {
    return isThrottled ? 16.67 : 1000 / targetFps // 60fps = 16.67ms, 120fps = 8.33ms
  }

  return {
    currentFps,
    isThrottled,
    effectiveFps: getEffectiveFps(),
    frameDelay: getFrameDelay(),
  }
}

/**
 * GPU-accelerated transform utility
 * Returns CSS transform string optimized for GPU
 */
export function gpuTransform(transform: {
  x?: number
  y?: number
  z?: number
  scale?: number
  rotate?: number
}): string {
  const { x = 0, y = 0, z = 0, scale = 1, rotate = 0 } = transform
  return `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotate(${rotate}deg)`
}

/**
 * Hook for smooth 120fps animations with spring physics
 */
export function use120fpsSpring(
  target: number,
  options: {
    stiffness?: number
    damping?: number
    mass?: number
    precision?: number
  } = {}
) {
  const {
    stiffness = 300,
    damping = 30,
    mass = 1,
    precision = 0.01,
  } = options

  const [value, setValue] = useState(target)
  const velocityRef = useRef(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      const diff = target - value
      const springForce = diff * (stiffness / 1000)
      const dampingForce = velocityRef.current * (damping / 1000)
      const acceleration = (springForce - dampingForce) / mass

      velocityRef.current += acceleration
      const newValue = value + velocityRef.current

      if (Math.abs(diff) < precision && Math.abs(velocityRef.current) < precision) {
        setValue(target)
        velocityRef.current = 0
        return
      }

      setValue(newValue)
      frameRef.current = requestAnimationFrame(animate)
    }

    if (Math.abs(target - value) > precision) {
      frameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, value, stiffness, damping, mass, precision])

  return value
}
