'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { X } from 'lucide-react';
import React from 'react';
import DateIcon from '../date-icon';

interface TransactionItemProps {
  id: number;
  name: string;
  amount: number;
  date: Date;
  category: string;
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
  const handleDeleteClick = () => {
    handleDelete(id);
  };

  const handleTransactionCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      // If the target is a button, do not trigger the card click event
      handleCardClick(id);
    }
  };

  return (
    <li>
      <Card
        className="flex flex-row justify-between py-0 gap-0 hover:bg-gray-50 transition duration-200 ease-in-out cursor-pointer"
        onClick={handleTransactionCardClick}
      >
        <div className="w-8 rounded-l-xl">
          <p className="text-sm font-medium w-25 h-25 text-center overflow-hidden transform rotate-[270deg]">
            {category}
          </p>
        </div>
        <div className="my-6 mx-6">
          <DateIcon date={new Date(date)} />
        </div>
        <div className="flex-1 flex flex-col justify-center my-6 min-w-25">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>
              {amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'CAD',
              })}
            </CardDescription>
          </CardHeader>
        </div>
        <div className="pr-6 flex flex-col justify-center m-6 min-w-15">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer hover:text-red-700"
            aria-label="Delete transaction"
            onClick={handleDeleteClick}
          >
            <X />
          </Button>
        </div>
      </Card>
    </li>
  );
};

export default TransactionItem;
