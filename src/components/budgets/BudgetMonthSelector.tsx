'use client';

import { Button } from '@/src/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useMemo, useState } from 'react';
import VirtualizedYearDropdown from './VirtualizedYearSelect';

interface LocalProps {
  date: Date;
}

const BudgetMonthSelector: FC<LocalProps> = ({ date }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Get current date if no date is provided
  const today = dayjs();
  const currentDate = dayjs(date) || today;
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month(); // 0-based month index

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

  function handleMonthSelect(monthIndex: number) {
    const month = monthIndex + 1; // monthIndex is 0-based, but we need 1-based
    router.push(`/${currentYear}/${month}`);
  }

  function handleYearSelect(year: number) {
    const month = currentMonth + 1; // current month (1-based)
    router.push(`/${year}/${month}`);
  }

  const handleBackwardMonth = () => {
    const nextMonthIndex = currentMonth - 1;
    handleMonthSelect(nextMonthIndex);
  };

  const handleForwardMonth = () => {
    const nextMonthIndex = currentMonth + 1;
    handleMonthSelect(nextMonthIndex);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2 pb-2">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4 py-2 px-10 bg-white border border-gray-200 rounded-sm shadow-sm">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleBackwardMonth}>
            <ChevronLeft />
          </Button>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2">
              <Button variant="ghost">
                <h2 className="text-2xl font-bold text-gray-900">{months[currentMonth]}</h2>
                <ChevronsUpDown />
              </Button>
            </div>
          </CollapsibleTrigger>
          <VirtualizedYearDropdown
            years={years}
            currentYear={currentYear}
            onYearSelect={handleYearSelect}
          />
          <Button variant="ghost" size="icon" className="size-8" onClick={handleForwardMonth}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <CollapsibleContent
        className={`grid grid-cols-4 gap-2 overflow-hidden ${open ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BudgetMonthSelector;
