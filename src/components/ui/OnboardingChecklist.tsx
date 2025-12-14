import { useState, useEffect } from 'react';
import { 
  Check, 
  Circle,
  ArrowRight,
  Trophy,
  X
} from '@phosphor-icons/react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action?: () => void;
  href?: string;
}

interface OnboardingChecklistProps {
  userType: 'contractor' | 'homeowner';
  items: ChecklistItem[];
  onComplete?: () => void;
  onDismiss?: () => void;
  storageKey?: string;
}

// Default checklist items for contractors
export const contractorChecklistItems: Omit<ChecklistItem, 'completed' | 'action'>[] = [
  {
    id: 'profile',
    label: 'Complete your profile',
    description: 'Add your trades, service area, and contact info',
    href: '/contractor/profile'
  },
  {
    id: 'portfolio',
    label: 'Add portfolio photos',
    description: 'Show off your best work to win more bids',
    href: '/contractor/portfolio'
  },
  {
    id: 'browse',
    label: 'Browse available jobs',
    description: 'Find jobs in your area that match your skills',
    href: '/jobs'
  },
  {
    id: 'bid',
    label: 'Submit your first bid',
    description: 'Remember: you keep 100% of what you earn',
    href: '/jobs'
  },
  {
    id: 'tools',
    label: 'Explore business tools',
    description: 'Free invoicing, expense tracking, and more',
    href: '/contractor/tools'
  }
];

// Default checklist items for homeowners
export const homeownerChecklistItems: Omit<ChecklistItem, 'completed' | 'action'>[] = [
  {
    id: 'profile',
    label: 'Set up your profile',
    description: 'Add your contact info and preferences',
    href: '/homeowner/profile'
  },
  {
    id: 'post',
    label: 'Post your first project',
    description: 'Describe what you need done with photos',
    href: '/post-job'
  },
  {
    id: 'review',
    label: 'Review contractor bids',
    description: 'Compare quotes and check ratings',
    href: '/homeowner/projects'
  },
  {
    id: 'hire',
    label: 'Hire a contractor',
    description: 'Choose the best fit for your project',
    href: '/homeowner/projects'
  },
  {
    id: 'tools',
    label: 'Check out free tools',
    description: 'Budget calculator, warranty tracker, and more',
    href: '/homeowner/tools'
  }
];

export function OnboardingChecklist({
  userType,
  items,
  onComplete,
  onDismiss,
  storageKey = 'ftw:onboarding'
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(items);
  
  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dismissed) {
        setDismissed(true);
      }
      if (parsed.completed) {
        setChecklistItems(prev => 
          prev.map(item => ({
            ...item,
            completed: parsed.completed.includes(item.id)
          }))
        );
      }
    }
  }, [storageKey]);

  // Save state changes
  useEffect(() => {
    const completedIds = checklistItems.filter(i => i.completed).map(i => i.id);
    localStorage.setItem(storageKey, JSON.stringify({
      dismissed,
      completed: completedIds
    }));
    
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [checklistItems, dismissed, storageKey, isComplete, onComplete]);

  const handleToggle = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed && !isComplete) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 font-mono text-sm border-2 border-black shadow-[3px_3px_0_#00FF00] hover:shadow-[4px_4px_0_#00FF00] transition-shadow z-50"
      >
        Show Getting Started ({completedCount}/{totalCount})
      </button>
    );
  }

  if (dismissed && isComplete) {
    return null;
  }

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-black text-xl uppercase tracking-tight mb-1">
            {isComplete ? '🎉 ALL DONE!' : 'GETTING STARTED'}
          </h2>
          <p className="text-sm">
            {isComplete 
              ? `You're all set up and ready to go!`
              : `Welcome to FairTradeWorker! Let's get you set up.`
            }
          </p>
        </div>
        
        {!isComplete && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-black/10 transition-colors"
            aria-label="Dismiss checklist"
          >
            <X size={20} weight="bold" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-sm">PROGRESS</span>
          <span className="font-mono text-sm font-bold">{progressPercent}%</span>
        </div>
        <div className="h-4 bg-white border-2 border-black">
          <div 
            className="h-full bg-[#00FF00] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <ul className="space-y-3">
        {checklistItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleToggle(item.id)}
              className={`
                w-full flex items-start gap-4 p-4 text-left transition-all
                border-2 border-black
                ${item.completed 
                  ? 'bg-[#00FF00]/20 shadow-[2px_2px_0_#000]' 
                  : 'bg-white shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                }
              `}
            >
              {/* Checkbox */}
              <div className={`
                flex-shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center
                ${item.completed ? 'bg-[#00FF00]' : 'bg-white'}
              `}>
                {item.completed && <Check size={16} weight="bold" />}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`
                  font-bold uppercase text-sm block
                  ${item.completed ? 'line-through opacity-70' : ''}
                `}>
                  {item.label}
                </span>
                <span className={`
                  text-xs block mt-1
                  ${item.completed ? 'opacity-50' : 'opacity-70'}
                `}>
                  {item.description}
                </span>
              </div>

              {/* Arrow for incomplete items */}
              {!item.completed && item.href && (
                <ArrowRight size={20} weight="bold" className="flex-shrink-0 opacity-50" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Completion celebration */}
      {isComplete && (
        <div className="mt-6 p-4 bg-[#00FF00] border-2 border-black">
          <div className="flex items-center gap-3">
            <Trophy size={32} weight="fill" />
            <div>
              <p className="font-black uppercase">YOU'RE READY!</p>
              <p className="text-sm">
                {userType === 'contractor' 
                  ? "Start bidding on jobs. Remember: you keep 100%."
                  : "Post a project and get bids from local contractors."
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-configured versions for quick use
export function ContractorOnboarding({ 
  completedItems = [],
  onComplete,
  onDismiss 
}: { 
  completedItems?: string[];
  onComplete?: () => void;
  onDismiss?: () => void;
}) {
  const items = contractorChecklistItems.map(item => ({
    ...item,
    completed: completedItems.includes(item.id)
  }));
  
  return (
    <OnboardingChecklist
      userType="contractor"
      items={items}
      onComplete={onComplete}
      onDismiss={onDismiss}
      storageKey="ftw:contractor-onboarding"
    />
  );
}

export function HomeownerOnboarding({ 
  completedItems = [],
  onComplete,
  onDismiss 
}: { 
  completedItems?: string[];
  onComplete?: () => void;
  onDismiss?: () => void;
}) {
  const items = homeownerChecklistItems.map(item => ({
    ...item,
    completed: completedItems.includes(item.id)
  }));
  
  return (
    <OnboardingChecklist
      userType="homeowner"
      items={items}
      onComplete={onComplete}
      onDismiss={onDismiss}
      storageKey="ftw:homeowner-onboarding"
    />
  );
}
