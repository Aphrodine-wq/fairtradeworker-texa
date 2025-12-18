# 20-Year Upkeep Projection (Frontend + Infra)

A pragmatic view of what it costs to keep this system healthy for two decades. All figures in USD, rough order-of-magnitude, assuming 2025 dollars and modest inflation/compounding. Adjust for your actual hiring market and infra discounts.

## Baseline Assumptions
- Team: lean steady state of 2–3 engineers (mix of FE/FS), fractional design, fractional QA, fractional SRE/ops; grows slightly with traffic/features.
- Infra: Vercel + API infra + DB + observability + storage + CDN; moderate but growing traffic.
- Cadence: quarterly maintenance cycles (deps, security, perf), annual deeper refactors (design system, routing/state), 3–4 major platform shifts over 20 years (framework/runtime changes).

## Cost Bands (per year, steady-state, 5-year snapshots)
- Years 1–5: **$350k – $550k/yr** (small team, moderate traffic)
- Years 6–10: **$450k – $700k/yr** (more features, more integrations, higher perf/accessibility bar)
- Years 11–15: **$550k – $850k/yr** (platform shifts, redesigns, compliance hardening)
- Years 16–20: **$650k – $950k/yr** (legacy retirement, re-platforming, data migrations)

> 20-year rough total (summed across ranges): **~$10M – $16M**. Lower end assumes stable scope and cautious hiring; upper end assumes higher traffic/compliance and multiple re-platforms.

## What drives cost up
- Traffic/usage scale (CDN, edge, DB, storage, queues, monitoring volume)
- Security/compliance (SOC2/ISO/HIPAA-style hardening, pen tests, audits)
- Platform shifts (React ↔ new runtimes, Vite → successor, Node versions, TS/RSC changes)
- Mobile/pwa parity and accessibility debt closure (WCAG AA+)
- Test infra growth (E2E farms, visual reg, perf/RUM SLAs)

## What keeps cost down
- Strict dependency hygiene and quarterly upgrades
- Design system discipline (single source of tokens, no one-off theme forks)
- Automated E2E + accessibility + perf budgets in CI
- Observability with clear SLOs (error budgets, uptime, Web Vitals targets)
- Pruning unused code/flags and scheduled refactors (every 12–18 months)

## Suggested annual budget split (steady-state)
- People: **75–85%** (2–3 engineers + fractional design/QA/SRE)
- Infra/tooling: **10–20%** (hosting, DB, CDN, logs/traces/RUM, test infra)
- Professional services/compliance: **5–10%** (audits, pen tests, legal)

## Operational cadence to survive 20 years
- **Quarterly**: dep bumps, security patches, perf/RUM review, a11y spot checks
- **Annual**: design system audit, routing/state audit, error budget review, DR test
- **2–3 year**: framework/runtime upgrades, CSS/DS refresh, asset pipeline updates
- **5–7 year**: re-platform or major UI/IA refresh; data migration/archival plan

## Risks if underfunded
- Dependency rot → security incidents
- Perf regressions → revenue/SEO hits
- A11y non-compliance → legal/brand risk
- Knowledge loss → brittle deployments
- Cost blowups from unobserved infra growth

## Quick takeaway
If you budget **$350k–$550k/yr early** and let it rise toward **$650k–$950k/yr** over time, you can keep this codebase reliable, performant, and compliant for 20 years. That implies a lifetime upkeep envelope of roughly **$10M–$16M**. Tight process (deps, design system, tests, observability) is the lever to stay near the low end.

---

## Reality check: current low-traffic “keep the lights on” run rate

If traffic is modest and you’re not adding big features, the monthly ops cost can be far lower than the long-term staffed model:

- **Infra (Vercel + DB + storage + logs):** roughly **$300–$1,200/mo** if usage stays moderate and you cap logging/tracing.
- **Engineering maintenance:** ~20–30 hrs/mo for dep bumps, security patches, small fixes → **$3k–$6k/mo** if using a contractor.
- **Total lean month:** **~$3.5k–$7k/mo** to keep it stable and up to date.

The higher annual bands in this doc assume a staffed team, growth, and compliance over decades. For today’s low-traffic upkeep, the lean numbers above are the practical floor.

---

## Running Year 1 on $100k (then reinvest profits)

- **Tiny core**: 1 senior FE/FS (contract) + fractional design/QA. Keep burn near $8k/mo engineer + $2k/mo fractional support ≈ $10k/mo → $120k target; trim to $100k by shortening engagement to 10 months or negotiating lower rates.
- **Scope lock**: Ship and polish one hero funnel (e.g., CRM Void drag/pin + lead capture). Defer new features; focus on stability, perf, and demo-readiness.
- **Ops/infra**: Stay on Vercel + minimal DB/observability tiers. Budget infra at $500–$1k/mo; cap logging/tracing volume; set alerts on spend.
- **Quality floor**: Add smoke E2E (Playwright) for auth + hero flow; add axe a11y checks; set Web Vitals alerts. Do monthly dep bumps, quarterly perf/a11y sweeps.
- **Design system**: Freeze net-new tokens; standardize buttons/cards/menus you already use. Avoid theme explosions.
- **Profit reinvestment plan (post-Year 1)**: As revenue grows, stair-step headcount to 2–3 engineers and expand QA/design. Reintroduce backlog items, add deeper test coverage, and raise infra tiers where traffic demands it.
