import { X } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import type { Category } from '@prisma/client';

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <ul className="space-y-2">
      {categories.map((category) => (
        <li key={category.categoryId}>
          <Card key={category.categoryId} className="flex flex-row justify-between">
            <div className="flex-1">
              <CardHeader>
                <CardTitle>
                  {category.name} ({category.type})
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </div>
            <div className="pr-6">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer hover:text-red-700"
                aria-label="Delete category"
              >
                <X />
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;
