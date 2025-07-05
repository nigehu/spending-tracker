'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FormSchema } from '@/src/lib/transaction.utils';
import { Transaction } from '@prisma/client';
import { Context, context } from '@/lib/context';
import {
  hasProperty,
  isDefined,
  isNumber,
  isObject,
  isString,
  isArray,
} from '../lib/typeguard.utils';
import { isDate } from 'date-fns';

export async function createTransaction(props: unknown, ctx: Context = context) {
  if (
    !isObject(props) ||
    !hasProperty(props, 'name') ||
    !hasProperty(props, 'amount') ||
    !hasProperty(props, 'date') ||
    !hasProperty(props, 'category')
  ) {
    throw new Error('Transaction requires the following fields: name, amount, date, category');
  }
  if (!isString(props.name)) {
    throw new Error('Transaction name must be a string');
  }
  if (!isNumber(props.amount)) {
    throw new Error('Transaction amount must be a number');
  }
  if (!isDate(props.date)) {
    throw new Error('Transaction date must be a date');
  }
  if (!isNumber(props.category)) {
    throw new Error('Transaction category must be a number');
  }

  const { name, amount, date, category: categoryId } = props;

  const category = await ctx.prisma.category.findUnique({
    where: {
      categoryId: categoryId,
    },
  });
  if (!isDefined(category)) {
    throw new Error('Transaction category must exist');
  }
  let response: Transaction | undefined = undefined;
  try {
    response = await ctx.prisma.transaction.create({
      data: {
        name,
        amount,
        date,
        categoryId: category.categoryId,
      },
    });
  } catch (error) {
    console.error('Failed to update:', error);
    throw new Error('Database update failed');
  }
  revalidatePath('/');
  return response;
}

export async function updateTransaction(id: number, { name, amount, date, category }: FormSchema) {
  try {
    await prisma.transaction.update({
      where: {
        transactionId: id,
      },
      data: {
        name,
        amount,
        date,
        categoryId: category,
      },
    });
  } catch (error) {
    console.error('Failed to update:', error);
    throw new Error('Database update failed');
  }
  revalidatePath('/');
}

export async function deleteTransaction(id: number) {
  try {
    await prisma.transaction.delete({
      where: {
        transactionId: id,
      },
    });
  } catch (error) {
    console.error('Failed to delete:', error);
    throw new Error('Database delete failed');
  }
  revalidatePath('/');
}

interface BulkTransactionData {
  name: string;
  amount: number;
  date: Date;
  categoryId: number;
}

export async function bulkImportTransactions(
  transactions: BulkTransactionData[],
  ctx: Context = context,
) {
  if (!isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  if (transactions.length === 0) {
    throw new Error('No transactions to import');
  }

  if (transactions.length > 1000) {
    throw new Error('Cannot import more than 1000 transactions at once');
  }

  // Validate each transaction
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];

    if (!isObject(transaction)) {
      throw new Error(`Transaction at index ${i} must be an object`);
    }

    if (!hasProperty(transaction, 'name') || !isString(transaction.name)) {
      throw new Error(`Transaction at index ${i} must have a valid name`);
    }

    if (!hasProperty(transaction, 'amount') || !isNumber(transaction.amount)) {
      throw new Error(`Transaction at index ${i} must have a valid amount`);
    }

    if (!hasProperty(transaction, 'date') || !isDate(transaction.date)) {
      throw new Error(`Transaction at index ${i} must have a valid date`);
    }

    if (!hasProperty(transaction, 'categoryId') || !isNumber(transaction.categoryId)) {
      throw new Error(`Transaction at index ${i} must have a valid categoryId`);
    }
  }

  // Verify all categories exist
  const categoryIds = [...new Set(transactions.map((t) => t.categoryId))];
  const existingCategories = await ctx.prisma.category.findMany({
    where: {
      categoryId: {
        in: categoryIds,
      },
    },
    select: {
      categoryId: true,
    },
  });

  const existingCategoryIds = new Set(existingCategories.map((c) => c.categoryId));
  const missingCategoryIds = categoryIds.filter((id) => !existingCategoryIds.has(id));

  if (missingCategoryIds.length > 0) {
    throw new Error(`Categories not found: ${missingCategoryIds.join(', ')}`);
  }

  let createdTransactions: Transaction[] = [];
  let result;

  try {
    // Use createMany for better performance
    result = await ctx.prisma.transaction.createMany({
      data: transactions.map((transaction) => ({
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        categoryId: transaction.categoryId,
      })),
      skipDuplicates: false, // Allow duplicates for now, can be made configurable
    });

    // Fetch the created transactions for return
    createdTransactions = await ctx.prisma.transaction.findMany({
      where: {
        name: {
          in: transactions.map((t) => t.name),
        },
        amount: {
          in: transactions.map((t) => t.amount),
        },
        date: {
          in: transactions.map((t) => t.date),
        },
        categoryId: {
          in: transactions.map((t) => t.categoryId),
        },
      },
      orderBy: {
        transactionId: 'desc',
      },
      take: result.count,
    });
  } catch (error) {
    console.error('Failed to bulk import transactions:', error);
    throw new Error('Failed to import transactions');
  }

  revalidatePath('/');
  revalidatePath('/transactions');

  return {
    success: true,
    importedCount: result.count,
    transactions: createdTransactions,
  };
}
