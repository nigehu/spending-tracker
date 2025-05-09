import prisma from '@/lib/prisma';
import { CategoryForm } from '@/src/components/category/category-form';
import CategoryList from '@/src/components/category/cateogry-list';

export default async function Categories() {
  const categories = await prisma.category.findMany();
  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-6 w-full">
        <CategoryList categories={categories} />
      </div>
      <div className="h-[calc(100vh_-_37px)] w-full md:w-1/2 p-8 bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Add New Category</h1>
        <CategoryForm />
      </div>
    </div>
  );
}
