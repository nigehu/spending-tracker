import prisma from '@/lib/prisma';
import BudgetCategories from '@/src/components/budgets/BudgetCategories';
import BudgetMonthSelector from '@/src/components/budgets/BudgetMonthSelector';
import { CopyPreviousMonthButton } from '@/src/components/budgets/copy-previous-month-button';
import { CreateBudgetButton } from '@/src/components/budgets/create-budget-button';
import { Budget, BudgetCategory, BudgetGroup, Category } from '@prisma/client';
import dayjs from 'dayjs';

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
  amount: number;
  transactionTotal: number;
}

export default async function Budgets({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const date = dayjs(`${year}-${month}-01`).toDate();

  // Calculate start and end dates for the month
  const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
  const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

  // Calculate previous month dates
  const previousMonth = dayjs(`${year}-${month}-01`).subtract(1, 'month');
  const previousStartDate = previousMonth.startOf('month').toDate();
  const previousEndDate = previousMonth.endOf('month').toDate();

  // Fetch budget for the current month
  const budget: BudgetResponse | null = await prisma.budget.findFirst({
    where: {
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
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
        lte: previousEndDate,
      },
      endDate: {
        gte: previousStartDate,
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
        amount: budgetCategory.amount,
        transactionTotal: categoryTransactionTotals[budgetCategory.categoryId] || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(budgetCategories);
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-6 w-full">
        <BudgetMonthSelector date={date} />
        {budget ? (
          <BudgetCategories
            budget={budget}
            allCategories={allCategories}
            hasPreviousMonthBudget={!!previousBudget}
            canCopyFromPrevious={!!previousBudget && budget.budgetCategories.length === 0}
            budgetCategories={budgetCategories}
            date={date}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">No Budget Found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      No budget has been set up for {dayjs(date).format('MMMM YYYY')}. You can
                      create a new budget to start tracking your spending goals.
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <CreateBudgetButton year={parseInt(year)} month={parseInt(month)} />
                    {previousBudget && (
                      <CopyPreviousMonthButton year={parseInt(year)} month={parseInt(month)} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
