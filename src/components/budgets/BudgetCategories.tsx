'use client';

import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';
import type { Budget, Category } from '@prisma/client';
import dayjs from 'dayjs';
import { AddBudgetCategory } from './add-budget-category';
import BudgetCategoryList from './BudgetCategoryList';
import { CopyPreviousMonthButton } from './copy-previous-month-button';

interface BudgetCategoriesProps {
  date: Date;
  budget: Budget;
  budgetCategories: EnhancedBudgetCategory[];
  allCategories: Category[];
  hasPreviousMonthBudget: boolean;
  canCopyFromPrevious: boolean;
}

function BudgetCategories({
  budget,
  budgetCategories,
  allCategories,
  hasPreviousMonthBudget,
  canCopyFromPrevious,
  date,
}: BudgetCategoriesProps) {
  // Get current date if no date is provided
  const currentDate = date || new Date();
  const currentYear = dayjs(currentDate).year();
  const currentMonth = dayjs(currentDate).month(); // 0-based month index

  // Separate categories by type and sort alphabetically
  const creditCategories = budgetCategories.filter((bc) => bc.type === 'CREDIT');
  const debitCategories = budgetCategories.filter((bc) => bc.type === 'DEBIT');

  // Calculate totals for each type
  const creditTotal = creditCategories.reduce((sum, bc) => sum + bc.amount, 0);
  const debitTotal = debitCategories.reduce((sum, bc) => sum + bc.amount, 0);

  // Calculate transaction totals for credit and debit categories
  const transactionCreditTotal = creditCategories.reduce((sum, bc) => sum + bc.transactionTotal, 0);
  const transactionDebitTotal = debitCategories.reduce((sum, bc) => sum + bc.transactionTotal, 0);

  // Get existing category IDs for filtering
  const existingCategoryIds = budgetCategories.map((bc) => bc.categoryId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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
        <BudgetCategoryList
          budgetTotal={debitTotal}
          transactionTotal={transactionDebitTotal}
          categories={debitCategories}
          allCategories={allCategories}
          theme="debit"
        />
        <BudgetCategoryList
          budgetTotal={creditTotal}
          transactionTotal={transactionCreditTotal}
          categories={creditCategories}
          allCategories={allCategories}
          theme="credit"
        />
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

export default BudgetCategories;
