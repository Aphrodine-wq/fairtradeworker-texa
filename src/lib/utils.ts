import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { sanitizeInput, sanitizeHTML } from "./security"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user input for safe display
 */
export function safeInput(input: string): string {
  return sanitizeInput(input)
}

/**
 * Sanitize HTML content for safe rendering
 */
export function safeHTML(html: string): string {
  return sanitizeHTML(html)
}

/**
 * Format number with performance optimization
 */
const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
})

export function formatNumber(num: number): string {
  return numberFormatter.format(num)
}

/**
 * Format currency with performance optimization
 */
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}
