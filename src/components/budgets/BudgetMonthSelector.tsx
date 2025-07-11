'use client';

import { Button } from '@/src/components/ui/button';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useMemo } from 'react';
import VirtualizedYearDropdown from './VirtualizedYearSelect';

interface LocalProps {
  date?: Date;
}

const BudgetMonthSelector: FC<LocalProps> = ({ date }) => {
  const router = useRouter();

  // Get current date if no date is provided
  const currentDate = date || new Date();
  const currentYear = dayjs(currentDate).year();
  const currentMonth = dayjs(currentDate).month(); // 0-based month index

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Generate a range of years (from 1900 to 2100 for a large virtualized list)
  const years = useMemo(() => {
    const startYear = 1900;
    const endYear = 2100;
    const yearRange = [];

    for (let year = startYear; year <= endYear; year++) {
      yearRange.push(year);
    }

    return yearRange;
  }, []);

  // Redirect to current year/month if no date is provided
  useEffect(() => {
    if (!date) {
      const year = dayjs().year();
      const month = dayjs().month() + 1; // Convert to 1-based month
      router.push(`/${year}/${month}`);
    }
  }, [date, router]);

  function handleMonthSelect(monthIndex: number) {
    const year = dayjs(currentDate).year();
    const month = monthIndex + 1; // monthIndex is 0-based, but we need 1-based
    router.push(`/${year}/${month}`);
  }

  function handleYearSelect(year: number) {
    const month = dayjs(currentDate).month() + 1; // current month (1-based)
    router.push(`/${year}/${month}`);
  }

  return (
    <div className="space-y-6">
      {/* Header with Year Dropdown */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Year:</span>
          <VirtualizedYearDropdown
            years={years}
            currentYear={currentYear}
            onYearSelect={handleYearSelect}
          />
        </div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-4 gap-2">
        {months.map((month, index) => (
          <Button
            key={month}
            variant={currentMonth === index ? 'default' : 'outline'}
            onClick={() => handleMonthSelect(index)}
            className="h-12"
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BudgetMonthSelector;
