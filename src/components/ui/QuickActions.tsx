import { ReactNode } from 'react';
import { 
  ArrowRight,
  Briefcase,
  Camera,
  ClipboardText,
  CurrencyDollar,
  House,
  Lightning,
  MagnifyingGlass,
  Plus,
  Star,
  Trophy,
  UserCircle
} from '@phosphor-icons/react';

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  highlight?: boolean;
  badge?: string;
}

export function QuickAction({
  icon,
  title,
  description,
  href,
  highlight = false,
  badge
}: QuickActionProps) {
  return (
    <a
      href={href}
      className={`
        block p-4 border border-white/10 transition-all rounded-lg
        ${highlight 
          ? 'bg-[#00FF00]/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-0.5' 
          : 'bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-0.5'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 p-2 border border-white/10 rounded-md
          ${highlight ? 'bg-black text-[#00FF00]' : 'bg-white'}
        `}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-black uppercase text-sm">{title}</h3>
            {badge && (
              <span className="font-mono text-xs bg-[#FFFF00] px-2 py-0.5 border-0 shadow-sm">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs opacity-70 mt-1">{description}</p>
        </div>
        
        {/* Arrow */}
        <ArrowRight size={20} weight="bold" className="flex-shrink-0 opacity-50" />
      </div>
    </a>
  );
}

// Grid container for quick actions
interface QuickActionsGridProps {
  title?: string;
  children: ReactNode;
}

export function QuickActionsGrid({ title, children }: QuickActionsGridProps) {
  return (
    <div className="mb-6">
      {title && (
        <h2 className="font-black uppercase text-lg mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

// Pre-built quick action sets for contractors
export function ContractorQuickActions() {
  return (
    <QuickActionsGrid title="Quick Actions">
      <QuickAction
        icon={<MagnifyingGlass size={24} weight="bold" />}
        title="Browse Jobs"
        description="Find new opportunities in your area"
        href="/jobs"
        highlight
        badge="12 NEW"
      />
      <QuickAction
        icon={<CurrencyDollar size={24} weight="bold" />}
        title="My Bids"
        description="Track your submitted bids"
        href="/contractor/bids"
      />
      <QuickAction
        icon={<ClipboardText size={24} weight="bold" />}
        title="Create Invoice"
        description="Bill your customers professionally"
        href="/contractor/invoices/new"
      />
      <QuickAction
        icon={<Camera size={24} weight="bold" />}
        title="Add Portfolio Photos"
        description="Show off your best work"
        href="/contractor/portfolio"
      />
      <QuickAction
        icon={<UserCircle size={24} weight="bold" />}
        title="Edit Profile"
        description="Keep your info up to date"
        href="/contractor/profile"
      />
      <QuickAction
        icon={<Briefcase size={24} weight="bold" />}
        title="Business Tools"
        description="Free CRM, scheduling, and more"
        href="/contractor/tools"
      />
    </QuickActionsGrid>
  );
}

// Pre-built quick action sets for homeowners
export function HomeownerQuickActions() {
  return (
    <QuickActionsGrid title="What would you like to do?">
      <QuickAction
        icon={<Plus size={24} weight="bold" />}
        title="Post a Project"
        description="Get bids from local contractors"
        href="/post-job"
        highlight
      />
      <QuickAction
        icon={<House size={24} weight="bold" />}
        title="My Projects"
        description="View your active and past projects"
        href="/homeowner/projects"
      />
      <QuickAction
        icon={<Star size={24} weight="bold" />}
        title="Saved Contractors"
        description="Quick access to trusted pros"
        href="/homeowner/saved-contractors"
      />
      <QuickAction
        icon={<ClipboardText size={24} weight="bold" />}
        title="Budget Calculator"
        description="Estimate your project costs"
        href="/homeowner/tools/budget"
      />
    </QuickActionsGrid>
  );
}

// =========================================
// MILESTONE CELEBRATIONS
// =========================================

interface MilestoneProps {
  type: 'first-bid' | 'first-win' | 'portfolio' | 'earnings' | 'reviews' | 'custom';
  value?: string | number;
  onDismiss?: () => void;
}

const milestoneConfig = {
  'first-bid': {
    icon: <Lightning size={32} weight="fill" />,
    title: "FIRST BID SUBMITTED! 🎉",
    message: "You're officially in the game. Remember: you keep 100% of what you earn here.",
    encouragement: "Most contractors win their first job within 2 weeks of consistent bidding."
  },
  'first-win': {
    icon: <Trophy size={32} weight="fill" />,
    title: "YOU WON YOUR FIRST JOB! 🏆",
    message: "Congratulations! Your skills got you here. Now go crush it.",
    encouragement: "The first one is always the hardest. It only gets easier from here."
  },
  'portfolio': {
    icon: <Camera size={32} weight="bold" />,
    title: "PORTFOLIO COMPLETE! 📸",
    message: "Looking professional! Contractors with complete portfolios win 2x more jobs.",
    encouragement: "Your work speaks for itself now."
  },
  'earnings': {
    icon: <CurrencyDollar size={32} weight="bold" />,
    title: "EARNINGS MILESTONE! 💰",
    message: "And you kept every single dollar. No cuts. No fees.",
    encouragement: "On other platforms, you would have lost 15-30% of this."
  },
  'reviews': {
    icon: <Star size={32} weight="fill" />,
    title: "5-STAR REVIEW! ⭐",
    message: "Quality work gets recognized. Your reputation is growing.",
    encouragement: "Great reviews are the best marketing money can't buy."
  },
  'custom': {
    icon: <Trophy size={32} weight="fill" />,
    title: "ACHIEVEMENT UNLOCKED!",
    message: "Keep going!",
    encouragement: ""
  }
};

export function MilestoneCelebration({ type, value, onDismiss }: MilestoneProps) {
  const config = milestoneConfig[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white/95 backdrop-blur-lg border border-white/10 shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200 rounded-lg">
        {/* Header with icon */}
        <div className="bg-[#00FF00] p-6 text-center border-b-4 border-gray-200 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-black mb-4">
            {config.icon}
          </div>
          <h2 className="font-black text-2xl uppercase">{config.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {value && (
            <p className="font-mono text-4xl font-black mb-4">
              {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
            </p>
          )}
          <p className="text-lg mb-4">{config.message}</p>
          {config.encouragement && (
            <p className="text-sm opacity-70 italic">{config.encouragement}</p>
          )}
        </div>

        {/* Action */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onDismiss}
            className="w-full bg-black text-white py-3 font-black uppercase text-lg hover:bg-gray-800 transition-colors rounded-md shadow-md"
          >
            LET'S GO!
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to trigger celebrations
export function useMilestoneCelebration() {
  // This would typically use a state management system
  // For now, returns helper functions for integration
  return {
    celebrate: (type: MilestoneProps['type'], value?: string | number) => {
      // Trigger celebration modal
      console.log('Celebrate:', type, value);
    },
    checkMilestones: (userData: {
      bidCount?: number;
      jobsWon?: number;
      portfolioPhotos?: number;
      totalEarnings?: number;
      avgRating?: number;
    }) => {
      // Check for new milestones and trigger celebrations
      const milestones: string[] = [];
      
      if (userData.bidCount === 1) milestones.push('first-bid');
      if (userData.jobsWon === 1) milestones.push('first-win');
      if (userData.portfolioPhotos && userData.portfolioPhotos >= 5) milestones.push('portfolio');
      if (userData.totalEarnings && userData.totalEarnings >= 1000) milestones.push('earnings');
      if (userData.avgRating && userData.avgRating >= 5) milestones.push('reviews');
      
      return milestones;
    }
  };
}
