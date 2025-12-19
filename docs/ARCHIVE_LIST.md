# Docs Archive Index

This file lists documentation that is archived, deprecated, or proposed for archival. It is an index and rationale only — no files are deleted by this list. To archive a document, move it into `docs/archive/deprecated/` and add a short rationale entry here.

## Archival Policy
- Keep an index entry for each archived doc with the reason and date.
- Maintain at least one pointer back to the archived doc from the topical folder.
- Archive when the doc is outdated, superseded by a newer doc, or no longer relevant to current architecture.

## Current Archive Candidates / Locations
- `docs/archive/deprecated/` — historical or removed designs and notes.
- `docs/archive/fixes/` — small fixes and one-off notes that don't merit top-level docs.

## Suggested files to review for archival
(maintainers should review and move files as appropriate; this is a proposal list)
- Legacy marketing drafts or obsolete pricing tables.
- Topic drafts superseded by `docs/design/` or `docs/technical/` updates.

## How to archive
1. Move the file to `docs/archive/deprecated/`.
2. Add a short entry to this file with filename, date, and rationale.
3. Update any cross-references to point to the archive location.

---

## Archived Files (December 2025 Consolidation)

### Root-Level Documentation Consolidation

**Date:** December 19, 2025  
**Rationale:** Major documentation consolidation to reduce redundancy and improve maintainability

1. **`COLOR_FIX_PROGRESS.md`** → `docs/archive/2025-12-consolidation/`
   - Completed task documentation from December 2024
   - All color fixes are complete and deployed
   - Archived as historical record

2. **`IMPLEMENTATION_SUMMARY.md`** → `docs/archive/2025-12-consolidation/`
   - Implementation notes from December 2024
   - Specific to one PR, now outdated
   - Archived as historical reference

3. **`PERFORMANCE.md`** → `docs/technical/PERFORMANCE.md`
   - Moved to proper location in docs/ structure (not a duplicate)
   - Performance optimization guide belongs in technical docs
   - Contains comprehensive performance metrics and best practices

4. **`COMPLETE_SYSTEM_ANALYSIS.md`** → `docs/archive/2025-12-consolidation/`
   - Extensive codebase statistics and business projections
   - Content overlaps significantly with SUPERREADME.md
   - Reference preserved in SUPERREADME.md
   - Archived but available for detailed metrics

5. **`SUPERREADME.md` (old version)** → `docs/archive/2025-12-consolidation/SUPERREADME_OLD.md`
   - Previous version was 4,861 lines (extremely long)
   - Replaced with streamlined 350-line version
   - Old version preserved for reference
   - New version focuses on quick orientation with links to detailed docs

### Impact
- Reduced root-level markdown files from 7 to 2 (README.md + SUPERREADME.md)
- Slimmed SUPERREADME.md by 91% (4,861 → 457 lines)
- Improved documentation discoverability
- Maintained all critical information through cross-references

### Additional Docs Consolidation

6. **`docs/product/PRD_ENHANCEMENTS_COMPLETE.md`** → `docs/archive/2025-12-consolidation/`
   - Completed PRD enhancement documentation
   - All enhancements are now in the main PRD.md
   - Archived as historical reference

7. **`docs/product/COMPETITIVE_FEATURES_IMPLEMENTATION.md`** → `docs/archive/2025-12-consolidation/`
   - Completed competitive features implementation notes
   - Features documented in COMPETITIVE_FEATURES_ROADMAP.md
   - Archived as completed work

8. **`docs/product/TIERS_1_3_IMPLEMENTATION.md`** → `docs/archive/2025-12-consolidation/`
   - Completed tier implementation documentation (tiers are implemented)
   - Tiers fully described in PRD.md and PRICING.md
   - Archived as completed work - implementation is live in codebase

9. **`docs/product/PRODUCT_ROADMAP.md`** → `docs/archive/2025-12-consolidation/`
   - Duplicate roadmap (higher-level strategic view)
   - ROADMAP.md provides more detailed implementation checklist
   - Archived to eliminate duplication

10. **`docs/technical/SECURITY_SUMMARY.md`** → `docs/archive/2025-12-consolidation/`
    - Shortened version of SECURITY.md
    - Full security documentation in SECURITY.md
    - Archived to eliminate duplication

11. **`docs/guides/E2E_TESTING_COMPLETE.md`** → `docs/archive/2025-12-consolidation/`
    - Summary of E2E testing
    - Full documentation in E2E_TESTING_IMPLEMENTATION_COMPLETE.md
    - Archived to eliminate duplication

12. **`docs/design/NAVIGATION_UPDATE_COMPLETE.md`** → `docs/archive/2025-12-consolidation/`
    - Navigation update completion notes
    - Full implementation details in NAVIGATION_IMPLEMENTATION_SUMMARY.md
    - Archived to eliminate duplication

### Overall Consolidation Results
- **Root-level docs:** 7 → 2 (71% reduction)
- **docs/product:** 9 → 5 files (44% reduction)
- **docs/technical:** 14 → 13 files (minor cleanup)
- **docs/guides:** Multiple duplicates removed
- **docs/design:** Duplicate implementations archived
- **Total archived:** 12 documentation files
- **Total documentation reduction:** ~6,000+ lines of duplicate content removed

All archived documentation remains accessible in `docs/archive/2025-12-consolidation/` for historical reference.

---
Maintainers: add entries below as files are archived.
