# Super Ultra Mega Big README

This document is the authoritative, always-updated system map for FairTradeWorker. It covers architecture, revenue projections, line-of-code footprint, AI strategy, and a complete feature inventory. Update this file whenever the product, pricing, or codebase changes.

---

## Table of Contents

- Purpose & Update Policy
- System Overview
- Revenue Model & Projections
- Line-of-Code (LOC) Footprint
- Feature Inventory (one-line descriptions)
- AI & Automation Stack
- FairTradeWorker AI Architecture – Open Source Enhancement Strategy
- Architecture Deep Dive (Hosted-First + Resilience)
- Role-Based Flows & UI Surfaces
- Financial Expansion (50-Year Detail)
- Operations, Flags, Legal & Compliance
- Testing, Rollout, and Observability
- Update Instructions

---

## Purpose & Update Policy

- Source of truth for what the platform is, how it makes money, and what it contains.
- Keep in sync with every material change (features, pricing, AI models, architecture).
- When updating: refresh revenue assumptions, regenerate LOC counts, and add/edit features.

---

## System Overview

- Mission: Zero-fee home services marketplace where contractors keep 100% of earnings; homeowners pay a flat job fee.
- Frontend: React 19 + TypeScript, Vite, Tailwind, shadcn/ui.
- AI: Smart Claude Tiering (Haiku for simple jobs, Sonnet for complex/multi-trade) with budget guardrails.
- Data: Spark KV (front-end demo persistence), automation timers for jobs/invoices/CRM.
- Design: Brutalist-inspired UI, dark mode, responsive, WCAG-minded.

```
flowchart LR
    Homeowner[Homeowner App] -->|Posts job + pays fee| Marketplace[Job Marketplace]
    Contractor[Contractor App] -->|Bids + manages CRM| Marketplace
    Operator[Operator Console] -->|Territory + revenue| Marketplace
    Marketplace -->|AI scope| AIEngine[Smart Claude Tiering]
    Marketplace -->|Invoices + Payments| Billing[Invoice & Revenue Layer]
    Billing -->|Metrics| Dashboards[Company/Operator Dashboards]
    Automation[Automation Runner] -->|Late fees, reminders, recurring, CRM follow-ups| Billing
    Automation -->|Scheduling + checks| Marketplace
```

---

## Revenue Model & Projections (50-Year Outlook)

**Current pricing assumptions (base):**

- Homeowner/platform fee: **$20 per completed job**.
- Pro subscription: **$59/mo** per contractor (advanced tools & AI).
- Premium visibility: **$15/job** boost (featured/priority listing).
- Processing fee share: **2.9%** of invoice value (payments pass-through).
- Operator royalty: **10%** of platform fees (territory operators).
- Average invoice: **$1,200** per job.

**Short-term monthly projections (present-day capacity):**

- Conservative: 2,000 jobs; 1,000 contractors (20% Pro = 200); 10% boosts.
  - Platform fees: $40k; Pro subs: $10k; Boosts: $3k; Processing: $69.6k; Gross: ~$122.6k; Royalties: $4k; **Net: ~$118.6k/mo**.
- Base: 10,000 jobs; 4,000 contractors (25% Pro = 1,000); 15% boosts.
  - Platform fees: $200k; Pro subs: $50k; Boosts: $22.5k; Processing: $348k; Gross: ~$620.5k; Royalties: $20k; **Net: ~$600.5k/mo**.
- Aggressive: 25,000 jobs; 6,000 contractors (30% Pro = 1,800); 20% boosts.
  - Platform fees: $500k; Pro subs: $90k; Boosts: $75k; Processing: $870k; Gross: ~$1.535M; Royalties: $50k; **Net: ~$1.485M/mo**.

**50-year scale plan (anchor milestones, yearly run-rate):**

- Year 1 (0–300k users; refs: SCALING_300K_USERS.md / IMPLEMENTATION_300K_USERS.md)
  - Target: 300k users, 10% contractors (30k), 15% Pro (4.5k); ~1k jobs/day.
  - Est. run-rate: **~$12–18M/yr** (platform + Pro + boosts + processing) before royalties; infra ~$84k/yr.
- Year 5 (regional leadership in 3 states)
  - Jobs/day: 5k; Contractors: 120k; Pro: 25% (30k); Boost attach: 20%.
  - Est. annual: **$80–120M/yr**; royalties: ~10% of platform fees.
- Year 10 (national penetration)
  - Jobs/day: 25k; Contractors: 400k; Pro: 30% (120k); Boost attach: 25%.
  - Est. annual: **$450–650M/yr**; processing share dominates at scale.
- Year 20 (multi-country)
  - Jobs/day: 75k; Contractors: 1.2M; Pro: 30% (360k); Boost attach: 30%.
  - Est. annual: **$1.5–2.2B/yr**; mix shifts toward processing/boosts; platform fees steady.
- Year 30 (global footprint, mature ops)
  - Jobs/day: 150k; Contractors: 2.5M; Pro: 30% (750k); Boost attach: 35%.
  - Est. annual: **$3.2–4.5B/yr**; assume modest price indexation (~2–3%/yr) folded in.
- Year 50 (mature platform, steady-state growth)
  - Jobs/day: 300k; Contractors: 5M; Pro: 30% (1.5M); Boost attach: 40%.
  - Est. annual: **$7–9B/yr**; assumes incremental pricing indexation and stable take-rates; royalties remain 10% of platform fees.

**Planning guidance:**

- Recompute every major release: update fees, boost price, processing %, royalty %, average invoice, Pro conversion, job volume, and geographic coverage.
- Track attach rates separately (Pro %, boost %, payment adoption) and revisit CAGR assumptions per decade.
- Note royalty drag (10% of platform fees) and infra/ops budgets per phase when updating.

---

## Line-of-Code (LOC) Footprint (snapshot)

Computed on current workspace (see Update Instructions for refresh):

- **Grand total:** 101,821 lines
- **docs:** 25,945 (markdown)
- **src:** 75,051 (tsx/ts/css)
- **public:** 360 (js/json)
- **scripts:** 465 (mjs/js)

Key src breakdown:

- `src/components`: 50,318 (tsx)
- `src/pages`: 6,510 (tsx)
- `src/lib`: 8,558 (ts)
- `src/hooks`: 1,866 (ts)
- `src/styles`: 959 (css)

---

## Feature Inventory (one-line descriptions)

**Core Platform**

- Authentication & roles: Homeowner, Contractor, Operator with demo accounts.
- Job posting: Text, photo, video, audio/file inputs with tiered job classification.
- Marketplace & bidding: Browse, bid, performance-based sorting, fresh job indicators, sticky first bid.
- AI scope generation: Smart Claude tiering routes simple vs. complex scopes; fallback prompts.
- Job tiers: Quick fix / Standard / Major project pricing guidance.
- Payments & invoicing: Invoice manager, taxes, status badges, payment terms.

**Contractor**

- Dashboard: Earnings, active jobs, win rate, fresh jobs.
- CRM: Kanban/list/timeline, customer lifetime metrics, sequences.
- Follow-up automation: Scheduled sequences with pause-on-reply.
- Instant invites: Email/SMS invites to prospects.
- Invoice suite: PDF generator, recurring invoices, auto late fees, auto reminders.
- Pro upgrade: Gated advanced tools, upsell surfaces.
- Referral system: Contractor referral rewards and tracking.

**Operator**

- Territory map: 254 Texas counties, claiming workflow.
- Speed metrics: Territory performance dashboards.
- Company revenue dashboard: Platform fees, Pro MRR, ARR, processing, royalties, targets.

**Homeowner**

- Flat-fee posting: Transparent pricing to start projects.
- Direct messaging: Contact contractors directly; track activity.
- Project tracking: Visibility into bids and job status.

**Growth & Viral**

- Post-&-Win referrals: Share codes from posted jobs.
- Contractor referral goldmine: Incentivized contractor invites.
- Live stats bar: Real-time platform momentum display.
- Boosted listings: Paid visibility upgrades.

**Design & UX**

- Brutalist/dark-mode responsive UI, WCAG-aware.
- Photo lightbox and media viewers.
- Smooth animations and magnetic theme toggle.

**AI & Automation**

- Smart Claude Tiering: Haiku for simple jobs, Sonnet for complex/multi-trade; budget-guarded calls.
- Budget controller: $120/mo safety margin; tracks Haiku/Sonnet spend.
- Automation Runner: Recurring invoices, late fees, reminders, CRM follow-ups on schedule.
- Prompt systems: Standard vs. detailed prompts with materials, price ranges, and timelines.
- Integration stubs: Spark LLM with ready hooks for Anthropic SDK.

**Analytics & Reporting**

- Company revenue dashboard: Platform fees, Pro subs, processing fees, royalties, targets.
- MRR/ARR projections and progress meters.
- Territory and operator breakdowns.

**Integration-Ready Hooks**

- Stripe checkout points (Pro upgrade), Twilio/Resend email/SMS stubs, TUS video upload stubs, Supabase placeholder.

---

## AI & Automation Stack

- Smart Claude Tiering (`src/lib/ai/smartClaude.ts`): job-based model selection; Haiku for short/simple, Sonnet for complex/multi-trade; Spark LLM fallback.
- Budget Controller (`src/lib/ai/budgetController.ts`): spend limits, safety margins, call tracking per model.
- AI entrypoint (`src/lib/ai.ts`): caching, complexity detection, runtime metrics.
- Automation services (`src/lib/automation.ts`): recurring invoices, late fees, reminders, CRM follow-ups; AutomationRunner wiring for components.
- Prompts: Standard (quick scope) vs. Detailed (multi-trade/major project) with pricing/materials/time outputs.

---

## FairTradeWorker AI Architecture – Open Source Enhancement Strategy

### Philosophy: The Tiered Intelligence Stack

- Claude for judgment and high-stakes scoping; open source for routing, context, and background tasks.
- Goal: reduce Claude spend, deepen intelligence (RAG), and add adaptive CRM/matching/automation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OPEN SOURCE: ROUTING LAYER                       │
│  • Intent classification (Mistral 7B / Qwen3 0.6B)                  │
│  • Job complexity scoring                                            │
│  • Spam/quality filtering                                            │
│  • Language detection                                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
     │   OPEN SOURCE  │   │     CLAUDE     │   │   OPEN SOURCE  │
     │   EMBEDDINGS   │   │   SCOPING      │   │   BACKGROUND   │
     │                │   │                │   │                │
     │ • BGE-M3       │   │ • Haiku: Quick │   │ • CRM insights │
     │ • Nomic Embed  │   │ • Sonnet: Major│   │ • Email drafts │
     │ • Similar jobs │   │ • Multi-trade  │   │ • Summaries    │
     │ • Contractor   │   │ • Price ranges │   │ • Follow-ups   │
     │   matching     │   │ • Materials    │   │                │
     └────────────────┘   └────────────────┘   └────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RAG KNOWLEDGE LAYER                           │
│  • Historical job scopes (ChromaDB / Milvus)                        │
│  • Contractor specialties database                                   │
│  • Material pricing index                                            │
│  • Regional labor rates                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer 1: Pre-Routing (Save Claude Tokens)

- Models:
  - Intent: Qwen3-0.6B (CPU-fast) or Mistral 7B.
  - Complexity: Mistral 7B to decide Haiku vs Sonnet.
  - Spam: DistilBERT for garbage filtering.
  - Language detection: FastText for routing.

**Implementation sketch:**

```typescript
// src/lib/ai/openSourceRouter.ts
interface JobClassification {
  intent: 'quick_fix' | 'standard' | 'major_project' | 'multi_trade';
  complexity: number; // 0-100
  trades: string[];
  requiresSonnet: boolean;
  spam_score: number;
}

export async function classifyJob(description: string): Promise<JobClassification> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'qwen3:0.6b',
      prompt: `Classify this home service job. Return JSON only.

Job: "${description}"

Return: {"intent": "quick_fix|standard|major_project|multi_trade", "complexity": 0-100, "trades": [...], "requiresSonnet": true/false}`,
      stream: false,
    }),
  });
  return parseResponse(response);
}
```

**Cost impact:** ~40% of simple jobs handled by routing; Claude only sees high-judgment cases.

### Layer 2: Embedding & RAG

- What to index:
  - Historical scopes (all Claude outputs).
  - Contractor specialties and performance.
  - Material pricing (regional, seasonal) and labor rates.
  - Trade-specific knowledge snippets.
- Embedding models (Ollama/self-hosted): BGE-M3, Nomic Embed, E5-Large, all-MiniLM-L6-v2.
- Vector DB options: ChromaDB (simple), Milvus/Qdrant (scale), pgvector (Postgres-native).

**RAG retrieval sketch:**

```typescript
// src/lib/ai/ragContext.ts
import { ChromaClient } from 'chromadb';
const chroma = new ChromaClient();

export async function getJobContext(jobDescription: string): Promise<RAGContext> {
  const embedding = await embedText(jobDescription);
  const similarScopes = await chroma.collection('job_scopes').query({
    queryEmbeddings: [embedding],
    nResults: 5,
    where: { status: 'completed' },
  });
  const materials = await chroma.collection('materials').query({
    queryEmbeddings: [embedding],
    nResults: 10,
  });
  const contractors = await chroma.collection('contractor_specialties').query({
    queryEmbeddings: [embedding],
    nResults: 8,
  });
  return {
    similarScopes: similarScopes.documents,
    materialPricing: materials.documents,
    suggestedContractors: contractors.documents,
    averagePrice: calculateAverageFromScopes(similarScopes),
    typicalTimeframe: extractTimeframes(similarScopes),
  };
}
```

**Enhanced scope prompt with context:**

```typescript
// src/lib/ai/enhancedScope.ts
export async function generateEnhancedScope(job: Job): Promise<Scope> {
  const context = await getJobContext(job.description);
  const prompt = `You are scoping a home service job. Use the context below to provide accurate, market-informed estimates.

## SIMILAR COMPLETED JOBS:
${context.similarScopes.map(s => `- ${s.title}: $${s.finalPrice}, ${s.duration} days`).join('\n')}

## CURRENT MATERIAL PRICES (${job.zipCode} area):
${context.materialPricing.map(m => `- ${m.item}: $${m.price}`).join('\n')}

## AVERAGE FOR THIS JOB TYPE: $${context.averagePrice}
## TYPICAL TIMEFRAME: ${context.typicalTimeframe}

---

## NEW JOB TO SCOPE:
${job.description}

Photos provided: ${job.photos?.length || 0}
Location: ${job.city}, ${job.state}

Generate a detailed scope including:
1. Itemized work breakdown
2. Material estimates with quantities
3. Labor estimate (hours)
4. Price range (low/mid/high) calibrated to similar jobs above
5. Timeline
6. Potential complications to discuss with homeowner`;

  return await claude.generate(prompt, {
    model: context.complexity > 70 ? 'sonnet' : 'haiku',
  });
}
```

### Layer 3: CRM Intelligence

- Lead scoring (predictive via Mistral/Qwen).
- Sentiment analysis on conversations.
- Customer lifetime value prediction; surface in dashboards.

**Lead scoring sketch:**

```typescript
// src/lib/crm/leadScoring.ts
interface LeadScore {
  score: number;
  likelihood: 'hot' | 'warm' | 'cold';
  reasoning: string;
  suggestedAction: string;
  optimalContactTime: string;
}
```

### Layer 4: Smart Follow-Ups

- Context-aware drafts using cheaper models (Mistral/Qwen), referencing sentiment, objections, timing.

**Follow-up sketch:**

```typescript
// src/lib/automation/smartFollowUp.ts
export async function generateFollowUp(customer: Customer, context: ConversationContext): Promise<FollowUpMessage> {
  const analysis = await analyzeConversation(context.messages);
  const draft = await ollama.generate({
    model: 'mistral:7b-instruct',
    prompt: `Write a follow-up message...
...`,
  });
  return {
    content: draft.response,
    scheduledFor: calculateOptimalTime(customer, analysis),
    channel: determineChannel(customer),
  };
}
```

### Layer 5: Contractor Matching Intelligence

- Semantic matching via embeddings; re-rank with ratings, response time, completion, availability.

**Matching sketch:**

```typescript
// src/lib/matching/contractorMatch.ts
export async function findBestContractors(job: Job): Promise<ContractorMatch[]> {
  const jobEmbedding = await embedText(`${job.title} ${job.description}`);
  const matches = await vectorDB.query({
    collection: 'contractor_profiles',
    embedding: jobEmbedding,
    filter: { servicesZip: job.zipCode, isActive: true, isPro: true },
    limit: 20,
  });
  const ranked = matches.map(match => ({
    ...match,
    compositeScore: calculateCompositeScore({
      semanticSimilarity: match.score,
      reviewScore: match.contractor.avgRating,
      responseTime: match.contractor.avgResponseTime,
      completionRate: match.contractor.completionRate,
      specialtyMatch: calculateSpecialtyMatch(job, match.contractor),
      availability: checkAvailability(match.contractor, job.preferredDate),
    }),
  }));
  return ranked.sort((a, b) => b.compositeScore - a.compositeScore);
}
```

### Deployment Options

- Self-hosted: Ollama + ChromaDB (or Milvus/Qdrant/pgvector) + React app + Claude API for scoping. Hardware: 16–32GB RAM; GPU recommended for 7B speed; cloud GPU ~$0.30–0.80/hr.
- Hybrid cloud: Hosted APIs (Together.ai, Groq free tier, Fireworks) + Claude for scoping.

### Cost Comparison

- Current (Claude-only): ~$225/mo (example mix).
- With OSS layer: Routing on Groq (free), embeddings self-hosted, background on Together (~$3.60), Claude scoping reduced (~$90) → **~$94/mo** (~60% savings) plus deeper features.

### Implementation Roadmap

- Phase 1 (Week 1–2): RAG foundation (Chroma/Milvus, BGE-M3, ingest historical scopes, inject context into `smartClaude.ts`).
- Phase 2 (Week 3): Smart routing (Qwen/Mistral classifier), complexity scoring, update Smart Tiering to use OSS routing.
- Phase 3 (Week 4–5): CRM intelligence (lead scoring, sentiment, CLV) surfaced in dashboards.
- Phase 4 (Week 6): Smart automation (context-aware follow-ups, optimal timing, A/B variants).
- Phase 5 (Week 7–8): Contractor matching (embed profiles, composite scoring, replace sorting).

### Quick Wins

1. Run Ollama + Mistral 7B locally (10 minutes).
2. Stand up ChromaDB for scope history; start ingesting Claude outputs.
3. Use BGE-M3 embeddings for semantic search immediately.
4. Use Groq free tier for routing to drop Claude calls quickly.

### Key Files to Modify (when implementing)

```
src/lib/ai/
├── smartClaude.ts      # Add RAG context injection
├── budgetController.ts # Track open source costs separately
├── openSourceRouter.ts # NEW: Pre-classification layer
├── ragContext.ts       # NEW: RAG retrieval
└── embeddings.ts       # NEW: Embedding utilities

src/lib/crm/
├── leadScoring.ts      # NEW: Predictive scoring
├── sentimentAnalysis.ts # NEW: Message analysis
└── clvPrediction.ts    # NEW: Lifetime value

src/lib/automation/
├── automation.ts       # Modify sequences
└── smartFollowUp.ts    # NEW: Context-aware drafts

src/lib/matching/
└── contractorMatch.ts  # NEW: Semantic matching
```

---

# Architecture Deep Dive (Hosted-First + Resilience)

- **Service slices (front-of-house)**: React 19 SPA (Vite), AI entrypoint (`src/lib/ai.ts`), scoping surfaces (Photo Scoper, Browse Jobs), payments/invoices, CRM, operator dashboards.
- **Service slices (back-of-house, logical)**: Routing/classification (open source), embeddings/RAG, Claude scoping, CRM intelligence, automation runner, matching, revenue CTAs/config, navigation preferences.
- **Data & storage**: Spark KV for demo persistence; vector DB (Chroma/Milvus/Qdrant/pgvector) for scopes/materials/contractors; object storage for media; Postgres (planned) for transactional; Redis L1; semantic cache L3.
- **Caching tiers**: L1 in-memory (classification/embeddings), L2 Redis (scopes, embeddings, contractors/materials), L3 semantic cache (vector similarity), CDN/edge for static.
- **Resilience**: Circuit breakers, bulkheads, timeouts, retries, stale-on-failure for caches, budget guardrails for AI, feature flags for AI/revenue endpoints, open-source fallback for Claude.
- **Observability**: Metrics (latency, token spend, cache hit rates), logs (structured), traces (route → AI → RAG), alerts (budget, latency, DLQ depth), audit trails for AI prompts/outputs.
- **Security**: Key management (env vars), PII minimization in prompts, output filters for safety, role-based navigation, affiliate disclosure text baked into CTAs, rate limits.
- **Delivery**: Vercel for deploys, Vite build, CI-friendly `npm run build` gate; lint pending eslint.config migration.
- **Runbook shards (examples)**:
  - AI outage: flip flag to OSS-only routing + cached scopes; throttle scope requests; notify ops.
  - Vector DB degraded: bypass L3 semantic cache, fall back to defaults; enqueue reindex; alert on miss spikes.
  - Claude budget breach: drop to Haiku-only for simple jobs, increase cache TTL, pause non-critical automations.
  - Navigation schema drift: reset to defaults, log reset, prompt user to re-save preferences.

```
flowchart LR
  Edge[CDN/Edge] --> App[React App]
  App --> Router[Open-Source Router\n(intent/complexity/spam)]
  Router --> RAG[RAG Context\n(vector DB)]
  Router --> Claude[Claude Scoping\nHaiku/Sonnet]
  RAG --> Claude
  Claude --> CacheL2[Redis L2]
  Router --> CacheL1[In-memory L1]
  App --> CRM[CRM Intel\nlead score/sentiment/CLV]
  App --> Auto[Automation Runner\nfollow-ups, invoices]
  App --> Matching[Contractor Matching\nembeddings + scores]
  Claude --> SemCache[L3 Semantic Cache]
  Auto --> Queue[Queues/Workers]
```

---

# Role-Based Flows & UI Surfaces

- **Homeowner journey**: Post job → AI scope preview (Haiku/Sonnet) → pay flat fee → receive bids → select contractor → invoices/payments → feedback → referrals/donations.
- **Contractor journey**: Browse with load-more + filters → AI scope + materials/tools CTAs → place bids → premium lead upsell → CRM dashboard (list/pipeline/analytics) with spread filters → invoices + payouts → Pro upgrade → referrals.
- **Operator journey**: Navigation customization, territory map, revenue dashboards (fees, Pro, boosts, processing, royalties), speed metrics, observability hooks for latency/budget.
- **AI surfaces**: Photo Scoper, Browse Jobs cards, Payment Dashboard CTAs, CRM insights (lead score/sentiment/CLV), smart follow-ups, contractor matching recommendations.
- **Revenue surfaces**: Affiliate materials/tools in scopes/dashboards, insurance/financing links, donations, premium lead access button, API/tools directory links; all flag/config-driven.
- **Navigation customization**: Drag/reorder/toggle with saved preferences; dialog stays in sync with current nav.
- **End-to-end UI mapping (selected)**:
  - Job intake: `PhotoScoper` (media upload, AI scope preview) → `PaymentDashboard` (fee capture).
  - Discovery: `BrowseJobs` (virtualized load-more, list/map toggle, premium lead CTA).
  - CRM: `EnhancedCRMDashboard` (list/pipeline/analytics views, full-width search + button filters).
  - Payments: `PaymentDashboard` CTAs (affiliate/insurance/financing/donations); invoices in `InvoiceManager`.
  - Operator: `CompanyRevenueDashboard`, territory map, navigation customizer dialog.
- **Journeys with AI touchpoints**:
  - Scope quality: pre-route → RAG → Claude; cache hits lower cost/latency.
  - Follow-ups: sentiment → next-best-action → scheduled send with pause-on-reply.
  - Matching: embed job + contractor profiles → composite scoring → surfaced in bids/CRM notes.

---

# Financial Expansion (50-Year Detail)

- **Revenue waterfalls** (per job): platform fee $20 + boost attach (10–40% × $15) + processing share (2.9% of GMV) + affiliate/insurance/financing referrals + premium leads + donations + API/license share (where applicable).
- **Contractor ARPA sketch**: ((platform fees from their jobs × royalty-adjusted) + Pro + boosts attributable + affiliate lift) / active contractor; monitor per phase.
- **Per-decade recalibration**: Refresh attach rates, CPI indexing (2–3%/yr), invoice averages, royalty %, processing spread, and GMV share; rerun pessimistic/base/aggressive bands.
- **Infra cost anchors**: $1–2k/mo (seed) → $5–10k (scale-up) → $15–40k (national) → $40–120k (global); tie to caching hit rates, media load, vector query volume, AI token budgets.
- **Risked ranges**: Track downside with -5pp Pro/-10pp boost and invoice -20%; upside with +5pp Pro/+10pp boost and invoice +20%; present both net and gross (royalty/processing separated).
- **GMV sensitivity**: GMV = jobs × avg invoice; processing share scales linearly; royalties tied to platform fees only; Pro and boosts scale with contractor base/attach.
- **Decade snapshots (base case mix)**:
  - Years 1–5: Platform + boosts + processing dominate; affiliates/insurance early placements; API/directory negligible.
  - Years 5–15: Processing overtakes platform fees; Pro MRR stabilizes; boosts ~20–30%; referrals (insurance/financing) meaningful.
  - Years 15–30: API/white-label begins contributing (if launched); tools directory recurring; price indexation lifts all core lines.
  - Years 30–50: Steady-state indexation; attach rates mature; margin lift from infra efficiency and higher-value SKUs (priority boosts, enterprise APIs).
- **Illustrative revenue mix per 100k jobs/day (base)**:
  - Platform fees: ~$730M/yr (100k × $20 × 365).
  - Boosts @25%: ~$137M/yr (25k × $15 × 365).
  - Pro @30% of 200k contractors @ $59/mo: ~$36M/yr.
  - Processing 2.9% on $1,200 GMV: ~$1.27B/yr.
  - Affiliate/materials/tools @6% on $400 spend, 15% click, 10% conv: ~$79M/yr.
  - Insurance/financing referrals (10%/12% attach @ $100/$75): ~$685M/yr.
  - Premium leads ($15, 15% of non-winners @ 3.5 bids/job): ~$226M/yr.
  - API/tools directory (conservative) + donations: upside/long-tail.

---

# Operations, Flags, Legal & Compliance

- **Feature flags**: AI routing, embeddings, RAG, revenue CTAs (affiliate/insurance/financing/donations/API/tools), premium leads, nav customization; default-safe fallbacks.
- **A/B testing hooks**: Pricing ladders (Pro $50 vs $59), boost tiers ($9/$15/$19), CTA placements, prompt variants, cache TTLs; measure attach, conversion, latency, token cost.
- **Legal/Compliance**: Affiliate disclosures near CTAs; financing/insurance partner disclosures; AI output disclaimer (“not a guaranteed quote”); ToS for contractor vs platform; arbitration clause; data privacy (PII minimization, encryption in transit, least-privilege).
- **SLAs**: 99.9% → 99.95% target; support tiers for Pro/operators; RCA within 48h; publish error budgets tied to release cadence.
- **Incident playbooks**: AI outage → fallback to cached scopes + open-source models; payment outage → queue invoices, retry; vector DB outage → disable semantic cache, fall back to defaults; navigation schema drift → reset to defaults with warning toast.
- **Governance rhythm**: Monthly flag reviews, quarterly pricing/attach re-baselines, semiannual DR drills, annual compliance/privacy reviews, key rotations quarterly.
- **Data lifecycle**: Minimize retention for PII; expire AI prompt logs; purge old media; anonymize analytics; separate prod vs. demo keys and storage.
- **Partner management**: Vendor scorecards (uptime, pricing, DPAs), dual providers for payments/LLM where feasible, exit plans for each critical vendor.

---

# Testing, Rollout, and Observability

- **Validation**: Prompt regression harness (cost/latency/quality), RAG retrieval accuracy checks, cache hit-rate targets (L1 >40%, L2 >60% with promotions), contract tests for providers.
- **Performance**: Load tests for job/bid flows, CRM list/pipeline rendering with virtualization/windowing, map lazy-load, payment dashboard CTAs, nav customizer state sync.
- **Rollout**: Dark launch behind flags → canary (5–10%) → full rollout; keep rollback toggles for AI providers, vector endpoints, and revenue CTAs.
- **Observability checklist**: Metrics (latency, error rate, token spend, cache hits, DLQ depth), logs (structured per request with correlation IDs), traces (router → RAG → Claude), alerts (budget exceed, latency SLO breach, cache miss spike, vector error rate).
- **Data quality**: Spot-check scopes vs historical outcomes; monitor pricing sanity (within 3σ of historical); validate CRM lead scores vs conversion; audit affiliate click tracking.
- **Test matrix (examples)**:
  - Functional: scopes (simple/complex/multi-trade), bids, payments, CRM filters (no scroll), navigation customization save/reset.
  - Reliability: cache promotions/demotions, semantic cache toggle, Claude fallback to OSS, budget thresholds.
  - UI/UX: keyboard navigation, focus states, dark/light contrast, map lazy-load Suspense, list/map toggle ARIA labels.
  - Revenue: CTA visibility by flag, link integrity, disclosures present, premium lead button only for contractors.
  - Performance targets: scopes <3s P95 simple; list render smooth with 200+ items; map render under Suspense; CRM filters apply <500ms on 5k rows (target).

---

# FairTradeWorker Revenue Expansion Deep-Dive

## Executive Summary

- Builds on the existing $7–9B/year 50-year projection with an added $2–4B+ annually via high-margin, largely passive streams layered onto existing flows.
- Leverages current infra, AI scopes, bidding, and dashboards to insert affiliate, referral, upsell, and API monetization.

## Revenue Stream Analysis

### 1) Affiliate Partnerships for Supplies & Tools

- Model: 4–10% commission on material/tool purchases.
- Placement: tracked links in AI scopes and dashboards.
- Scale: 300k jobs/day (109.5M/year); avg material spend $400; 15% click rate; 6% commission.
- Annual Revenue: **~$394M**.
- Advantages: near-zero marginal cost; natural contractor behavior; scales with job volume.

### 2) Insurance & Financing Affiliates

- Model: $50–$200 per successful referral.
- Placement: job flows for contractor insurance and homeowner financing.
- Adoption: Insurance 8% of jobs; Financing 12% of jobs.
- Annual Revenue: **~$1.86B** (8.76M × $100 + 13.14M × $75).
- Advantages: high-value referrals; strong demand; recurring opportunities (renewals).

### 3) Lead Generation Upsell

- Model: $10–$20 per premium lead access (non-winning bidders).
- Scale: 3.5 bids/job; convert 15% of non-winners; $15 per premium lead.
- Annual Revenue: **~$616M**.
- Advantages: uses existing bidding infra; urgency via scarcity; high willingness to pay.

### 4) Donations / “Support Fair Trade”

- Model: voluntary contributions.
- Scale: 5M users; 2% participation; $15 avg.
- Annual Revenue: **~$1.5M**.
- Advantages: minimal implementation cost; goodwill-driven; scales with user base.

### 5) White-Label/API Access

- Model: tiered API pricing (freemium + premium).
- Scale (conservative): 10k active integrations; $59/month each.
- Annual Revenue: **~$6B** (high-end potential; adjust per adoption).
- Advantages: leverages AI infra; ecosystem lock-in; high-margin software licensing.

### 6) Sponsored Tools Directory

- Model: 20–30% recurring commissions on SaaS tools.
- Scale: 5M contractors; 10% adoption; $600 annual spend; 25% commission.
- Annual Revenue: **~$75M**.
- Advantages: recurring SaaS commissions; natural workflow fit; low maintenance post-setup.

## Total Revenue Impact

- Conservative: **~$2.9B annually**; Aggressive: **~$4.6B annually**.
- Uplift: 40–65% over base 50-year projection; minimal incremental infra.

## Implementation Priority

1) Affiliate partnerships (immediate) – tracked links in scopes/dashboards.
2) Donations (immediate) – simple link placement.
3) Insurance/financing (3–6 months) – API partners; compliance review.
4) Lead generation upsell (6–12 months) – bidding flow upgrade; micro-payments.
5) Sponsored tools (12–18 months) – curated directory; commission tracking.
6) API/white-label (18–24 months) – metering, auth, pricing plans.

## Risk Mitigation

- UX: non-intrusive placements.
- Compliance: affiliate disclosures; finance/insurance regulatory review.
- Vendor reliability: diversify partners; failover links; monitoring.
- Scalability: automated tracking/payouts; feature flags; A/B gating.

## Synergistic Effects

- More contractors → more material purchases → higher affiliate revenue.
- More jobs → more insurance/financing → higher referral income.
- More platform value → more external interest → higher API demand.
- Ecosystem flywheel: marketplace → financial services → tooling → data moat.

---

## Update Instructions

- **Revenue:** adjust pricing (platform fee, Pro price, boost price, processing %, royalty %, average invoice), set job volume + Pro conversion assumptions, recompute gross/net.
- **LOC:** rerun LOC script from repo root:
  - `python -c "from pathlib import Path; root=Path('.'); ..."` (use the one-line script above; update totals and date).
- **Features:** add/remove lines in Feature Inventory when functionality changes; keep one-sentence clarity.
- **AI:** refresh model names/prices if Anthropic pricing changes; update budgets accordingly.
- **Versioning:** note date of refresh at top when numbers change.

---

## Changelog (Current Session)

- Implemented hosted-first AI stack wiring: routing/classification, embeddings + RAG context, and enhanced scoping with hosted Claude fallback.
- Added CRM intelligence (lead scoring, sentiment, CLV), smart follow-ups, contractor matching.
- Added revenue CTAs (affiliate materials/tools, insurance/financing, donations, premium lead upsell, API/tools directory) behind config flags.
- Added `docs/AI_CONFIG.md` for environment keys, provider toggles, and vector config.

_Last refreshed: current session (LOC and revenue projections computed from the present workspace/pricing assumptions)._

---

# Deep-Dive Expansion: Scaling & Financial Blueprint (50-Year Horizon)

## Executive Overview

- **Purpose**: Be the definitive, living blueprint for revenue, scaling, operations, and risk across 50 years.
- **Scope**: Pricing knobs, scenario bands, CAGR paths, cost/margin models, org growth, infra/ops playbooks, risks, AI roadmap, and update instructions.
- **Assumptions**: Base pricing from current model (platform $20/job, Pro $59/mo, boost $15/job, processing 2.9%, royalty 10% on platform fees, avg invoice $1,200). Adjust per geography and inflation as needed.
- **Versioning**: Every major release should refresh: (1) pricing, (2) attach rates, (3) job/volume forecasts, (4) infra/ops budgets, (5) AI model mix/pricing.
- **Reference docs**: `docs/SCALING_300K_USERS.md`, `docs/IMPLEMENTATION_300K_USERS.md`, `docs/COMPLETE_FEATURES.md`, `docs/COMPLETE_SOFTWARE_STRUCTURE.md`, `README.md`.

---

## Pricing & Revenue Inputs (Knobs to Tune)

- Platform fee per completed job: default $20 (adjust per market; consider CPI indexing).
- Pro subscription: $59/mo per contractor (volume/enterprise tiers optional).
- Boost/featured listing: $15/job (promo tiers possible: $9, $19 A/B).
- Processing share: 2.9% of invoice value (pass-through; margin impact modeled separately).
- Operator royalty: 10% of platform fees to territory operators.
- Average invoice: $1,200 (sensitivity: $800–$2,000).
- Pro conversion: baseline 20–30% of contractors; sensitivity table included.
- Boost attach: baseline 10–40% over time; sensitivity included.
- Jobs/day growth: phase-based ramp; see 50-year tables.
- Geographic expansion: TX → multi-state → national → global; adjust fee elasticity and attach rates per region.

---

## Financial Projections (50-Year Horizon)

### Milestone Snapshot (Annual Run-Rate, Base Case)

| Year | Jobs/Day | Contractors | Pro % | Pro Count | Boost Attach | Annual Revenue (Range) | Notes |
|------|----------|-------------|-------|-----------|--------------|------------------------|-------|
| 1 | 1,000 | 30k | 15% | 4.5k | 10% | $12–18M | Seed → 300k users; infra ~$84k/yr; targets from scaling docs |
| 5 | 5,000 | 120k | 25% | 30k | 20% | $80–120M | Regional leadership in 3 states |
| 10 | 25,000 | 400k | 30% | 120k | 25% | $450–650M | National penetration |
| 20 | 75,000 | 1.2M | 30% | 360k | 30% | $1.5–2.2B | Multi-country footprint |
| 30 | 150,000 | 2.5M | 30% | 750k | 35% | $3.2–4.5B | Mature global ops; indexed pricing |
| 50 | 300,000 | 5M | 30% | 1.5M | 40% | $7–9B | Steady-state; modest price indexation |

### Scenario Bands (Pessimistic / Base / Aggressive)

- **Pessimistic**: Lower attach (Pro 15–20%, boost 10–15%), slower volume (half of base jobs/day), invoice avg $900. Expect ~50–60% of base revenue.
- **Base**: Table above. Assumes steady attach improvements and modest CPI-linked price lifts.
- **Aggressive**: Faster volume growth (1.3–1.5× base), higher attach (Pro 35%, boost 45%), invoice avg $1,500 with periodic premium SKUs. Expect 1.5–2.0× base revenue.

### CAGR Pacing Guidance

- Years 1–5: Target 60–80% YoY (small base, rapid expansion).
- Years 5–10: Target 35–45% YoY (national build-out).
- Years 10–20: Target 20–30% YoY (international rollout, marketplace effects).
- Years 20–30: Target 10–15% YoY (mature but still expanding globally).
- Years 30–50: Target 5–8% YoY (steady-state with pricing indexation).

### Sensitivity Levers (Recompute When Updating)

- Price levers: platform fee ±$5, Pro price ±$10, boost price ±$5.
- Volume levers: jobs/day ±25%; contractor base ±20%.
- Attach levers: Pro conversion ±5pp; boost attach ±10pp.
- Invoice average: test $800–$2,000 bands.
- Royalty rate: 8–12% scenarios for operator agreements.
- Processing share: 2.5–3.5% sensitivity; note pass-through vs margin.

### Key Ratios to Track

- ARPA (contractors): (Platform fee share from their jobs + Pro + boosts attributable) / contractor.
- ARPU (users overall): Gross revenue / total users.
- LTV:CAC placeholder: maintain >3:1 target; update CAC per GTM phase.
- Gross margin: (Revenue – royalties – processing pass-through – infra) / Revenue; target improvement via infra efficiency and boost/Pro mix.

---

## Cost & Margin Model (Phase-Based)

### Baseline Costs (Year 1 references)

- Infra (Year 1): ~$84k/yr (from scaling docs) covering CDN, app servers, DB/cache, storage, monitoring.
- Support/Success: seed team handling <5k users/mo; variable with DAU.
- R&D: core product/AI/infra team; expect heavier ratio early.
- GTM: marketing, referral incentives; ramp with volume milestones.
- Contingency: 10–15% buffer on infra/ops for spikes and experiments.

### Phase Budgets (Guidance, non-binding)

- Foundation (0–5k users): $1–2k/mo infra; tiny team; focus on speed-to-market.
- Growth (5k–25k): $2–5k/mo infra; add GTM spend; start observability stack maturity.
- Scale (25k–100k): $5–10k/mo infra; add SRE; begin auto-scaling and Redis; QA automation.
- Optimize (100k–300k): $7–15k/mo infra; multi-AZ, blue/green; DR drills; security audits.
- National (300k–1M users): $15–40k/mo infra; multi-region; dedicated data/ML; cost optimization program.
- Global (1M–5M+ users): $40–120k/mo infra depending on regions, media volumes, and latency targets.

### Margin Drivers

- Positive: Boost uptake, Pro conversion, invoice volume growth, infra efficiency (caching, CDN, reserved capacity), automation reducing support costs.
- Negative: Royalty drag (10% of platform fees), payment processing pass-through, high media storage/egress, GTM spend, premium support staffing.

---

## Scaling Roadmap (Architecture & Capacity)

### Capacity Targets by Phase (daily unless noted)

- Year 1: 1k jobs, 5k bids, 10k messages, 3k photos/day, 2k weekly videos, 15k peak concurrent.
- Year 5: 5k jobs, 25k bids, 50k messages, 15k photos/day, 10k weekly videos, 60k peak concurrent.
- Year 10: 25k jobs, 125k bids, 250k messages, 75k photos/day, 50k weekly videos, 250k peak concurrent.
- Year 20: 75k jobs, 375k bids, 750k messages, 225k photos/day, 150k weekly videos, 800k peak concurrent.
- Year 30: 150k jobs, 750k bids, 1.5M messages, 450k photos/day, 300k weekly videos, 1.6M peak concurrent.
- Year 50: 300k jobs, 1.5M bids, 3M messages, 900k photos/day, 600k weekly videos, 3M+ peak concurrent.

### Architecture Evolution (high-level)

- Phase 1: Static front-end + Spark KV, local assets; single-region.
- Phase 2: CDN + edge caching; Redis for hot paths; object storage (S3/R2) for media; basic PostgreSQL for analytics.
- Phase 3: Auto-scaling app tier; blue/green; queues for media/AI jobs; observability stack (metrics, tracing, logs).
- Phase 4: Multi-AZ then multi-region; read replicas; regional media buckets; async pipelines for AI/vision; feature flags.
- Phase 5: Global traffic steering; data sharding by region; dedicated BI/warehouse; advanced cost controls; DR across continents.

### SLO/SLI Targets (examples)

- Page load: <1s P95 early; maintain <1.5s at scale.
- API latency: <100ms P50 / <500ms P95.
- Availability: 99.9% → 99.95% as multi-region matures.
- Error rate: <1%; track by service.
- Media upload: photos <3s, video chunked with resumable uploads.

---

## Org & Operations (Phase Hiring & Processes)

### Team Shape by Phase (indicative)

- Foundation (0–5k users): 4–6 eng (full-stack/infra), 1 PM, 1 design, fractional marketing, shared support.
- Growth (5k–25k): +2–3 eng, +1 QA, +1–2 support, dedicated marketing lead, part-time data.
- Scale (25k–100k): +SRE, +Data/Analytics, +Security, +GTM (demand gen), +CS manager.
- Optimize (100k–300k): Regional leads (ops), +Support pods, +Product line PMs, +Infra/Platform eng.
- National/Global: Multiple squads per domain (jobs, bids, payments, AI, growth), 24/7 on-call rotations, compliance/privacy counsel.

### Core Processes

- Incident response: severity matrix, paging, RCA within 48h; track MTTR/MTBF.
- Release management: CI/CD with canaries and feature flags; error budgets tied to release throttles.
- QA: automated regression + performance baselines per release; chaos drills semi-annual.
- Compliance/security: access reviews, secrets management, pen tests; data residency checks when global.
- Support/Success: tiered SLAs; playbooks for refunds/disputes; operator escalations.

---

## Risk & Mitigation

- Technical: Scaling data stores, media costs, AI latency; mitigations—caching, sharding, cost guardrails, async pipelines, circuit breakers.
- Financial: Revenue concentration, attach-rate underperformance; mitigations—diversify SKUs, adjust pricing/discounts, strengthen boosts/Pro value.
- Regulatory: Data privacy, payments, communications; mitigations—PII minimization, vendor DPAs, PCI scope isolation, opt-in messaging compliance.
- Vendor: LLM/API outages, payment provider issues; mitigations—fallback models (Claude/GPT), multi-processor strategy, graceful degradation.
- GTM: Slower acquisition, churn; mitigations—referral loops, retention programs, segmented pricing, NPS tracking.

---

## AI & Automation Strategy

- Model mix: Smart Claude Tiering (Haiku for simple, Sonnet for complex/multi-trade); consider GPT/other LLMs as backups for availability/price.
- Budget envelopes: Maintain $120/mo safety buffer for demo; production budgets scale with revenue (set % of GMV or fixed per-job cap).
- Prompt governance: Standard vs detailed prompts; testing harness to measure quality and cost per job type.
- Automation roadmap: Expand AutomationRunner for media pipelines, proactive QA alerts, and operator insights; add human-in-the-loop for edge cases.
- Upgrade cadence: Quarterly review of model pricing/quality; A/B new models; rotate keys and audit usage.

---

## Update Playbook (How to Keep This Current)

- Refresh pricing knobs and attach rates; rerun revenue tables (pessimistic/base/aggressive).
- Recompute LOC snapshot and date-stamp when codebase shifts materially.
- Update capacity targets and infra phases after major releases or new regions.
- Revisit org staffing and process maturity every phase change or +50% DAU step.
- Re-run risk assessment quarterly; verify vendor fallback readiness.
- Log changes at top with date/owner; link any new supporting docs.

---

## Appendices

- Parameters glossary: pricing, attach rates, volume assumptions, invoice averages, royalties, processing %, SLO targets.
- Formula references: revenue = (jobs × platform fee) + (Pro subs × price) + (jobs × boost attach × boost price) + (GMV × processing share); royalties = platform fees × royalty %.
- Source links: `docs/SCALING_300K_USERS.md`, `docs/IMPLEMENTATION_300K_USERS.md`, `README.md`, `docs/COMPLETE_FEATURES.md`, `docs/COMPLETE_SOFTWARE_STRUCTURE.md`.
