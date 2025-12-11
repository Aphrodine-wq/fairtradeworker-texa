# 🟢 FairTradeWorker Texas – README (Core-Values Edition)

Zero-fee marketplace for Texas home services.

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
│   │   ├── jobpost/
│   │   │   └── UniversalJobPoster.tsx   <-- the golden page
│   │   ├── marketplace/
│   │   │   ├── Marketplace.tsx
│   │   │   └── JobCard.tsx              <-- Small/Medium/Large badge
│   │   ├── crm/
│   │   │   ├── CRMDashboard.tsx
│   │   │   └── InstantInvite.tsx        <-- email/SMS widget
│   │   ├── jobs/
│   │   │   ├── BrowseJobs.tsx           <-- contractor job browsing
│   │   │   └── JobPoster.tsx
│   │   ├── contractor/
│   │   │   └── ContractorDashboard.tsx
│   │   ├── territory/
│   │   │   └── TerritoryMap.tsx
│   │   └── ui/                          <-- 40+ shadcn components
│   └── lib/
│       ├── ai/
│       │   ├── multimodalScope.ts       <-- video + voice + text + photos + file
│       │   └── learnFromPast.ts         <-- stores embeddings for future scopes
│       └── sorting/
│           └── leadPriority.ts          <-- performance + accuracy + operator
└── public/
    └── racehorse.svg                     <-- orange wrench inside Texas shape, lightning tail
```

---

## 🟩 CORE FEATURES

### 1. Free Job Posting
- No fees, ever
- Button text: "Post Job – $0" (orange, always)
- No Stripe integration in job posting flow

### 2. Free Job Bidding
- Contractors bid without paying a cent
- Bid modal has $0 fee label

### 3. Open Marketplace
- No paywall banners
- All jobs visible to relevant contractors

### 4. Performance = Priority
Bids are sorted by:
```typescript
score = performance_score + bid_accuracy + (is_operator ? 0.2 : 0)
```

### 5. In-Person CRM Sign-Up
- Contractor enters homeowner's email or phone
- Instant invite link sent via email or SMS
- Homeowner joins in 2 clicks

### 6. One-Page Job Post (Racehorse)
- All inputs on single scroll page
- Media recorder with pause/resume
- File drop zone for Excel, PDF, txt
- Parallel uploads with progress bars
- Sub-100ms interactions

### 7. AI Scope (multimodal)
- Video → GPT-4-Vision description
- Audio → Whisper transcript
- Photos → analyzed and stored
- Files → parsed and added to scope
- Learning system improves over time

### 8. Clean, Seamless, Familiar
- Inter font throughout
- 8px spacing grid
- Orange = action, Blue = info, Gray = idle
- iOS-style button feedback (hover:scale-105, active:scale-95)

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
- 254 Texas counties (6 pre-claimed)

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

## 🔧 DEVELOPMENT NOTES

### Data Persistence
All data uses Spark's `useKV` hook:
- User accounts
- Jobs and bids
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

Built with ❤️ for Texas contractors and homeowners.
