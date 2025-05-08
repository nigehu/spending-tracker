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
  handleDelete: (id: number) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  name,
  amount,
  date,
  category,
  handleDelete,
}) => {
  const handleDeleteClick = () => {
    handleDelete(id);
  };

  return (
    <li>
      <Card className="flex flex-row justify-between py-0 gap-0">
        <div className="w-8 bg-gradient-to-r from-red-500 to-white-500 rounded-l-xl">
          <p className="text-sm font-medium w-25 h-25 text-center overflow-hidden transform rotate-[270deg]">
            {category}
          </p>
        </div>
        <div className="my-6 mx-6">
          <DateIcon date={new Date(date)} />
        </div>
        <div className="flex-1 flex flex-col justify-center my-6">
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
        <div className="pr-6 flex flex-col justify-center m-6">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer hover:text-red-700"
            aria-label="Delete category"
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
