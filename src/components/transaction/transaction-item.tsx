'use client';

import { format } from 'date-fns';
import { ShoppingCart, X } from 'lucide-react';
import React from 'react';

interface TransactionItemProps {
  id: number;
  name: string;
  amount: number;
  date: Date;
  handleDelete: (id: number) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  name,
  amount,
  date,
  handleDelete,
}) => {
  const handleDeleteClick = () => {
    handleDelete(id);
  };

  return (
    <li
      key={id}
      className="bg-white p-4 rounded shadow flex items-center justify-between hover:bg-gray-100 transition-colors"
    >
      <div className="flex flex-col items-center justify-center">
        <ShoppingCart className="text-gray-500" size={24} />
        <p className="text-xs text-blue-500">Shopping</p>
      </div>
      <div className="flex-1 w-full p-4 rounded-md flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-500">
            {amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'CAD',
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-md font-medium text-gray-700">{format(date, 'dd-MMM-yyyy')}</p>
        </div>
      </div>

      <button
        onClick={handleDeleteClick}
        className="cursor-pointer hover:text-red-700 text-lg font-bold"
        aria-label="Delete transaction"
      >
        <X />
      </button>
    </li>
  );
};

export default TransactionItem;
