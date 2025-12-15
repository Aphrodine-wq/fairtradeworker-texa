/**
 * Branded types for type-safe IDs
 * Prevents mixing different ID types at compile-time
 * Zero runtime overhead - purely compile-time type checking
 */

/**
 * Brand helper type
 * Creates a distinct type from a base type
 */
type Brand<T, B> = T & { readonly __brand: B }

/**
 * Branded ID types
 */
export type UserId = Brand<string, 'UserId'>
export type JobId = Brand<string, 'JobId'>
export type BidId = Brand<string, 'BidId'>
export type InvoiceId = Brand<string, 'InvoiceId'>
export type TerritoryId = Brand<number, 'TerritoryId'>
export type QuestionId = Brand<string, 'QuestionId'>
export type MilestoneId = Brand<string, 'MilestoneId'>

/**
 * Helper functions to create branded IDs
 * Use these when converting string IDs to branded types
 */
export const userId = (id: string): UserId => id as UserId
export const jobId = (id: string): JobId => id as JobId
export const bidId = (id: string): BidId => id as BidId
export const invoiceId = (id: string): InvoiceId => id as InvoiceId
export const territoryId = (id: number): TerritoryId => id as TerritoryId
export const questionId = (id: string): QuestionId => id as QuestionId
export const milestoneId = (id: string): MilestoneId => id as MilestoneId

/**
 * Type guard to check if a string is a valid ID format
 */
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0
}
