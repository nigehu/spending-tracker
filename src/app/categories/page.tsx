import React from 'react';

type Category = {
  id: number;
  name: string;
};

const categories: Category[] = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Utilities' },
];

export default async function Categories() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Categories</h1>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="p-4 bg-white shadow rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
