'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FormSchema } from '@/src/lib/transaction.utils';

export async function addNewTransaction({ name, amount, date, category }: FormSchema) {
  try {
    await prisma.transaction.create({
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
