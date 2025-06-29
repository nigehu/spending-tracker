'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';

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
import { formSchema, FormSchema } from '@/src/lib/transaction.utils';
import { Category } from '@prisma/client';
import { createTransaction } from '../../app/actions';

interface TransactionFormProps {
  categories: Category[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ categories }) => {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date: new Date(),
    },
  });

  // Currency formatting function
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Parse currency string to number
  function parseCurrency(value: string): number {
    // Remove currency symbols, commas, and spaces
    const cleanValue = value.replace(/[$,]/g, '');
    return parseFloat(cleanValue) || 0;
  }

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);

    // Update display amount for formatting
    const numericValue = parseCurrency(newAmount);
    if (!isNaN(numericValue)) {
      setDisplayAmount(formatCurrency(numericValue));
    }

    // Update form value
    form.setValue('amount', numericValue);
  };

  // Handle focus - show raw value
  const handleFocus = () => {
    setIsFocused(true);
    setDisplayAmount(amount);
  };

  // Handle blur - format as currency
  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseCurrency(amount);
    if (!isNaN(numericValue)) {
      setDisplayAmount(formatCurrency(numericValue));
      setAmount(numericValue.toString());
      form.setValue('amount', numericValue);
    }
  };

  // Handle submit button key down
  const handleSubmitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      nameInputRef.current?.focus();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function onSubmit(values: FormSchema) {
    createTransaction(values);

    // Reset form and clear custom state
    form.reset();
    setAmount('');
    setDisplayAmount('');
    setIsFocused(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name of the purchase" {...field} ref={nameInputRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={() => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="$0.00"
                  value={isFocused ? amount : displayAmount}
                  onChange={handleAmountChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a purchase category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
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
        <Button className="cursor-pointer" type="submit" onKeyDown={handleSubmitKeyDown}>
          Submit
        </Button>
      </form>
    </Form>
  );
};
