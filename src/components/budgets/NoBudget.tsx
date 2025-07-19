import { CopyPreviousMonthButton } from '@/src/components/budgets/copy-previous-month-button';
import { CreateBudgetButton } from '@/src/components/budgets/create-budget-button';
import dayjs from 'dayjs';
import { FC } from 'react';

interface NoBudgetProps {
  date: Date;
  previousBudgetExists: boolean;
}

const NoBudget: FC<NoBudgetProps> = ({ date, previousBudgetExists }) => {
  const currentDate = dayjs(date);
  const year = currentDate.year();
  const month = currentDate.month() + 1; // Convert to 1-based month
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">No Budget Found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                No budget has been set up for {currentDate.format('MMMM YYYY')}. You can create a
                new budget to start tracking your spending goals.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <CreateBudgetButton year={year} month={month} />
              {previousBudgetExists && <CopyPreviousMonthButton year={year} month={month} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoBudget;
