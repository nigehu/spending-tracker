import prisma from '@/lib/prisma';
import { BudgetForm } from '@/src/components/budgets/budget-form';
import dayjs from 'dayjs';

export default async function Budgets({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const date = dayjs(`${year}-${month}-01`).toDate();
  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-6 w-full">
        <BudgetForm date={date} />
        {year}
        {month}
      </div>
    </div>
  );
}
