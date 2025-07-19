'use client';

import { formatCurrency } from '@/src/lib/utils';
import { FC } from 'react';

interface BudgetTotalProps {
  title: string;
  children: number;
  color?: boolean;
  reverse?: boolean;
}

const BudgetTotal: FC<BudgetTotalProps> = ({ title, children, color, reverse }) => {
  if (reverse) {
    children = -Math.abs(children);
  }
  return (
    <div className="text-right border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p
        className={`text-2xl font-bold ${color ? (children >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}
      >
        {formatCurrency(children)}
      </p>
    </div>
  );
};

export default BudgetTotal;
