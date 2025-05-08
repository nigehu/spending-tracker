'use server';

import prisma from '@/lib/prisma';
import { FormSchema } from '@/src/components/category/category-form';
import { revalidatePath } from 'next/cache';

export async function addNewCategory({ name, transactionType, description }: FormSchema) {
  try {
    await prisma.category.create({
      data: {
        name,
        type: transactionType,
        description: description ?? '',
      },
    });
  } catch (error) {
    console.error('Failed to update:', error);
    throw new Error('Database update failed');
  }
  revalidatePath('/categories');
}

export async function deleteCategory(id: number) {
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
  revalidatePath('/categories');
}
