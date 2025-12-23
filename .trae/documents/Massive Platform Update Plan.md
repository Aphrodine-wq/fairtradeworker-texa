# Massive Update: Multi-Page Platform Architecture

This update transforms the single-page MVP into a proper multi-page marketplace platform with dedicated user journeys.

## 1. New Role-Specific Landing Pages
We will create dedicated high-converting landing pages for each user type:
- **`src/pages/ContractorLanding.tsx`**:
  - Focus: "Keep 100% of your earnings."
  - Features: Deep dive into CRM, AI Scoping, and Zero Fees.
  - Social Proof: Contractor-specific testimonials.
- **`src/pages/HomeownerLanding.tsx`**:
  - Focus: "Fair prices, verified pros."
  - Features: "How AI Scoping saves you money," Escrow security.
  - Trust: Verification badges explanation.

## 2. Navigation Overhaul (`Header.tsx`)
We will upgrade the main navigation bar (for guests) to include:
- **For Contractors**: Links to the new contractor landing page.
- **For Homeowners**: Links to the new homeowner landing page.
- **Resources**: Link to the Blog.
- **Find a Pro**: A new link to the public directory (placeholder).

## 3. Public Directory Foundation (`ContractorDirectory.tsx`)
- Create a `ContractorDirectory` page that allows users to "Browse Pros" (even if mock data for now).
- This fulfills the "Public Discovery" requirement from the roadmap.

## 4. Routing & Infrastructure (`App.tsx`)
- Register new routes: `contractor-landing`, `homeowner-landing`, `directory`.
- Ensure smooth transitions between these pages.

## 5. Global Polish
- Update `Footer.tsx` to link to these new internal pages.
- Ensure consistent animations (Framer Motion) across all new pages.
