import React from 'react';
import { Button } from '@/src/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ImportNavigationProps {
  onBack?: () => void;
  onForward?: () => void;
  backLabel?: string;
  forwardLabel?: string;
  isForwardDisabled?: boolean;
  isForwardLoading?: boolean;
  showBack?: boolean;
  showForward?: boolean;
  showTopBack?: boolean;
}

const ImportNavigation: React.FC<ImportNavigationProps> = ({
  onBack,
  onForward,
  backLabel = 'Back',
  forwardLabel = 'Continue',
  isForwardDisabled = false,
  isForwardLoading = false,
  showBack = true,
  showForward = true,
}) => {
  return (
    <div className="pt-6">
      <div className="flex justify-between">
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        )}
        {!showBack && <div />} {/* Spacer when back button is hidden */}
        {showForward && onForward && (
          <Button
            onClick={onForward}
            disabled={isForwardDisabled || isForwardLoading}
            className="flex items-center gap-2"
          >
            {isForwardLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                {forwardLabel}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImportNavigation;
