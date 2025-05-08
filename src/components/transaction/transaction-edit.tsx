'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import React from 'react';
import DateIcon from '../date-icon';
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

interface TransactionItemProps {
  id: number;
  name: string;
  amount: number;
  date: Date;
  categoryId: number;
  categories: Category[];
  handleClose: () => void;
}

const TransactionEdit: React.FC<TransactionItemProps> = ({
  id,
  name,
  amount,
  date,
  categoryId,
  categories,
  handleClose,
}) => {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      amount,
      date,
      category: categoryId,
    },
  });

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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      console.log(true);
    }
  };

  return (
    <li>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-8">
          <Card className="flex flex-row justify-between py-0 gap-0" onClick={handleCardClick}>
            <div className="w-8 bg-gradient-to-r from-red-500 to-white-500 rounded-l-xl">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
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
            </div>
            <div className="my-6 mx-6 flex flex-col justify-center">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="ghost" className="h-20 cursor-pointer" type="button">
                          <DateIcon date={new Date(field.value)} />
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
                )}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center my-6">
              <CardHeader>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <CardTitle>{<Input placeholder="Name of the purchase" {...field} />}</CardTitle>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <CardDescription>
                      {<Input placeholder="Amount" className="w-50" {...field} />}
                    </CardDescription>
                  )}
                />
              </CardHeader>
            </div>
            <div className="pr-6 flex flex-col justify-center m-6">
              <Button
                size="icon"
                className="cursor-pointer px-8 mb-2"
                aria-label="Save transaction"
                type="submit"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="cursor-pointer px-8"
                aria-label="Save transaction"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </li>
  );
};

export default TransactionEdit;
