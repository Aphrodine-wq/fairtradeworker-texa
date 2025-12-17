import { ReactNode } from 'react';
import { 
  Briefcase, 
  ClipboardText, 
  CurrencyDollar, 
  Handshake,
  HardHat,
  House,
  Lightning,
  MagnifyingGlass,
  Newspaper,
  Star,
  UsersThree
} from '@phosphor-icons/react';

type EmptyStateType = 
  | 'jobs'
  | 'bids'
  | 'leads'
  | 'invoices'
  | 'reviews'
  | 'contractors'
  | 'messages'
  | 'projects'
  | 'search'
  | 'custom';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const emptyStateConfig: Record<Exclude<EmptyStateType, 'custom'>, {
  icon: ReactNode;
  title: string;
  message: string;
  encouragement: string;
}> = {
  jobs: {
    icon: <Briefcase size={48} weight="bold" />,
    title: "NO JOBS YET",
    message: "New jobs are posted every day. Check back soon or set up job alerts to get notified instantly.",
    encouragement: "Your next opportunity is around the corner."
  },
  bids: {
    icon: <CurrencyDollar size={48} weight="bold" />,
    title: "NO BIDS SUBMITTED",
    message: "Browse available jobs in your area and submit your first bid. Remember: you keep 100% of what you earn.",
    encouragement: "Every successful contractor started with their first bid."
  },
  leads: {
    icon: <UsersThree size={48} weight="bold" />,
    title: "NO LEADS YET",
    message: "Your leads will appear here as homeowners reach out. Make sure your profile is complete to attract more attention.",
    encouragement: "A complete profile gets 3x more leads."
  },
  invoices: {
    icon: <ClipboardText size={48} weight="bold" />,
    title: "NO INVOICES",
    message: "Once you complete jobs, create invoices right here. Professional, trackable, and yours to keep.",
    encouragement: "Your first invoice is waiting to be created."
  },
  reviews: {
    icon: <Star size={48} weight="bold" />,
    title: "NO REVIEWS YET",
    message: "Complete your first job and ask happy customers for reviews. Great reviews lead to more work.",
    encouragement: "Quality work speaks for itself."
  },
  contractors: {
    icon: <HardHat size={48} weight="bold" />,
    title: "NO CONTRACTORS SAVED",
    message: "When you find contractors you like, save them here for quick access on future projects.",
    encouragement: "Build your trusted network."
  },
  messages: {
    icon: <Handshake size={48} weight="bold" />,
    title: "NO MESSAGES",
    message: "Your conversations with homeowners and contractors will appear here. Direct communication, no middlemen.",
    encouragement: "Clear communication leads to great results."
  },
  projects: {
    icon: <House size={48} weight="bold" />,
    title: "NO PROJECTS",
    message: "Ready to improve your home? Post your first project and get bids from local contractors.",
    encouragement: "Start your home improvement journey."
  },
  search: {
    icon: <MagnifyingGlass size={48} weight="bold" />,
    title: "NO RESULTS FOUND",
    message: "Try adjusting your filters or search terms. Sometimes broadening your criteria helps.",
    encouragement: "Keep searching — the right match is out there."
  }
};

export function EmptyState({ 
  type, 
  title, 
  message, 
  action,
  icon 
}: EmptyStateProps) {
  const config = type !== 'custom' ? emptyStateConfig[type] : null;
  
  const displayIcon = icon || config?.icon || <Lightning size={48} weight="bold" />;
  const displayTitle = title || config?.title || "NOTHING HERE YET";
  const displayMessage = message || config?.message || "This section is empty. Take action to fill it up!";
  const encouragement = config?.encouragement;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon container with brutalist styling */}
      <div className="bg-white/90 backdrop-blur-sm border border-white/10 p-6 shadow-lg mb-6 rounded-lg">
        <div className="text-black">
          {displayIcon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-black text-2xl uppercase tracking-tight mb-3">
        {displayTitle}
      </h3>
      
      {/* Message */}
      <p className="text-base max-w-md mb-4 leading-relaxed">
        {displayMessage}
      </p>
      
      {/* Encouragement (subtle, supportive) */}
      {encouragement && (
        <p className="font-mono text-sm text-black/70 mb-6 border-l-4 border-[#00FF00] pl-3">
          {encouragement}
        </p>
      )}
      
      {/* Action button slot */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}

// Quick-use variants for common cases
export function EmptyJobs({ action }: { action?: ReactNode }) {
  return <EmptyState type="jobs" action={action} />;
}

export function EmptyBids({ action }: { action?: ReactNode }) {
  return <EmptyState type="bids" action={action} />;
}

export function EmptyLeads({ action }: { action?: ReactNode }) {
  return <EmptyState type="leads" action={action} />;
}

export function EmptyInvoices({ action }: { action?: ReactNode }) {
  return <EmptyState type="invoices" action={action} />;
}

export function EmptyReviews({ action }: { action?: ReactNode }) {
  return <EmptyState type="reviews" action={action} />;
}

export function EmptyContractors({ action }: { action?: ReactNode }) {
  return <EmptyState type="contractors" action={action} />;
}

export function EmptyMessages({ action }: { action?: ReactNode }) {
  return <EmptyState type="messages" action={action} />;
}

export function EmptyProjects({ action }: { action?: ReactNode }) {
  return <EmptyState type="projects" action={action} />;
}

export function NoSearchResults({ action }: { action?: ReactNode }) {
  return <EmptyState type="search" action={action} />;
}
