'use client';

import React from 'react';
import type { Category, Transaction } from '@prisma/client';
import { deleteTransaction } from '@/src/app/actions';
import TransactionEdit from './transaction-edit';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import TransactionInputSection from './TransactionInputSection';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories }) => {
  const [cardEditing, setCardEditing] = React.useState<number | undefined>(undefined);

  const handleCardClick = (id?: number) => {
    setCardEditing((prev) => (prev === id ? undefined : id));
  };
  const handleDelete = (id: number) => {
    deleteTransaction(id);
  };

  const exportToJSON = () => {
    const exportData = transactions.map((t) => {
      const category = categories.find((c) => c.categoryId === t.categoryId);
      return {
        category: category?.name || 'Unknown',
        date: new Date(t.date).toISOString().split('T')[0], // YYYY-MM-DD format
        amount: t.amount,
        name: t.name,
      };
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-8 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Transactions</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionInputSection categories={categories} />
        </CardContent>
      </Card>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No entries yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Transaction List</h3>
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {' '}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((t) => {
                    const category = categories.find((c) => c.categoryId === t.categoryId);

                    if (t.transactionId === cardEditing) {
                      return (
                        <tr key={t.transactionId} className="bg-blue-50">
                          <td className="px-4 py-2 pl-24" colSpan={6}>
                            <TransactionEdit
                              id={t.transactionId}
                              amount={t.amount}
                              name={t.name}
                              date={t.date}
                              categoryId={t.categoryId}
                              categories={categories}
                              handleClose={handleCardClick}
                            />
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={t.transactionId} className="group hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                category?.type === 'CREDIT'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {category?.type || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {category?.name || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                category?.type === 'CREDIT' ? 'text-green-600' : 'text-gray-600'
                              }`}
                            >
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(t.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.DateTimeFormat('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }).format(new Date(t.date))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {t.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => handleCardClick(t.transactionId)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium p-1 rounded hover:bg-blue-50"
                                title="Edit transaction"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(t.transactionId)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium p-1 rounded hover:bg-red-50"
                                title="Delete transaction"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
