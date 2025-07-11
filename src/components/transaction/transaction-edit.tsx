'use client';

import { Button } from '@/src/components/ui/button';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/src/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/form';
import { formSchema, FormSchema } from '@/src/lib/transaction.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { SelectSingleEventHandler } from 'react-day-picker';
import { Category } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { updateTransaction } from '@/src/app/actions';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';

interface TransactionEditProps {
  id: number;
  name: string;
  amount: number;
  date: Date;
  categoryId: number;
  categories: Category[];
  handleClose: () => void;
}

const TransactionEdit: React.FC<TransactionEditProps> = ({
  id,
  name,
  amount,
  date,
  categoryId,
  categories,
  handleClose,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(amount.toString());
  const [isFocused, setIsFocused] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      amount,
      date,
      category: categoryId,
    },
  });

  // Focus name input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Parse currency string to number
  function parseCurrency(value: string): number {
    const cleanValue = value.replace(/[$,]/g, '');
    return parseFloat(cleanValue) || 0;
  }

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setDisplayAmount(newAmount);

    const numericValue = parseCurrency(newAmount);
    if (!isNaN(numericValue)) {
      form.setValue('amount', numericValue);
    }
  };

  // Handle focus - show raw value
  const handleFocus = () => {
    setIsFocused(true);
    setDisplayAmount(amount.toString());
  };

  // Handle blur - format as currency
  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseCurrency(displayAmount);
    if (!isNaN(numericValue)) {
      setDisplayAmount(formatCurrency(numericValue));
      form.setValue('amount', numericValue);
    }
  };

  function handleEditSubmit(values: FormSchema) {
    updateTransaction(id, values);
    handleClose();
  }

  const handleCancelClick = () => {
    handleClose();
  };

  const handleCalendarChange: SelectSingleEventHandler = (newDate) => {
    if (newDate) {
      form.setValue('date', newDate, { shouldValidate: true });
      setCalendarOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelClick();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleEditSubmit)} onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-2">
          {/* Category */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                          <div className="flex items-center gap-2">
                            <span>{category.name}</span>
                            <span
                              className={`text-xs px-1 py-0.5 rounded ${
                                category.type === 'CREDIT'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {category.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Amount */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="amount"
              render={() => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="$0.00"
                      value={
                        isFocused ? displayAmount : formatCurrency(parseFloat(displayAmount) || 0)
                      }
                      onChange={handleAmountChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className="h-8 text-sm font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-8 w-full justify-start text-left font-normal text-sm',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {field.value ? format(field.value, 'MMM dd') : <span>Pick date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleCalendarChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Name */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Transaction name"
                      {...field}
                      ref={nameInputRef}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="h-8 w-8 p-0" aria-label="Save transaction">
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCancelClick}
              aria-label="Cancel edit"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default TransactionEdit;
