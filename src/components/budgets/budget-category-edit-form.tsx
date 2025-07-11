'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteBudgetCategory,
  updateBudgetCategoryCategory,
} from '@/src/app/[year]/[month]/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog';
import type { Category } from '@prisma/client';
import { EnhancedBudgetCategory } from '@/src/app/[year]/[month]/page';

interface BudgetCategoryEditFormProps {
  budgetCategory: EnhancedBudgetCategory;
  availableCategories: Category[];
  onClose: () => void;
}

export function BudgetCategoryEditForm({
  budgetCategory,
  availableCategories,
  onClose,
}: BudgetCategoryEditFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    budgetCategory.categoryId.toString(),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Filter out the current category from available options
  const otherCategories = availableCategories.filter(
    (cat) => cat.categoryId !== budgetCategory.categoryId,
  );

  const handleCategoryChange = async (newCategoryId: string) => {
    if (newCategoryId === selectedCategoryId) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateBudgetCategoryCategory({
        budgetCategoryId: budgetCategory.categoryId,
        categoryId: parseInt(newCategoryId),
      });
      setSelectedCategoryId(newCategoryId);
      router.refresh();
    } catch (error) {
      console.error('Failed to update budget category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteBudgetCategory({
        budgetCategoryId: budgetCategory.categoryId,
      });
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Failed to delete budget category:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Edit Budget Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Current Category</label>
          <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
            {budgetCategory.name}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Change to Category</label>
          <Select
            value={selectedCategoryId}
            onValueChange={handleCategoryChange}
            disabled={isUpdating || isDeleting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {otherCategories.map((category) => (
                <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
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
          {isUpdating && <p className="text-xs text-gray-500">Updating...</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isUpdating || isDeleting}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isUpdating || isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove &ldquo;{budgetCategory.name}&rdquo; from this
                budget? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
