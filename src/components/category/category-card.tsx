'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import type { Category } from '@prisma/client';
import { deleteCategory } from '@/src/app/categories/actions';

interface CategoryCardProps {
  category: Category;
  onEdit: (id: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category: { categoryId, name, type, description },
  onEdit,
}) => {
  const handleDelete = () => {
    console.log('delete category', categoryId);
    deleteCategory(categoryId);
  };
  const handleEdit = () => {
    onEdit(categoryId);
  };

  const typeColor = type === 'CREDIT' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-1">
        <CardTitle className="text-lg leading-tight">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">{description}</CardDescription>
        <div className={`text-xs font-medium mt-2 ${typeColor}`}>{type}</div>
      </CardHeader>
      <CardFooter className="pt-4">
        <div className="flex flex-row gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer hover:text-blue-700"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer hover:text-red-700"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
