# SuperREADME — Complete Project Overview

This document is the single, expanded canonical overview for the repository. It consolidates high-level goals, architecture, design systems, deployment instructions, developer workflows, and pointers to topic-specific docs contained in the `docs/` folder.

> 📊 **For detailed codebase statistics and financial projections**, see [`docs/archive/2025-12-consolidation/COMPLETE_SYSTEM_ANALYSIS.md`](docs/archive/2025-12-consolidation/COMPLETE_SYSTEM_ANALYSIS.md)
>
> 📚 **For extensive technical specifications and component details**, see the archived [`SUPERREADME_OLD.md`](docs/archive/2025-12-consolidation/SUPERREADME_OLD.md) (4,861 lines of detailed documentation)

---

## 1 — Project Summary

- **Name:** fairtradeworker-texa (FairTradeWorker)
- **Purpose:** Zero-fee home services marketplace connecting homeowners with contractors
- **Core Principle:** Contractors keep 100% of what they earn. Always.
- **Status:** Production-ready (95% complete)

### Key Features

**For Contractors:**
- Zero marketplace fees
- Free CRM (50 contacts), unlimited with Pro ($59/mo)
- Job bidding and matching
- Invoice and payment management
- Pro tools: instant payouts, analytics, automation

**For Homeowners:**
- Flat $20 platform fee per completed job
- AI-powered job scoping (60 seconds)
- Direct contractor communication
- Transparent bidding process

---

## 2 — High-level Architecture

### Frontend
- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Spark KV (localStorage-based)
- **Entry:** `src/main.tsx` → `src/App.tsx`

### Mobile
- **Platform:** `ios-app/` contains React Native / Expo configuration

### API / Backend
- **Serverless:** `api/` hosts endpoints (Vercel functions)
  - `api/receptionist/inbound.ts` - AI receptionist
  - `api/sms/jobSearch.ts` - SMS integration
  - `api/_spark/[...slug].ts` - Spark framework

### Infrastructure
- **Hosting:** Vercel (see `vercel.json`)
- **Storage:** Supabase (PostgreSQL)
- **Payments:** Stripe Connect
- **AI:** OpenAI (Whisper + GPT-4)
- **Monitoring:** See `infrastructure/` folder

---

## 3 — Key Folders & What to Edit

| Folder | Purpose |
|--------|---------|
| `src/` | Application source (components, hooks, pages, styles) |
| `api/` | Serverless API handlers |
| `ios-app/` | Mobile app code and React Native config |
| `docs/` | **All documentation** - see [`docs/README.md`](docs/README.md) |
| `infrastructure/` | Deployment and monitoring configs |
| `scripts/` | Utility scripts for CI/deploy |
| `public/` | Static assets, service worker, PWA manifest |

---

## 4 — Developer Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/Aphrodine-wq/fairtradeworker-texa.git
cd fairtradeworker-texa

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Common Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Coverage report
npm run lint         # Lint code
```

---

## 5 — Project Structure

```
fairtradeworker-texa/
├── api/                  # Serverless API endpoints
│   ├── receptionist/     # AI receptionist
│   ├── sms/             # SMS integration
│   └── _spark/          # Spark framework
├── docs/                # 📚 All documentation
│   ├── getting-started/ # Project overview
│   ├── product/         # PRD, roadmap, features
│   ├── technical/       # Architecture, performance
│   ├── guides/          # Testing, deployment
│   ├── design/          # Design system, themes
│   ├── business/        # Scaling, revenue
│   ├── features/        # Feature specs
│   └── archive/         # Historical docs
├── infrastructure/      # Docker, monitoring, scaling
├── ios-app/            # React Native mobile app
├── public/             # Static assets, PWA
├── src/                # Application source
│   ├── components/     # 248 React components
│   ├── pages/          # 14 page components
│   ├── lib/            # Utilities and helpers
│   ├── hooks/          # Custom React hooks
│   ├── tests/          # 45+ test files
│   └── styles/         # CSS and theme files
├── README.md           # Main entry point
├── SUPERREADME.md      # This file
├── package.json        # Dependencies
└── vercel.json         # Deployment config
```

---

## 6 — Design System & UX

FairTradeWorker uses a modern shadow-based design system (December 2025):

### Visual Philosophy
- **Depth:** Shadow-based (no borders) - `shadow-lg hover:shadow-xl`
- **Cards:** Rounded corners (`rounded-xl`), elevated appearance
- **Buttons:** 3D effects with layered shadows, hover transforms
- **Colors:** Clean grayscale with accent colors (#00FF00 brand green)
- **Theme:** Pure white/black - zero transparency, no gradients

### Key Components
- **Netflix-style Browse Jobs:** Horizontal scrolling lanes
- **3D Buttons:** Layered shadow system with hover lift
- **CRM Void:** Space-themed CRM interface with orbital navigation
- **Cards:** Borderless with shadow depth

For complete design documentation, see:
- [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md)
- [`docs/design/THEMES.md`](docs/design/THEMES.md)

---

## 7 — Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript 5.7 + Vite 7.2 |
| **Styling** | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| **State** | Spark KV (localStorage) + React Hooks |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Payments** | Stripe Connect |
| **AI** | OpenAI (Whisper + GPT-4 Vision) |
| **Hosting** | Vercel |
| **Testing** | Vitest + React Testing Library |
| **Icons** | Phosphor Icons (1,514 exports) |

### Codebase Metrics
- **Total Lines:** 138,961
- **TypeScript Files:** 394 (100% TypeScript)
- **React Components:** 248
- **Test Files:** 45+
- **Test Coverage:** 85%+

---

## 8 — Revenue Model

| Revenue Stream | Amount | Who Pays |
|----------------|--------|----------|
| **Platform Fee** | $20 flat per completed job | Homeowner |
| **Pro Subscription** | $59/month | Contractor (optional) |
| **Payment Processing** | 2.9% + $0.30 | Contractor (Stripe standard) |
| **Contractor Fees** | **$0** | ✅ Always free |

### Pro Features ($59/mo)
- Unlimited CRM contacts (vs. 50 free)
- Instant payouts (30 min vs. 3 days)
- No-show protection ($50 credit)
- Advanced analytics & reporting
- Automation workflows
- Priority support

For detailed financial projections, see [`docs/business/`](docs/business/)

---

## 9 — Testing Strategy

### Test Coverage
- **15 test files**
- **130+ test cases**
- **85%+ coverage**

### Test Categories
- **Unit tests:** Component logic, utilities, hooks
- **Integration tests:** Feature workflows, API integrations
- **E2E tests:** Complete user journeys

### Key Test Files
- `authentication.test.tsx` - User auth flows
- `contractorWorkflow.test.tsx` - Contractor features
- `homeownerWorkflow.test.tsx` - Homeowner features
- `paymentProcessing.test.tsx` - Payment flows
- `viralFeatures.test.tsx` - Referral systems

For complete testing documentation, see:
- [`docs/guides/TESTING_COMPREHENSIVE_GUIDE.md`](docs/guides/TESTING_COMPREHENSIVE_GUIDE.md)
- [`docs/guides/TESTING_SUMMARY.md`](docs/guides/TESTING_SUMMARY.md)

---

## 10 — Deployment

### Vercel Deployment

**Platform:** Vercel  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Auto-Deploy:** On push to `main` branch

```bash
# Deploy to production
npx vercel --prod

# Preview deployment
npx vercel
```

### Environment Variables

Required for production:
- `VITE_API_URL` - API endpoint
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_TWILIO_ACCOUNT_SID` - Twilio SID
- `VITE_SENDGRID_API_KEY` - SendGrid key

For complete deployment guide, see [`docs/guides/DEPLOYMENT.md`](docs/guides/DEPLOYMENT.md)

---

## 11 — Documentation Index

All documentation lives in the [`docs/`](docs/) folder:

### 🚀 Getting Started
- [Project Overview](docs/getting-started/PROJECT_OVERVIEW.md)

### 📋 Product
- [PRD](docs/product/PRD.md) - Product Requirements
- [Roadmap](docs/product/ROADMAP.md) - Implementation roadmap
- [Features](docs/product/FEATURES.md) - Complete feature list
- [Pricing](docs/product/PRICING.md) - Pricing details

### 🔧 Technical
- [Architecture](docs/technical/ARCHITECTURE.md) - System architecture
- [Performance](docs/technical/PERFORMANCE.md) - Optimization guide
- [Security](docs/technical/SECURITY.md) - Security implementation
- [AI System](docs/technical/AI_SYSTEM.md) - AI configuration

### 📖 Guides
- [Testing Guide](docs/guides/TESTING_COMPREHENSIVE_GUIDE.md)
- [Deployment](docs/guides/DEPLOYMENT.md)
- [Stripe Integration](docs/guides/STRIPE_INTEGRATION.md)
- [Supabase Setup](docs/guides/SUPABASE.md)

### 🎨 Design
- [Design System](docs/design/DESIGN_SYSTEM.md)
- [Themes](docs/design/THEMES.md)
- [Navigation](docs/design/NAVIGATION_CUSTOMIZATION_UPDATE.md)

### 💼 Business
- [Scaling Plan](docs/business/SCALING_PLAN.md) - Path to 300K users
- [Viral Features](docs/business/VIRAL_FEATURES.md) - Growth mechanics

### ✨ Features
- [CRM Void](docs/features/CRM_VOID.md) - Space-themed CRM
- [Invoice System](docs/features/INVOICE_SYSTEM.md)
- [Photo System](docs/features/PHOTO_SYSTEM.md)
- [Certification Wallet](docs/features/CERTIFICATION_WALLET.md)

**📚 Complete documentation index:** [`docs/README.md`](docs/README.md)

---

## 12 — Conventions & Patterns

### TypeScript
- Strict-ish typing
- Explicit return types for public functions
- 100% TypeScript (zero JavaScript)

### Styling
- Tailwind utility classes
- Design tokens in `theme.json` and `tailwind.config.js`
- CSS modules alongside `src/`

### API Handlers
- Keep handlers thin
- Reusable helpers in `lib/`
- Follow existing patterns in `api/`

### State Management
```typescript
// Example: useLocalKV hook
const [jobs, setJobs] = useLocalKV<Job[]>("jobs", [])

// Read
const openJobs = jobs.filter(j => j.status === 'open')

// Write
setJobs([...jobs, newJob])
```

---

## 13 — Roadmap & Priorities

### Implementation Status (95% Complete)

✅ **Completed:**
- Core marketplace (job posting, bidding, browsing)
- AI job scoping (ready for GPT-4 Vision)
- CRM with Kanban board
- Invoice and payment management
- Viral growth features (referrals)
- Territory operator system
- Pro subscription features
- Comprehensive test coverage

⏳ **Needs Production Integration (5%):**
- Stripe payment processing (integration-ready)
- OpenAI GPT-4 Vision + Whisper (integration-ready)
- Twilio SMS service (integration-ready)
- SendGrid email service (integration-ready)

### Short-Term (3-6 months)
- Complete backend integrations
- Mobile app polish
- Advanced analytics
- Review & rating system

### Long-Term (12+ months)
- AI-powered contractor matching
- Expansion to other states
- White-label solution
- B2B marketplace

For complete roadmap, see [`docs/product/ROADMAP.md`](docs/product/ROADMAP.md)

---

## 14 — Troubleshooting & Common Tasks

### Rebuild
```bash
npm run build
# Check build.log on failures
```

### Local API Testing
Use HTTP client against local dev server or run API handlers via Node.

### Common Issues

**Build Errors:**
```bash
# Clear cache
rm -rf node_modules .vite dist
npm install
npm run build
```

**Module Not Found:**
- Check import paths (use `@/` alias)
- Verify file exists
- Check `tsconfig.json` paths

**Performance Issues:**
```bash
# Analyze bundle
npm run build:analyze
```

For complete troubleshooting, see [`docs/VOID/TROUBLESHOOTING.md`](docs/VOID/TROUBLESHOOTING.md)

---

## 15 — Archival Policy

How we manage documentation:

1. **Move outdated docs** to `docs/archive/` or `docs/archive/deprecated/`
2. **Maintain index** in `docs/ARCHIVE_LIST.md` with rationale
3. **Keep pointers** from topic area to archived docs for traceability

Recent archival (December 2025):
- `COLOR_FIX_PROGRESS.md` → Completed task (Dec 2024)
- `IMPLEMENTATION_SUMMARY.md` → Outdated implementation notes
- `COMPLETE_SYSTEM_ANALYSIS.md` → Consolidated into this document

---

## 16 — Contact & Maintainers

- **Website:** [fairtradeworker.com](https://fairtradeworker.com)
- **Repository:** [github.com/Aphrodine-wq/fairtradeworker-texa](https://github.com/Aphrodine-wq/fairtradeworker-texa)
- **Issues & PRs:** Use GitHub for code-level questions

---

## 17 — License

Proprietary - All rights reserved

---

**Last Updated:** December 19, 2025  
**Version:** 2.1.0  
**Status:** Production-Ready (95% Complete)

---

<div align="center">

**Built with ❤️ for contractors who deserve to keep what they earn.**

</div>
