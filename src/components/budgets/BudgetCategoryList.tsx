'use client';

import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Category } from '@prisma/client';
import { FC } from 'react';
import { BudgetCategoryItem } from './BudgetCategoryItem';
import BudgetTotal from './BudgetTotal';

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
  const budgetDifferenceTotal = budgetTotal - transactionTotal;
  const totalsDescriptor = theme === 'debit' ? 'Expenses' : 'Income';
  return (
    <div>
      <div className="flex items-center justify-around mb-6">
        <BudgetTotal title={`Projected ${totalsDescriptor}`}>{budgetTotal}</BudgetTotal>
        <BudgetTotal title={`Actual ${totalsDescriptor}`}>{transactionTotal}</BudgetTotal>
        <BudgetTotal title={`Remaining ${totalsDescriptor}`} color reverse={theme === 'credit'}>
          {budgetDifferenceTotal}
        </BudgetTotal>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{themeName} Categories</TableHead>
            <TableHead className="text-right pr-3">Budget</TableHead>
            <TableHead className="text-right">Transactions</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell className="font-medium">No {theme} categories added</TableCell>
            </TableRow>
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
        </TableBody>
      </Table>
    </div>
  );
};

export default BudgetCategoryList;
