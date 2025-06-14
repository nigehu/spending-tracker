'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { addNewCategory } from '@/src/app/categories/actions';
import { formSchema, FormSchema } from '@/src/lib/category.utils';
import { MonthPicker } from '../ui/monthpicker';
import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

interface LocalProps {
  date: Date;
}

export const BudgetForm: FC<LocalProps> = ({ date }) => {
  const router = useRouter();

  function handleMonthChange(newDate: Date) {
    const month = dayjs(newDate).format('M');
    const year = dayjs(newDate).year();
    router.push(`/budgets/${year}/${month}`);
  }

  return (
    <div>
      <MonthPicker
        className="h-full w-full"
        variant={{
          calendar: {
            main: 'outline',
          },
        }}
        selectedMonth={date}
        onMonthSelect={handleMonthChange}
      />
    </div>
  );
};
