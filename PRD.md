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

### 3D Theme Toggle
- **Functionality**: Animated theme switcher with a 3D rotating sphere that flips between sun (☀️) and moon (🌙) icons
- **Purpose**: Provide delightful, accessible way to switch between light and dark modes while saving user preference
- **Trigger**: User clicks theme toggle button in top-right corner of header
- **Progression**: Click toggle → Sphere rotates 180° on Y-axis with spring animation (0.8s) → Icon flips from sun to moon (or vice versa) → Entire page fades to new theme (0.4s transition) → Preference saved to localStorage → Theme persists across sessions
- **Success criteria**: Animation is smooth with natural spring physics; theme applies immediately; preference persists after page refresh; respects system preference on first visit

### Post-&-Win Viral Loop (Tiered Referral System)
- **Functionality**: Every homeowner who posts a job receives a unique referral code with escalating rewards. First referral earns $20 off next job, third referral unlocks priority contractor matching, fifth referral grants "Preferred Homeowner" gold badge status that makes jobs more attractive to top-tier contractors. Tracks multi-degree referral chains (A→B→C gives A a bonus).
- **Purpose**: Create compounding viral growth through neighbor-to-neighbor referrals with escalating financial incentives and network effects
- **Trigger**: Immediately after job is posted successfully
- **Progression**: Post job → System generates unique referral code (format: initials + userID hash + random) → Show tiered rewards card with progress tracker → Share via SMS/email/copy → First referral used: $20 credit applied → Third referral: unlock "Priority Matching" feature → Fifth referral: receive "Preferred Homeowner" gold badge visible to all contractors → Track second-degree referrals (small bonus for A when B refers C) → All earnings and tier progress tracked in dashboard with visual progress bar
- **Success criteria**: Tiered rewards display correctly; $20 credit applies automatically on first referral; priority matching activates at 3 referrals; gold badge shows on job posts at 5 referrals; second-degree tracking gives 10% bonus; dashboard shows referral tree; target K-factor of 1.2 achieved through tiered system; 35% of referral codes used within 7 days

### Contractor Referral Goldmine (Leaderboard & Buddy System)
- **Functionality**: Contractors can invite tradesmen via SMS with leaderboard showing top recruiters per county. Contractors who bring in 5+ active tradesmen in a quarter get "Crew Leader" status with dedicated landing page. Optional "buddy system" links referring contractor to referral for first 90 days, earning 2% of new contractor's first 10 jobs as mentorship incentive.
- **Purpose**: Rapidly expand contractor network through quality peer referrals with skin-in-the-game mentorship and competitive gamification
- **Trigger**: Contractor clicks "Invite a Tradesman" or views Referral Leaderboard in CRM dashboard
- **Progression**: Click invite button → Enter buddy's name, phone, and trade specialty → Optional: Enable "Buddy Link" (90-day mentorship) → System sends personalized SMS → Buddy signs up via tracked link → Track onboarding progress → Buddy completes first job → Both earn $50 → If buddy-linked: referring contractor earns 2% of next 10 jobs → After 5 successful referrals in quarter: unlock "Crew Leader" badge and custom landing page → View county leaderboard showing top 10 recruiters → Climb leaderboard to boost profile visibility
- **Success criteria**: SMS invites are sent with tracking; buddy system option toggles on/off; 2% commission calculated correctly for first 10 jobs; Crew Leader badge displays after 5 active referrals; custom landing page generates with share link; county leaderboard updates in real-time; top recruiters display with photo and stats; 45% invite-to-signup conversion achieved; quality referrals incentivized over volume

### Speed-Based Job Visibility
- **Functionality**: Small jobs (<$300) display with blinking green "FRESH" tag for first 15 minutes; first bid within 15 min gets sticky top slot for 2 hours; Lightning Round for small jobs where first 3 bids within 10 minutes get bolt icon highlighting; Response Time badges on contractor profiles (green clock <15 min, yellow <30 min, no badge >60 min); Peak Hours notifications alert contractors when job posting volume spikes.
- **Purpose**: Create urgency, encourage contractors to monitor feed actively, and gamify quick responses while helping homeowners identify responsive contractors
- **Trigger**: Job is posted with AI price estimate under $300, or contractor views job feed during high-activity period
- **Progression**: Job posted ��� Job appears with green blinking badge and highlighted border → Contractors see "FRESH" indicator → **Lightning Round**: First 3 contractors to bid within 10 min → Bids get bolt icon ⚡ highlighting → Homeowner sees "3 contractors responded in under 10 minutes" trust builder → First to bid within 15 min → Bid gets sticky priority position for 2 hours with orange highlight → Creates camping behavior on feed → **Response Time Badges**: System tracks contractor avg time-to-bid → Profile displays badge (green clock <15 min average, yellow clock <30 min, no badge if >60 min) → Homeowners filter for fast responders → **Peak Hours**: When job posting volume increases 3x normal rate → Push notification to contractors: "12 new jobs posted in [County] in the last hour—now's a great time to bid!" → Contractors open app during high-activity windows → Bid on fresh jobs → Peak hours drive 40% more engagement
- **Success criteria**: Fresh indicator appears on qualifying jobs; contractors bid within 15 minutes on 85% of small jobs; sticky positioning works correctly for first bids; Lightning Round bolt icons display on first 3 bids; Response Time badges calculate accurately; contractors with green badges get 25% more bid acceptances; Peak Hours notifications send when volume spikes; notifications increase contractor engagement 40% during peaks; camping rate reaches 40% of contractors checking every 15 min during 4-7pm

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

### AI Job Scoping (Confidence Scoring & Pro Assessment)
- **Functionality**: Upload video/voice/photos, get AI-generated scope with 1-100 Confidence Score. Jobs 90+ confidence get "Verified Scope" badge. Jobs below 60 confidence trigger optional "Request Pro Assessment" where local operator/experienced contractor does quick video call to refine scope (operators earn $5-15 per assessment).
- **Purpose**: Remove friction from job posting, provide instant pricing transparency with quality scoring, and create additional revenue stream for operators while improving accuracy
- **Trigger**: Homeowner clicks "Post Job" button
- **Progression**: Choose input method (video/voice/text+photos) → Upload content → For video: show chunked upload progress with circular ring indicator → Extract 5 thumbnail frames → Smart frame extraction auto-identifies "money shots" (actual problem areas) → Use object detection to auto-tag visible items (water heater, HVAC, electrical panel) → Pre-populate job category from detected objects → If multiple issues detected: prompt to split into separate jobs or bundle with multi-job discount → Voice transcription pulls key phrases and highlights in scope summary → Analyze all inputs → Calculate Confidence Score (1-100) → If 90+: display "Verified Scope" green badge → If 60-89: standard scope with yellow indicator → If <60: show orange banner "Request Pro Assessment for $10 - get expert refinement" with book button → Operator/contractor conducts 5-10 min video call → Refines scope → Homeowner pays assessment fee → Post job with refined scope
- **Success criteria**: Confidence score displays on all scopes; Verified Scope badge shows on 90+ jobs; Pro Assessment booking flow works; operators/contractors can accept assessment requests; video call initiates; refined scope updates job; assessment payment processes; operators earn $5-15 per assessment; smart frame extraction identifies problem areas; object detection tags items with 80% accuracy; multi-issue detection prompts split/bundle option; voice transcription highlights key phrases in summary

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

### Contractor CRM - Business Command Center
- **Functionality**: Complete business management hub with Smart Scheduler showing optimal job sequences based on location/travel time, Repeat Customer Engine auto-identifying customers for seasonal outreach, templated follow-up sequences, Customer Health Scores, automation rules (auto-send review requests, follow-up reminders), Win/Loss tracking by job type/size/time, profit calculator per job, and working radius settings.
- **Purpose**: Transform CRM from contact tracking into complete business operation system that runs contractor's entire workflow
- **Trigger**: Contractor logs in or clicks "Dashboard" or "CRM"
- **Progression**: Land on dashboard → See enhanced stats cards (Total Customers, Active, LTV, Repeat Rate, Win Rate, Avg Margin) → **Smart Scheduler Tab**: View calendar with available time slots → Set working radius (miles) and hours → System auto-suggests optimal daily job sequences based on location clustering and travel time → Drag jobs to schedule → See travel time between jobs → Simple profit calculator shows (estimated time × hourly rate - materials cost = projected margin) → **Customer List Tab**: Use instant invite widget → Auto-capture every bid interaction as CRM entry → View customer grid with Health Score (0-100 based on job frequency, payment speed, referral activity) → Click customer card → See full timeline of touchpoints → Add color tags (VIP, High Value >$1K, Frequent 3+ jobs, Referrer) → Voice memo notes with transcription → **Kanban Board Tab**: View 4 columns (Lead, Active, Completed, Advocate) → Drag to update status → Automation: Completed → auto-send review request after 3 days → Lead sitting 14 days → trigger follow-up reminder → **Repeat Customer Engine Tab**: System auto-identifies customers 6+ months since last work → Shows seasonal maintenance suggestions (HVAC customers: filter changes, Plumbing: winterization) → One-click send templated outreach → Track engagement → **Follow-Up Sequences (Pro)**: Create multi-step sequences → Add SMS/email at days 1, 3, 7, 30 → Templates for different job types → Auto-pause when customer replies → **Win/Loss Tracking**: Log lost bids with reason → View conversion rate dashboard by job type, size, time of day submitted → Identify patterns to improve bid strategy
- **Success criteria**: Contractor spends 40% of platform time in CRM; Smart Scheduler suggests jobs saving 2+ hours travel time per week; Repeat Customer Engine identifies opportunities with 30% reactivation rate; Health Scores calculate correctly; automation rules trigger on schedule; Win/Loss tracking shows insights; profit calculator accurate; follow-up sequences achieve 25%+ reply rate; contractors report CRM runs their entire business

### Invoice Management - Delightful & Bulletproof
- **Functionality**: Smart line item suggestions based on AI scope and job type, materials markup calculator with industry standards, Payment Plans for jobs over $1K (2-4 payments, no interest, contractor paid in full immediately), optional Tip Jar (5-15% one-click), Invoice Insights dashboard (avg time-to-payment by customer, most profitable job types, seasonal trends, YoY comparisons), quarterly tax summaries with categorized expenses, company logo upload for branded invoices or use platform generic template, invoice templates to save/reuse common configurations, recurring invoices, partial payments, late fees.
- **Purpose**: Make invoicing fast, professional, and a revenue optimization tool while providing contractors business intelligence
- **Trigger**: Contractor clicks "Invoices" in menu or "+ New Invoice"
- **Progression**: Navigate to Invoice Manager → View tabs (All, Draft, Sent, Paid, Overdue, Templates) → **Create Invoice**: Click new invoice → Select completed job → System pre-populates smart line items based on original AI scope (e.g., "replace water heater" suggests: water heater unit, installation labor, haul-away fee, permits) → Materials markup calculator suggests industry-standard margins (plumbing: 25-35%, electrical: 30-40%, HVAC: 20-30%) → Add/edit line items with drag-to-reorder → Set tax rate (auto-applies to all items) → Choose due date → **Payment Plans (Pro)**: For jobs >$1K, toggle "Enable Payment Plan" → Select 2, 3, or 4 payments → Homeowner sees split amounts, contractor receives full payment immediately (platform fronts difference) → **Tip Jar**: Toggle "Enable Tip" → Homeowner sees 5%, 10%, 15% buttons and custom amount → **Logo Settings**: Upload company logo (PNG/JPG, max 2MB) OR use platform generic template with FTW branding → **Save as Template**: Click "Save Template" → Name configuration → Reuse for similar jobs → Mark as pro forma (estimate before work) if needed → Set as recurring (monthly/quarterly) if applicable → Create & send → **Invoice Insights (Pro)**: View dashboard with charts → Avg time-to-payment by customer (identify slow payers) → Most profitable job types (HVAC nets 40% vs plumbing 28%) → Seasonal revenue trends (summer peak for AC) → YoY comparison → **Tax Export (Pro)**: Click "Export Q4 2024 Tax Summary" → CSV downloads with categorized line items (Labor, Materials, Permits, Travel) → Imports directly to QuickBooks → (Pro) Auto-reminders sent at 3, 7, 14 days → Late fees auto-add 1.5% after 30 days → Track viewed status → Mark as paid → Invoice PDF generates with logo/branding
- **Success criteria**: Invoices created in <90 seconds; smart suggestions appear for recognized job types; materials markup calculator shows recommendations; payment plans work with platform float; tip jar increases contractor earnings 8-12%; logo uploads successfully and appears on PDF; platform template looks professional; invoice templates save/load correctly; recurring invoices auto-generate on schedule; Invoice Insights dashboard shows accurate metrics; tax export includes all necessary categories; collection rate 78% within 7 days (Pro: 85%); late fees calculate correctly; average invoice value increases 15% with smart features

### Pro Upgrade
- **Functionality**: Contractors upgrade to Pro ($39/mo) for instant payouts, auto-reminders, no-show protection, Invoice Insights dashboard, Smart Scheduler, Repeat Customer Engine, unlimited CRM contacts, advanced analytics
- **Purpose**: Monetization and premium feature access that provides real business value
- **Trigger**: "Upgrade to Pro" button in dashboard, invoices page, or when hitting free tier limits
- **Progression**: View feature comparison card showing Free vs Pro benefits → Free tier: 50 CRM contacts, manual invoices, 3-day payouts, basic dashboard → Pro tier: Unlimited contacts, auto-invoice reminders, instant payouts (30 min), no-show protection ($50 credit), Invoice Insights dashboard with profitability metrics, Smart Scheduler with route optimization, Repeat Customer Engine, advanced Win/Loss tracking, quarterly tax exports, priority support → Click upgrade button → (Payment integration) Enter payment details → Process $39/mo subscription → Update Pro status instantly → Show Pro badge (crown icon) on profile and all interactions → Unlock all Pro features immediately → Pro contractors get 15% higher visibility in bid sort rankings → Target 15% conversion rate by month 6
- **Success criteria**: User's Pro status is persisted; Pro badge displays prominently; all Pro features become accessible; free tier limits enforce correctly; Pro contractors see instant payouts option; Invoice Insights dashboard appears; Smart Scheduler unlocks; 15% of contractors convert to Pro within 6 months; Pro members report 40% higher earnings due to better tools

### Strategic Monetization Layers
- **Functionality**: Multiple revenue streams beyond Pro subscriptions: Bid Boost feature ($5-20 to feature bid at top for 24h, limited 2 per job), Materials Marketplace partnership (order supplies with bulk discounts, platform takes affiliate cut), FTW Verified certification ($99/year for background check, insurance verification, skills assessment with prominent badge and higher search ranking).
- **Purpose**: Diversify platform revenue while providing value-added services to contractors and homeowners
- **Trigger**: Contractor views bid submission dialog, Materials tab, or Profile Settings
- **Progression**: **Bid Boost**: Contractor writing bid → See "Boost This Bid" option → Select boost duration (6hr $5, 12hr $10, 24hr $20) → Confirm payment → Bid appears at top of homeowner's list with "Featured" star badge → Limited to 2 boosted bids per job to prevent pay-to-win → Homeowner sees "Featured bid" but still sorts by quality after boost expires → **Materials Marketplace**: Contractor reviewing job → Click "Order Materials" → See materials list from AI scope → Select items → System queries partner supplier API (starting with Ferguson, HD Pro) → Real-time pricing with negotiated 10-15% bulk discount → Contractor saves money, platform earns 5-8% affiliate commission → Add to cart → Complete order (ships directly or pickup) → Track order status → Invoice automatically includes materials cost → **FTW Verified Certification**: Contractor views profile → See "Get Verified" prompt → Click to start verification → Upload: Background check authorization ($35 third-party fee), Proof of insurance (auto-verify expiration), Trade license/certifications, Complete skills assessment (10 question test per trade) → Submit for review → Platform team verifies within 48h → Approved: Receive prominent "FTW Verified" green checkmark badge → Badge shows on all bids and profile → Higher placement in search/browse (0.25 score boost) → Access to premium job categories (commercial work, property management contracts, insurance restoration jobs) → Annual renewal $99 → 30-day expiration reminder
- **Success criteria**: Bid Boost charges correctly; boosted bids display at top with star icon; 2-boost-per-job limit enforces; Materials Marketplace queries supplier APIs; prices show correct discount; platform affiliate commission tracks; contractors save 10-15% on materials; FTW Verified application flow completes; background checks integrate with third-party service; verification approves/denies within 48h; verified badge displays prominently; verified contractors rank higher; premium job categories unlock; annual renewal reminds and processes; revenue targets: Bid Boost $5k/month by month 6, Materials $15k/month by month 9, Verified $8k/month by month 12

### Territory Operator System - Real Tools & Tier System
- **Functionality**: Operator Dashboard with territory health metrics (active contractors per 10k residents, job density heat maps, average response times, contractor quality scores), Territory Challenges (time-limited promotions like "first to 5 jobs wins $100 bonus"), Local Events calendar to log partnerships and track which generate most signups, Operator Tier system (Bronze 1 county, Silver 3-5, Gold 6-10, Platinum 11+) with escalating benefits, Territory Transfer marketplace to sell established territories.
- **Purpose**: Give operators real business management tools, create growth incentives through tiers, and establish territory asset value
- **Trigger**: Operator clicks "Territory Map" or "Operator Dashboard"
- **Progression**: **Territory Map**: View Texas map with 254 counties color-coded → Click available county → View territory preview (population, current job velocity, contractor count) → Confirm claim → County changes to owned status → **Operator Dashboard**: See tier badge (Bronze/Silver/Gold/Platinum) and progress to next tier → View territory health metrics grid → Active contractors per 10k residents (target >15) → Job density heat map showing underserved zip codes → Average contractor response time to bids (target <15 min) → Contractor quality score distribution → Identify recruitment opportunities in underserved areas → **Territory Challenges**: Create time-limited promotion → Set reward ($50-$200) → Set goal (first to 5 jobs in week, highest bid count) → Contractors in territory see challenge banner → Winner auto-receives bonus → Track challenge performance → **Local Events Calendar**: Log event (home show, hardware store demo, community fair) → Track contractor signups from event → Measure ROI per event type → Best-performing activities highlighted → **Operator Tiers**: Bronze (1 county): 10% revenue share, standard support → Silver (3-5 counties): 12% share, priority support, exclusive training webinars → Gold (6-10 counties): 15% share, dedicated account manager, quarterly strategy calls → Platinum (11+ counties): 18% share, all Gold benefits, early feature access, annual conference invite → **Territory Transfer**: List territory for sale → Set price (suggested 12x monthly net) → Buyers browse marketplace → Platform takes 5% transaction fee → Transfer ownership seamlessly → Creates asset value and exit strategy
- **Success criteria**: Dashboard metrics calculate accurately; heat maps visualize job density; territory challenges create and track correctly; local events calendar logs activities; tier system displays benefits and progress; higher tiers unlock features; territory transfer marketplace lists/sells territories; 5% fee processes on transfers; operators motivated to grow and optimize territories; average territory grows from 8 to 25 active contractors in 6 months

### Payment Flow (Simulated)
- **Functionality**: Homeowner accepts bid and pays via Stripe-like checkout
- **Purpose**: Complete the job transaction loop
- **Trigger**: Homeowner clicks "Accept Bid" on a bid
- **Progression**: Click accept → Show payment modal → Enter card details (simulated) → Process payment → Update job status → Notify contractor
- **Success criteria**: Job status updates and contractor sees payment in dashboard

### Enhanced Demo Mode - Conversion Machine
- **Functionality**: Demo mode transformed into persuasive sales tool with guided walkthroughs highlighting pain points solved, sample notifications showing real-time bid arrivals, realistic metrics dashboards, competitor fee calculator, and clear conversion CTAs.
- **Purpose**: Turn demo experience into primary conversion funnel that sells platform benefits viscerally
- **Trigger**: User clicks "Demo as [Role]" button on homepage
- **Progression**: Click demo role button → Auto-login as pre-configured demo user with rich sample data → Show prominent demo banner with "You're exploring as [Name] - [Role]" → **Guided Walkthrough**: First-time demo shows overlay tutorial → For homeowner: "See how Maria posted her plumbing job in 47 seconds" → Step through streamlined job posting with pre-filled data → Watch simulated bids arrive in real-time (animated toasts) → For contractor: "Watch how Jake won 3 bids this morning without paying any fees" → Show dashboard with earnings, active bids → Simulate accepting job and instant payout → For operator: Show territory map with revenue metrics → **Sample Notifications**: Push realistic notifications during demo → "New job posted 2 minutes ago in your area" → "Your bid was accepted! $485 earned" → "John referred a neighbor - you earned $20" → **Realistic Metrics**: Dashboard shows believable data → Contractor: "Last 30 days: 12 jobs, $5,840 earned, $0 in fees" → Compare with grayed-out competitor widget: "On [Competitor], you'd have paid $875 in fees" → **Fee Calculator**: Prominent "What would this cost on [Competitor]?" calculator → Enter job amount → Show side-by-side: "You keep $500 here | You keep $425 on [Other Platform]" → Make value proposition visceral and immediate → **Clear Conversion CTA**: After 3-5 minutes of demo exploration → Show modal: "Ready to stop paying fees? Sign up now and post your first real job" or "Ready to keep 100% of your earnings? Create your account" → Single-click transition from demo to real signup → Pre-fill email if collected → Demo session data shows 65% homepage engagement, 40% demo-to-signup conversion
- **Success criteria**: Demo mode loads instantly with rich data (12 sample jobs, 24 bids, 8 invoices, 3 territories per role); guided walkthrough highlights key features; sample notifications appear realistically; metrics dashboards show believable numbers; competitor fee calculator compares accurately; conversion modal appears after engagement threshold; demo-to-signup rate reaches 40%; users report understanding platform value immediately

### Social Proof & Trust Signals
- **Functionality**: Real-time activity feed on homepage, neighborhood trust scores showing platform activity by zip code, contractor success stories with video testimonials embedded throughout experience.
- **Purpose**: Build credibility and create FOMO through transparent community activity and social proof
- **Trigger**: User lands on homepage or browses platform
- **Progression**: **Real-Time Activity Feed**: Homepage displays scrolling feed → "John in Houston just posted a fence repair job" (2 min ago) → "Maria in Austin accepted a bid from Mike's Plumbing" (5 min ago) → "Sarah earned $1,200 this week in Dallas" (8 min ago) → Anonymized enough for privacy but specific enough to feel real → Updates every 30 seconds with new activity → Creates sense of active marketplace → **Neighborhood Trust Scores**: Job posting page shows local activity → "Your neighbors in 75001 have posted 47 jobs and saved $12,340 in fees this year" → Map visualization shows job density by zip code → "Top active zip codes: 75001 (47 jobs), 75002 (38 jobs), 75039 (31 jobs)" → Creates friendly competition between neighborhoods → Homeowners see "You're in an active area - expect fast bids!" → **Contractor Success Stories**: Prominent section on contractor signup page → "Meet Jake, who grew his business 40% in 6 months on FairTradeWorker" → Video testimonial embedded (2-3 minutes) → Show actual dashboard metrics → "I was paying $1,200/month in fees on other platforms. Now I keep everything." → Rotate 3-5 featured contractors monthly → Success stories link from homepage, about page, and contractor dashboard → Create aspirational path for new contractors
- **Success criteria**: Activity feed updates in real-time; activities are anonymized appropriately; neighborhood trust scores calculate correctly by zip code; savings numbers aggregate accurately; success story videos embed and play smoothly; testimonials feel authentic; social proof increases homepage time-on-site 25%; trust indicators improve signup conversion 15%

### Mobile-First Optimization
- **Functionality**: Complete job posting flow optimized for one-thumb operation, Quick Capture mode (big record button), contractor mobile experience surfaces urgent actions, Apple Watch/Wear OS notifications for FRESH jobs, offline mode for rural contractors.
- **Purpose**: Enable seamless mobile experience since most homeowners post from phones after discovering problems, and contractors need instant job notifications
- **Trigger**: User accesses platform from mobile device or areas with spotty coverage
- **Progression**: **Quick Capture for Homeowners**: Open app on mobile → Large "Quick Post" button fills bottom third of screen → Tap once to start video recording → UI shows only essential controls: record timer, pause, stop → Tap again to stop → AI handles everything else (no forms) → Review captured video → Add voice description if needed → AI generates scope automatically → One tap to post → Target: 47-second posting time → **Contractor Mobile Dashboard**: Open app → Prioritized view shows most urgent actions first → "3 new jobs to bid on" at top with orange badges → "2 invoices awaiting payment" below → "Today's scheduled jobs" with nav button → Large tap targets (minimum 44×44px) → Swipe gestures to mark jobs complete → Pull to refresh for new jobs → **Smart Watch Notifications**: FRESH job posts trigger instant notification → Apple Watch/Wear OS displays: "New plumbing job $200-$300 - 2 miles away - Bid now" → Tap to open quick bid view → Dictate bid amount and message → Submit from wrist → Target: Enable contractors to bid within 2 minutes of job posting from anywhere → **Offline Mode**: Detect spotty connectivity → Cache job list and details locally → Allow contractor to view jobs, draft bids, prepare invoices → Queue actions to send when connectivity returns → Show "Offline" indicator → Sync automatically when back online → Critical for rural Texas areas → **One-Thumb Operation**: All buttons positioned in bottom third of screen for thumb reach → Large text (minimum 16px) → No tiny tap targets → Horizontal scrolling eliminated → Forms auto-advance after input → Minimal typing required
- **Success criteria**: Quick Capture mode reduces job posting time to <60 seconds on mobile; contractor mobile dashboard loads <1.5 seconds; watch notifications send within 15 seconds of job posting; offline mode caches essential data; queued actions sync successfully; all interactive elements meet 44×44px minimum; text remains readable at 16px+; one-thumb operation tested on devices from iPhone SE to iPhone 15 Pro Max; 70% of homeowner jobs posted from mobile; 85% of contractor bids submitted from mobile; mobile conversion rate matches desktop

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

**DuoTone Glass Morphism**: A premium, magazine-editorial aesthetic featuring pristine glass-like surfaces with subtle blur effects and a strictly enforced two-color system (Electric Blue + Charcoal). No gradients except for the 3D theme toggle. Every UI element is either blue (action/trust) or charcoal/gray (structure/text), creating instant visual hierarchy and a professional, trustworthy appearance. The design includes a delightful 3D magnetic theme toggle that rotates like a luxury car switch with spring physics. All surfaces have a museum-glass quality with 12px backdrop blur, floating on subtle noise texture. Micro-interactions are purposeful: buttons lift on hover, cards float with enhanced shadows, links grow animated underlines, and pages fade in with gentle upward motion. Zero fluff—just diamonds.

## Color Selection

**DuoTone System**: Two colors. No exceptions. This constraint creates editorial simplicity with surgical precision.

- **Primary Color**: oklch(0.506 0.213 264) - Electric Blue for buttons, links, and active states
- **Secondary Colors**: oklch(0.706 0.12 264) - Light Blue for supporting elements
- **Accent Color**: oklch(0.456 0.243 264) - Deep Blue for CTAs and highlights
- **Background**: Warm light gray oklch(0.988 0.002 264) in light mode, deep charcoal oklch(0.165 0.01 264) in dark mode
- **Glass Surfaces**: White @ 85% opacity in light mode, Charcoal @ 75% opacity in dark mode (with 12px backdrop-blur)
- **Foreground/Background Pairings**: 
  - Background (Light) → Foreground (Charcoal): Ratio 17.8:1 ✓
  - Primary (Electric Blue) → White text: Ratio 8.4:1 ✓
  - Card (Glass White) → Text: Ratio 17.8:1 ✓
  - Muted → Muted-foreground: Ratio 7.1:1 ✓

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

**Spring Physics & Purposeful Motion**: Every animation serves a function—orienting during navigation, establishing relationships, providing feedback, or guiding attention. The centerpiece is the 3D magnetic theme toggle with luxury-car-switch spring physics (0.8s, stiffness: 200, damping: 20) that rotates 180° on the Y-axis. Theme changes trigger a 0.4s page-wide color transition. All buttons respond with lift (2px translate-y, scale-105) and enhanced shadows on hover, then scale-95 on click for tactile feedback. Cards float on hover with shadow-xl and 4px lift. Links grow animated blue underlines from left to right. Pages fade in with gentle 10px upward motion (0.6s ease-out). Loading states use subtle blue shimmer instead of spinners. No decoration—only natural physics creating delightful responsiveness.

## Component Selection

- **Components**: 
  - Button (primary/secondary/ghost with electric blue theming, hover lift effects, 44px minimum)
  - Card (glass morphism with 85%/75% opacity, 12px backdrop-blur, rounded-2xl, hover float)
  - GlassCard (specialized card with museum-glass aesthetic and shadow-xl hover)
  - Input, Textarea (border-bottom focus states, 16px minimum text, 44px height)
  - Dialog (glass background with blur, smooth open/close)
  - Tabs (for contractor dashboard: Browse Jobs, CRM, Invoices)
  - Badge (job status, Pro status, county status with blue variants)
  - Avatar (user profiles with blue primary background)
  - Table (transforms to cards on mobile)
  - Progress (for AI scoping with blue accent)
  - Toaster (sonner with blue theme for notifications)
  - Lightbox (full-screen photo viewer with glass overlay)
  - Label (form fields with blue focus)
  - ThemeToggle (3D animated sun/moon with spring physics and gradient spheres)
  
- **Customizations**: 
  - GlassCard component with backdrop-blur-12 and semi-transparent backgrounds
  - 3D ThemeToggle with rotateY animation and luxury spring physics
  - Custom noise texture overlay on body (0.5% opacity for depth)
  - Animated link underlines that grow from left to right
  - Page fade-in animation with upward motion
  - Territory map using SVG for Texas counties
  - Custom stat cards with large numbers and Phosphor icons
  - Custom job scope result card with price slider
  - Custom file upload zones with drag-and-drop
  - Custom lightbox with smooth scale animations
  - Custom instant invite widget with real-time validation

- **States**: 
  - Buttons: default, hover (scale-105 + brightness + shadow-md + translate-y-[-2px]), active (scale-95), disabled (opacity-50)
  - Inputs: default (border-input), focus (border-primary + ring), error (border-destructive), minimum 44px height
  - Cards: default (shadow-sm + rounded-lg), hover (shadow-md + translate-y-[-2px])
  - Theme: light (white background) and dark (deep dark background) with smooth 0.4s fade transition
  
- **Icon Selection**: 
  - Phosphor icons throughout (Wrench for jobs, House for homeowner, Hammer for contractor, MapPin for territory, CurrencyDollar for invoices, Crown for Pro, Users for CRM, EnvelopeSimple for email invites, DeviceMobile for SMS invites, PaperPlaneRight for sending invites, Note for customer notes, Sun for light mode, Moon for dark mode)

- **Spacing**: 
  - Container padding: px-4 md:px-8
  - Section gaps: gap-6 md:gap-8
  - Card padding: p-4 md:p-6
  - Button padding: px-6 py-3
  - All spacing uses 4px increments (4, 8, 12, 16, 24px)

- **Mobile**: 
  - Stack navigation horizontally on desktop, collapse items on mobile with responsive breakpoints
  - Single column layouts below md breakpoint
  - Touch-friendly 44px minimum tap targets on all interactive elements
  - Full-width cards and buttons on mobile
  - Simplified table → card list transformation on mobile with stacked layouts
  - Text minimum 16px for readability
  - Lightbox photos support pinch-to-zoom gesture
  - No horizontal scrolling at any breakpoint
