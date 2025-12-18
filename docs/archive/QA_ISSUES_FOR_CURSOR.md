# QA Issues for Cursor - FairTradeWorker Comprehensive Audit

> **Generated:** December 2024  
> **Codebase:** 179,168 LOC  
> **Purpose:** Detailed issues for Cursor AI to fix

---

## 🔴 CRITICAL Issues (Must Fix Immediately)

### 1. BrowseJobs Missing `onNavigate` Prop
**File:** `src/App.tsx`  
**Line:** ~82  
**Issue:** BrowseJobs component requires `onNavigate` prop but it's not passed in the route
**Impact:** Navigation may silently fail
```tsx
// Current
<Route path="/browse-jobs" element={<BrowseJobs />} />

// Should be
<Route path="/browse-jobs" element={<BrowseJobs onNavigate={(page) => navigate(`/${page}`)} />} />
```

### 2. PhotoUploader Props Mismatch
**File:** `src/components/ui/PhotoUploader.tsx`  
**Lines:** Interface definition  
**Issue:** Component interface doesn't include `photos` prop but PostJob pages try to pass it
**Impact:** TypeScript errors, photos not displaying

**Fix:** Add to PhotoUploaderProps interface:
```tsx
interface PhotoUploaderProps {
  photos?: Array<{ url: string; id: string }>;
  // ... existing props
}
```

### 3. Duplicate Card Import
**File:** `src/pages/ProUpgrade.tsx`  
**Issue:** Card component imported twice from different paths
**Impact:** Build errors, confusion

**Fix:** Remove duplicate import, keep only one:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
```

### 4. Duplicate Icon Imports
**File:** `src/components/dashboard/ContractorDashboardNew.tsx`  
**Issue:** Icons imported multiple times
**Impact:** Build warnings, bundle size

**Fix:** Consolidate icon imports into single import statement

### 5. Duplicate Type Definitions
**File:** `src/lib/types.ts`  
**Issues:**
- `Territory` interface defined twice
- `Bid` interface has duplicate `amount` property
- `Photo` interface has duplicate `isUploading` property

**Fix:** Remove duplicate definitions, keep one of each

### 6. Job Type Missing Properties
**File:** `src/lib/types.ts`  
**Issue:** PostJob pages reference properties not in Job interface:
- `hasVoiceRecording`
- `photoCount`
- `videoCount`
- `hasAudioFile`
- `audioUrl`
- `recordings`

**Fix:** Add to Job interface:
```tsx
interface Job {
  // ... existing props
  hasVoiceRecording?: boolean;
  photoCount?: number;
  videoCount?: number;
  hasAudioFile?: boolean;
  audioUrl?: string;
  recordings?: string[];
}
```

---

## 🟠 HIGH Priority Issues

### 7. Settings Tabs Mismatch
**File:** `src/pages/Settings.tsx`  
**Issue:** 
- Tab triggers defined for 7 tabs
- TabsContent only exists for 4 tabs
- Tab ID mismatch: trigger uses "payments" but content uses "billing"

**Fix:** Either add missing TabsContent components or remove unused tab triggers. Fix ID mismatch.

### 8. Password Validation Inconsistency
**Files:** 
- `src/pages/Signup.tsx` - requires 8 characters
- `src/pages/Login.tsx` - checks for 6 characters

**Fix:** Standardize on 8 character minimum across all forms

### 9. Forgot Password Navigation Loop
**File:** `src/pages/Login.tsx`  
**Issue:** "Forgot Password" link navigates to `/login` (same page)
**Impact:** User confusion, no way to reset password

**Fix:** Navigate to `/forgot-password` or implement password reset flow

### 10. Memory Leak - Unbounded Cache
**File:** `src/hooks/useLocalKV.ts`  
**Lines:** 5-7  
**Issue:** Module-level `cache` Map grows indefinitely, never cleared
**Impact:** Memory consumption grows over time

**Fix:** Implement LRU cache or periodic cleanup:
```tsx
const MAX_CACHE_SIZE = 100;
if (cache.size > MAX_CACHE_SIZE) {
  const firstKey = cache.keys().next().value;
  cache.delete(firstKey);
}
```

### 11. Memory Leak - AI Response Cache
**File:** `src/lib/ai.ts`  
**Line:** ~45  
**Issue:** `responseCache` Map grows indefinitely

**Fix:** Same LRU cache pattern as above

### 12. Stale Closure in usePhotoUpload
**File:** `src/hooks/usePhotoUpload.ts`  
**Lines:** 176-180  
**Issue:** `uploadPhoto` uses stale `photos` reference from closure
**Impact:** Photos may not be found, uploads fail silently

**Fix:** Use functional state update or ref for photos array

### 13. Missing Error Logging
**File:** `src/ErrorFallback.tsx`  
**Issue:** Errors not logged to any tracking service
**Impact:** Production errors go unnoticed

**Fix:** Add error logging service (Sentry, LogRocket, etc.):
```tsx
useEffect(() => {
  console.error('Application Error:', error);
  // logErrorToService(error, errorInfo);
}, [error]);
```

---

## 🟡 MEDIUM Priority Issues

### 14. TypeScript - Unused Imports
**Multiple Files:** Clean up unused imports

| File | Unused Imports |
|------|----------------|
| `src/components/dashboard/ContractorDashboardNew.tsx` | Button, Badge, useMemo, useState, useEffect, Check, X |
| `src/pages/BrowseJobs.tsx` | Multiple unused imports |
| Various components | useState, useEffect defined but not used |

**Fix:** Remove all unused imports

### 15. useRef Missing Initial Values
**Multiple Files:** useRef calls need initial values
```tsx
// Wrong
const ref = useRef();

// Correct
const ref = useRef<HTMLDivElement>(null);
```

### 16. Animation Type Incompatibility
**File:** `src/components/ui/card.tsx`  
**Lines:** 39-40  
**Issue:** Framer Motion variants have type issues with `type: "spring"`

**Fix:** Use const assertion:
```tsx
type: "spring" as const
```

### 17. Side Effect in useMemo
**File:** `src/components/Territory/TerritoryMap.tsx`  
**Issue:** useMemo callback contains side effects
**Impact:** Unpredictable behavior, React rules violation

**Fix:** Move side effects to useEffect

### 18. Missing Event Listener Cleanup
**File:** `src/hooks/useServiceWorker.ts`  
**Lines:** 68-77  
**Issue:** `updatefound` event listener never removed
**Impact:** Memory leak, duplicate handlers

**Fix:** Return cleanup function from useEffect

### 19. Resize Handler Not Throttled
**File:** `src/hooks/use-mobile.ts`  
**Lines:** 47-49  
**Issue:** resize/orientationchange handlers fire immediately
**Impact:** Performance degradation on resize

**Fix:** Add throttle:
```tsx
const throttledUpdate = useMemo(
  () => throttle(updateMobileState, 100),
  []
);
```

### 20. Unnecessary Home Redirects
**Multiple Files:** Components redirect to 'home' unnecessarily
- Check CRMVoid, various navigation handlers
- Should navigate to appropriate destination, not always home

---

## 🔵 LOW Priority Issues

### 21. Accessibility - Missing aria-labels
**Files:**
- `src/components/ui/PhotoUploader.tsx` - Drop zone needs `role="button"` and `aria-label`
- `src/components/ui/button.tsx` - Icon-only buttons need aria-label enforcement
- File inputs missing `aria-label`

**Fix:** Add appropriate aria attributes

### 22. Accessibility - Generic Alt Text
**File:** `src/components/ui/PhotoUploader.tsx`  
**Lines:** 134, 253  
**Issue:** Uses "Upload preview" for all images

**Fix:** Use descriptive alt text:
```tsx
alt={`Photo ${index + 1} preview`}
```

### 23. Accessibility - Keyboard Navigation
**File:** `src/components/ui/PhotoUploader.tsx`  
**Lines:** 200-207  
**Issue:** Drop zone not keyboard accessible

**Fix:** Add keyboard support:
```tsx
<div
  tabIndex={0}
  role="button"
  aria-label="Upload photos by clicking or pressing Enter"
  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
  // ... existing props
>
```

### 24. Silent Catch Blocks
**Multiple Files:** Errors swallowed silently
- `src/hooks/usePhotoUpload.ts` - compression errors
- `src/hooks/useLocalKV.ts` - parse errors
- `src/lib/ai.ts` - AI response errors

**Fix:** At minimum, log errors:
```tsx
catch (error) {
  console.error('Operation failed:', error);
  // Handle gracefully
}
```

### 25. Stale Cached Insets
**File:** `src/hooks/use-mobile.ts`  
**Lines:** 61-62  
**Issue:** `cachedInsets` never invalidates on orientation change

**Fix:** Clear cache on orientation change

---

## 📋 File-by-File Summary

| File | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| `src/App.tsx` | 1 | 0 | 0 | 0 |
| `src/lib/types.ts` | 2 | 0 | 0 | 0 |
| `src/pages/ProUpgrade.tsx` | 1 | 0 | 0 | 0 |
| `src/components/dashboard/ContractorDashboardNew.tsx` | 1 | 0 | 1 | 0 |
| `src/pages/Settings.tsx` | 0 | 1 | 0 | 0 |
| `src/pages/Signup.tsx` | 0 | 1 | 0 | 0 |
| `src/pages/Login.tsx` | 0 | 2 | 0 | 0 |
| `src/hooks/useLocalKV.ts` | 0 | 1 | 0 | 1 |
| `src/hooks/usePhotoUpload.ts` | 0 | 1 | 0 | 1 |
| `src/lib/ai.ts` | 0 | 1 | 0 | 1 |
| `src/ErrorFallback.tsx` | 0 | 1 | 0 | 0 |
| `src/components/ui/PhotoUploader.tsx` | 1 | 0 | 0 | 3 |
| `src/components/ui/card.tsx` | 0 | 0 | 1 | 0 |
| `src/hooks/useServiceWorker.ts` | 0 | 0 | 1 | 0 |
| `src/hooks/use-mobile.ts` | 0 | 0 | 1 | 1 |
| `src/components/Territory/TerritoryMap.tsx` | 0 | 0 | 1 | 0 |

---

## 🚀 Recommended Fix Order

1. **First Pass - Critical:**
   - Fix duplicate type definitions in `types.ts`
   - Add missing Job interface properties
   - Fix PhotoUploader props
   - Fix BrowseJobs onNavigate
   - Remove duplicate imports

2. **Second Pass - High:**
   - Fix Settings tabs mismatch
   - Fix password validation consistency
   - Fix forgot password navigation
   - Add memory leak protections

3. **Third Pass - Medium:**
   - Clean up unused imports
   - Fix useRef initial values
   - Fix animation types
   - Add event listener cleanup

4. **Fourth Pass - Low:**
   - Add accessibility attributes
   - Improve error logging
   - Add keyboard navigation

---

## 🧪 Testing Checklist After Fixes

- [ ] App builds without TypeScript errors
- [ ] All routes navigate correctly
- [ ] PostJob pages save with all media types
- [ ] Settings page all tabs work
- [ ] Signup/Login validation consistent
- [ ] Password reset flow works
- [ ] No console errors in production
- [ ] Memory usage stable over time
- [ ] Keyboard navigation works throughout

---

*This document was generated by comprehensive QA testing of the FairTradeWorker codebase.*
