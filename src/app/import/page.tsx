'use server';

import prisma from '@/lib/prisma';
import ImportWalkthrough from '@/src/components/import/ImportWalkthrough';

export default async function ImportPage() {
  const categories = await prisma.category.findMany();

  return <ImportWalkthrough categories={categories} />;
}
