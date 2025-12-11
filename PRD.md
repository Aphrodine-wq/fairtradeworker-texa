# FairTradeWorker Texas - Product Requirements Document

A zero-fee Texas home repairs marketplace where AI scopes jobs in seconds, homeowners post work effortlessly, and contractors keep 100% of their earnings.

**Experience Qualities**:
1. **Empowering** - Makes posting and bidding on home repair jobs feel effortless and transparent
2. **Trustworthy** - Clear pricing, AI-powered scoping, and fair transactions build confidence
3. **Efficient** - Fast job posting with AI assistance, streamlined contractor workflows, instant territory claiming

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform requires multiple user roles (homeowner, contractor, operator), AI scoping simulation, job management, bidding system, invoice tracking, territory management, and payment flows. The multi-sided marketplace nature with distinct dashboards and workflows qualifies it as a complex application.

## Essential Features

### Demo Mode
- **Functionality**: Instant access to three pre-configured user accounts (homeowner, contractor, operator) with sample data
- **Purpose**: Allow potential users to explore the platform's features without signing up
- **Trigger**: Clicking one of three "Demo as [Role]" buttons on the homepage
- **Progression**: Click demo button → Auto-login as demo user → Show demo mode banner → Navigate to role-appropriate page → Explore pre-populated jobs, bids, invoices, and territories
- **Success criteria**: Users can instantly experience all platform features with realistic data; demo banner clearly indicates demo mode status

### User Authentication & Role Selection
- **Functionality**: Email-based signup/login with role selection (homeowner, contractor, operator)
- **Purpose**: Segregate user experiences and permissions based on their role in the marketplace
- **Trigger**: Landing page CTA buttons or header login link
- **Progression**: Click role button → Enter email/password → Select role dropdown → Auto-create user profile → Redirect to role-specific dashboard
- **Success criteria**: User can sign up, log in, and see content appropriate to their role

### AI Job Scoping (Simulated)
- **Functionality**: Upload video/voice/photos, get AI-generated scope, price range, and materials list
- **Purpose**: Remove friction from job posting and provide instant pricing transparency
- **Trigger**: Homeowner clicks "Post Job" button
- **Progression**: Choose input method (video/voice/text+photos) → Upload content → Show loading (2s simulation) → Display scope card with price range and materials → Confirm and post
- **Success criteria**: Job is created with AI-generated details visible to contractors

### Job Browsing & Bidding
- **Functionality**: Contractors view open jobs with photos, materials list, and AI scope, then submit bids
- **Purpose**: Connect contractors with relevant work opportunities and detailed job information
- **Trigger**: Contractor navigates to "Browse Jobs" or dashboard
- **Progression**: View filtered job list → See job photos in grid → Click photo to open full-screen lightbox → Navigate between photos with arrow keys/buttons → Close lightbox → Review AI scope and materials → Enter bid amount and message → Submit bid → Toast confirmation
- **Success criteria**: Bid appears in homeowner's bid list and contractor's active bids; photos expand smoothly in lightbox viewer

### Photo Lightbox Viewer
- **Functionality**: Full-screen photo viewer with keyboard navigation and smooth transitions
- **Purpose**: Allow contractors to examine job details closely before bidding
- **Trigger**: Clicking any job photo thumbnail in browse view or job details
- **Progression**: Click photo thumbnail → Lightbox opens with smooth animation → View full-resolution image → Use arrow keys or buttons to navigate → See photo counter (e.g., "2 / 5") → Press Escape or X to close → Return to job listing
- **Success criteria**: Photos display at full resolution, navigation is smooth, keyboard shortcuts work, mobile touch gestures supported

### Contractor Dashboard & CRM
- **Functionality**: View active jobs, open bids, earnings, and manage customer relationships
- **Purpose**: Centralize contractor business operations
- **Trigger**: Contractor logs in or clicks "Dashboard"
- **Progression**: Land on dashboard → See stats cards → Browse jobs table → Click actions (bid, view, contact)
- **Success criteria**: Contractor can track all job activity and financials in one place

### Invoice Management
- **Functionality**: Create, send, and track invoices with auto-reminders (Pro feature)
- **Purpose**: Streamline contractor payment collection
- **Trigger**: Contractor clicks "Invoices" tab or "+ New Invoice"
- **Progression**: Select completed job → Auto-fill amount → Set due date → Send → Track status → Auto-reminder (Pro only)
- **Success criteria**: Invoices are created, stored, and reminder dates tracked

### Pro Upgrade
- **Functionality**: Contractors upgrade to Pro ($39/mo) for instant payouts, auto-reminders, no-show protection
- **Purpose**: Monetization and premium feature access
- **Trigger**: "Upgrade to Pro" button in dashboard or invoices page
- **Progression**: View feature comparison card → Click upgrade button → (Simulated payment) → Update Pro status → Show Pro badge
- **Success criteria**: User's Pro status is persisted and Pro features become available

### Territory Map & Claiming
- **Functionality**: Interactive Texas county map where operators claim territories
- **Purpose**: Geographic market segmentation for operators
- **Trigger**: Operator clicks "Territory Map"
- **Progression**: View Texas map with 254 counties color-coded → Click available county → Confirm claim → County changes to orange → Operator ID linked
- **Success criteria**: Counties can be claimed once, visually update, and filter job visibility

### Payment Flow (Simulated)
- **Functionality**: Homeowner accepts bid and pays via Stripe-like checkout
- **Purpose**: Complete the job transaction loop
- **Trigger**: Homeowner clicks "Accept Bid" on a bid
- **Progression**: Click accept → Show payment modal → Enter card details (simulated) → Process payment → Update job status → Notify contractor
- **Success criteria**: Job status updates and contractor sees payment in dashboard

## Edge Case Handling

- **No AI Input Provided** - Show friendly error message and allow re-upload
- **Zero Bids on Job** - Display "No bids yet" state with tips for improving job description
- **Territory Already Claimed** - Disable claim button and show owner information
- **Non-Pro Accessing Pro Features** - Show upgrade prompt modal
- **Empty Dashboard States** - Friendly illustrations with CTAs to get started
- **Invalid Bid Amounts** - Validation requiring bid to be within reasonable range
- **Network Errors** - Toast notifications with retry options
- **Multiple Role Switches** - Prevent role changes after initial selection

## Design Direction

The design should feel professional yet approachable, like a blend of a modern construction site office and a friendly Texas Main Street business. Orange (trade work, warmth, action) paired with trustworthy blue creates confidence. The interface should feel fast, transparent, and empowering—no hidden fees, no confusion. Everything is upfront and honest, just like a handshake deal, but with modern technology backing it up.

## Color Selection

A bold, energetic palette centered on construction orange with supporting blues and neutrals for a professional marketplace feel.

- **Primary Color**: oklch(0.68 0.19 35) - Vibrant construction orange communicating action, energy, and fair trade
- **Secondary Colors**: oklch(0.45 0.15 255) - Deep trustworthy blue for stability and professionalism
- **Accent Color**: oklch(0.75 0.20 85) - Bright yellow-orange for CTAs and important actions
- **Foreground/Background Pairings**: 
  - Background (Light Gray oklch(0.98 0 0)): Dark text oklch(0.25 0 0) - Ratio 13.2:1 ✓
  - Primary (Orange oklch(0.68 0.19 35)): White text oklch(1 0 0) - Ratio 4.9:1 ✓
  - Secondary (Blue oklch(0.45 0.15 255)): White text oklch(1 0 0) - Ratio 8.1:1 ✓
  - Accent (Yellow-Orange oklch(0.75 0.20 85)): Black text oklch(0.25 0 0) - Ratio 7.2:1 ✓

## Font Selection

Strong, readable typefaces that convey professionalism and clarity, appropriate for both contractors and homeowners navigating financial and work decisions.

- **Primary Typeface**: Space Grotesk - A distinctive geometric sans with technical character that feels modern and trustworthy without being corporate
- **Secondary Typeface**: Inter - Clean, highly legible for body text and data-heavy interfaces

**Typographic Hierarchy**:
- H1 (Hero Headlines): Space Grotesk Bold/48px/tight (-0.02em) letter spacing
- H2 (Section Headers): Space Grotesk Bold/32px/tight letter spacing
- H3 (Card Titles): Space Grotesk SemiBold/20px/normal spacing
- Body (Main Content): Inter Regular/16px/relaxed line-height (1.6)
- Small (Captions/Labels): Inter Medium/14px/normal line-height

## Animations

Animations should feel snappy and purposeful—like the satisfying click of a quality power tool. Use motion to guide attention during the AI scoping process (progressive reveal), provide satisfying feedback on bid submissions and territory claims (scale + fade), and smooth transitions between dashboard views. Avoid anything that feels sluggish or decorative. Every animation should make the interface feel more responsive and delightful.

## Component Selection

- **Components**: 
  - Button (primary, secondary, ghost variants with orange/blue theming)
  - Card (for job listings, bids, stats, white bg with subtle shadows)
  - Input, Textarea (for forms with focus states)
  - Dialog (for bid submission, payment flows, confirmations)
  - Tabs (for contractor dashboard sections)
  - Badge (for Pro status, job status, county status)
  - Avatar (for user profiles)
  - Table (for job listings, invoice lists)
  - Progress (for AI scoping loading state)
  - Toaster (sonner for notifications)
  - Lightbox (full-screen photo viewer with keyboard navigation)
  
- **Customizations**: 
  - Custom territory map component using SVG for Texas counties (no external map library in demo)
  - Custom stat cards with large numbers and Phosphor icons
  - Custom job scope result card with price slider
  - Custom file upload zones with drag-and-drop states
  - Custom lightbox with smooth animations, keyboard controls (Escape, Arrow keys), and photo counter

- **States**: 
  - Buttons: default, hover (scale-105 + brightness), active (scale-95), disabled (opacity-50)
  - Inputs: default (border-gray-300), focus (border-primary + ring), error (border-destructive)
  - Cards: default (shadow-sm), hover (shadow-md + translate-y-[-2px])
  
- **Icon Selection**: 
  - Phosphor icons throughout (Wrench for jobs, House for homeowner, Hammer for contractor, MapPin for territory, CurrencyDollar for invoices, Crown for Pro)

- **Spacing**: 
  - Container padding: px-4 md:px-8
  - Section gaps: gap-6 md:gap-8
  - Card padding: p-4 md:p-6
  - Button padding: px-6 py-3

- **Mobile**: 
  - Stack navigation horizontally on desktop, collapse to hamburger on mobile
  - Single column layouts below md breakpoint
  - Touch-friendly 44px minimum tap targets
  - Full-width cards and buttons on mobile
  - Simplified table → card list transformation on mobile
