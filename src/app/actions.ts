'use server';

import prisma from '@/lib/prisma';
import { FormSchema } from '../components/transaction/transaction-form';
import { revalidatePath } from 'next/cache';

export async function addNewTransaction({ name, amount, date }: FormSchema) {
  try {
    await prisma.transaction.create({
      data: {
        name,
        amount,
        date,
        categoryId: 1,
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
