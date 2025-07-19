'use server';

import prisma from '@/lib/prisma';
import BudgetCategories from '@/src/components/budgets/BudgetCategories';
import BudgetMonthSelector from '@/src/components/budgets/BudgetMonthSelector';
import NoBudget from '@/src/components/budgets/NoBudget';
import { Budget, BudgetCategory, BudgetGroup, Category } from '@prisma/client';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';

export interface PreviousBudgetResponse extends Budget {
  budgetCategories: BudgetCategory[];
}

export interface BudgetResponse extends Budget {
  budgetCategories: (BudgetCategory & {
    category: Category;
  })[];
  budgetGroup: BudgetGroup;
}

export interface EnhancedBudgetCategory extends Category {
  budgetCategoryId: number;
  amount: number;
  transactionTotal: number;
}

export default async function Budgets({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const date = dayjs(`${year}-${month}`);
  if (!date.isValid()) {
    const year = dayjs().year();
    const month = dayjs().month() + 1; // Convert to 1-based month
    redirect(`/${year}/${month}`);
  }
  const previousMonth = date.subtract(1, 'month');

  // Fetch budget for the current month
  const budget: BudgetResponse | null = await prisma.budget.findFirst({
    where: {
      startDate: {
        lte: date.endOf('month').toDate(),
      },
      endDate: {
        gte: date.startOf('month').toDate(),
      },
    },
    include: {
      budgetCategories: {
        include: {
          category: true,
        },
      },
      budgetGroup: true,
    },
  });

  // Check if previous month's budget exists
  const previousBudget: PreviousBudgetResponse | null = await prisma.budget.findFirst({
    where: {
      startDate: {
        lte: previousMonth.endOf('month').toDate(),
      },
      endDate: {
        gte: previousMonth.startOf('month').toDate(),
      },
    },
    include: {
      budgetCategories: true,
    },
  });

  // Fetch all categories for the add budget category dropdown
  const allCategories: Category[] = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Fetch transaction totals for each category within the budget time range
  let budgetCategories: EnhancedBudgetCategory[] = [];
  if (budget) {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
      select: {
        amount: true,
        categoryId: true,
      },
    });

    // Calculate totals for each category
    const categoryTransactionTotals = transactions.reduce(
      (acc, transaction) => {
        acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + transaction.amount;
        return acc;
      },
      {} as Record<number, number>,
    );

    budgetCategories = budget.budgetCategories
      .map((budgetCategory) => ({
        ...budgetCategory.category,
        budgetCategoryId: budgetCategory.budgetCategoryId,
        amount: budgetCategory.amount,
        transactionTotal: categoryTransactionTotals[budgetCategory.categoryId] || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const plainDate = date.toDate();

  return (
    <div className="flex flex-col md:flex-row">
      <div className="px-6 py-2 w-full">
        <BudgetMonthSelector date={plainDate} />
        {budget ? (
          <BudgetCategories
            budget={budget}
            allCategories={allCategories}
            hasPreviousMonthBudget={!!previousBudget}
            canCopyFromPrevious={!!previousBudget && budget.budgetCategories.length === 0}
            budgetCategories={budgetCategories}
            date={plainDate}
          />
        ) : (
          <NoBudget date={plainDate} previousBudgetExists={!!previousBudget} />
        )}
      </div>
    </div>
  );
}
