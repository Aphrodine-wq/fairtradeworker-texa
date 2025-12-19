# FairTradeWorker - Master Prompt

**Version:** 1.0.0  
**Last Updated:** December 19, 2025  
**Purpose:** Comprehensive system prompt for AI assistants and developers working on FairTradeWorker

---

## 🎯 SYSTEM IDENTITY

You are working with **FairTradeWorker**, a zero-fee home services marketplace platform that connects homeowners with contractors. The core mission is: **"Zero Fees. Zero BS. Zero Middlemen"** - contractors keep 100% of what they earn.

**Key Principle:** Unlike traditional platforms that take 15-30% of contractor earnings, FairTradeWorker charges contractors $0 in fees. Homeowners pay a flat fee to post projects.

---

## 📊 PROJECT OVERVIEW

### Business Model

**Revenue Streams:**
1. **Homeowner Posting Fees:** Tiered platform fee ($15 flat for quick fixes, 3% for standard jobs, 2.5% for major projects)
2. **Pro Subscriptions:** $59/month for contractors (advanced tools and AI features)
3. **Optional Premium Features:** Job boost, featured listings, priority placement

**User Roles:**
- **Contractors:** Browse jobs, submit bids (zero fees), manage CRM, use business tools
- **Homeowners:** Post jobs, receive bids, manage projects, track progress
- **Operators:** Manage territories, view analytics, track metrics

### Codebase Statistics

- **Total TypeScript Files:** 273 files
- **Total Lines of Code:** 45,200+ lines
- **Components:** 150+ React components
- **Pages:** 15 page components
- **Library Modules:** 19 utility modules
- **Custom Hooks:** 6 React hooks
- **Test Files:** 15 test files (460 total tests, 85.7% passing)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend:**
- **React 19** - Latest React version with hooks
- **TypeScript 5.7** - Full type safety, strict mode
- **Vite 7.2** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling with dark mode
- **shadcn/ui v4** - 55+ accessible UI components
- **Phosphor Icons** - 1,514+ icons available

**State Management:**
- **Local Storage** - via `useLocalKV` hook (key-value storage)
- **Spark KV** - GitHub Spark key-value storage
- **Zustand** - Global state (used for VOID OS, currently on back burner)
- **React Hooks** - useState, useEffect, useMemo, useCallback

**UI Libraries:**
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations and transitions
- **React Hook Form** - Form management
- **Zod** - Schema validation

**Testing:**
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation for tests
- **Coverage:** 60% overall, targeting 80%+

**Deployment:**
- **Vercel** - Serverless deployment
- **GitHub** - Version control
- **CI/CD** - Automated deployments

### Project Structure

```
fairtradeworker-texa-main/
├── src/
│   ├── components/          # React components
│   │   ├── contractor/      # Contractor-specific components (95+ files)
│   │   ├── jobs/            # Job-related components
│   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   ├── ui/              # shadcn/ui components
│   │   ├── void/            # VOID OS components (on back burner)
│   │   └── shared/          # Shared components
│   ├── pages/               # Page components (15 files)
│   ├── lib/                 # Library modules (19 files)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── ai/              # AI integration
│   │   ├── void/            # VOID OS library (on back burner)
│   │   └── territory/       # Territory management
│   ├── hooks/               # Custom React hooks (6 hooks)
│   ├── styles/              # CSS files
│   └── tests/               # Test files
│       ├── unit/            # Unit tests
│       ├── integration/     # Integration tests
│       └── e2e/             # End-to-end tests
├── docs/                    # Documentation
│   ├── business/            # Business documentation
│   ├── technical/          # Technical documentation
│   ├── features/           # Feature documentation
│   └── guides/             # User guides
├── api/                     # API routes (Vercel serverless functions)
└── public/                  # Static assets
```

---

## 🎨 DESIGN SYSTEM

### Design Principles

- **Modern & Clean:** Minimal, accessible design with proper hierarchy
- **Dark Mode:** Full dark mode support with system preference detection
- **Responsive:** Mobile-first design, works on all screen sizes
- **Accessible:** WCAG compliant, keyboard navigation, screen reader support
- **Performance:** Optimized for speed, lazy loading, code splitting

### Color System

- **Light Theme:** White backgrounds, black text, subtle borders
- **Dark Theme:** Black backgrounds, white text, high contrast
- **Accent Colors:** Foreground/background system with opacity variants
- **Borders:** `border-black/20` or `border-white/20` for subtlety
- **Shadows:** Soft, smooth shadows with hover effects

### Component Patterns

- **shadcn/ui Components:** Use existing components from `src/components/ui/`
- **Custom Components:** Follow shadcn/ui patterns for consistency
- **Icons:** Use Phosphor Icons (`@phosphor-icons/react`)
- **Animations:** Framer Motion for smooth transitions
- **Forms:** React Hook Form + Zod validation

---

## 🔑 KEY FEATURES & MODULES

### Core Features

**For Contractors:**
1. **Job Browsing & Bidding** - Browse jobs, submit bids (zero fees)
2. **Construction CRM** - Pipeline, documents, financials, collaboration, reporting
3. **Business Tools** - Free CRM, invoicing, expense tracking, tax helper
4. **Pro Features** - Advanced tools with subscription ($59/month)
5. **Enterprise CRM** - AI insights, analytics, integrations, workflows

**For Homeowners:**
1. **Job Posting** - Post jobs with AI-powered scoping
2. **Photo Upload** - Upload project photos
3. **Bid Management** - Receive and compare bids
4. **Project Tracking** - Track projects from start to finish

**For Operators:**
1. **Territory Management** - Claim and manage territories
2. **Analytics** - View platform analytics and metrics
3. **User Management** - Manage contractors and homeowners

### Construction CRM System

**5 Core Components:**
1. **ConstructionPipeline.tsx** - Visual pipeline (Leads → Bidding → Won → Active → Completed)
2. **ConstructionDocuments.tsx** - Document management (contracts, blueprints, invoices, photos)
3. **ConstructionFinancials.tsx** - Job profitability, budget monitoring, payment tracking
4. **ConstructionCollaboration.tsx** - Team communication, task management, messaging
5. **ConstructionReporting.tsx** - Project metrics, profitability analysis, sales forecasting

### Enterprise CRM Features

**9 Advanced Components:**
1. **AIInsightsCRM.tsx** - Predictive lead scoring, recommendations, sentiment analysis
2. **AdvancedAnalyticsCRM.tsx** - Deep reporting, custom dashboards, forecasting
3. **IntegrationHub.tsx** - QuickBooks, Procore, Buildertrend, JobNimbus integrations
4. **EnterpriseSecurity.tsx** - AES-256 encryption, GDPR/CCPA/HIPAA/PCI compliance
5. **TerritoryManager.tsx** - Geographic and product-based territories
6. **AdvancedWorkflows.tsx** - Event triggers, scheduled workflows, approvals
7. **CustomObjectsBuilder.tsx** - Custom object creation, field definition, relationships
8. **DataWarehouse.tsx** - High-volume storage, table management, analytics
9. **MobileCRM.tsx** - Offline access, sync management, mobile features

### Business Tools

**Finance & Accounting:**
- Invoice Manager, Expense Tracking, Tax Helper, Payment Processing
- Multi-Job Invoicing, Profit Calculator

**Sales & Marketing:**
- CRM System, Lead Management, AI Receptionist, Bid Optimizer
- Follow-Up Sequences, Lead Import, Quote Builder, Bid Analytics

**Operations:**
- Document Manager, Scheduling Calendar, Communication Hub
- Notification Center, Change Order Builder, Crew Dispatcher
- Inventory Management, Quality Assurance, Compliance Tracker

**Analytics & Reporting:**
- Reporting Suite, Advanced Analytics, Construction Reporting
- Company Revenue Dashboard, Bid Analytics

---

## 🧠 AI INTEGRATION

### AI Architecture

**Hosted-First Approach:**
- **Primary:** Claude (Haiku/Sonnet) with smart tiering
- **Pre-routing:** Classification and routing before processing
- **RAG Context:** Embeddings + retrieval-augmented generation
- **Open-Source Helpers:** Background/CRM tasks

**AI Features:**
- **AI Receptionist** - Voice call processing, transcription, intent extraction
- **AI Scoping** - Photo-based project scoping and estimation
- **Lead Scoring** - Predictive lead scoring with ML
- **Sentiment Analysis** - Customer sentiment tracking
- **Smart Recommendations** - Next-best-action recommendations

**Configuration:**
- See `docs/AI_CONFIG.md` for AI configuration
- See `docs/technical/AI_SYSTEM.md` for full AI architecture

---

## 🔐 SECURITY & COMPLIANCE

### Data Protection

- **Encryption:** AES-256 for data at rest, TLS 1.3 for data in transit
- **Access Control:** Role-based access control (contractor, homeowner, operator)
- **Audit Logging:** Comprehensive audit trails
- **Secure Storage:** Encrypted local storage, secure API endpoints

### Compliance

- **GDPR:** European data protection compliance
- **CCPA:** California privacy compliance
- **HIPAA:** Healthcare data compliance (if applicable)
- **PCI:** Payment card industry compliance

---

## 📱 MOBILE SUPPORT

### Mobile Features

- **Responsive Design:** Mobile-first, works on all devices
- **Touch-Friendly:** Optimized for touch interactions
- **Offline Mode:** Service worker for offline capabilities
- **Push Notifications:** Ready for implementation

### iOS App

- **Framework:** Expo + React Native
- **Location:** `ios-app/` directory
- **Status:** In development
- **Features:** Full feature parity with web app

---

## 🧪 TESTING STRATEGY

### Test Structure

**Test Categories:**
1. **Unit Tests** - Component and utility function tests
2. **Integration Tests** - API and workflow integration tests
3. **E2E Tests** - End-to-end user workflow tests
4. **Audit Tests** - Route validation and platform audits

**Current Status:**
- **Total Tests:** 460 tests
- **Passing:** 394 tests (85.7%)
- **Failing:** 66 tests (14.3%)
- **Coverage:** 60% overall (target: 80%+)

**Test Framework:**
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation

**Running Tests:**
```bash
npm test              # Run all tests
npm test:ui           # Run with UI
npm test:coverage     # Run with coverage
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

**TypeScript:**
- **Strict Mode:** Enabled
- **Coverage:** 100% TypeScript
- **Type Safety:** Full type checking

**Linting & Formatting:**
- **ESLint:** Configured with React hooks rules
- **Prettier:** Code formatting (if configured)
- **TypeScript ESLint:** Type-aware linting

### Best Practices

**Component Development:**
- Use functional components with hooks
- Implement `React.memo` for expensive components
- Use `useMemo` and `useCallback` for optimization
- Follow shadcn/ui component patterns

**State Management:**
- Use `useLocalKV` for persistent local state
- Use React hooks for component state
- Use Zustand only for global state (VOID OS)

**Performance:**
- Lazy load routes and heavy components
- Code split large bundles
- Optimize images and assets
- Use React.memo for re-render prevention

**Error Handling:**
- Use error boundaries for component errors
- Implement try-catch for async operations
- Provide user-friendly error messages
- Log errors for debugging

---

## 📚 DOCUMENTATION STRUCTURE

### Key Documentation Files

**Getting Started:**
- `docs/getting-started/PROJECT_OVERVIEW.md` - Complete project overview
- `README.md` - Quick start and overview
- `docs/MASTER_PROMPT.md` - This file

**Technical:**
- `docs/technical/ARCHITECTURE.md` - System architecture
- `docs/technical/COMPLETE_SOFTWARE_STRUCTURE.md` - Full codebase structure
- `docs/technical/AI_SYSTEM.md` - AI integration details
- `docs/technical/SECURITY.md` - Security implementation

**Features:**
- `docs/features/CONSTRUCTION_CRM_FEATURES.md` - Construction CRM details
- `docs/features/INVOICE_SYSTEM.md` - Invoice system
- `docs/features/PHOTO_SYSTEM.md` - Photo upload system

**Business:**
- `docs/business/REVENUE_MODEL_PROJECTION.md` - Revenue model
- `docs/business/SCALING_PLAN.md` - Scaling strategy
- `docs/business/VIRAL_FEATURES.md` - Viral growth features

**Guides:**
- `docs/guides/DEPLOYMENT.md` - Deployment guide
- `docs/guides/SUPABASE.md` - Supabase setup
- `docs/guides/STRIPE_INTEGRATION.md` - Payment integration

---

## ⚠️ IMPORTANT NOTES

### VOID OS Status

**VOID OS is currently on the back burner:**
- VOID OS components exist but are not actively developed
- Navigation has been switched from VOID to basic CRM
- VOID-related code is preserved but not in active use
- See `docs/VOID/HARSH_TRUTHS.md` for critical issues

**Current CRM:**
- Basic CRM component (`CRMDashboard`) is now used
- Located in `src/components/contractor/CRMDashboard.tsx`
- Simple customer management interface

### Known Issues

**Test Failures:**
- 66 tests failing (14.3% failure rate)
- Mainly VOID component tests (data structure mismatches)
- See `docs/TESTING_SUMMARY.md` for details

**Technical Debt:**
- Some placeholder components (10 modules)
- Some stubbed functions (8+ functions)
- See `docs/VOID/MISSING_FEATURES.md` for details

---

## 🎯 DEVELOPMENT PRIORITIES

### Current Focus

1. **Core Functionality** - Job posting, bidding, CRM features
2. **Business Tools** - Invoicing, expense tracking, reporting
3. **Mobile Support** - Responsive design, mobile optimization
4. **AI Features** - AI Receptionist, scoping, lead scoring
5. **Testing** - Increase coverage to 80%+, fix failing tests

### Future Roadmap

- Additional integrations (QuickBooks, Procore, etc.)
- Enhanced mobile features
- Advanced AI capabilities
- Additional reporting features
- API documentation
- User guides

---

## 🔧 COMMON TASKS

### Adding a New Feature

1. **Create Component:**
   - Add component in appropriate directory (`components/contractor/`, `components/jobs/`, etc.)
   - Follow existing component patterns
   - Use TypeScript with proper types

2. **Add Route:**
   - Add route in `src/App.tsx`
   - Add navigation item in `src/lib/types/navigation.ts` (if needed)
   - Add breadcrumb in `src/components/layout/Breadcrumb.tsx`

3. **Add Tests:**
   - Create test file in `src/tests/`
   - Write unit tests for component
   - Write integration tests if needed

4. **Update Documentation:**
   - Update relevant docs in `docs/`
   - Add feature description
   - Update changelog if needed

### Modifying Existing Features

1. **Find Component:**
   - Search codebase for component name
   - Check `docs/technical/COMPLETE_SOFTWARE_STRUCTURE.md`
   - Use grep/search tools

2. **Understand Structure:**
   - Read component code
   - Check related components
   - Review documentation

3. **Make Changes:**
   - Follow existing patterns
   - Maintain type safety
   - Update tests if needed

4. **Test Changes:**
   - Run tests: `npm test`
   - Test manually in dev mode
   - Check for regressions

### Debugging

1. **Check Console:**
   - Browser console for errors
   - Network tab for API issues
   - React DevTools for component state

2. **Check Logs:**
   - Vercel logs for serverless functions
   - Local logs for development
   - Error boundaries for component errors

3. **Use Tools:**
   - React DevTools for component inspection
   - TypeScript compiler for type errors
   - ESLint for code issues

---

## 📞 SUPPORT & RESOURCES

### Documentation

- **Main Docs:** `docs/` directory
- **Technical Docs:** `docs/technical/`
- **Feature Docs:** `docs/features/`
- **Guides:** `docs/guides/`

### Code Examples

- **Components:** See `src/components/` for examples
- **Hooks:** See `src/hooks/` for custom hooks
- **Utils:** See `src/lib/utils/` for utility functions

### Getting Help

- **Documentation:** Check relevant docs first
- **Code Search:** Use grep/search to find examples
- **Tests:** Check test files for usage examples

---

## 🎓 KEY CONCEPTS

### Zero-Fee Model

- Contractors pay $0 in fees
- Homeowners pay flat fee to post
- Platform revenue from subscriptions and premium features

### User Roles

- **Contractor:** Can browse jobs, bid, manage CRM, use business tools
- **Homeowner:** Can post jobs, receive bids, manage projects
- **Operator:** Can manage territories, view analytics

### State Management

- **Local State:** React hooks (useState, useEffect)
- **Persistent State:** useLocalKV hook (localStorage)
- **Global State:** Zustand (for VOID OS, currently on back burner)

### Component Patterns

- **Functional Components:** All components are functional
- **Hooks:** Use React hooks for state and effects
- **Composition:** Compose components for reusability
- **Memoization:** Use React.memo, useMemo, useCallback for performance

---

## ✅ CHECKLIST FOR NEW DEVELOPERS

- [ ] Read `README.md` and `docs/getting-started/PROJECT_OVERVIEW.md`
- [ ] Understand the zero-fee business model
- [ ] Review `docs/technical/ARCHITECTURE.md`
- [ ] Explore `src/components/` to understand component structure
- [ ] Review `docs/MASTER_PROMPT.md` (this file) for system overview
- [ ] Set up development environment (`npm install`, `npm run dev`)
- [ ] Run tests (`npm test`) to understand test structure
- [ ] Review existing code patterns before making changes
- [ ] Check documentation before asking questions

---

## 🔄 VERSION INFORMATION

**Current Version:** 1.0.0  
**Last Updated:** December 19, 2025  
**Status:** Production Ready  
**Deployment:** Vercel (Production)  
**Repository:** GitHub (main branch)

---

**This Master Prompt is a living document. Update it as the system evolves.**
