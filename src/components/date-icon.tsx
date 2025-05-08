import { format } from 'date-fns';
import React from 'react';

interface DateIconProps {
  date: Date;
}

const DateIcon: React.FC<DateIconProps> = ({ date }) => {
  return (
    <div className="flex flex-col items-center justify-center p-1 rounded-md shadow-sm bg-white w-14 h-14">
      <span className="text-s font-medium text-gray-800 leading-none pb-1">
        {format(date, 'MMM')}
      </span>
      <span className="text-xs text-gray-500 leading-none">{format(date, 'dd')}</span>
    </div>
  );
};

export default DateIcon;
