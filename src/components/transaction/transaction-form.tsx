'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { context } from '@/lib/context';

interface TransactionFormProps {
  categories: Category[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ categories }) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date: new Date(),
    },
  });

  function onSubmit(values: FormSchema) {
    createTransaction(values, context);
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
                <Input placeholder="Name of the purchase" {...field} />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="Amount" {...field} />
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
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="cursor-pointer" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};
