'use client';

import type { Budget, BudgetCategory, Category, BudgetGroup } from '@prisma/client';
import { AddBudgetCategory } from './add-budget-category';
import { BudgetCategoryItem } from './budget-category-item';
import { CopyPreviousMonthButton } from './copy-previous-month-button';

interface BudgetCategoriesProps {
  budget: Budget & {
    budgetCategories: (BudgetCategory & {
      category: Category;
    })[];
    budgetGroup: BudgetGroup;
  };
  allCategories: Category[];
  categoryTransactionTotals: Record<number, number>;
  hasPreviousMonthBudget: boolean;
  canCopyFromPrevious: boolean;
  currentYear: number;
  currentMonth: number;
}

export function BudgetCategories({
  budget,
  allCategories,
  categoryTransactionTotals,
  hasPreviousMonthBudget,
  canCopyFromPrevious,
  currentYear,
  currentMonth,
}: BudgetCategoriesProps) {
  // Separate categories by type
  const creditCategories = budget.budgetCategories.filter((bc) => bc.category.type === 'CREDIT');
  const debitCategories = budget.budgetCategories.filter((bc) => bc.category.type === 'DEBIT');

  // Calculate totals for each type
  const creditTotal = creditCategories.reduce((sum, bc) => sum + bc.amount, 0);
  const debitTotal = debitCategories.reduce((sum, bc) => sum + bc.amount, 0);
  const totalBudgetAmount = creditTotal - debitTotal;

  // Get existing category IDs for filtering
  const existingCategoryIds = budget.budgetCategories.map((bc) => bc.category.categoryId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
          <p className="text-sm text-gray-600">Group: {budget.budgetGroup.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className={`text-2xl font-bold text-${totalBudgetAmount >= 0 ? 'green' : 'red'}-600`}>
            ${totalBudgetAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Copy Previous Month Button */}
      {hasPreviousMonthBudget && canCopyFromPrevious && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Quick Setup</h4>
              <p className="text-sm text-blue-700">
                Copy budget categories from the previous month to get started quickly.
              </p>
            </div>
            <CopyPreviousMonthButton year={currentYear} month={currentMonth} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debit Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Debit Categories</h4>
            <span className="text-sm font-semibold text-red-600">${debitTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            {debitCategories.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No debit categories added</p>
            ) : (
              debitCategories.map((budgetCategory) => (
                <BudgetCategoryItem
                  key={budgetCategory.budgetCategoryId}
                  budgetCategory={budgetCategory}
                  theme="debit"
                  transactionTotal={categoryTransactionTotals[budgetCategory.categoryId] || 0}
                  availableCategories={allCategories}
                />
              ))
            )}
          </div>
        </div>
        {/* Credit Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Credit Categories</h4>
            <span className="text-sm font-semibold text-green-600">${creditTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            {creditCategories.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No credit categories added</p>
            ) : (
              creditCategories.map((budgetCategory) => (
                <BudgetCategoryItem
                  key={budgetCategory.budgetCategoryId}
                  budgetCategory={budgetCategory}
                  theme="credit"
                  transactionTotal={categoryTransactionTotals[budgetCategory.categoryId] || 0}
                  availableCategories={allCategories}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Budget Category */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <AddBudgetCategory
          budgetId={budget.budgetId}
          existingCategoryIds={existingCategoryIds}
          availableCategories={allCategories}
        />
      </div>
    </div>
  );
}
