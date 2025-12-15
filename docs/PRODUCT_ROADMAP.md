# FairTradeWorker
## Complete Product Roadmap & Feature Specification
### Bootstrap Launch: January 1, 2026

---

## Current Phase Update (Hosted-First AI + Revenue CTAs Live)
- Hosted-first AI stack implemented: routing/classification, embeddings + RAG, enhanced Claude scoping, CRM intelligence, smart follow-ups, contractor matching (see `docs/AI_CONFIG.md`).
- Revenue CTAs live (config-driven): affiliate materials/tools, insurance/financing links, donations, premium lead upsell, API/tools directory. Flags and fallbacks prevent hard dependency on keys/links.

## Next Steps (Near-Term)
- Partner integrations: insurance/financing providers; finalize affiliate partners and API/white-label pricing.
- Resilience: feature flags, rate limits/budget guardrails, Claude fallback to open source, observability hooks.
- Legal/Compliance: affiliate disclosures, AI disclaimers, ToS/contractor agreements, operator royalty terms.
- Optional self-host path: swap hosted inference/vector endpoints with local (Ollama + Chroma/Milvus) via config.

## Part 1: AI Receptionist (Flagship Pro Feature)

**TL;DR VERDICT: YES, DO IT — IT'S A PRO MONETIZATION NUCLEAR WEAPON**

Price at $50/month total Pro tier (or $39 base + $11 add-on). Makes Pro feel like an "unfair advantage" package. Most contractors spend $200-500/month on answering services or miss calls entirely.

### Core Value Proposition

When someone calls the contractor's business number:
- AI answers 24/7 with natural voice ("Hi, this is the assistant for Joe's Roofing…")
- Listens, transcribes (Whisper), understands intent (GPT)
- Routes intelligently (emergency → call contractor immediately; quote → create private job)
- Auto-creates a private job in contractor's FTW dashboard (bypasses marketplace — 100% theirs)
- Texts the caller with unique link → onboards homeowner directly to platform

**Result:** Contractor never misses a lead, keeps job private, gets it funneled straight into FTW's CRM/tools.

### Bootstrap Implementation (Zero Extra Backend Cost)

| Component | Details |
|-----------|---------|
| Twilio | ~$1/number + pennies per min/SMS for phone forwarding/voice |
| OpenAI | Whisper for transcription + GPT-4o for routing — reuse lib/ai.ts |
| Webhooks | Vercel functions → process call → create private job in CRM |
| Cost per user | ~$3-5/month → charge $50 → INSANE MARGIN |

### MVP Flow

1. Greeting + record message
2. Transcribe → GPT extracts details → auto-private job + SMS link
3. Fallback voicemail if AI confidence low

### Risks & Mitigations

- **Accuracy:** Beta with first 10-20 Pro users, iterate prompts fast
- **Setup friction:** One-click guide to forward number to Twilio
- **Legal:** Add "call may be recorded" + TOS opt-in

### Top 5 Priority Enhancements (Build Order)

#### 1. Full CRM Auto-Population & Private Job Creation
**Priority:** HIGHEST — Build First  
**Effort:** 2-3 days (reuse CRMKanban.tsx + hooks/useLocalKV.ts)  
**Why #1:** Core "20x" multiplier. Every call = rich, actionable lead with zero manual work. Highest pro conversion driver.

**Implementation:** GPT extracts structured data (name, phone, address, issue, urgency) → auto-create CRM card + private job → attach transcript + audio → text caller unique onboarding link.

#### 2. Context-Aware Conversations with Contractor History
**Effort:** 2 days  
**Impact:** "Welcome back, Mrs. Johnson — is this about the kitchen remodel?" → massive trust + virality

**Implementation:** Pull recent jobs from CRM before GPT response. System prompt includes contractor name + recent jobs summary. Match caller phone to existing records.

#### 3. Calendar Sync & Auto-Scheduling
**Effort:** 3 days (build on existing availability calendar)  
**Impact:** Turns inquiries into booked appointments while caller is on the line. Alone justifies $50/month.

**Implementation:** AI checks calendar slots real-time → offers times → books on confirmation → adds to calendar + sends confirmation text with FTW job link.

#### 4. Proactive Upsell & Quote Estimation During Call
**Effort:** 2 days  
**Impact:** Increases average job value 20-50%, creates instant draft invoices.

**Implementation:** GPT prompt includes upsells. Pull from materials price DB + scoping logic → instant ballpark → auto-create draft invoice → text link includes "Secure with deposit?"

#### 5. Multi-Channel Expansion (SMS/Chat Fallback + Website Widget)
**Effort:** 3-4 days  
**Impact:** Captures 2-3x more leads. Makes AI omnipresent.

**Implementation:** Twilio SMS webhook → same GPT processing. Simple embed script for contractor portfolio sites → funnels to FTW.

### Recommended Build Timeline

| Week | Deliverables |
|------|-------------|
| Week 1 | #1 (CRM auto-population) + basic call handling — get end-to-end working |
| Week 2 | #2 (context) + #4 (upsell/quote) — create the "holy shit" moment |
| Week 3 | #3 (scheduling) + #5 (SMS/widget) — polish and launch beta |

---

## Part 2: Flagship Pro Features ($50/month)

Five additional flagship features that make Pro feel like a full virtual office.

### 1. AI Bid Optimizer & Auto-Bid Engine
**Value:** Upload past job data → AI analyzes win/loss patterns → suggests optimal prices + auto-places bids. "What-if" simulations included.

**Why 20x:** Stops over/under-bidding (biggest profit killer). Saves hours researching. Increases win rate 30-50%. Auto-bid runs 24/7.

**Effort:** 7-10 days  
**Implementation:** Reuse lib/ai.ts + materials JSON. Pro dashboard for CSV upload. GPT prompt analyzes 50 past jobs. Auto-bid rules with background worker. Glassmorphism "Bid Simulator" card with probability graph.

### 2. AI Follow-Up Automator & Sequence Builder
**Value:** Drag-and-drop sequence builder (SMS/email/in-app) → AI personalizes from transcripts → auto-sends on triggers.

**Why 20x:** Turns "forgotten leads" into wins (most contractors lose 70% here). Personalizes at scale. Frees 10-20 hours/week.

**Effort:** 6-8 days  
**Implementation:** New SequenceBuilder.tsx (shadcn/ui drag-drop). Twilio + SendGrid. Triggers from CRM state changes. Analytics card shows recovered revenue.

### 3. AI Expense & Profit Tracker with Tax Optimizer
**Value:** Snap receipt photos → AI categorizes → real-time P&L per job → quarterly tax estimates + deduction suggestions.

**Why 20x:** Most contractors guess profits. This shows exact margins live. Catches missed deductions (saves thousands).

**Effort:** 5-7 days  
**Implementation:** Image upload + GPT-4 Vision for receipt parsing. LocalKV for expenses tied to jobs. Glass card showing monthly profit + projected tax.

### 4. AI Change Order & Upsell Generator
**Value:** Mid-job discovery? Snap photo → AI scopes extra work → generates change order PDF → homeowner approves digitally.

**Why 20x:** Captures 20-40% more revenue per job from extras. Eliminates disputes with signed approvals. Instant quotes.

**Effort:** 4-6 days  
**Implementation:** Reuse PhotoScoper.tsx + Vision. ChangeOrderBuilder.tsx auto-fills from photo. Digital signature via canvas. Auto-updates invoice.

### 5. AI Crew Dispatcher & Subcontractor Manager
**Value:** AI assigns jobs to subs by skills/availability/location → SMS schedules → tracks progress with photo check-ins.

**Why 20x:** Scales operations without chaos. Reduces no-shows. Real-time oversight = higher quality.

**Effort:** 8-10 days  
**Implementation:** Extend CRM with crew members (skills, calendar, GPS opt-in). GPT routing. Twilio SMS dispatch. Photo check-in with AI verification.

---

## Part 3: Free Features (Adoption & Virality Drivers)

20 zero-cost features that make FTW the daily hub contractors can't live without:

1. **Job Alerts & Saved Searches** — Save filters → browser notifications for matches
2. **Contractor Portfolio Builder** — Drag-and-drop before/after photos + testimonials → shareable link
3. **Review & Rating System** — Post-job ratings → display on profiles + sort higher
4. **Dispute Center (Light)** — "Issue?" button → form + in-app chat for mediation
5. **Materials Price Checker** — JSON of avg prices → show during bidding
6. **Job Drafts for Homeowners** — Save incomplete postings → resume later
7. **Bulk Actions on Job Lists** — Select multiple → mark viewed/saved
8. **Keyboard Shortcuts Dashboard** — Power-user navigation (j/k scrolling)
9. **Dark Mode Toggle** — Existing palette + prefers-color-scheme
10. **Homeowner Job History** — Past jobs + re-post similar with one click
11. **Contractor Availability Calendar** — Set "available dates" → auto-filter jobs
12. **Simple Weather Integration** — Free API → show forecast on job cards
13. **Job Comparison Tool** — Side-by-side view of saved jobs
14. **Basic Milestone Templates** — Pre-filled checklists for common jobs
15. **Referral Leaderboard** — Public ranking of top referrers
16. **In-App Messaging (Light)** — Direct chat between homeowner/contractor
17. **Job Bookmark Folders** — Organize saved jobs ("High Priority")
18. **Quick Bid Templates** — Save common bid structures
19. **Homeowner Photo Annotation** — Draw on photos to mark issues
20. **Contractor Bio Builder** — Guided form → rich profile with trades/certs

---

## Part 4: Additional Pro Features ($39/month Tier)

20 more features that create unfair advantages for power users:

1. Lead Import & Auto-Bid — CSV import old leads + auto-follow-ups + rule-based auto-bids
2. Expense Tracker — Log costs per job + monthly P&L reports
3. Quote Template Builder — Drag-and-drop professional PDFs with logo/terms
4. Change Order System — Mid-job extras → digital approval → auto-update invoice
5. Seasonal Demand Forecast — Platform data → "Roofing spikes 35% in March"
6. Custom Branding on Portfolio — Custom domain/CNAME + remove FTW branding
7. Advanced Bid Analytics — Win/loss ratios + response time impact
8. Custom Automation Builder — Drag-and-drop workflows with conditions
9. Territory Heatmaps — Job density by county + competitor estimates
10. Priority Job Alerts — Push notifications + 5-min head start on new jobs
11. Multi-Job Invoicing — Bundle multiple jobs into one invoice
12. Profit Calculator — Real-time margin preview during bidding
13. Custom Fields & Tags — Add unlimited fields to jobs/leads
14. Export Everything — CSV/PDF exports of all data
15. Bid Boost History — Track ROI of past boosts
16. Client Portal Link — Branded link for homeowners to view progress
17. Insurance/Cert Upload Verification — Auto-flag verified contractors in search
18. Pro-Only Filters — "Only show jobs from repeat homeowners"
19. Dedicated Pro Support Chat — In-app priority messaging

---

## Part 5: Bonus Delight Features (Ship in Days)

Quick wins that add polish and personality:

- Animated Onboarding Tour — Framer Motion guided walkthrough
- Daily Job Digest Email — Simple template with new matches
- "Win Streak" Badge — Track consecutive wins → display on profile
- Random Grok Wisdom Quotes — On loading screens (xAI flavor)
- Job Share Buttons — One-click share to Facebook groups

---

## Part 6: Launch Strategy

### January 1 Announcement

🚀 **PRO EXCLUSIVE: AI RECEPTIONIST**  
Never miss a call again.  
Turns inbound leads into private FTW jobs automatically.

### Expected Impact

- 2-3x Pro conversion rate — contractors dream of this exact tool
- Insane margins — $3-5 cost per user, charge $50
- Viral word-of-mouth — contractors will spread this in Facebook groups

### What's Next

Ready to spec code for any of these features. Recommended order:

1. AI Receptionist core (CRM auto-population)
2. Bid Optimizer (pure ROI, pairs with receptionist)
3. Follow-Up Automator (recovers lost leads)
4. Expense Tracker (daily use = stickiness)
5. Change Order Generator (captures extra revenue)

---

## Technical Implementation Details

### 1. AI Receptionist System

**Architecture Overview:**
- Call Flow: Inbound → Twilio → Vercel webhook → Whisper transcribe → GPT-4o intent → CRM write → SMS response
- Latency Target: <3s first response, <8s full processing
- Fallback: Voicemail after 2 failed intent matches or caller opt-out
- Storage: useLocalKV: calls/{contractorId}/{callId} + jobs/{contractorId}/{jobId}
- Cost Model: Twilio: $0.0085/min + $0.0075/SMS | OpenAI: ~$0.02/call avg

**Webhook Endpoint:** `POST /api/receptionist/inbound`

**GPT Extraction Schema:**
```typescript
{
  callerName: string | null,
  callerPhone: string, // E.164 format
  issueType: 'repair' | 'install' | 'inspect' | 'emergency' | 'quote' | 'other',
  urgency: 'low' | 'medium' | 'high' | 'emergency',
  propertyAddress: string | null,
  description: string, // max 500 chars
  estimatedScope: string | null,
  confidence: float 0-1 // below 0.6 triggers voicemail fallback
}
```

### 2. Storage Architecture

**Primary:** localStorage via useLocalKV hook — JSON stringified  
**Namespaces:** users/, jobs/, bids/, messages/, expenses/, sequences/, calls/  
**Limits:** 5MB per origin — split large data across keys  
**Sync:** Future: optional cloud sync via Supabase/Firebase

### 3. API Routes (Vercel)

- `/api/receptionist/*` — Twilio webhooks for voice/SMS
- `/api/ai/scope` — GPT-4 Vision for photo scoping
- `/api/ai/extract` — GPT-4o for data extraction
- `/api/ai/chat` — Conversational AI for receptionist
- `/api/export/*` — PDF/CSV generation endpoints

### 4. Third-Party Services

- **Twilio:** Voice, SMS, phone numbers — ~$1/number/month + usage
- **OpenAI:** GPT-4o, GPT-4 Vision, Whisper — ~$0.01-0.03/request
- **SendGrid:** Email delivery — free tier 100/day
- **Vercel:** Hosting, serverless functions — free tier sufficient
- **Mapbox:** Maps for territory heatmaps — free tier 50k loads/month

---

**End of Roadmap**
