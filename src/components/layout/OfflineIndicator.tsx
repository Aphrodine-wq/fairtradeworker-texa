import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WifiSlash, ArrowClockwise, Download } from '@phosphor-icons/react';

export function OfflineIndicator() {
  const { isOnline, needsUpdate, updateServiceWorker, isInstalling } = useServiceWorker();

  if (isInstalling) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 flex items-center gap-3">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-sm font-medium">Installing offline support...</span>
      </div>
    );
  }

  if (needsUpdate) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm">
        <div className="flex items-start gap-3">
          <Download className="text-primary mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Update Available</h4>
            <p className="text-xs text-muted-foreground mb-3">
              A new version of FairTradeWorker is ready to install.
            </p>
            <Button 
              size="sm" 
              onClick={() => {
                updateServiceWorker();
                toast.success('Updating app...');
              }}
              className="w-full"
            >
              <ArrowClockwise size={16} className="mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground border border-destructive rounded-lg p-4 shadow-lg z-50 flex items-center gap-3">
        <WifiSlash size={20} />
        <div>
          <p className="font-semibold text-sm">You're offline</p>
          <p className="text-xs opacity-90">Changes will sync when you reconnect</p>
        </div>
      </div>
    );
  }

  return null;
}
