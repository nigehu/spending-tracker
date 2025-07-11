'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema } from '@/src/lib/transaction.utils';
import { useRef, useEffect, useState } from 'react';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, DollarSign } from 'lucide-react';

import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Category } from '@prisma/client';
import { createTransaction } from '../../app/actions';

interface TransactionInputSectionProps {
  categories: Category[];
}

const multiTransactionSchema = z.object({
  transactions: z.array(formSchema),
});
type MultiTransactionForm = z.infer<typeof multiTransactionSchema>;

const TransactionInputSection: React.FC<TransactionInputSectionProps> = ({ categories }) => {
  const form = useForm<MultiTransactionForm>({
    resolver: zodResolver(multiTransactionSchema),
    defaultValues: {
      transactions: [{ name: '', date: new Date(), amount: undefined, category: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions',
  });
  const isSubmitting = form.formState.isSubmitting;

  // Refs for amount input fields
  const amountRefs = useRef<(HTMLInputElement | null)[]>([]);
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastAddedIndex = useRef<number>(-1);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // State to track which calendar is open
  const [openCalendars, setOpenCalendars] = useState<boolean[]>([]);
  const [submissionError, setSubmissionError] = useState<string>('');

  // Focus on the amount field of the newly added row
  useEffect(() => {
    if (lastAddedIndex.current >= 0 && amountRefs.current[lastAddedIndex.current]) {
      amountRefs.current[lastAddedIndex.current]?.focus();
      lastAddedIndex.current = -1; // Reset after focusing
    }
  }, [fields.length]);

  const handleCategoryKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();

      if (currentIndex < fields.length - 1) {
        // Move to next row's category field
        const nextIndex = currentIndex + 1;
        if (categoryRefs.current[nextIndex]) {
          categoryRefs.current[nextIndex]?.focus();
        }
      } else {
        // Move to Add Another Transaction button
        addButtonRef.current?.focus();
      }
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();

      if (currentIndex < fields.length - 1) {
        // Move to next row's amount field
        const nextIndex = currentIndex + 1;
        if (amountRefs.current[nextIndex]) {
          amountRefs.current[nextIndex]?.focus();
        }
      } else {
        // Move to Add Another Transaction button
        addButtonRef.current?.focus();
      }
    }
  };

  const handleAddRow = () => {
    const newIndex = fields.length;
    const currentValues = form.getValues();
    const lastTransaction = currentValues.transactions[currentValues.transactions.length - 1];
    const newDate = lastTransaction?.date || new Date();

    append({ name: '', date: newDate, amount: undefined, category: 0 });
    lastAddedIndex.current = newIndex;
  };

  const handleDateSelect = (date: Date | undefined, index: number) => {
    if (date) {
      form.setValue(`transactions.${index}.date`, date);
      // Close the calendar for this row
      const newOpenCalendars = [...openCalendars];
      newOpenCalendars[index] = false;
      setOpenCalendars(newOpenCalendars);
    }
  };

  const toggleCalendar = (index: number) => {
    const newOpenCalendars = [...openCalendars];
    newOpenCalendars[index] = !newOpenCalendars[index];
    setOpenCalendars(newOpenCalendars);
  };

  const onSubmit = async (values: MultiTransactionForm) => {
    setSubmissionError(''); // Clear previous errors

    try {
      for (const row of values.transactions) {
        await createTransaction({
          name: row.name,
          amount: row.amount,
          date: row.date,
          category: row.category,
        });
      }
      form.reset();
    } catch (error) {
      console.error(error);
      setSubmissionError('Failed to create transactions. Please try again.');
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit, (errors) => {
    // Handle validation errors
    const errorMessages: string[] = [];

    if (errors.transactions && Array.isArray(errors.transactions)) {
      errors.transactions.forEach((rowErrors, index) => {
        if (rowErrors) {
          const rowNumber = index + 1;
          const fieldErrors: string[] = [];

          if (rowErrors.name) fieldErrors.push(`Name: ${rowErrors.name.message}`);
          if (rowErrors.amount) fieldErrors.push(`Amount: ${rowErrors.amount.message}`);
          if (rowErrors.date) fieldErrors.push(`Date: ${rowErrors.date.message}`);
          if (rowErrors.category) fieldErrors.push(`Category: ${rowErrors.category.message}`);

          if (fieldErrors.length > 0) {
            errorMessages.push(`Row ${rowNumber}: ${fieldErrors.join(', ')}`);
          }
        }
      });
    }

    setSubmissionError(
      errorMessages.length > 0 ? errorMessages.join('\n') : 'Please fix the errors above.',
    );
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {submissionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              <div className="mt-2 text-sm text-red-700">
                <pre className="whitespace-pre-wrap font-sans">{submissionError}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-sm font-medium text-gray-700">
          <div>Category</div>
          <div>Amount</div>
          <div>Date</div>
          <div>Name</div>
          <div className="w-8">Actions</div>
        </div>

        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            {/* Category */}
            <div>
              <Controller
                control={form.control}
                name={`transactions.${idx}.category`}
                render={({ field: catField }) => (
                  <Select
                    value={catField.value ? String(catField.value) : ''}
                    onValueChange={(value) => catField.onChange(Number(value))}
                  >
                    <SelectTrigger
                      className="h-9 text-sm w-full"
                      ref={(el) => {
                        categoryRefs.current[idx] = el;
                      }}
                      onKeyDown={(e) => handleCategoryKeyDown(e, idx)}
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((category) => (
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
                )}
              />
              <p className="text-xs text-red-600">
                {form.formState.errors.transactions?.[idx]?.category?.message as string}
              </p>
            </div>
            {/* Amount */}
            <div>
              <Controller
                control={form.control}
                name={`transactions.${idx}.amount`}
                render={({ field: amtField }) => (
                  <div className="relative h-9">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      ref={(el) => {
                        amountRefs.current[idx] = el;
                      }}
                      type="number"
                      placeholder="0.00"
                      value={amtField.value ?? ''}
                      onChange={amtField.onChange}
                      className="h-9 text-sm font-mono pl-8"
                    />
                  </div>
                )}
              />
              <p className="text-xs text-red-600">
                {form.formState.errors.transactions?.[idx]?.amount?.message as string}
              </p>
            </div>
            {/* Date */}
            <div>
              <Controller
                control={form.control}
                name={`transactions.${idx}.date`}
                render={({ field: dateField }) => (
                  <Popover open={openCalendars[idx]} onOpenChange={() => toggleCalendar(idx)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 w-full justify-start text-left font-normal text-sm"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {dateField.value ? (
                          format(dateField.value, 'MMM dd')
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateField.value}
                        onSelect={(date) => handleDateSelect(date, idx)}
                        defaultMonth={dateField.value || new Date()}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <p className="text-xs text-red-600">
                {form.formState.errors.transactions?.[idx]?.date?.message as string}
              </p>
            </div>
            {/* Name */}
            <div>
              <Controller
                control={form.control}
                name={`transactions.${idx}.name`}
                render={({ field: nameField }) => (
                  <Input
                    placeholder="Transaction name"
                    {...nameField}
                    className="h-9 text-sm w-full"
                    onKeyDown={(e) => handleNameKeyDown(e, idx)}
                  />
                )}
              />
              <p className="text-xs text-red-600">
                {form.formState.errors.transactions?.[idx]?.name?.message as string}
              </p>
            </div>
            {/* Remove Button */}
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0"
                onClick={() => remove(idx)}
                disabled={fields.length === 1}
                aria-label="Remove transaction row"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Add Row Button */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="flex items-center gap-2"
          ref={addButtonRef}
        >
          <Plus className="h-3 w-3" />
          Add Another Transaction
        </Button>
        {/* Submit Button */}
        <Button
          type="submit"
          size="sm"
          className="px-4"
          disabled={isSubmitting}
          aria-label="Add transactions"
        >
          {isSubmitting ? 'Adding...' : 'Add All Transactions'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionInputSection;
