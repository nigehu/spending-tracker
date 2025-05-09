'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import type { Category } from '@prisma/client';
import React from 'react';

import { updateCategory } from '@/src/app/categories/actions';
import { Form } from '@/src/components/ui/form';
import { formSchema, FormSchema } from '@/src/lib/category.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface CategoryEditFormProps {
  category: Category;
  onClose: () => void;
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({
  category: { categoryId, name, type, description },
  onClose,
}) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      description,
      transactionType: type,
    },
  });

  function onSubmit(values: FormSchema) {
    updateCategory(categoryId, values);
    onClose();
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of the category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Purpose of the category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                      <SelectItem value="DEBIT">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer hover:text-blue-700"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer hover:text-blue-700"
                type="submit"
              >
                Save
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CategoryEditForm;
