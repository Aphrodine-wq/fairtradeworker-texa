/**
 * VOID CRM - Lazy loaded version for code splitting
 */

import { lazy } from 'react'

export const VOID = lazy(() => import('./VOID').then(module => ({ default: module.VOID })))
