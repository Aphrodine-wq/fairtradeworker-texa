import { ReactNode } from 'react';
import { 
  Warning,
  WifiSlash,
  Bug,
  ArrowClockwise,
  House,
  CheckCircle,
  XCircle,
  Info
} from '@phosphor-icons/react';

// =========================================
// ERROR STATES
// =========================================

type ErrorType = 'generic' | 'network' | 'not-found' | 'permission' | 'server';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const errorConfig: Record<ErrorType, {
  icon: ReactNode;
  title: string;
  message: string;
  encouragement: string;
}> = {
  generic: {
    icon: <Warning size={48} weight="bold" />,
    title: "SOMETHING WENT WRONG",
    message: "We hit an unexpected bump. This is on us, not you.",
    encouragement: "Try refreshing the page or come back in a few minutes."
  },
  network: {
    icon: <WifiSlash size={48} weight="bold" />,
    title: "CONNECTION LOST",
    message: "Looks like you're offline or our servers are having trouble.",
    encouragement: "Check your internet connection and try again."
  },
  'not-found': {
    icon: <Bug size={48} weight="bold" />,
    title: "PAGE NOT FOUND",
    message: "The page you're looking for doesn't exist or has been moved.",
    encouragement: "Double-check the URL or head back to the dashboard."
  },
  permission: {
    icon: <Warning size={48} weight="bold" />,
    title: "ACCESS DENIED",
    message: "You don't have permission to view this page.",
    encouragement: "If you think this is a mistake, contact support."
  },
  server: {
    icon: <Bug size={48} weight="bold" />,
    title: "SERVER ERROR",
    message: "Our servers are temporarily unavailable.",
    encouragement: "We're working on it. Please try again in a few minutes."
  }
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  action,
  secondaryAction
}: ErrorStateProps) {
  const config = errorConfig[type];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="bg-[#FF0000]/10 border border-white/10 p-6 inline-block mb-6 shadow-lg rounded-lg">
          <div className="text-[#FF0000]">
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-black text-2xl uppercase tracking-tight mb-3">
          {title || config.title}
        </h1>

        {/* Message */}
        <p className="text-base mb-4">
          {message || config.message}
        </p>

        {/* Encouragement */}
        <p className="text-sm opacity-70 mb-6">
          {config.encouragement}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase hover:bg-gray-800 transition-colors rounded-md shadow-md"
            >
              <ArrowClockwise size={20} weight="bold" />
              {action.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm text-black px-6 py-3 font-bold uppercase hover:bg-white transition-colors rounded-md shadow-md"
            >
              <House size={20} weight="bold" />
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Common error state shortcuts
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      type="network"
      action={{ label: 'Try Again', onClick: onRetry }}
    />
  );
}

export function NotFoundError({ onGoHome }: { onGoHome: () => void }) {
  return (
    <ErrorState
      type="not-found"
      secondaryAction={{ label: 'Go Home', onClick: onGoHome }}
    />
  );
}

export function ServerError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      type="server"
      action={{ label: 'Try Again', onClick: onRetry }}
    />
  );
}

// =========================================
// USER FEEDBACK / TOASTS
// =========================================

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackToastProps {
  type: FeedbackType;
  message: string;
  onDismiss?: () => void;
}

const feedbackConfig: Record<FeedbackType, {
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}> = {
  success: {
    icon: <CheckCircle size={20} weight="fill" />,
    bgColor: 'bg-[#00FF00]',
    textColor: 'text-black'
  },
  error: {
    icon: <XCircle size={20} weight="fill" />,
    bgColor: 'bg-[#FF0000]',
    textColor: 'text-white'
  },
  warning: {
    icon: <Warning size={20} weight="fill" />,
    bgColor: 'bg-[#FFFF00]',
    textColor: 'text-black'
  },
  info: {
    icon: <Info size={20} weight="fill" />,
    bgColor: 'bg-black',
    textColor: 'text-white'
  }
};

export function FeedbackToast({ type, message, onDismiss }: FeedbackToastProps) {
  const config = feedbackConfig[type];

  return (
    <div className={`
      ${config.bgColor} ${config.textColor}
      border-0 shadow-xl shadow-[4px_4px_0_#000]
      px-4 py-3 flex items-center gap-3
      animate-in slide-in-from-top-2 duration-200
    `}>
      {config.icon}
      <p className="font-bold flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:opacity-70 transition-opacity"
        >
          <XCircle size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}

// Toast container for positioning
export function ToastContainer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {children}
    </div>
  );
}

// Pre-built success messages
export function BidSubmittedToast({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <FeedbackToast
      type="success"
      message="Bid submitted! You'll be notified when the homeowner responds."
      onDismiss={onDismiss}
    />
  );
}

export function InvoiceSentToast({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <FeedbackToast
      type="success"
      message="Invoice sent! You'll be notified when payment is received."
      onDismiss={onDismiss}
    />
  );
}

export function ProfileSavedToast({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <FeedbackToast
      type="success"
      message="Profile saved successfully!"
      onDismiss={onDismiss}
    />
  );
}

export function SavedToast({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <FeedbackToast
      type="success"
      message="Changes saved!"
      onDismiss={onDismiss}
    />
  );
}

// =========================================
// INLINE VALIDATION FEEDBACK
// =========================================

interface FieldFeedbackProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export function FieldFeedback({ type, message }: FieldFeedbackProps) {
  const colors = {
    success: 'text-[#00FF00]',
    error: 'text-[#FF0000]',
    warning: 'text-[#FFFF00]'
  };

  const icons = {
    success: <CheckCircle size={14} weight="fill" />,
    error: <XCircle size={14} weight="fill" />,
    warning: <Warning size={14} weight="fill" />
  };

  return (
    <p className={`flex items-center gap-1 text-sm mt-1 ${colors[type]}`}>
      {icons[type]}
      {message}
    </p>
  );
}

// =========================================
// CONFIRMATION DIALOG
// =========================================

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColors = {
    danger: 'bg-[#FF0000] text-white hover:bg-[#CC0000]',
    warning: 'bg-[#FFFF00] text-black hover:bg-[#CCCC00]',
    default: 'bg-black text-white hover:bg-white hover:text-black'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="bg-white border-0 shadow-2xl shadow-[8px_8px_0_#000] max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-black text-xl uppercase">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p>{message}</p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-bold uppercase border-0 shadow-xl hover:bg-black/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-bold uppercase border-0 shadow-xl transition-colors ${confirmColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
