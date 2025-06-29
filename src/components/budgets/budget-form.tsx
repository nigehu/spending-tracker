'use client';

import { Button } from '@/src/components/ui/button';
import { FC, useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { FixedSizeList as List } from 'react-window';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { Budget, BudgetCategory, Category, BudgetGroup } from '@prisma/client';
import { BudgetCategories } from './budget-categories';

interface LocalProps {
  date?: Date;
  budget?: Budget & {
    budgetCategories: (BudgetCategory & {
      category: Category;
    })[];
    budgetGroup: BudgetGroup;
  };
  allCategories?: Category[];
  categoryTransactionTotals?: Record<number, number>;
  hasPreviousMonthBudget?: boolean;
  canCopyFromPrevious?: boolean;
}

interface VirtualizedYearDropdownProps {
  years: number[];
  currentYear: number;
  onYearSelect: (year: number) => void;
}

const VirtualizedYearDropdown: FC<VirtualizedYearDropdownProps> = ({
  years,
  currentYear,
  onYearSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);

  const ITEM_HEIGHT = 36;
  const MAX_HEIGHT = 200;

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to current year when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const currentYearIndex = years.findIndex((year) => year === currentYear);
      if (currentYearIndex !== -1) {
        listRef.current.scrollToItem(currentYearIndex, 'center');
      }
    }
  }, [isOpen, currentYear, years]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const year = years[index];
    return (
      <div
        style={style}
        className={cn(
          'px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors',
          year === currentYear && 'bg-accent text-accent-foreground',
        )}
        onClick={() => {
          onYearSelect(year);
          setIsOpen(false);
        }}
      >
        {year}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" className="w-32 justify-between" onClick={() => setIsOpen(!isOpen)}>
        <span>{currentYear}</span>
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50">
          <List
            ref={listRef}
            height={Math.min(years.length * ITEM_HEIGHT, MAX_HEIGHT)}
            itemCount={years.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        </div>
      )}
    </div>
  );
};

export const BudgetForm: FC<LocalProps> = ({
  date,
  budget,
  allCategories = [],
  categoryTransactionTotals = {},
  hasPreviousMonthBudget = false,
  canCopyFromPrevious = false,
}) => {
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

      {/* Budget Information */}
      {budget && (
        <BudgetCategories
          budget={budget}
          allCategories={allCategories}
          categoryTransactionTotals={categoryTransactionTotals}
          hasPreviousMonthBudget={hasPreviousMonthBudget}
          canCopyFromPrevious={canCopyFromPrevious}
          currentYear={currentYear}
          currentMonth={currentMonth + 1} // Convert to 1-based month
        />
      )}
    </div>
  );
};
