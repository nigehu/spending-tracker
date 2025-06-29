'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { createBudgetCategory } from '@/src/app/[year]/[month]/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Category } from '@prisma/client';

interface AddBudgetCategoryProps {
  budgetId: number;
  existingCategoryIds: number[];
  availableCategories: Category[];
}

export function AddBudgetCategory({
  budgetId,
  existingCategoryIds,
  availableCategories,
}: AddBudgetCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const router = useRouter();

  // Filter out categories that are already in the budget
  const availableCategoriesForBudget = availableCategories.filter(
    (category) => !existingCategoryIds.includes(category.categoryId),
  );

  // Filter categories by transaction type
  const filteredCategories = availableCategoriesForBudget.filter((category) => {
    if (categoryFilter === 'ALL') return true;
    return category.type === categoryFilter;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCategoryId || !amount) {
      toast.error('Please select a category and enter an amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setIsCreating(true);
    try {
      await createBudgetCategory({
        budgetId,
        categoryId: parseInt(selectedCategoryId),
        amount: amountValue,
      });

      // Reset form
      setSelectedCategoryId('');
      setAmount('');
      setIsOpen(false);

      // Show success message
      toast.success('Budget category added successfully');

      // Refresh the page to show the new budget category
      router.refresh();
    } catch (error) {
      console.error('Failed to create budget category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create budget category');
    } finally {
      setIsCreating(false);
    }
  }

  if (availableCategoriesForBudget.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        All categories have been added to this budget.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
          + Add Budget Category
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div className="flex items-end gap-4">
            {/* Category Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter('ALL')}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={categoryFilter === 'DEBIT' ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter('DEBIT')}
                >
                  Debit
                </Button>
                <Button
                  type="button"
                  variant={categoryFilter === 'CREDIT' ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter('CREDIT')}
                >
                  Credit
                </Button>
              </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-2 ">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      No {categoryFilter.toLowerCase()} categories available
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              category.type === 'CREDIT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category.type}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ">
              <label className="text-sm font-medium text-gray-700 opacity-0">Actions</label>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isCreating || !selectedCategoryId || !amount}
                  size="sm"
                >
                  {isCreating ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedCategoryId('');
                    setAmount('');
                    setCategoryFilter('ALL');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
