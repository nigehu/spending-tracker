'use client';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

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

export default VirtualizedYearDropdown;
