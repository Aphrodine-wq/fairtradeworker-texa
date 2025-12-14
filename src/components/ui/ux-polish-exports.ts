// FairTradeWorker UX Polish Components
// These components make the platform feel more welcoming and user-friendly
// without adding new features

// Empty States - Friendly placeholders when there's no data
export {
  EmptyState,
  EmptyJobs,
  EmptyBids,
  EmptyLeads,
  EmptyInvoices,
  EmptyReviews,
  EmptyContractors,
  EmptyMessages,
  EmptyProjects,
  NoSearchResults
} from './EmptyState';

// Onboarding - Help new users get started
export {
  OnboardingChecklist,
  ContractorOnboarding,
  HomeownerOnboarding,
  contractorChecklistItems,
  homeownerChecklistItems
} from './OnboardingChecklist';

// Help Tips - Contextual guidance throughout the UI
export {
  HelpTip,
  BidTip,
  FirstJobTip,
  ProfileCompletionTip,
  SavedSearchTip,
  InvoiceTip,
  WelcomeBackTip,
  FeatureHelp
} from './HelpTip';

// Welcome Experience - First-time user greetings
export {
  WelcomeBanner,
  WelcomeBar,
  ValueReminder
} from './WelcomeBanner';

// Quick Actions - Clear next steps for users
export {
  QuickAction,
  QuickActionsGrid,
  ContractorQuickActions,
  HomeownerQuickActions,
  MilestoneCelebration,
  useMilestoneCelebration
} from './QuickActions';

// Loading States - Polished loading experiences
export {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  SkeletonGrid,
  TableRowSkeleton
} from './LoadingStates';

// Status Indicators - Clear visual feedback
export {
  StatusBadge,
  JobStatus,
  ProgressBar,
  StepProgress,
  NotificationBadge
} from './LoadingStates';

// Error States - Friendly error handling
export {
  ErrorState,
  NetworkError,
  NotFoundError,
  ServerError
} from './Feedback';

// User Feedback - Toasts and confirmations
export {
  FeedbackToast,
  ToastContainer,
  BidSubmittedToast,
  InvoiceSentToast,
  ProfileSavedToast,
  SavedToast,
  FieldFeedback,
  ConfirmDialog
} from './Feedback';
