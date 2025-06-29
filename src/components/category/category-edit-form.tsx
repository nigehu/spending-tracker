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
import { Textarea } from '../ui/textarea';

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
    <Card className="h-full flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <CardContent className="flex-1 space-y-4 pt-6">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                name="transactionType"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
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
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Purpose of the category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-4">
            <div className="flex flex-row gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-pointer hover:text-gray-700"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-pointer hover:text-blue-700"
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
