'use client';

import { Button } from '@/src/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { copyPreviousMonthCategories } from '@/src/app/[year]/[month]/actions';

interface CopyPreviousMonthButtonProps {
  year: number;
  month: number;
}

export function CopyPreviousMonthButton({ year, month }: CopyPreviousMonthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleCopy = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await copyPreviousMonthCategories({ year, month });
      setSuccess(result.message);
      router.refresh();
    } catch (error) {
      console.error('Failed to copy previous month categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to copy categories');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCopy}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <CopyIcon className="h-4 w-4" />
        {isLoading ? 'Copying...' : 'Copy Previous Month'}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {success && <p className="text-sm text-green-600">{success}</p>}
    </div>
  );
}
