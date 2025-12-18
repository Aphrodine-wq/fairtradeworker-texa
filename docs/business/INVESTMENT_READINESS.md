# Investment & Codebase Readiness (Frontend)

This document summarizes the current frontend/codebase footprint and suggests an investment ask tailored to the product stage. All line counts are exact (not shortened) from the latest scan on 2025-12-17.

## Codebase Footprint (exact LOC)
- Total LOC (repo, excluding node_modules/dist/build/coverage/.git/etc.): **179168**
- By extension:
  - **.tsx**: 99790
  - **.ts**: 18605
  - **.md**: 41591
  - **.json**: 13005
  - **.css**: 4071
  - **.js**: 632
  - **.sql**: 572
  - **.mjs**: 233
  - **.sh**: 36
  - **.html**: 70
  - **.gitignore**: 78
  - **.log**: 173
  - **.local**: 2
  - **.spark-initial-sha**: 1
  - **(no extension)**: 62
  - **.txt**: 4

## Recent Frontend State
- Performance tuned: GPU-accelerated transitions, reduced motion support, lighter borderless UI, minimized transition durations.
- UX polish: CRM Void drag/pin persistence, submenu fixes, borderless glass styling, light-mode border removals, smoother header layout, demo scroll-to-top.
- Build setup: Vite + SWC, tree shaking, minimized CSS/JS, modern targets (es2020+), lazy-loaded routes/components.
- Documentation: CRM Void now accurately described (no lore), new performance hooks/motion presets added.

## Suggested Investment Ask (frontend scope)
These ranges assume funding to mature the frontend into production-grade scale (accessibility, QA automation, perf budgets, design system hardening) over 9–12 months with a small senior team (2–3 engineers + design + QA).

- **Recommended ask**: **$650,000 – $900,000**
  - Covers 12 months runway for 2 senior FE + 1 full-stack + fractional design/QA.
  - Includes budget for load testing, accessibility sweep (WCAG 2.1 AA), design system refactor, observability (RUM, logs), and UX research cycles.

- **Lean option**: **$400,000 – $550,000**
  - 9 months runway for 2 engineers, slower feature velocity, fewer dedicated QA/design cycles.

- **Aggressive option**: **$1,000,000 – $1,300,000**
  - 12–15 months runway for 3–4 engineers + dedicated design + QA automation; adds mobile polish, offline-ready PWA, full E2E/perf testing, and internationalization.

## Current Codebase Worth (technical asset view)
- A mature React/Vite + TypeScript codebase with **179168** LOC, heavy TSX/UI surface (99790 LOC) and structured business logic (18605 LOC TS) represents a non-trivial replacement cost (multiple senior-years of effort).
- Strengths increasing value: modular lazy-loaded pages, performance optimizations, documented CRM Void behaviors, and a sizeable design system footprint.
- Risk areas to monitor: test coverage (unit/E2E), accessibility debt, and ongoing perf budgets as features grow; these slightly discount valuation until closed.

## Next Steps (to boost valuation before a raise)
1. Add automated E2E + accessibility checks (Playwright + axe) on critical flows (auth, jobs, CRM Void menus, lead capture).
2. Ship perf/RUM instrumentation (Web Vitals + user timing) with dashboards to quantify improvements.
3. Harden design system tokens/themes; document usage patterns and migrate stragglers.
4. Publish a concise frontend architecture README (routing, state, data fetching, caching) to reduce onboarding friction.
5. Produce a short demo video showing CRM Void drag/pin, voice intake modal, and lead capture flow.
