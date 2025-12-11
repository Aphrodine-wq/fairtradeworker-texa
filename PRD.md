# FairTradeWorker Texas - Product Requirements Document

A zero-fee Texas home repairs marketplace where AI scopes jobs in seconds, homeowners post work effortlessly, and contractors keep 100% of their earnings.

## 🚀 Scale-Faster Playbook Implementation

This platform includes 10 growth acceleration features designed to achieve viral growth:

1. **Post-&-Win Viral Loop** - Homeowners get unique $20-off referral codes after posting jobs
2. **Contractor Referral Goldmine** - Contractors can invite up to 10 tradesmen per month; both earn $50 on first job completion
3. **Speed-Based Job Visibility** - Small jobs show blinking green "FRESH" badges for 15 minutes
4. **Speed Metrics Dashboard** - Real-time tracking of job-to-bid time, conversion rates, and payout velocity
5. **Live Stats Bar** - Homepage displays real-time platform activity and velocity
6. **Referral Earnings Tracking** - Contractors see referral income integrated into dashboard earnings
7. **Zero-Fee Messaging** - All job posting and bidding emphasizes "$0 fee" throughout the platform
8. **Performance-First Sorting** - Bids are sorted by contractor quality score (performance + accuracy + operator status)
9. **In-Person CRM Sign-ups** - Contractors can instantly invite homeowners via email or SMS
10. **Territory Operator System** - Operators claim counties and track their territory metrics

## Core Values
1. **Free Job Posting** - Homeowners never pay to post
2. **Free Job Bidding** - Contractors never pay to bid  
3. **Open Marketplace** - No paywalls or hidden fees
4. **Performance = Priority** - Best contractors ranked first
5. **In-Person CRM Sign-Up** - Contractors invite homeowners instantly
6. **One-Page Job Post** - Racehorse fast, under 100ms
7. **AI Scope** - Multimodal analysis (video, voice, text, photos, files)
8. **Clean, Seamless, Familiar** - iOS-quality interactions

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

### Post-&-Win Viral Loop
- **Functionality**: Every homeowner who posts a job receives a unique $20-off referral code to share with neighbors
- **Purpose**: Create viral growth through neighbor-to-neighbor referrals with financial incentives
- **Trigger**: Immediately after job is posted successfully
- **Progression**: Post job → System generates unique referral code → Show referral card with code and share buttons → User shares via SMS or copy/paste → Neighbor uses code when posting → Original poster gets $20 → Referral earnings tracked in dashboard
- **Success criteria**: Referral codes are generated and displayed; sharing mechanisms work; earnings are tracked; 0.7 new jobs per posted job is the target metric

### Contractor Referral Goldmine
- **Functionality**: Contractors can invite up to 10 tradesmen per month via SMS; both earn $50 when invited contractor completes first job
- **Purpose**: Rapidly expand contractor network through trusted peer referrals
- **Trigger**: Contractor clicks "Invite a Tradesman" button in CRM dashboard
- **Progression**: Click invite button → Enter buddy's name and phone → System sends SMS with personalized message → Buddy signs up → Buddy completes first job → Both earn $50 → Track referral status and earnings
- **Success criteria**: SMS invites are sent; monthly limit of 10 enforced; referrals tracked through completion; both parties receive $50 upon first job completion

### Speed-Based Job Visibility
- **Functionality**: Small jobs (<$300) display with blinking green "FRESH" tag for first 15 minutes; first bid within 15 min gets sticky top slot for 2 hours
- **Purpose**: Create urgency and encourage contractors to monitor feed actively
- **Trigger**: Job is posted with AI price estimate under $300
- **Progression**: Job posted → Job appears with green blinking badge and highlighted border → Contractors see "FRESH" indicator → First to bid within 15 min → Bid gets priority position for 2 hours → Creates camping behavior on feed
- **Success criteria**: Fresh indicator appears on qualifying jobs; contractors bid within 15 minutes; sticky positioning works correctly

### Speed Metrics Dashboard
- **Functionality**: Real-time tracking of key growth metrics with visual status indicators (green/yellow/red lights)
- **Purpose**: Keep the team focused on speed and conversion metrics instead of vanity metrics
- **Trigger**: Operator views the Speed Metrics tab in Territory Map
- **Progression**: Navigate to metrics tab → View three key metrics (Job-to-First-Bid Time, Invite-to-Signup Conversion, Same-Day Payout Count) → See color-coded status lights → Rally team around improvements
- **Success criteria**: Metrics calculate correctly; status lights update based on targets; operators can track performance trends

### Live Stats Bar
- **Functionality**: Prominent display of real-time platform activity on homepage
- **Purpose**: Build trust and demonstrate platform velocity to new visitors
- **Trigger**: User visits homepage
- **Progression**: View homepage → See live stats bar with jobs posted today, average bid time, and completed jobs this week → Understand platform is active and fast
- **Success criteria**: Stats update in real-time; numbers are accurate; bar is visually prominent but not overwhelming

### User Authentication & Role Selection
- **Functionality**: Email-based signup/login with role selection (homeowner, contractor, operator)
- **Purpose**: Segregate user experiences and permissions based on their role in the marketplace
- **Trigger**: Landing page CTA buttons or header login link
- **Progression**: Click role button → Enter email/password → Select role dropdown → Auto-create user profile → Redirect to role-specific dashboard
- **Success criteria**: User can sign up, log in, and see content appropriate to their role

### AI Job Scoping (Simulated)
- **Functionality**: Upload video/voice/photos, get AI-generated scope, price range, and materials list. Video support includes up to 150 MB files with advanced analysis including scene detection, object recognition, audio transcription, and metadata extraction.
- **Purpose**: Remove friction from job posting and provide instant pricing transparency with rich multimodal analysis
- **Trigger**: Homeowner clicks "Post Job" button
- **Progression**: Choose input method (video/voice/text+photos) → Upload content → For video: show chunked upload progress with circular ring indicator → Extract 5 thumbnail frames → Allow user to select cover image → Analyze video metadata (codec, bitrate, GPS, device) → Detect scene cuts, objects, sound events → Transcribe audio → Show quality warnings (shaky, low audio) → Display comprehensive scope card with all analysis → Confirm and post
- **Success criteria**: Job is created with AI-generated details visible to contractors; video uploads handle 150 MB files; progress shows percentage and thumbnails; analysis extracts meaningful data

### 150 MB Video Upload System
- **Functionality**: Advanced video upload with chunked resumable transfer, real-time thumbnail extraction, metadata analysis, duplicate detection, and quality warnings
- **Purpose**: Enable homeowners to record detailed walkthrough videos of repair needs while providing contractors with rich visual context
- **Trigger**: Homeowner selects "Video" input method when posting a job
- **Progression**: Select video method → Click or drag to upload video (max 150 MB) → Validate file (MP4, MOV, MKV, WebM) → Calculate SHA-256 hash of first/last 1 MB → Check for duplicate uploads within 24h → Start chunked upload (5 MB chunks, ~30 chunks for full file) → Show circular progress indicator with percentage → Extract 5 thumbnail frames at 0%, 25%, 50%, 75%, 100% duration → Display thumbnail strip → Allow cover selection → Analyze video (duration, scene cuts, objects, sound events, transcript, GPS, device info) → Show quality warnings (shaky footage, low audio) → Display comprehensive analysis results → Continue with job posting
- **Success criteria**: Uploads handle files up to 150 MB; progress can be paused/resumed; thumbnails extract correctly; duplicate detection prevents re-uploads; analysis provides actionable data; warnings appear for quality issues; upload completes successfully 98% of the time

### Video Analysis & Metadata
- **Functionality**: Extract comprehensive metadata from uploaded videos including technical specs, GPS location, scene changes, detected objects, sound events, and audio transcription
- **Purpose**: Provide contractors with deep context about the job and auto-fill location data when available
- **Trigger**: Video upload completes processing
- **Progression**: Video uploaded → Extract technical metadata (codec, bitrate, fps, resolution, color space) → Parse GPS coordinates from video metadata → Detect device make/model → Analyze audio (sample rate, loudness in LUFS) → Detect scene changes → Identify objects in frames (water heater, pipes, etc.) → Classify sound events (drip, hiss, hum) → Transcribe speech with timestamps → Detect language → Calculate motion blur score → Compile all data for AI scope generation
- **Success criteria**: All metadata fields populate correctly; GPS auto-fills job location when present; scene cuts and objects are detected; transcript is clickable with timestamps; warnings trigger for poor audio (<-40 LUFS) or shaky footage (<22 dB PSNR)

### Job Browsing & Bidding
- **Functionality**: Contractors view open jobs with size badges (🟢 Small ≤$300, 🟡 Medium ≤$1,500, 🔴 Large >$1,500), photos, materials list, and AI scope, then submit free bids
- **Purpose**: Connect contractors with relevant work opportunities and detailed job information while emphasizing zero fees
- **Trigger**: Contractor navigates to "Browse Jobs" or dashboard
- **Progression**: View filtered job list → See job size badge → See job photos in grid → Click photo to open full-screen lightbox → Navigate between photos with arrow keys/buttons → Close lightbox → Review AI scope and materials → Enter bid amount and message → See "$0 fee" label → Submit bid → Toast confirmation
- **Success criteria**: Bid appears in homeowner's bid list and contractor's active bids; photos expand smoothly in lightbox viewer; free bidding message is clear

### Performance-Based Bid Sorting
- **Functionality**: Bids are automatically sorted by contractor quality score (performance + accuracy + operator status)
- **Purpose**: Prioritize the most reliable contractors for homeowners
- **Trigger**: When homeowner views bids on their job
- **Progression**: View job → See bids sorted by score → Top performers appear first → Operator-contractors get 0.2 boost
- **Success criteria**: Bids display in correct priority order; formula: `score = performanceScore + bidAccuracy + (isOperator ? 0.2 : 0)`

### Job Size Classification
- **Functionality**: Jobs automatically categorized as Small (🟢 ≤$300), Medium (🟡 ≤$1,500), or Large (🔴 >$1,500)
- **Purpose**: Help contractors quickly identify jobs that match their capacity
- **Trigger**: AI generates price estimate
- **Progression**: AI calculates priceHigh → System assigns size → Badge displays on job card
- **Success criteria**: Size badge appears on all jobs; correct categorization based on priceHigh value

### Contractor Dashboard & CRM
- **Functionality**: View active jobs, open bids, earnings, manage customer relationships, and send instant invites for in-person sign-ups
- **Purpose**: Centralize contractor business operations and enable contractors to quickly onboard homeowners via email or SMS
- **Trigger**: Contractor logs in or clicks "Dashboard"
- **Progression**: Land on dashboard → See stats cards → Browse tabs (Jobs, CRM, Invoices) → In CRM tab: Use instant invite widget → Enter customer name and email/phone → Click send → Invite sent instantly → Customer added to CRM → View customer list → Click customer card → See details and add notes
- **Success criteria**: Contractor can track all job activity, financials, and customer relationships in one place; instant invites are sent successfully with clear feedback; customers are stored and manageable in CRM

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
- **Invalid Email/Phone in CRM Invite** - Real-time validation with clear error messages before allowing send
- **Duplicate Customer Entries** - Allow duplicates for flexibility (contractor may re-invite same person)
- **Empty CRM** - Show friendly empty state with instructions to use invite widget

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
  - Dialog (for bid submission, payment flows, confirmations, customer details)
  - Tabs (for contractor dashboard sections: Browse Jobs, CRM, Invoices)
  - Badge (for Pro status, job status, county status, customer status)
  - Avatar (for user profiles)
  - Table (for job listings, invoice lists)
  - Progress (for AI scoping loading state)
  - Toaster (sonner for notifications, especially invite confirmations)
  - Lightbox (full-screen photo viewer with keyboard navigation)
  - Label (for form fields in instant invite widget)
  
- **Customizations**: 
  - Custom territory map component using SVG for Texas counties (no external map library in demo)
  - Custom stat cards with large numbers and Phosphor icons
  - Custom job scope result card with price slider
  - Custom file upload zones with drag-and-drop states
  - Custom lightbox with smooth animations, keyboard controls (Escape, Arrow keys), and photo counter
  - Custom instant invite widget with email/SMS tabs and real-time validation

- **States**: 
  - Buttons: default, hover (scale-105 + brightness), active (scale-95), disabled (opacity-50)
  - Inputs: default (border-gray-300), focus (border-primary + ring), error (border-destructive)
  - Cards: default (shadow-sm), hover (shadow-md + translate-y-[-2px])
  
- **Icon Selection**: 
  - Phosphor icons throughout (Wrench for jobs, House for homeowner, Hammer for contractor, MapPin for territory, CurrencyDollar for invoices, Crown for Pro, Users for CRM, EnvelopeSimple for email invites, DeviceMobile for SMS invites, PaperPlaneRight for sending invites, Note for customer notes)

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
