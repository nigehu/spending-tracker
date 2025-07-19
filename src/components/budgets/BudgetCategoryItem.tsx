'use client';

import { updateBudgetCategory } from '@/src/app/[year]/[month]/actions';
import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';
import { Input } from '@/src/components/ui/input';
import { formatCurrency } from '@/src/lib/utils';
import type { Category } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BudgetCategoryEditForm } from './budget-category-edit-form';
import { TableCell, TableRow } from '@/src/components/ui/table';

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
          budgetCategoryId: budgetCategory.budgetCategoryId,
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
    <TableRow>
      <TableCell className="font-medium">{budgetCategory.name}</TableCell>
      <TableCell className="py-2 px-0">
        <div className="flex items-end flex-col">
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
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(budgetCategory.transactionTotal)}
      </TableCell>
      <TableCell
        className={`text-right text-${budgetDifference >= 0 ? 'green' : 'red'}-700 font-semibold`}
      >
        {formatCurrency(budgetDifference)}
      </TableCell>
    </TableRow>
  );
}
