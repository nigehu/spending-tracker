'use client';

import type { Category } from '@prisma/client';
import React from 'react';
import CategoryCard from './category-card';
import CategoryEditForm from './category-edit-form';

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const [cardEditing, setCardEditing] = React.useState<number | undefined>(undefined);

  const handleCardClick = (id?: number) => {
    setCardEditing((prev) => (prev === id ? undefined : id));
  };

  // Separate categories by type
  const debitCategories = categories.filter((category) => category.type === 'DEBIT');
  const creditCategories = categories.filter((category) => category.type === 'CREDIT');

  const renderCategoryList = (
    categoryList: Category[],
    title: string,
    theme: 'debit' | 'credit',
  ) => {
    const themeClasses = {
      debit: {
        header: 'text-red-800',
        container: 'border-red-200',
      },
      credit: {
        header: 'text-green-800',
        container: 'border-green-200',
      },
    };

    return (
      <div
        className={`mb-8 p-6 bg-white border rounded-lg shadow-sm ${themeClasses[theme].container}`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses[theme].header}`}>
          {title} ({categoryList.length})
        </h2>
        {categoryList.length === 0 ? (
          <p className="text-gray-500 italic">No {title.toLowerCase()} categories found</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {categoryList.map((category) => (
              <li key={category.categoryId}>
                {cardEditing === category.categoryId ? (
                  <CategoryEditForm category={category} onClose={handleCardClick} />
                ) : (
                  <CategoryCard category={category} onEdit={handleCardClick} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCategoryList(debitCategories, 'Debit Categories', 'debit')}
        {renderCategoryList(creditCategories, 'Credit Categories', 'credit')}
      </div>
    </>
  );
};

export default CategoryList;
