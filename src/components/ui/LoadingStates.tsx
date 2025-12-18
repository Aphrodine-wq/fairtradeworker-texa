import { ReactNode } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Warning, 
  XCircle,
  Spinner,
  Lightning
} from '@phosphor-icons/react';

// =========================================
// LOADING STATES
// =========================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <Spinner size={size === 'sm' ? 16 : size === 'md' ? 32 : 48} weight="bold" />
      </div>
      {message && (
        <p className="font-mono text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Full page loading state
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white/90 backdrop-blur-sm border border-white/10 p-8 shadow-lg inline-block mb-4 rounded-lg">
          <div className="w-12 h-12 mx-auto animate-spin">
            <Spinner size={48} weight="bold" />
          </div>
        </div>
        <p className="font-mono text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loader for cards
export function CardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/10 p-6 shadow-md animate-pulse rounded-lg">
      <div className="h-4 bg-black/10 w-2/3 mb-4" />
      <div className="h-3 bg-black/10 w-full mb-2" />
      <div className="h-3 bg-black/10 w-4/5 mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-black/10 w-20" />
        <div className="h-8 bg-black/10 w-24" />
      </div>
    </div>
  );
}

// Grid of skeleton loaders
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="h-4 bg-black/10 w-full" />
        </td>
      ))}
    </tr>
  );
}

// =========================================
// STATUS INDICATORS
// =========================================

type StatusType = 'success' | 'warning' | 'error' | 'pending' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, {
  icon: ReactNode;
  bgColor: string;
  textColor: string;
  defaultLabel: string;
}> = {
  success: {
    icon: <CheckCircle size={14} weight="fill" />,
    bgColor: 'bg-[#00FF00]',
    textColor: 'text-black',
    defaultLabel: 'Complete'
  },
  warning: {
    icon: <Warning size={14} weight="fill" />,
    bgColor: 'bg-[#FFFF00]',
    textColor: 'text-black',
    defaultLabel: 'Attention'
  },
  error: {
    icon: <XCircle size={14} weight="fill" />,
    bgColor: 'bg-[#FF0000]',
    textColor: 'text-white',
    defaultLabel: 'Error'
  },
  pending: {
    icon: <Clock size={14} weight="bold" />,
    bgColor: 'bg-white',
    textColor: 'text-black',
    defaultLabel: 'Pending'
  },
  info: {
    icon: <Lightning size={14} weight="fill" />,
    bgColor: 'bg-black',
    textColor: 'text-white',
    defaultLabel: 'Info'
  }
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : 'px-3 py-1 text-sm gap-1.5';

  return (
    <span className={`
      inline-flex items-center font-mono uppercase border-0 shadow-lg
      ${config.bgColor} ${config.textColor} ${sizeClasses}
    `}>
      {config.icon}
      {displayLabel}
    </span>
  );
}

// Job status indicator with more context
interface JobStatusProps {
  status: 'open' | 'bidding' | 'awarded' | 'in-progress' | 'completed' | 'cancelled';
  showLabel?: boolean;
}

const jobStatusConfig: Record<JobStatusProps['status'], {
  color: string;
  label: string;
  description: string;
}> = {
  open: {
    color: 'bg-[#00FF00]',
    label: 'OPEN',
    description: 'Accepting bids'
  },
  bidding: {
    color: 'bg-[#FFFF00]',
    label: 'BIDDING',
    description: 'Reviewing bids'
  },
  awarded: {
    color: 'bg-[#00FF00]',
    label: 'AWARDED',
    description: 'Contractor selected'
  },
  'in-progress': {
    color: 'bg-black',
    label: 'IN PROGRESS',
    description: 'Work underway'
  },
  completed: {
    color: 'bg-[#00FF00]',
    label: 'COMPLETED',
    description: 'Job finished'
  },
  cancelled: {
    color: 'bg-[#FF0000]',
    label: 'CANCELLED',
    description: 'Job cancelled'
  }
};

export function JobStatus({ status, showLabel = true }: JobStatusProps) {
  const config = jobStatusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 ${config.color} border-0 shadow-sm`} />
      {showLabel && (
        <span className="font-mono text-xs uppercase">{config.label}</span>
      )}
    </div>
  );
}

// =========================================
// PROGRESS INDICATORS
// =========================================

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'black';
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  size = 'md',
  color = 'green'
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };
  
  const colorClasses = {
    green: 'bg-[#00FF00]',
    yellow: 'bg-[#FFFF00]',
    black: 'bg-black'
  };

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="font-mono text-sm">{label}</span>}
          {showPercent && <span className="font-mono text-sm font-bold">{clampedValue}%</span>}
        </div>
      )}
      <div className={`w-full bg-white border-0 shadow-lg ${sizeClasses[size]}`}>
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// Step progress indicator
interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          {/* Step circle */}
          <div className={`
            w-8 h-8 flex items-center justify-center font-mono font-bold text-sm
            border-0 shadow-lg
            ${index < currentStep 
              ? 'bg-[#00FF00]' 
              : index === currentStep 
                ? 'bg-[#FFFF00]' 
                : 'bg-white'
            }
          `}>
            {index < currentStep ? (
              <CheckCircle size={16} weight="bold" />
            ) : (
              index + 1
            )}
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-2
              ${index < currentStep ? 'bg-[#00FF00]' : 'bg-black/20'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================
// NOTIFICATION COUNTS
// =========================================

interface NotificationBadgeProps {
  count: number;
  max?: number;
}

export function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-[#FF0000] text-white font-mono text-xs font-bold px-1 border border-white">
      {displayCount}
    </span>
  );
}
