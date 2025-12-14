# FairTradeWorker Software Flows

## Complete User Journey Documentation

### 1. User Registration & Onboarding Flow

```
Homepage
  ↓
Select Role (Homeowner/Contractor/Operator)
  ↓
Signup Form
  ├─ Email, Password, Full Name
  ├─ Role-specific fields
  └─ Terms acceptance
  ↓
Account Created
  ↓
Role-specific Dashboard
  ├─ Homeowner → HomeownerDashboard
  ├─ Contractor → ContractorDashboard
  └─ Operator → OperatorDashboard
  ↓
Onboarding Checklist (First-time users)
  ├─ Complete profile
  ├─ Add portfolio photos (contractors)
  ├─ Post first job (homeowners)
  └─ Explore tools
  ↓
Welcome Banner (Dismissible)
  ↓
Ready to Use Platform
```

### 2. Homeowner Job Posting Flow

```
Homeowner Dashboard
  ↓
Click "Post Job"
  ↓
Job Posting Page
  ├─ Input Method Selection
  │   ├─ Upload Photos
  │   ├─ Record Video
  │   ├─ Record Audio
  │   └─ Type Description
  ↓
AI Scoping (60 seconds)
  ├─ Photo Analysis (if photos)
  ├─ Scope Generation
  ├─ Price Estimation
  └─ Materials List
  ↓
Review AI Scope
  ├─ Edit if needed
  ├─ Confirm details
  └─ Set urgency (optional)
  ↓
Post Job
  ├─ Job created
  ├─ Referral code generated
  └─ Success message
  ↓
Job Listed in Marketplace
  ├─ Contractors see job
  ├─ Bids start coming in
  └─ Homeowner receives notifications
  ↓
Review Bids
  ├─ Compare prices
  ├─ Check contractor profiles
  └─ Read bid messages
  ↓
Accept Bid
  ├─ Job status → "in-progress"
  ├─ Contractor notified
  └─ Milestones created (for large jobs)
  ↓
Track Progress
  ├─ View milestones
  ├─ See project updates
  └─ Review photos
  ↓
Job Completed
  ├─ Final payment processed
  ├─ Review/rating prompt
  └─ Job archived
```

### 3. Contractor Bidding Flow

```
Contractor Dashboard
  ↓
Browse Jobs
  ├─ Filter by size (small/medium/large)
  ├─ View map or list
  └─ See priority leads (operators only)
  ↓
View Job Details
  ├─ Read AI scope
  ├─ View photos
  ├─ Check materials needed
  └─ See bid intelligence
  ↓
Submit Bid
  ├─ Enter bid amount
  ├─ Write message
  ├─ Use template (optional)
  └─ Save as template (optional)
  ↓
Bid Submitted
  ├─ Success toast
  ├─ Bid appears in "My Bids"
  └─ Homeowner notified
  ↓
Wait for Response
  ├─ Bid status: "pending"
  ├─ Can view other bids (if accepted)
  └─ Receive notification if accepted
  ↓
Bid Accepted
  ├─ Job status → "in-progress"
  ├─ Access job details
  └─ Start work
  ↓
Complete Work
  ├─ Upload progress photos
  ├─ Update milestones
  └─ Mark complete
  ↓
Create Invoice
  ├─ Auto-populated from job
  ├─ Add line items
  └─ Send to homeowner
  ↓
Receive Payment
  ├─ 100% of bid amount
  ├─ No platform fees
  └─ Payment processed
```

### 4. Operator Territory Management Flow

```
Operator Dashboard
  ↓
View Territory Map
  ├─ See available counties
  ├─ View claimed territory
  └─ Check territory health
  ↓
Claim Territory (if not claimed)
  ├─ Select county
  ├─ View preview
  └─ Confirm claim
  ↓
Monitor Territory
  ├─ View jobs in territory
  ├─ Track contractor activity
  ├─ Monitor homeowner activity
  └─ View territory metrics
  ↓
Priority Leads (10 min early access)
  ├─ See new jobs immediately
  ├─ "PRIORITY LEAD" badge
  └─ 10 minutes before contractors
  ↓
Business Tools Access
  ├─ Same tools as contractors
  ├─ CRM, Invoicing, etc.
  └─ Territory-specific analytics
  ↓
Territory Challenges (Future)
  ├─ Create promotions
  ├─ Track performance
  └─ Reward winners
```

### 5. Business Tools Flow

```
Navigate to Business Tools
  ↓
View Tool Categories
  ├─ All Tools
  ├─ Free Tools (no PRO badge)
  ├─ Finance
  ├─ Sales & CRM
  ├─ Management
  ├─ Operations
  ├─ Analytics
  └─ Automation
  ↓
Select Tool
  ├─ Click tool card
  └─ Tool component loads
  ↓
Use Tool
  ├─ Interact with tool
  ├─ Save data
  └─ Export if available
  ↓
Navigate Back
  └─ Return to Business Tools
```

### 6. Free Tools Flow (Homeowners)

```
Navigate to Free Tools
  ↓
View Available Tools
  ├─ Saved Contractors
  ├─ Quick Notes
  ├─ Project Budget Calculator
  └─ Warranty Tracker
  ↓
Select Tool
  ├─ Tool component loads
  └─ Use tool features
  ↓
Save Data
  └─ Stored in local storage
```

### 7. Payment Processing Flow

```
Job Completed
  ↓
Contractor Creates Invoice
  ├─ Line items added
  ├─ Total calculated
  └─ Sent to homeowner
  ↓
Homeowner Reviews Invoice
  ├─ View details
  ├─ Check line items
  └─ Approve payment
  ↓
Payment Processing
  ├─ Stripe integration
  ├─ Payment processed
  └─ Funds transferred
  ↓
Payment Confirmed
  ├─ Contractor receives 100%
  ├─ Invoice marked "paid"
  └─ Receipt generated
```

### 8. AI Receptionist Flow (Pro Feature)

```
Incoming Call
  ↓
AI Answers
  ├─ Natural voice conversation
  ├─ Transcribes call
  └─ Extracts job details
  ↓
Job Details Extracted
  ├─ Scope identified
  ├─ Urgency detected
  └─ Requirements captured
  ↓
Private Job Created
  ├─ Added to contractor's CRM
  ├─ Not visible in marketplace
  └─ Contractor notified
  ↓
Text Sent to Caller
  ├─ Onboarding link
  └─ Next steps
  ↓
Follow-up Sequence
  ├─ Automated messages
  └─ Convert to public job if needed
```

### 9. Milestone Payment Flow (Large Jobs)

```
Large Job Accepted
  ↓
Milestones Created
  ├─ Based on project type
  ├─ Payment schedule set
  └─ Percentages assigned
  ↓
Contractor Completes Milestone
  ├─ Uploads progress
  ├─ Marks milestone complete
  └─ Requests payment
  ↓
Homeowner Reviews
  ├─ Checks work
  ├─ Approves milestone
  └─ Payment released
  ↓
Repeat for Each Milestone
  ↓
Final Payment
  └─ Job complete
```

### 10. Search & Filter Flow

```
Browse Jobs Page
  ↓
Apply Filters
  ├─ Job size (small/medium/large)
  ├─ Location (if map view)
  └─ Status (open/in-progress)
  ↓
View Results
  ├─ List view
  └─ Map view
  ↓
Sort Options
  ├─ Newest first
  ├─ Price range
  └─ Number of bids
  ↓
Select Job
  └─ View details
```

### 11. Profile Management Flow

```
Navigate to Profile
  ↓
Edit Profile
  ├─ Update contact info
  ├─ Add portfolio photos
  ├─ Set service area
  └─ Add certifications
  ↓
Save Changes
  ├─ Profile updated
  ├─ Completion % calculated
  └─ Success message
```

### 12. Notification Flow

```
Event Occurs
  ├─ New job posted
  ├─ Bid received
  ├─ Bid accepted
  ├─ Payment received
  └─ Milestone update
  ↓
Notification Created
  ├─ Stored in system
  └─ Badge count updated
  ↓
User Sees Notification
  ├─ Notification center
  ├─ Badge on icon
  └─ Toast message (optional)
  ↓
User Clicks Notification
  └─ Navigate to relevant page
```

---

## Key Features by User Type

### Homeowners
- Post jobs (photo/video/audio/text)
- Review bids
- Accept/reject bids
- Track project progress
- Make payments
- Leave reviews
- Free tools access

### Contractors
- Browse jobs
- Submit bids (0% fees)
- Manage jobs
- Create invoices
- Track expenses
- Use business tools (most free)
- Build portfolio
- Access Pro features ($50/month)

### Operators
- Claim territories
- Monitor territory health
- View territory analytics
- Priority leads (10 min early)
- Business tools access
- Territory challenges (future)

---

## Data Flow

### Job Creation
```
User Input → AI Scoping → Job Object → Local Storage/KV → Display in Marketplace
```

### Bid Submission
```
Bid Form → Bid Object → Added to Job.bids[] → Local Storage/KV → Homeowner Notification
```

### Payment Processing
```
Invoice → Stripe API → Payment Processed → Funds Transferred → Status Updated
```

### Data Persistence
```
All data stored in:
- Local Storage (via useLocalKV hook)
- Spark KV (production)
- No backend required (client-side only)
```

---

## Error Handling Flows

### Network Error
```
Error Detected → NetworkError Component → Retry Button → Retry Request
```

### Image Load Error
```
Image Fails → onError Handler → Placeholder Image → User Sees Fallback
```

### Form Validation Error
```
Submit Form → Validation Check → FieldFeedback Component → User Corrects → Resubmit
```

---

## State Management

### Global State (via useLocalKV)
- Current user
- Jobs array
- Invoices array
- Territories array
- Bid templates
- Users array

### Component State
- Form inputs
- UI state (modals, dialogs)
- Filter selections
- View modes

---

## Navigation Flow

```
App.tsx (Router)
  ├─ Home → HomePage
  ├─ Login → LoginPage
  ├─ Signup → SignupPage
  ├─ Dashboard → Role-specific dashboard
  ├─ Browse Jobs → BrowseJobs
  ├─ Post Job → JobPoster
  ├─ My Jobs → MyJobs
  ├─ Business Tools → BusinessTools
  ├─ Free Tools → FreeToolsPage
  ├─ CRM → EnhancedCRM
  ├─ Invoices → InvoiceManager
  └─ ... (other pages)
```

---

## Integration Points

### Stripe Payments
- Invoice payment processing
- Payment status tracking
- Receipt generation

### OpenAI (Future)
- AI photo scoping
- AI receptionist
- AI bid optimization

### Twilio (Future)
- SMS notifications
- AI receptionist calls

### SendGrid (Future)
- Email notifications
- Automated follow-ups

---

## Performance Optimizations

### Code Splitting
- Lazy loading for heavy components
- Route-based code splitting
- Dynamic imports

### Image Optimization
- OptimizedImage component
- Lazy loading
- Error handling
- Placeholder fallbacks

### State Management
- Local storage caching
- KV storage for persistence
- Optimistic updates

---

## Security Considerations

### Client-Side Only
- No backend authentication required
- Local storage for data
- Demo mode available

### Data Validation
- Form validation
- Type checking (TypeScript)
- Input sanitization

---

## Testing Flows

### Unit Tests
- Component rendering
- Function logic
- State management

### Integration Tests
- User workflows
- Data persistence
- Navigation

### E2E Tests
- Complete user journeys
- Cross-browser testing
- Performance testing
