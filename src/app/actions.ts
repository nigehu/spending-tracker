'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FormSchema } from '@/src/lib/transaction.utils';
import { Transaction } from '@prisma/client';
import { Context, context } from '@/lib/context';
import { hasProperty, isDefined, isNumber, isObject, isString } from '../lib/typeguard.utils';
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
