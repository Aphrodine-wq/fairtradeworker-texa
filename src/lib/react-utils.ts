/**
 * React utility functions and helpers
 */

import { memo } from 'react'
import type { ComponentType } from 'react'

/**
 * Shallow equality check for React.memo
 * Compares objects/arrays shallowly, handles primitives correctly
 */
export function shallowEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)
  
  if (prevKeys.length !== nextKeys.length) {
    return false
  }
  
  return prevKeys.every(key => {
    const prevVal = prevProps[key]
    const nextVal = nextProps[key]
    
    // Handle functions (compare by reference)
    if (typeof prevVal === 'function' && typeof nextVal === 'function') {
      return prevVal === nextVal
    }
    
    // Handle arrays (shallow compare)
    if (Array.isArray(prevVal) && Array.isArray(nextVal)) {
      if (prevVal.length !== nextVal.length) return false
      return prevVal.every((item, idx) => item === nextVal[idx])
    }
    
    // Handle objects (shallow compare)
    if (
      typeof prevVal === 'object' &&
      typeof nextVal === 'object' &&
      prevVal !== null &&
      nextVal !== null &&
      !Array.isArray(prevVal) &&
      !Array.isArray(nextVal)
    ) {
      const prevObjKeys = Object.keys(prevVal)
      const nextObjKeys = Object.keys(nextVal)
      if (prevObjKeys.length !== nextObjKeys.length) return false
      return prevObjKeys.every(k => prevVal[k] === nextVal[k])
    }
    
    // Primitive comparison
    return prevVal === nextVal
  })
}

/**
 * Memo wrapper with shallow comparison
 * Use this instead of React.memo for components with object/array props
 */
export function memoShallow<P extends Record<string, any>>(
  component: ComponentType<P>
): ComponentType<P> {
  return memo(component, shallowEqual) as ComponentType<P>
}

/**
 * Type-safe event handler creator
 * Ensures TypeScript knows the event type
 */
export function createEventHandler<T extends HTMLElement>(
  handler: (event: React.ChangeEvent<T>) => void
) {
  return handler
}

/**
 * Type-safe click handler creator
 */
export function createClickHandler(
  handler: (event: React.MouseEvent<HTMLElement>) => void
) {
  return handler
}

/**
 * Performance measurement helper (dev only)
 */
const isDev = import.meta.env.DEV

export function perfLog(label: string) {
  if (!isDev) {
    return () => {} // No-op in production
  }
  
  const start = performance.now()
  return () => {
    const duration = performance.now() - start
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`)
  }
}
