'use server';

import { revalidatePath } from 'next/cache';
import { Budget, BudgetCategory } from '@prisma/client';
import { Context, context } from '@/lib/context';
import { hasProperty, isNumber, isObject } from '@/src/lib/typeguard.utils';
import dayjs from 'dayjs';

export async function createBudget(props: unknown, ctx: Context = context) {
  if (!isObject(props) || !hasProperty(props, 'year') || !hasProperty(props, 'month')) {
    throw new Error('Budget creation requires year and month');
  }
  if (!isNumber(props.year)) {
    throw new Error('Year must be a number');
  }
  if (!isNumber(props.month)) {
    throw new Error('Month must be a number');
  }

  const { year, month } = props;

  // Create start and end dates for the month
  const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
  const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

  // Create budget name from month and year
  const budgetName = dayjs(`${year}-${month}-01`).format('MMMM YYYY');

  // Check if budget already exists for this month
  const existingBudget = await ctx.prisma.budget.findFirst({
    where: {
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  if (existingBudget) {
    throw new Error(`A budget already exists for ${budgetName}`);
  }

  // Get or create a default budget group
  let budgetGroup = await ctx.prisma.budgetGroup.findFirst({
    where: {
      name: 'Default',
    },
  });

  if (!budgetGroup) {
    budgetGroup = await ctx.prisma.budgetGroup.create({
      data: {
        name: 'Default',
      },
    });
  }

  let response: Budget | undefined = undefined;
  try {
    response = await ctx.prisma.budget.create({
      data: {
        name: budgetName,
        startDate,
        endDate,
        budgetGroupId: budgetGroup.budgetGroupId,
      },
    });
  } catch (error) {
    console.error('Failed to create budget:', error);
    throw new Error('Database update failed');
  }

  revalidatePath('/budgets');
  return response;
}

export async function createBudgetCategory(props: unknown, ctx: Context = context) {
  if (
    !isObject(props) ||
    !hasProperty(props, 'budgetId') ||
    !hasProperty(props, 'categoryId') ||
    !hasProperty(props, 'amount')
  ) {
    throw new Error('Budget category creation requires budgetId, categoryId, and amount');
  }
  if (!isNumber(props.budgetId)) {
    throw new Error('Budget ID must be a number');
  }
  if (!isNumber(props.categoryId)) {
    throw new Error('Category ID must be a number');
  }
  if (!isNumber(props.amount)) {
    throw new Error('Amount must be a number');
  }

  const { budgetId, categoryId, amount } = props;

  // Check if budget category already exists
  const existingBudgetCategory = await ctx.prisma.budgetCategory.findFirst({
    where: {
      budgetId,
      categoryId,
    },
  });

  if (existingBudgetCategory) {
    throw new Error('This category is already added to the budget');
  }

  // Verify budget exists
  const budget = await ctx.prisma.budget.findUnique({
    where: { budgetId },
  });

  if (!budget) {
    throw new Error('Budget not found');
  }

  // Verify category exists
  const category = await ctx.prisma.category.findUnique({
    where: { categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  let response: BudgetCategory | undefined = undefined;
  try {
    response = await ctx.prisma.budgetCategory.create({
      data: {
        budgetId,
        categoryId,
        amount,
      },
    });
  } catch (error) {
    console.error('Failed to create budget category:', error);
    throw new Error('Database update failed');
  }

  revalidatePath('/budgets');
  return response;
}

export async function updateBudgetCategory(props: unknown, ctx: Context = context) {
  if (
    !isObject(props) ||
    !hasProperty(props, 'budgetCategoryId') ||
    !hasProperty(props, 'amount')
  ) {
    throw new Error('Budget category update requires budgetCategoryId and amount');
  }
  if (!isNumber(props.budgetCategoryId)) {
    throw new Error('Budget category ID must be a number');
  }
  if (!isNumber(props.amount)) {
    throw new Error('Amount must be a number');
  }

  const { budgetCategoryId, amount } = props;

  // Verify budget category exists
  const existingBudgetCategory = await ctx.prisma.budgetCategory.findUnique({
    where: { budgetCategoryId },
  });

  if (!existingBudgetCategory) {
    throw new Error('Budget category not found');
  }

  let response: BudgetCategory | undefined = undefined;
  try {
    response = await ctx.prisma.budgetCategory.update({
      where: { budgetCategoryId },
      data: { amount },
    });
  } catch (error) {
    console.error('Failed to update budget category:', error);
    throw new Error('Database update failed');
  }

  revalidatePath('/budgets');
  return response;
}

export async function updateBudgetCategoryCategory(props: unknown, ctx: Context = context) {
  if (
    !isObject(props) ||
    !hasProperty(props, 'budgetCategoryId') ||
    !hasProperty(props, 'categoryId')
  ) {
    throw new Error('Budget category update requires budgetCategoryId and categoryId');
  }
  if (!isNumber(props.budgetCategoryId)) {
    throw new Error('Budget category ID must be a number');
  }
  if (!isNumber(props.categoryId)) {
    throw new Error('Category ID must be a number');
  }

  const { budgetCategoryId, categoryId } = props;

  // Verify budget category exists
  const existingBudgetCategory = await ctx.prisma.budgetCategory.findUnique({
    where: { budgetCategoryId },
  });

  if (!existingBudgetCategory) {
    throw new Error('Budget category not found');
  }

  // Verify new category exists
  const newCategory = await ctx.prisma.category.findUnique({
    where: { categoryId },
  });

  if (!newCategory) {
    throw new Error('Category not found');
  }

  // Check if the new category is already used in this budget
  const existingCategoryInBudget = await ctx.prisma.budgetCategory.findFirst({
    where: {
      budgetId: existingBudgetCategory.budgetId,
      categoryId: categoryId,
      budgetCategoryId: {
        not: budgetCategoryId,
      },
    },
  });

  if (existingCategoryInBudget) {
    throw new Error('This category is already added to the budget');
  }

  try {
    await ctx.prisma.budgetCategory.update({
      where: { budgetCategoryId },
      data: { categoryId },
    });
  } catch (error) {
    console.error('Failed to update budget category:', error);
    throw new Error('Database update failed');
  }

  revalidatePath('/budgets');
  return {
    message: `Successfully updated budget category to ${newCategory.name}`,
  };
}

export async function deleteBudgetCategory(props: unknown, ctx: Context = context) {
  if (!isObject(props) || !hasProperty(props, 'budgetCategoryId')) {
    throw new Error('Budget category deletion requires budgetCategoryId');
  }
  if (!isNumber(props.budgetCategoryId)) {
    throw new Error('Budget category ID must be a number');
  }

  const { budgetCategoryId } = props;

  // Verify budget category exists
  const existingBudgetCategory = await ctx.prisma.budgetCategory.findUnique({
    where: { budgetCategoryId },
    include: {
      category: true,
    },
  });

  if (!existingBudgetCategory) {
    throw new Error('Budget category not found');
  }

  try {
    await ctx.prisma.budgetCategory.delete({
      where: { budgetCategoryId },
    });
  } catch (error) {
    console.error('Failed to delete budget category:', error);
    throw new Error('Database update failed');
  }

  revalidatePath('/budgets');
  return {
    message: `Successfully deleted ${existingBudgetCategory.category.name} from budget`,
  };
}

export async function copyPreviousMonthCategories(props: unknown, ctx: Context = context) {
  if (!isObject(props) || !hasProperty(props, 'year') || !hasProperty(props, 'month')) {
    throw new Error('Copying categories requires year and month');
  }
  if (!isNumber(props.year)) {
    throw new Error('Year must be a number');
  }
  if (!isNumber(props.month)) {
    throw new Error('Month must be a number');
  }

  const { year, month } = props;

  // Calculate previous month
  const currentDate = dayjs(`${year}-${month}-01`);
  const previousMonth = currentDate.subtract(1, 'month');

  // Calculate start and end dates for previous month
  const previousStartDate = previousMonth.startOf('month').toDate();
  const previousEndDate = previousMonth.endOf('month').toDate();

  // Find previous month's budget
  const previousBudget = await ctx.prisma.budget.findFirst({
    where: {
      startDate: {
        lte: previousEndDate,
      },
      endDate: {
        gte: previousStartDate,
      },
    },
    include: {
      budgetCategories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!previousBudget) {
    throw new Error('No budget found for the previous month');
  }

  // Calculate start and end dates for current month
  const currentStartDate = currentDate.startOf('month').toDate();
  const currentEndDate = currentDate.endOf('month').toDate();

  // Find current month's budget
  let currentBudget = await ctx.prisma.budget.findFirst({
    where: {
      startDate: {
        lte: currentEndDate,
      },
      endDate: {
        gte: currentStartDate,
      },
    },
    include: {
      budgetCategories: true,
    },
  });

  // If no current budget exists, create one
  if (!currentBudget) {
    // Create budget name from month and year
    const budgetName = currentDate.format('MMMM YYYY');

    // Get or create a default budget group
    let budgetGroup = await ctx.prisma.budgetGroup.findFirst({
      where: {
        name: 'Default',
      },
    });

    if (!budgetGroup) {
      budgetGroup = await ctx.prisma.budgetGroup.create({
        data: {
          name: 'Default',
        },
      });
    }

    try {
      currentBudget = await ctx.prisma.budget.create({
        data: {
          name: budgetName,
          startDate: currentStartDate,
          endDate: currentEndDate,
          budgetGroupId: budgetGroup.budgetGroupId,
        },
        include: {
          budgetCategories: true,
        },
      });
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw new Error('Failed to create budget for the current month');
    }
  }

  // Check if current budget already has categories
  if (currentBudget.budgetCategories.length > 0) {
    throw new Error('Current budget already has categories. Cannot copy from previous month.');
  }

  // Copy categories from previous month
  const copiedCategories = [];
  for (const prevCategory of previousBudget.budgetCategories) {
    try {
      const newBudgetCategory = await ctx.prisma.budgetCategory.create({
        data: {
          budgetId: currentBudget.budgetId,
          categoryId: prevCategory.categoryId,
          amount: prevCategory.amount,
        },
      });
      copiedCategories.push(newBudgetCategory);
    } catch (error) {
      console.error(`Failed to copy category ${prevCategory.category.name}:`, error);
      // Continue with other categories even if one fails
    }
  }

  if (copiedCategories.length === 0) {
    throw new Error('Failed to copy any categories from the previous month');
  }

  revalidatePath('/budgets');
  return {
    message: `Successfully created budget and copied ${copiedCategories.length} categories from ${previousMonth.format('MMMM YYYY')}`,
    copiedCount: copiedCategories.length,
  };
}
