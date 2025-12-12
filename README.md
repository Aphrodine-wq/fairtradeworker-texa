# 🟢 FairTradeWorker – Scale-Faster Edition

Zero-fee marketplace for home services with viral growth mechanics built in.

## 🚀 Scale-Faster Playbook Features

This platform implements 10 growth acceleration strategies:

1. **Post-&-Win Viral Loop** – Every job posted generates a unique $20-off referral code
2. **Contractor Referral Goldmine** – Invite up to 10 tradesmen/month; both earn $50 on first job
3. **Speed-Based Job Visibility** – Small jobs get blinking green "FRESH" badges for 15 minutes
4. **Speed Metrics Dashboard** – Real-time tracking of key velocity metrics with traffic-light indicators
5. **Live Stats Bar** – Homepage displays jobs posted today, avg bid time, and weekly completions
6. **Same-Day Payout Tracking** – Metrics show same-day payout count (target: 100/day)
7. **Performance-First Sorting** – Bids ranked by score: performance + accuracy + operator boost
8. **Contractor Invite System** – 10 SMS invites per month with $50 rewards
9. **In-Person CRM Sign-Up** – Instant email/SMS invites for homeowners (2-click signup)
10. **Territory Speed Metrics** – Operators track job-to-bid time and conversion rates

## Core Values baked into code:

1. **Free Job Posting**
2. **Free Job Bidding**
3. **Open Marketplace**
4. **Performance = Priority**
5. **In-Person CRM Sign-Up** (contractors are marketers)
6. **One-Page Job Post** = Racehorse Fast
7. **AI Scope** that sees video, voice, text, photos, AND uploaded files
8. **Clean, Seamless, Familiar**

---

## 🧒 WHAT THIS APP DOES (explain-like-I'm-5)

- A single web app (React + Tailwind + Spark KV).
- One golden page: "Post Job" – accepts video, mic (with pause/add), text, photos, OR a file (Excel, PDF, txt).
- AI reads everything, stores it, learns for next time.
- Job lands in marketplace split into 3 buckets:
  - **Small (🟢)** – subs + contractors (≤ $300)
  - **Medium (🟡)** – subs + contractors (≤ $1,500)
  - **Large (🔴)** – contractors only (> $1,500)
- Bids are free.
- Leads are sorted by:
  1. Performance score (accepted bids / total bids)
  2. Bid accuracy (AI price vs final price)
  3. Operator status (yes = boost)
- Contractors get a FREE CRM.
- Homeowners do NOT get CRM.
- In-person sign-up: contractor types homeowner's email or phone → instant invite link sent (email or SMS) → homeowner joins in 2 clicks.
- Every click is < 100 ms. Racehorse fast.

---

## 🗂️ PROJECT STRUCTURE

```
fairtradeworker/
├── src/
│   ├── components/
│   │   ├── viral/
│   │   │   ├── ReferralCodeCard.tsx         <-- Post-&-Win referral display
│   │   │   ├── ContractorReferralSystem.tsx <-- Invite tradesmen feature
│   │   │   ├── SpeedMetricsDashboard.tsx    <-- Real-time metrics with lights
│   │   │   └── LiveStatsBar.tsx             <-- Homepage velocity display
│   │   ├── jobs/
│   │   │   ├── JobPoster.tsx                <-- Shows referral code after posting
│   │   │   ├── BrowseJobs.tsx               <-- Fresh job indicators
│   │   │   └── ScopeResults.tsx
│   │   ├── contractor/
│   │   │   ├── ContractorDashboard.tsx      <-- 4 tabs: Jobs, CRM, Referrals, Invoices
│   │   │   ├── CRMDashboard.tsx
│   │   │   ├── InstantInvite.tsx            <-- email/SMS widget
│   │   │   └── ProUpgrade.tsx
│   │   ├── territory/
│   │   │   └── TerritoryMap.tsx             <-- 2 tabs: Territories, Speed Metrics
│   │   └── ui/                              <-- 40+ shadcn components
│   └── lib/
│       ├── viral.ts                          <-- Referral code generation
│       ├── ai.ts                             <-- multimodal AI scope (simulated)
│       ├── sorting/
│       │   └── leadPriority.ts              <-- performance + accuracy + operator
│       └── types.ts                          <-- ReferralCode, ContractorReferral types
└── public/
```

---

## 🟩 CORE FEATURES

### 1. Post-&-Win Viral Loop
- Homeowners receive unique referral code after posting
- Share via SMS or copy/paste
- Neighbor uses code → both get $20
- Track earnings and usage in dashboard

### 2. Contractor Referral Goldmine
- Orange "Invite a Tradesman" button in CRM
- 10 invites per month max
- SMS sent with personal message
- Both earn $50 when buddy completes first job
- Track referral status: sent → signed-up → completed-first-job

### 3. Speed-Based Fresh Jobs
- Small jobs (<$300) show blinking green "FRESH" badge
- Active for first 15 minutes
- Border highlighted in primary color
- Creates urgency for contractors to bid fast

### 4. Speed Metrics Dashboard
- Job-to-First-Bid Time (target: <15 min)
- Invite-to-Signup Conversion (target: >35%)
- Same-Day Payout Count (target: >100/day)
- Traffic light system: Green/Yellow/Red indicators
- Operators track metrics in Territory Map

### 5. Live Stats Bar
- Jobs Posted Today counter
- Average Bid Time display
- Completed This Week tracker
- Displayed prominently on homepage
- Updates in real-time

### 6. Free Job Posting
- No fees, ever
- Button text: "Post Job – $0" (orange, always)
- Referral code appears immediately after posting

### 7. Free Job Bidding
- Contractors bid without paying a cent
- Bid modal has $0 fee label

### 8. Open Marketplace
- No paywall banners
- All jobs visible to relevant contractors

### 9. Performance = Priority
Bids are sorted by:
```typescript
score = performance_score + bid_accuracy + (is_operator ? 0.2 : 0)
```

### 10. In-Person CRM Sign-Up
- Contractor enters homeowner's email or phone
- Instant invite link sent via email or SMS
- Homeowner joins in 2 clicks

### 11. One-Page Job Post (Racehorse)
- All inputs on single scroll page
- Media recorder with pause/resume
- File drop zone for Excel, PDF, txt
- Parallel uploads with progress bars
- Sub-100ms interactions

### 12. AI Scope (multimodal)
- Video → GPT-4-Vision description
- Audio → Whisper transcript
- Photos → analyzed and stored
- Files → parsed and added to scope
- Learning system improves over time

### 13. Clean, Seamless, Familiar
- Inter font throughout
- 8px spacing grid
- Orange = action, Blue = info, Gray = idle
- iOS-style button feedback (hover:scale-105, active:scale-95)

---

## 🎯 GROWTH TARGETS

With Scale-Faster mechanics in place:

- **0 → 1,000 jobs/day** in 120 days
- **Contractor wait-list** in 6 months
- **Operator counties sold out** in 9 months

### Key Metrics to Track:
- Job-to-first-bid time (target: <15 min)
- Referral code usage rate (target: 0.7 new jobs per posted job)
- Contractor invite conversion (target: >35%)
- Same-day payouts (target: >100/day)
- Monthly contractor referral completions (target: 50+ per month)

---

## 🟢 RUN IT

```bash
npm install
npm run dev
```

Open `localhost:5173`:
1. Land on Home
2. Click "Demo as Homeowner" to try posting a job
3. Click "Demo as Contractor" to browse and bid
4. Click "Demo as Operator" to claim territories

---

## 🎨 DESIGN SYSTEM

### Colors
- **Background**: `oklch(0.98 0 0)` – Soft white
- **Primary**: `oklch(0.68 0.19 35)` – Construction orange
- **Secondary**: `oklch(0.45 0.15 255)` – Trust blue
- **Accent**: `oklch(0.75 0.20 85)` – Bright yellow-orange

### Typography
- **Headings**: Space Grotesk (Bold, 700)
- **Body**: Inter (Regular, 400)

### Spacing
- 8px base grid (2, 4, 6, 8, 12, 16, 24, 32, 48, 64)

---

## 📊 JOB SIZE BUCKETS

Jobs are automatically categorized by AI price estimate:

| Size | Max Price | Eligible Bidders | Badge |
|------|-----------|------------------|-------|
| Small | $300 | Subs + Contractors | 🟢 |
| Medium | $1,500 | Subs + Contractors | 🟡 |
| Large | $1,500+ | Contractors only | 🔴 |

---

## 🧪 DEMO MODE

Try all three user types instantly:

- **Demo Homeowner**: Post jobs, review bids, accept work
- **Demo Contractor**: Browse jobs, submit bids, manage invoices
- **Demo Operator**: Claim territories, view analytics

Demo data includes:
- 12 sample jobs across all size categories
- 25+ bids from various contractors
- 8 invoices in different states
- Sample territories available for claiming

---

## 🚀 TECH STACK

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui v4
- **Icons**: Phosphor Icons
- **Storage**: Spark KV (persistent state)
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: Sonner

---

## 📝 LICENSE

MIT – keep core values free forever.

---

## 🧪 TESTING

### End-to-End Test Suite

Comprehensive test coverage for all user types and features:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- **130+ test cases** across 7 test files
- **All 3 user types**: Homeowner, Contractor, Operator
- **All major features**: Jobs, Bids, Payments, Referrals, CRM, Invoicing
- **Integration tests**: Payment processing, milestone management
- **Viral features**: FRESH jobs, Lightning bids, referral system

See `E2E_TESTING_IMPLEMENTATION_COMPLETE.md` for detailed test documentation.

---

## 🔧 DEVELOPMENT NOTES

### Data Persistence
All data uses Spark's `useKV` hook:
- User accounts with referral earnings and invite counts
- Jobs and bids
- Referral codes and contractor referrals
- CRM customers
- Invoices
- Territory claims
- Demo mode state

### AI Scope (Simulated)
Currently uses a 2-second simulation. Future integration will connect to:
- GPT-4 Vision for video/photo analysis
- Whisper for audio transcription
- Document parser for file uploads

### Performance Targets
- Initial page load: < 1s
- Navigation: < 100ms
- AI scope generation: < 60s (when real)
- Photo lightbox: 60fps animations

---

Built with ❤️ for contractors and homeowners everywhere.

**Scale-Faster Playbook Implementation**: This platform includes 10 viral growth mechanics designed to achieve 0→1,000 jobs/day in 120 days through referral loops, contractor invites, speed metrics, and fresh job urgency.
