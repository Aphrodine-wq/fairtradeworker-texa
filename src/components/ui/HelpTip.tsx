import { useState, useEffect, ReactNode } from 'react';
import { 
  Lightbulb, 
  X, 
  Info,
  Lightning,
  CurrencyDollar,
  Star,
  ArrowRight,
  Question
} from '@phosphor-icons/react';

type TipVariant = 'info' | 'tip' | 'money' | 'highlight' | 'help';

interface HelpTipProps {
  id: string;
  title?: string;
  children: ReactNode;
  variant?: TipVariant;
  dismissible?: boolean;
  showOnce?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig: Record<TipVariant, {
  icon: ReactNode;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}> = {
  info: {
    icon: <Info size={20} weight="bold" />,
    bgColor: 'bg-white',
    borderColor: 'border-black',
    accentColor: 'bg-black'
  },
  tip: {
    icon: <Lightbulb size={20} weight="bold" />,
    bgColor: 'bg-[#FFFF00]/20',
    borderColor: 'border-black',
    accentColor: 'bg-[#FFFF00]'
  },
  money: {
    icon: <CurrencyDollar size={20} weight="bold" />,
    bgColor: 'bg-[#00FF00]/10',
    borderColor: 'border-black',
    accentColor: 'bg-[#00FF00]'
  },
  highlight: {
    icon: <Lightning size={20} weight="fill" />,
    bgColor: 'bg-white',
    borderColor: 'border-black',
    accentColor: 'bg-[#00FF00]'
  },
  help: {
    icon: <Question size={20} weight="bold" />,
    bgColor: 'bg-white',
    borderColor: 'border-black',
    accentColor: 'bg-black'
  }
};

export function HelpTip({
  id,
  title,
  children,
  variant = 'tip',
  dismissible = true,
  showOnce = false,
  action
}: HelpTipProps) {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `ftw:tip:${id}`;

  useEffect(() => {
    if (showOnce) {
      const wasDismissed = localStorage.getItem(storageKey);
      if (wasDismissed) {
        setDismissed(true);
      }
    }
  }, [showOnce, storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (showOnce) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (dismissed) return null;

  const config = variantConfig[variant];

  return (
    <div className={`
      ${config.bgColor} 
      border-2 ${config.borderColor} 
      shadow-[3px_3px_0_#000]
      relative
    `}>
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentColor}`} />
      
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-bold uppercase text-sm mb-1">{title}</p>
            )}
            <div className="text-sm leading-relaxed">
              {children}
            </div>
            
            {action && (
              <button
                onClick={action.onClick}
                className="mt-3 inline-flex items-center gap-2 font-bold text-sm uppercase hover:underline underline-offset-2"
              >
                {action.label}
                <ArrowRight size={14} weight="bold" />
              </button>
            )}
          </div>
          
          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-black/10 transition-colors -mr-1 -mt-1"
              aria-label="Dismiss tip"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-built contextual tips for common scenarios
export function BidTip() {
  return (
    <HelpTip
      id="bid-tip"
      variant="money"
      title="Keep 100%"
      showOnce
    >
      Unlike other platforms that take 15-30%, you keep every dollar you earn here. 
      No hidden fees. No cuts. That $5,000 job? You get $5,000.
    </HelpTip>
  );
}

export function FirstJobTip() {
  return (
    <HelpTip
      id="first-job"
      variant="tip"
      title="Quick Tip"
      showOnce
    >
      Include clear photos of your past work in your bid response. 
      Contractors with portfolio photos win 2x more jobs.
    </HelpTip>
  );
}

export function ProfileCompletionTip({ completionPercent }: { completionPercent: number }) {
  if (completionPercent >= 90) return null;
  
  return (
    <HelpTip
      id="profile-completion"
      variant="highlight"
      title={`Profile ${completionPercent}% Complete`}
    >
      Complete profiles get 3x more visibility. Add your service area, 
      trades, and at least 3 portfolio photos to stand out.
    </HelpTip>
  );
}

export function SavedSearchTip() {
  return (
    <HelpTip
      id="saved-search"
      variant="info"
      title="Save This Search"
      showOnce
    >
      Save your search filters to get instant browser notifications 
      when matching jobs are posted. Never miss an opportunity.
    </HelpTip>
  );
}

export function InvoiceTip() {
  return (
    <HelpTip
      id="invoice-tip"
      variant="tip"
      showOnce
    >
      Pro tip: Send invoices within 24 hours of job completion. 
      Quick invoicing means faster payment.
    </HelpTip>
  );
}

export function WelcomeBackTip({ name, daysSinceLastVisit }: { name: string; daysSinceLastVisit: number }) {
  if (daysSinceLastVisit < 3) return null;
  
  return (
    <HelpTip
      id="welcome-back"
      variant="highlight"
      dismissible
    >
      Welcome back, <strong>{name}</strong>! {daysSinceLastVisit} new jobs 
      have been posted in your area since your last visit.
    </HelpTip>
  );
}

// Inline help for specific features
export function FeatureHelp({ 
  feature,
  children 
}: { 
  feature: string;
  children: ReactNode;
}) {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="inline-flex items-center justify-center w-5 h-5 border border-black rounded-full text-xs font-bold hover:bg-black hover:text-white transition-colors"
        aria-label={`Help for ${feature}`}
      >
        ?
      </button>
      
      {showHelp && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowHelp(false)}
          />
          <div className="absolute z-50 left-6 top-0 w-64 bg-white border-2 border-black shadow-[4px_4px_0_#000] p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-xs uppercase">{feature}</span>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-0.5 hover:bg-black/10"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
            <div className="text-sm">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
