'use client';

import React from 'react';
import TransactionItem from './transaction-item';
import type { Category, Transaction } from '@prisma/client';
import { deleteTransaction } from '@/src/app/actions';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories }) => {
  const handleDelete = (id: number) => {
    deleteTransaction(id);
  };

  return (
    <div className="w-full md:w-1/2 p-8 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No entries yet.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((t) => (
            <TransactionItem
              key={t.transactionId}
              id={t.transactionId}
              amount={t.amount}
              name={t.name}
              date={t.date}
              category={categories.find((c) => c.categoryId === t.categoryId)?.name || ''}
              handleDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
