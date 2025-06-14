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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {name} ({type})
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer hover:text-blue-700"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer hover:text-red-700"
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
