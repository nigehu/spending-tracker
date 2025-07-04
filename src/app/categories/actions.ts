'use server';

import prisma from '@/lib/prisma';
import { FormSchema } from '@/src/lib/category.utils';
import { revalidatePath } from 'next/cache';

export async function addNewCategory({ name, transactionType, description }: FormSchema) {
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        type: transactionType,
        description: description ?? '',
      },
    });
    revalidatePath('/categories');
    return newCategory;
  } catch (error) {
    console.error('Failed to create:', error);
    throw new Error('Database create failed');
  }
}

export async function updateCategory(
  id: number,
  { name, transactionType, description }: FormSchema,
) {
  try {
    await prisma.category.update({
      where: {
        categoryId: id,
      },
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
    console.log(`Deleting category ${id}`);
    await prisma.category.delete({
      where: {
        categoryId: id,
      },
    });
  } catch (error) {
    console.error('Failed to delete:', error);
    throw new Error('Database delete failed');
  }
  revalidatePath('/categories');
}
