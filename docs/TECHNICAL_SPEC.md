# FairTradeWorker
## Technical Specification & Implementation Guide
### Deep-Dive Edition • December 2025

---

## 1. AI Receptionist System

### 1.1 Architecture Overview

**Call Flow:**
```
Inbound → Twilio → Vercel webhook → Whisper transcribe → GPT-4o intent → CRM write → SMS response
```

**Latency Target:** <3s first response, <8s full processing  
**Fallback:** Voicemail after 2 failed intent matches or caller opt-out  
**Storage:** useLocalKV: calls/{contractorId}/{callId} + jobs/{contractorId}/{jobId}  
**Cost Model:** Twilio: $0.0085/min + $0.0075/SMS | OpenAI: ~$0.02/call avg

### Webhook Endpoint

**POST /api/receptionist/inbound**

**Input:**
```json
{
  "From": "+1234567890",
  "To": "+1987654321",
  "CallSid": "CA...",
  "RecordingUrl": "https://...",
  "TranscriptionText": "..."
}
```

**Process:**
1. Match To → contractorId
2. Whisper if no transcription
3. GPT extract
4. Create job
5. SMS caller

**Output:**
```json
{
  "success": true,
  "jobId": "job-123",
  "smsStatus": "sent"
}
```

**Error States:**
- CONTRACTOR_NOT_FOUND
- TRANSCRIPTION_FAILED
- LOW_CONFIDENCE
- RATE_LIMITED

### GPT Extraction Schema

```typescript
interface CallExtraction {
  callerName: string | null; // extracted or 'Unknown Caller'
  callerPhone: string; // From number, E.164 format
  issueType: 'repair' | 'install' | 'inspect' | 'emergency' | 'quote' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  propertyAddress: string | null; // if mentioned
  description: string; // full issue summary, max 500 chars
  estimatedScope: string | null; // AI guess: 'small repair' / 'major project'
  confidence: number; // 0-1, below 0.6 triggers voicemail fallback
}
```

### 1.2 Enhancement: CRM Auto-Population

**Component:** `components/contractor/ReceptionistCRM.tsx`  
**Hook:** `useReceptionistJobs(contractorId)` — subscribes to new inbound jobs

**Auto-Fields:**
- name, phone, address, issue, urgency, transcript, audioUrl, createdAt

**CRM Card:** Glassmorphism card with expandable transcript, play audio button, one-click call back  
**Private Job:** Bypasses marketplace — contractor.privateJobs[] array, not global jobs[]

### 1.3 Enhancement: Context-Aware Conversations

**Lookup:** On call start: query CRM for callerPhone match in last 90 days  
**System Prompt:** "You are assistant for {contractorName}. Caller history: {recentJobs.map(j => j.summary).join('; ')}"  
**Personalization:** "Welcome back! Is this about the {lastJob.type} from {lastJob.date}?"  
**New vs Return:** Flag: isReturningCustomer → different greeting path  
**Upsell Trigger:** If lastJob.completed && daysSince > 30: "Ready for that follow-up inspection?"

### 1.4 Enhancement: Calendar Sync

**Data Source:** contractor.availability[] — array of { date, slots: [{ start, end, booked }] }  
**Real-Time Check:** GPT function call: checkAvailability(contractorId, preferredDate)  
**Booking Flow:** AI offers 2-3 slots → caller confirms → slot.booked = true → confirmation SMS  
**Conflict Guard:** Optimistic lock: re-check slot before confirm, retry if taken  
**Calendar Sync:** Optional: Google Calendar webhook via OAuth (Pro+ feature)

### 1.5 Enhancement: Live Upsell & Quoting

**Price DB:** data/materials.json — { category, item, avgPrice, laborMultiplier }  
**Quote Logic:** GPT prompt includes: "If issue matches {category}, estimate: base + (labor * hours)"  
**Upsell Rules:** config/upsells.json — { trigger: 'faucet', suggest: 'full plumbing inspection', discount: 15 }  
**Draft Invoice:** Auto-create invoice draft with line items, text link: "Secure with 20% deposit?"  
**Conversion Track:** Analytics: quotesSent, depositsCollected, conversionRate

### 1.6 Enhancement: Multi-Channel (SMS/Widget)

**SMS Inbound:** POST /api/receptionist/sms — same GPT pipeline, text-only  
**Missed Call:** If call unanswered after 4 rings → auto-SMS: "Couldn't reach you. Text your issue?"  
**Web Widget:** components/widget/ReceptionistWidget.tsx — embeddable <script> for contractor sites  
**Widget Flow:** Chat bubble → voice record or text → POST to same API → response in widget  
**Install:** Contractor copies: `<script src="ftw.io/widget/{contractorId}.js"></script>`

---

## 2. Flagship Pro Features

### 2.1 AI Bid Optimizer

**Component:** `components/contractor/BidOptimizer.tsx`  
**Data Input:** CSV upload or auto-pull from contractor.completedJobs[]  
**Training Set:** Min 20 jobs for reliable predictions, 50+ optimal  
**Features:** jobType, zipCode, scope, bidAmount, won (boolean), competitorCount, responseTime  
**Model:** GPT-4o with structured output: { recommendedBid, winProbability, marginEstimate }  
**Simulator UI:** Slider for bid amount → real-time probability curve (Chart.js)

**Auto-Bid Rules Schema:**
```typescript
interface AutoBidRule {
  name: string; // "Kitchen jobs under $10k in Dallas"
  filters: {
    jobType: string[];
    maxBudget: number;
    zipCodes: string[];
  };
  bidStrategy: 'matchAvg' | 'undercut5pct' | 'fixedMargin' | 'custom';
  maxBidsPerDay: number; // prevent runaway spending
  requireApproval: boolean; // true = queue for review, false = auto-submit
}
```

### 2.2 Follow-Up Automator

**Component:** `components/contractor/SequenceBuilder.tsx`  
**UI:** Drag-drop nodes: Trigger → Delay → Message → Condition → Branch  
**Triggers:** newLead, bidSubmitted, bidLost, jobCompleted, noResponseDays(n), customEvent  
**Channels:** sms (Twilio), email (SendGrid), inApp (push notification)  
**Personalization:** {{firstName}}, {{jobType}}, {{lastInteraction}}, {{customField}}  
**GPT Rewrite:** "Rewrite this template using transcript: {transcript}" → warm, personal message

**Sequence Storage:**
- sequences/{id}: { name, trigger, steps: [{ type, delay, channel, template, conditions }] }
- sequenceRuns/{id}: { sequenceId, leadId, currentStep, status, history: [{ step, sentAt, response }] }
- Analytics: { sent, opened, replied, converted, revenue } per sequence

### 2.3 Expense & Profit Tracker

**Component:** `components/contractor/ExpenseTracker.tsx`  
**Receipt Scan:** Camera/upload → GPT-4 Vision: { vendor, amount, date, category, taxDeductible }  
**Categories:** materials, labor, fuel, tools, insurance, permits, marketing, other  
**Job Link:** expenses/{id}.jobId — tie expense to specific job for per-job P&L  
**Dashboard:** Glass card: Revenue | Expenses | Profit | Margin % | Projected Tax  
**Tax Hints:** GPT prompt: "Based on IRS 2025 rules, flag deductions: {expense list}"

**P&L Calculation:**
- Revenue: sum(completedJobs.finalAmount)
- COGS: sum(expenses.where(category in ['materials', 'labor']))
- Gross Profit: Revenue - COGS
- Operating: sum(expenses.where(category in ['fuel', 'tools', 'marketing']))
- Net Profit: Gross - Operating
- Tax Estimate: Net * estimatedTaxRate (default 25%, adjustable)

### 2.4 Change Order Generator

**Component:** `components/contractor/ChangeOrderBuilder.tsx`  
**Input:** Photo of discovery + voice note or text description  
**AI Scope:** GPT-4 Vision: { issue, recommendedFix, estimatedMaterials, estimatedLabor }  
**PDF Output:** jsPDF template: logo, job ref, original scope, change details, new total, signature block  
**Digital Sign:** Canvas signature capture → base64 embed → timestamp + IP log  
**Integration:** On approval: update job.totalAmount, add to invoice, notify homeowner

**Change Order Schema:**
```typescript
interface ChangeOrder {
  id: string;
  jobId: string;
  description: string;
  photoUrl: string;
  originalAmount: number;
  changeAmount: number;
  newTotal: number;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';
  signature: {
    dataUrl: string;
    signedAt: string;
    signerIp: string;
    signerName: string;
  };
  audit: Array<{ action: string; timestamp: string; actor: string }>;
}
```

### 2.5 Crew Dispatcher

**Component:** `components/contractor/CrewDispatcher.tsx`  
**Crew Schema:** crew/{id}: { name, phone, skills: [], availability: [], location: { lat, lng }, rating }  
**Assignment AI:** GPT: "Assign {job} to best crew member: {crewList}. Consider: skills, distance, workload."  
**Dispatch:** Twilio SMS: "Job #{id} at {address}, {time}. Reply CONFIRM or DECLINE."  
**Check-In:** Crew uploads photo on arrival/completion → GPT verifies: "Is this {expectedWork}?"  
**Tracking:** Optional: browser geolocation on crew app → show on contractor map

**Dispatch Flow:**
1. Job Created → Trigger: new job or manual dispatch
2. AI Recommends → Top 3 crew ranked by fit score
3. Contractor Confirms → Or override with manual pick
4. SMS Sent → Crew has 30min to CONFIRM
5. No Response → Auto-escalate to next crew
6. Confirmed → Add to crew calendar, notify homeowner

---

## 3. Free Features (Detailed Specs)

### 3.1 Job Alerts & Saved Searches
**Component:** `components/contractor/SavedSearches.tsx`  
**Storage:** savedSearches/{id}: { name, filters: { zipCodes, jobTypes, budgetRange, keywords } }  
**Notifications:** Browser Push API + in-app badge counter  
**Matching:** On new job: run against all saved searches, batch notify  
**Digest Option:** Daily email at 7am with all matches (vs real-time)

### 3.2 Contractor Portfolio Builder
**Component:** `components/contractor/PortfolioBuilder.tsx`  
**Sections:** Hero image, bio, services list, before/after gallery, testimonials, contact CTA  
**Gallery:** Drag-drop reorder, auto-compress images (sharp.js), lazy load  
**Public URL:** ftw.io/pro/{username} — shareable, SEO-indexed  
**Analytics:** views, clicks, contactRequests per portfolio

### 3.3 Review & Rating System
**Schema:** reviews/{id}: { jobId, rating (1-5), text, photos[], response, createdAt }  
**Verification:** Only homeowners with completedJob can review  
**Display:** Star average + count on profile, sort contractors by rating  
**Response:** Contractor can reply once, shown below review  
**Flagging:** Report button → manual review queue

### 3.4 Dispute Center
**Component:** `components/shared/DisputeCenter.tsx`  
**Trigger:** "Issue?" button on active/completed jobs  
**Form:** issueType (quality, payment, communication, other), description, evidence upload  
**Chat:** In-app thread between homeowner + contractor  
**Escalation:** After 48h unresolved → flag for FTW mediation (future feature)  
**Resolution:** Mark resolved, optional public note

### 3.5 Materials Price Checker
**Data:** data/materials.json — 500+ items with regional price ranges  
**UI:** Search/filter → show low/avg/high price, last updated  
**Integration:** Show inline during bid creation: "Typical cost: $X-$Y"  
**Updates:** Monthly manual refresh from Home Depot/Lowe's public pricing  
**Pro Upgrade:** Live API pricing + historical trends

---

## 4. Technical Infrastructure

### 4.1 Storage Architecture
**Primary:** localStorage via useLocalKV hook — JSON stringified  
**Namespaces:** users/, jobs/, bids/, messages/, expenses/, sequences/, calls/  
**Limits:** 5MB per origin — split large data across keys  
**Sync:** Future: optional cloud sync via Supabase/Firebase

### 4.2 API Routes (Vercel)
- `/api/receptionist/*` — Twilio webhooks for voice/SMS
- `/api/ai/scope` — GPT-4 Vision for photo scoping
- `/api/ai/extract` — GPT-4o for data extraction
- `/api/ai/chat` — Conversational AI for receptionist
- `/api/export/*` — PDF/CSV generation endpoints

### 4.3 Third-Party Services
- **Twilio:** Voice, SMS, phone numbers — ~$1/number/month + usage
- **OpenAI:** GPT-4o, GPT-4 Vision, Whisper — ~$0.01-0.03/request
- **SendGrid:** Email delivery — free tier 100/day
- **Vercel:** Hosting, serverless functions — free tier sufficient
- **Mapbox:** Maps for territory heatmaps — free tier 50k loads/month

### 4.4 Component Library
**Base:** shadcn/ui — Button, Card, Dialog, Input, Select, Table, Tabs  
**Custom:** GlassCard, AnimatedNumber, StatusBadge, PriceSlider  
**Animation:** Framer Motion — page transitions, micro-interactions  
**Charts:** Chart.js or Recharts for analytics

### 4.5 File Structure
```
components/
  contractor/, homeowner/, shared/, widget/
hooks/
  useLocalKV, useAuth, useJobs, useBids, useReceptionist
lib/
  ai.ts, twilio.ts, pdf.ts, utils.ts
data/
  materials.json, milestones.json, upsells.json
api/
  Vercel serverless functions
```

---

## 5. Launch Checklist

### 5.1 Pre-Launch (Dec 15-31)
- [ ] AI Receptionist MVP live with 10 beta contractors
- [ ] Twilio numbers provisioned and tested
- [ ] Stripe/payment integration for Pro subscriptions
- [ ] Legal: TOS, Privacy Policy, call recording consent
- [ ] Landing page with Pro feature showcase

### 5.2 Launch Day (Jan 1)
- [ ] Announce in contractor Facebook groups
- [ ] Email blast to waitlist
- [ ] Product Hunt launch
- [ ] First 50 Pro signups get 30% off first 3 months

### 5.3 Post-Launch (Jan-Feb)
- [ ] Ship Bid Optimizer (Week 2)
- [ ] Ship Follow-Up Automator (Week 4)
- [ ] Ship Expense Tracker (Week 6)
- [ ] Iterate based on user feedback
- [ ] Target: 100 Pro subscribers by Feb 28

---

**End of Specification**
