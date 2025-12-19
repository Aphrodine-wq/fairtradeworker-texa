# Fixes Implementation Plan

## Status: In Progress

### Critical Fixes (Do First)

1. ✅ **Image Loading on Job Posts**
   - Issue: Images not loading properly
   - Fix: Use OptimizedImage component, ensure photos array is checked
   - File: `src/components/jobs/BrowseJobs.tsx`

2. ✅ **Free Tools Filtering**
   - Issue: Free tab only shows 3 tools, but ALL tab shows many free tools
   - Root Cause: Filter checks `category === 'free'` but should check `!isPro`
   - Fix: Change filter to show tools without `isPro: true`
   - File: `src/pages/BusinessTools.tsx` line 342

3. ✅ **Tool Navigation**
   - Issue: Clicking tools doesn't work
   - Root Cause: Free tools navigate to 'business-tools' but don't specify which tool
   - Fix: Update navigation to properly route to specific tool components
   - File: `src/pages/BusinessTools.tsx` routeMap

4. ✅ **Animation Issues**
   - Issue: Animations off throughout software, weird black/white on homepage
   - Root Cause: Blur effects in animations causing issues
   - Fix: Remove problematic blur effects, simplify animations
   - Files: `src/lib/animations.ts`, `src/pages/Home.tsx`

5. ✅ **AI Scope Display**
   - Issue: AI Scopes don't look professional
   - Fix: Improve typography, spacing, visual hierarchy
   - File: `src/components/jobs/BrowseJobs.tsx`

6. ✅ **Seed Data for Medium/Large Jobs**
   - Issue: No medium/large jobs in seed data
   - Fix: Add 5-10 medium jobs ($300-$1500) and 3-5 large jobs ($1500+)
   - File: `src/lib/demoData.ts`

### High Priority

1. **Operator Business Tools Access**
   - Status: Already implemented (line 124 of BusinessTools.tsx)
   - Verify: Ensure operators can actually access and use tools

2. **Operator Priority Leads**
   - Issue: Operators need 10-minute early access to new jobs
   - Fix: Filter jobs by `createdAt` - show jobs to operators 10 minutes before others
   - Files: `src/components/jobs/BrowseJobs.tsx`, operator-specific filtering

3. **Test Coverage**
   - Add tests for:
     - Image loading
     - Tool navigation
     - Job filtering
     - Operator priority leads

4. **Software Flows Documentation**
    - Document complete user flows
    - File: `docs/SOFTWARE_FLOWS.md`

---

## Implementation Order

1. Fix image loading (critical UX issue)
2. Fix Free Tools filtering (user confusion)
3. Fix tool navigation (broken functionality)
4. Fix animations (visual issues)
5. Improve AI scope display (professional appearance)
6. Add seed data (better demo experience)
7. Verify operator access (already implemented, just verify)
8. Implement priority leads (new feature)
9. Add tests (quality assurance)
10. Complete documentation (knowledge base)
