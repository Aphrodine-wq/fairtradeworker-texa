import { useState, useEffect } from 'react';
import { X, ArrowRight, CurrencyDollar, Lightning, Shield } from '@phosphor-icons/react';

interface WelcomeBannerProps {
  userType: 'contractor' | 'homeowner';
  userName?: string;
  onDismiss?: () => void;
  onAction?: () => void;
}

export function WelcomeBanner({
  userType,
  userName,
  onDismiss,
  onAction
}: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `ftw:welcome-${userType}`;

  useEffect(() => {
    const wasDismissed = localStorage.getItem(storageKey);
    if (wasDismissed) {
      setDismissed(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
    onDismiss?.();
  };

  if (dismissed) return null;

  const content = userType === 'contractor' ? {
    greeting: userName ? `WELCOME, ${userName.toUpperCase()}!` : 'WELCOME, CONTRACTOR!',
    headline: "You keep 100% of what you earn.",
    subline: "No fees. No cuts. No BS. The way it should be.",
    stats: [
      { icon: <CurrencyDollar size={24} weight="bold" />, label: "0% FEES", desc: "You earn it, you keep it" },
      { icon: <Lightning size={24} weight="bold" />, label: "60 SEC", desc: "AI-powered job scoping" },
      { icon: <Shield size={24} weight="bold" />, label: "FREE TOOLS", desc: "CRM, invoices, and more" }
    ],
    cta: "BROWSE JOBS",
    ctaHref: "/jobs"
  } : {
    greeting: userName ? `WELCOME, ${userName.toUpperCase()}!` : 'WELCOME!',
    headline: "Find quality contractors, fast.",
    subline: "Post your project, get bids, and hire with confidence. Flat $20 fee, no surprises.",
    stats: [
      { icon: <CurrencyDollar size={24} weight="bold" />, label: "$20 FLAT", desc: "One simple fee" },
      { icon: <Lightning size={24} weight="bold" />, label: "60 SEC", desc: "AI scopes your project" },
      { icon: <Shield size={24} weight="bold" />, label: "VERIFIED", desc: "Licensed contractors" }
    ],
    cta: "POST A PROJECT",
    ctaHref: "/post-job"
  };

  return (
    <div className="bg-black/95 backdrop-blur-lg text-white border border-white/10 shadow-xl mb-6 overflow-hidden relative rounded-lg">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 transition-colors z-10"
        aria-label="Dismiss welcome banner"
      >
        <X size={20} weight="bold" />
      </button>

      <div className="p-8 relative">
        {/* Greeting */}
        <p className="font-mono text-sm text-[#00FF00] mb-2">{content.greeting}</p>
        
        {/* Headline */}
        <h1 className="font-black text-3xl md:text-4xl uppercase tracking-tight mb-3">
          {content.headline}
        </h1>
        
        {/* Subline */}
        <p className="text-lg mb-8 max-w-xl">
          {content.subline}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
          {content.stats.map((stat, i) => (
            <div key={i} className="bg-white/10 border border-white/20 p-4">
              <div className="text-[#00FF00] mb-2">{stat.icon}</div>
              <p className="font-black text-lg">{stat.label}</p>
              <p className="text-xs opacity-70">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            onAction?.();
            window.location.href = content.ctaHref;
          }}
          className="inline-flex items-center gap-3 bg-[#00FF00] text-black px-8 py-4 font-black text-lg uppercase border-2 border-[#00FF00] shadow-[4px_4px_0_#fff] hover:shadow-[2px_2px_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          {content.cta}
          <ArrowRight size={24} weight="bold" />
        </button>

        {/* Skip link */}
        <button
          onClick={handleDismiss}
          className="ml-6 font-mono text-sm underline underline-offset-2 opacity-70 hover:opacity-100"
        >
          Skip intro
        </button>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00FF00] opacity-5 transform rotate-45 translate-x-16 translate-y-16" />
    </div>
  );
}

// Compact version for returning users or smaller spaces
export function WelcomeBar({
  userName,
  message,
  onDismiss
}: {
  userName?: string;
  message?: string;
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-[#00FF00]/90 backdrop-blur-sm text-black border border-white/10 px-4 py-3 flex items-center justify-between rounded-md shadow-md">
      <p className="font-bold">
        {userName ? `👋 Hey ${userName}!` : '👋 Welcome!'} {message || "Ready to get to work?"}
      </p>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

// Value proposition reminder (can show after some usage)
export function ValueReminder({ savedAmount }: { savedAmount?: number }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/10 shadow-lg p-4 flex items-center gap-4 rounded-lg">
      <div className="bg-[#00FF00]/20 p-3 border border-white/10 rounded-md">
        <CurrencyDollar size={24} weight="bold" />
      </div>
      <div className="flex-1">
        <p className="font-black uppercase text-sm">
          {savedAmount 
            ? `YOU'VE SAVED $${savedAmount.toLocaleString()} IN PLATFORM FEES`
            : "ZERO FEES FOREVER"
          }
        </p>
        <p className="text-sm opacity-70">
          On other platforms, this would have gone to middlemen.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-2 hover:bg-black/5"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}
