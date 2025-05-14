'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FormSchema } from '@/src/lib/transaction.utils';
import { Transaction } from '@prisma/client';
import { Context, context } from '@/lib/context';

export async function createTransaction(
  { name, amount, date, category }: FormSchema,
  ctx: Context = context,
) {
  let response: Transaction | undefined = undefined;
  try {
    response = await ctx.prisma.transaction.create({
      data: {
        name,
        amount,
        date,
        categoryId: category,
      },
    });
    console.log(response);
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
