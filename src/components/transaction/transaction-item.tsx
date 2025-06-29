'use client';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { X } from 'lucide-react';
import React from 'react';
import DateIcon from '../date-icon';
import { Category } from '@prisma/client';

interface TransactionItemProps {
  id: number;
  name: string;
  amount: number;
  date: Date;
  category?: Category;
  handleCardClick: (id: number) => void;
  handleDelete: (id: number) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  name,
  amount,
  date,
  category,
  handleCardClick,
  handleDelete,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDelete(id);
  };

  const handleTransactionCardClick = () => {
    handleCardClick(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <li className="mb-3">
      <Card
        className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-gray-200"
        onClick={handleTransactionCardClick}
      >
        <div className="flex items-center gap-4">
          {/* Date Icon */}
          <div className="flex-shrink-0">
            <DateIcon date={new Date(date)} />
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category?.name || 'Uncategorized'}</p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 ml-4">
                <p
                  className={`text-lg font-semibold ${
                    category?.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(Math.abs(amount))}
                </p>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Delete transaction"
              onClick={handleDeleteClick}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
};

export default TransactionItem;
