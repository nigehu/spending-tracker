'use client';

import { Controller, Control, FieldError, FieldValues } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
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
import { FormSchema } from '@/src/lib/transaction.utils';

interface TransactionFormRowProps {
  fieldState: Partial<Record<keyof FormSchema, FieldError>>;
  index: number;
  remove: (index: number) => void;
  categories: Category[];
  control: Control<FieldValues>;
  fieldsLength: number;
}

export const TransactionForm: React.FC<TransactionFormRowProps> = ({
  fieldState,
  index,
  remove,
  categories,
  control,
  fieldsLength,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Category */}
      <div className="flex-1">
        <Controller
          control={control}
          name={`transactions.${index}.category`}
          render={({ field: catField }) => (
            <Select
              value={catField.value ? String(catField.value) : ''}
              onValueChange={(value) => catField.onChange(Number(value))}
            >
              <SelectTrigger className="h-8 text-sm min-w-40">
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
        <p className="text-xs text-red-600">{fieldState?.category?.message as string}</p>
      </div>
      {/* Amount */}
      <div className="flex-1">
        <Controller
          control={control}
          name={`transactions.${index}.amount`}
          render={({ field: amtField }) => (
            <Input
              type="number"
              placeholder="$0.00"
              value={amtField.value || ''}
              onChange={(e) => {
                const value = e.target.value;
                amtField.onChange(value === '' ? undefined : Number(value));
              }}
              className="h-8 text-sm font-mono"
            />
          )}
        />
        <p className="text-xs text-red-600">{fieldState?.amount?.message as string}</p>
      </div>
      {/* Date */}
      <div className="flex-1">
        <Controller
          control={control}
          name={`transactions.${index}.date`}
          render={({ field: dateField }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-full justify-start text-left font-normal text-sm"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateField.value ? format(dateField.value, 'MMM dd') : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateField.value}
                  onSelect={dateField.onChange}
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <p className="text-xs text-red-600">{fieldState?.date?.message as string}</p>
      </div>
      {/* Name */}
      <div className="flex-1">
        <Controller
          control={control}
          name={`transactions.${index}.name`}
          render={({ field: nameField }) => (
            <Input placeholder="Transaction name" {...nameField} className="h-8 text-sm" />
          )}
        />
        <p className="text-xs text-red-600">{fieldState?.name?.message as string}</p>
      </div>
      {/* Remove Button */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => remove(index)}
          disabled={fieldsLength === 1}
          aria-label="Remove transaction row"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
