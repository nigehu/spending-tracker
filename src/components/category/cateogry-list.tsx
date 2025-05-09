'use client';

import type { Category } from '@prisma/client';
import React from 'react';
import CategoryCard from './category-card';
import CategoryEditForm from './category-edit-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const [filter, setFilter] = React.useState<string>('ALL');
  const [cardEditing, setCardEditing] = React.useState<number | undefined>(undefined);

  const handleCardClick = (id?: number) => {
    setCardEditing((prev) => (prev === id ? undefined : id));
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const filteredCategories = React.useMemo(() => {
    if (filter === 'ALL') return categories;
    return categories.filter((category) => category.type === filter);
  }, [categories, filter]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Categories</h1>
        <div>
          <Select onValueChange={handleFilterChange} defaultValue={filter}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select a transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
              <SelectItem value="DEBIT">Debit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <li key={category.categoryId}>
            {cardEditing === category.categoryId ? (
              <CategoryEditForm category={category} onClose={handleCardClick} />
            ) : (
              <CategoryCard category={category} onEdit={handleCardClick} />
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CategoryList;
