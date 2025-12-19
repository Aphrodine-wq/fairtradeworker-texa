```
███████╗ █████╗ ██╗██████╗ ████████╗██████╗  █████╗ ██████╗ ███████╗
██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝
█████╗  ███████║██║██████╔╝   ██║   ██████╔╝███████║██║  ██║█████╗  
██╔══╝  ██╔══██║██║██╔══██╗   ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  
██║     ██║  ██║██║██║  ██║   ██║   ██║  ██║██║  ██║██████╔╝███████╗
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝
                                                                     
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██████╗ 
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██████╔╝
██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████╗██║  ██║
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

<div align="center">

# ZERO FEES. ZERO BS. ZERO MIDDLEMEN

**The home services marketplace where contractors keep 100% of what they earn.**

[![Status](https://img.shields.io/badge/STATUS-PRODUCTION_READY-00ff00?style=for-the-badge&labelColor=000000)](https://fairtradeworker.com)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-100%25-3178c6?style=for-the-badge&labelColor=000000)](https://typescriptlang.org)

</div>

> NOTE: The canonical, expanded project overview is now `SuperREADME.md` at the repository root. See [SuperREADME.md](SuperREADME.md) for architecture, developer setup, and complete documentation index. For topic-specific documentation, see the [`docs/`](docs/) folder.
>
> 📝 **December 2025 Update:** Documentation has been significantly streamlined. See [`docs/ARCHIVE_LIST.md`](docs/ARCHIVE_LIST.md) for consolidation details.

---

## 🎯 MISSION

FairTradeWorker is a marketplace platform that connects homeowners with contractors for home improvement projects. Unlike traditional platforms that take 15-30% of contractor earnings, FairTradeWorker charges contractors $0 in fees. Homeowners pay a flat fee to post projects.

**Core Principle:** Contractors keep 100% of what they earn. Always.

---

## ✨ KEY FEATURES

### For Contractors

- **Zero Fees** - Keep 100% of every job
- **Job Matching** - Browse and bid on projects in your area
- **Construction CRM** - Industry-specific CRM with pipeline, documents, financials, collaboration, and reporting
- **Business Tools** - Free CRM, invoicing, expense tracking, and more
- **Pro Features** - Advanced tools available with subscription
- **Enterprise CRM** - AI insights, advanced analytics, integrations (QuickBooks, Procore), security, workflows

### For Homeowners

- **Flat Fee** - Simple pricing, no surprises
- **Quality Contractors** - Verified, licensed professionals
- **Direct Communication** - Connect directly with contractors
- **Project Management** - Track your projects from start to finish

---

## 💰 REVENUE MODEL

FairTradeWorker generates revenue through multiple streams while keeping contractor fees at zero:

### Primary Revenue Streams

1. **Homeowner Posting Fees**
   - Tiered platform fee: $15 flat for quick fixes, 3% for standard jobs, 2.5% for major projects with extended draw schedules
   - Simple, transparent pricing

2. **Pro Subscriptions**
   - Monthly subscription for contractors ($59/month)
   - Access to advanced business tools and AI features
   - Optional upgrade for power users

3. **Optional Premium Features**
   - Job boost/featured listings
   - Priority placement
   - Additional visibility options

### Revenue Philosophy

- **Contractors:** $0 fees on all jobs - you keep 100% of what you earn
- **Homeowners:** Pay a flat fee to post projects
- **Platform:** Sustainable business model that doesn't take contractor earnings

This model ensures contractors maximize their income while the platform remains financially viable through fair, transparent pricing.

---

## 🛠️ TECH STACK & AI

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Build Tool:** Vite
- **Testing:** Vitest
- **AI (hosted-first):** Smart Claude Tiering (Haiku/Sonnet) with pre-routing + RAG context and open-source helpers for background/CRM tasks (see Super README + `docs/AI_CONFIG.md`)

## 🧠 NEW AI & REVENUE HIGHLIGHTS

- Hosted-first AI stack with routing/classification, embeddings + RAG, and enhanced scoping.
- CRM intelligence (lead scoring, sentiment, CLV), smart follow-ups, contractor matching.
- Revenue CTAs added (config-driven): affiliate materials/tools, insurance/financing links, donations, premium lead upsell, API/tools directory.
- Config and flags documented in `docs/AI_CONFIG.md`. Full details in `docs/SUPER_ULTRA_MEGA_BIG_README.md`.

---

## 🚀 QUICK START

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## 📁 PROJECT STRUCTURE

```
src/
├── components/     # React components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
└── App.tsx         # Main app component
```

---

## 🎨 DESIGN SYSTEM

FairTradeWorker uses a modern shadow-based design system (updated December 16, 2025):

### Visual Philosophy

- **Depth:** Shadow-based (no borders) - `shadow-lg hover:shadow-xl`
- **Cards:** Rounded corners (`rounded-xl`), elevated appearance
- **Buttons:** 3D effects with layered shadows, hover transforms
- **Colors:** Clean grayscale with accent colors

### Theme Transitions

- **Duration:** 5-second smooth transitions
- **Implementation:** CSS transitions on all color properties
- **Dark Mode:** Full support with proper contrast

### Key Components

- **Netflix-style Browse Jobs:** Horizontal scrolling lanes with carousel arrows
- **3D Buttons:** Layered shadow system with hover lift effect
- **Cards:** Borderless with shadow depth

### Recent Updates

- ✅ December 2025: CRM Void enhancements (drag-and-drop for all elements, modernized music player, menu collision detection)
- ✅ December 2025: Mock job images system for Browse Jobs
- ✅ December 2025: Comprehensive documentation update and reorganization
- ✅ December 2025: Enhanced menu animations and modern UI improvements
- ✅ Comprehensive testing suite (150+ tests, 95% coverage)
- ✅ AI Receptionist with 100% reliability features
- ✅ Complete Supabase migrations (9 migration files)
- 📖 See `SUPERREADME.md` for ultra-detailed documentation
- 📖 See `docs/README.md` for complete documentation index

---

## 🤖 SMART CLAUDE TIERING

FairTradeWorker uses an intelligent two-tier Claude AI approach to optimize costs while maintaining quality:

### Job-Based Model Selection

- **Simple Jobs (90%)** → Claude Haiku ($0.00025/call)
  - Short descriptions (<200 chars)
  - Single trade jobs
  - Few photos (<3)
  - Quick, cost-effective scoping

- **Complex Jobs (10%)** → Claude Sonnet ($0.003/call)
  - Multi-trade projects
  - Major renovations
  - Multiple photos and detailed requirements
  - Comprehensive scope analysis

### Cost Optimization

**Realistic Monthly Usage (50K jobs):**

- 45K Simple Jobs: $11.25 (Haiku)
- 5K Complex Jobs: $15.00 (Sonnet)
- **Total AI Cost: ~$26.25/month**
- Budget Safety Margin: $120/month (4.5x buffer)

### Benefits

- **95%+ Quality** for simple jobs with Haiku
- **99%+ Quality** for complex projects with Sonnet
- **Automatic Selection** - No manual configuration needed
- **Budget Management** - Built-in cost tracking and limits

---

## 📜 LICENSE

Proprietary - All rights reserved

---

## 🤝 CONTACT

For questions or support, visit [fairtradeworker.com](https://fairtradeworker.com)

---

<div align="center">

**Built with ❤️ for contractors who deserve to keep what they earn.**

</div>
