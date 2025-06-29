'use client';

import { Button } from '@/src/components/ui/button';
import { createBudget } from '@/src/app/[year]/[month]/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dayjs from 'dayjs';

interface CreateBudgetButtonProps {
  year: number;
  month: number;
}

export function CreateBudgetButton({ year, month }: CreateBudgetButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  async function handleCreateBudget() {
    setIsCreating(true);
    try {
      await createBudget({ year, month });
      toast.success('Budget created successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to create budget:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create budget');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Button
      onClick={handleCreateBudget}
      disabled={isCreating}
      className="bg-yellow-600 hover:bg-yellow-700 text-white"
    >
      {isCreating
        ? 'Creating...'
        : `Create Budget for ${dayjs(`${year}-${month}-01`).format('MMMM YYYY')}`}
    </Button>
  );
}
