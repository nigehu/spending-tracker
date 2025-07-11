'use client';

import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';
import { formatCurrency } from '@/src/lib/utils';
import { Category } from '@prisma/client';
import { FC } from 'react';
import { BudgetCategoryItem } from './budget-category-item';

interface BudgetCategoryListProps {
  budgetTotal: number;
  transactionTotal: number;
  categories: EnhancedBudgetCategory[];
  allCategories: Category[];
  theme: 'credit' | 'debit';
}

const BudgetCategoryList: FC<BudgetCategoryListProps> = ({
  budgetTotal,
  transactionTotal,
  categories,
  allCategories,
  theme,
}) => {
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">{themeName} Categories</h4>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Budget Total</label>
          <p className={`w-24 h-9 leading-9 font-semibold`}>{formatCurrency(budgetTotal)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Transaction Total</label>
          <p className={`w-24 h-9 leading-9 font-semibold`}>{formatCurrency(transactionTotal)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No {theme} categories added</p>
        ) : (
          categories.map((budgetCategory) => (
            <BudgetCategoryItem
              key={budgetCategory.categoryId}
              budgetCategory={budgetCategory}
              theme={theme}
              availableCategories={allCategories}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetCategoryList;
