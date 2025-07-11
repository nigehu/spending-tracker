'use client';

import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Pencil } from 'lucide-react';
import { updateBudgetCategory } from '@/src/app/[year]/[month]/actions';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@prisma/client';
import { BudgetCategoryEditForm } from './budget-category-edit-form';
import { formatCurrency } from '@/src/lib/utils';
import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';

interface BudgetCategoryItemProps {
  budgetCategory: EnhancedBudgetCategory;
  theme: 'credit' | 'debit';
  availableCategories: Category[];
}

export function BudgetCategoryItem({
  budgetCategory,
  theme,
  availableCategories,
}: BudgetCategoryItemProps) {
  const [amount, setAmount] = useState(budgetCategory.amount.toString());
  const [displayAmount, setDisplayAmount] = useState(formatCurrency(budgetCategory.amount));
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse currency string to number
  function parseCurrency(value: string): number {
    // Remove currency symbols, commas, and spaces
    const cleanValue = value.replace(/[$,]/g, '');
    return parseFloat(cleanValue) || 0;
  }

  // Debounced update function
  const debouncedUpdate = (newAmount: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const amountValue = parseCurrency(newAmount);
      if (isNaN(amountValue) || amountValue < 0) {
        setError('Please enter a valid amount');
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        await updateBudgetCategory({
          budgetCategoryId: budgetCategory.categoryId,
          amount: amountValue,
        });
        router.refresh();
      } catch (error) {
        console.error('Failed to update budget category:', error);
        setError(error instanceof Error ? error.message : 'Failed to update amount');
      } finally {
        setIsUpdating(false);
      }
    }, 1000);
  };

  // Handle input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);

    // Update display amount for formatting
    const numericValue = parseCurrency(newAmount);
    if (!isNaN(numericValue)) {
      setDisplayAmount(formatCurrency(numericValue));
    }

    debouncedUpdate(newAmount);
  };

  // Handle focus - show raw value
  const handleFocus = () => {
    setIsFocused(true);
    setDisplayAmount(amount);
  };

  // Handle blur - format as currency
  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseCurrency(amount);
    if (!isNaN(numericValue)) {
      setDisplayAmount(formatCurrency(numericValue));
      setAmount(numericValue.toString());
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const themeClasses = {
    credit: {
      container: 'bg-green-50 border border-green-200',
      amount: 'text-green-700',
    },
    debit: {
      container: 'bg-red-50 border border-red-200',
      amount: 'text-red-700',
    },
  };

  const budgetDifference =
    theme === 'credit'
      ? budgetCategory.transactionTotal - budgetCategory.amount
      : budgetCategory.amount - budgetCategory.transactionTotal;

  if (showEditForm) {
    return (
      <div className="flex justify-center p-4">
        <BudgetCategoryEditForm
          budgetCategory={budgetCategory}
          availableCategories={availableCategories}
          onClose={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-3 ${themeClasses[theme].container} rounded-md gap-4 group`}
    >
      <div className="flex-1">
        <div className="flex gap-2 justify-between">
          <p className="font-medium text-gray-900">{budgetCategory.name}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditForm(true)}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Edit category ${budgetCategory.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">{budgetCategory.description}</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Budget</label>
        <Input
          type="text"
          value={isFocused ? amount : displayAmount}
          onChange={handleAmountChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-24 text-right font-semibold ${isUpdating ? 'opacity-50' : ''}`}
          disabled={isUpdating}
          placeholder="$0.00"
        />
        {isUpdating && <p className="text-xs text-gray-500 mt-1">Updating...</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Total</label>
        <p className={`w-24 h-9 leading-9 font-semibold`}>
          {formatCurrency(budgetCategory.transactionTotal)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          {theme === 'credit' ? 'Over' : 'Remaining'}
        </label>
        <p
          className={`w-24 h-9 leading-9 text-${budgetDifference >= 0 ? 'green' : 'red'}-700 font-semibold`}
        >
          {formatCurrency(budgetDifference)}
        </p>
      </div>
    </div>
  );
}
