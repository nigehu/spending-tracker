import { FC, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { Category } from '@prisma/client';
import { CSVData, HeaderMapping, CategorizedImportData } from './ImportWalkthrough';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { addNewCategory } from '@/src/app/categories/actions';
import { getCleanAmount } from './import.utils';

interface ImportCategorizationProps {
  csvData: CSVData;
  headerMapping: HeaderMapping;
  categories: Category[];
  onCategorizationComplete: (data: CategorizedImportData[]) => void;
}

interface CategoryMapping {
  [csvCategory: string]: {
    type: 'new' | 'existing';
    category?: Category;
    newCategoryData?: {
      name: string;
      description: string;
      transactionType: 'DEBIT' | 'CREDIT';
    };
  };
}

const ImportCategorization: FC<ImportCategorizationProps> = ({
  csvData,
  headerMapping,
  categories,
  onCategorizationComplete,
}) => {
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const importCategories = useMemo(() => {
    const categoryIndex = csvData.headers.indexOf(headerMapping.category);
    const categoryMap = csvData.rows.reduce((acc, row) => {
      const category = row[categoryIndex];
      if (!acc.has(category)) {
        acc.set(category, true);
      }
      return acc;
    }, new Map<string, boolean>());
    return Array.from(categoryMap.keys());
  }, [csvData.headers, csvData.rows, headerMapping.category]);

  const missingCategories = useMemo(() => {
    return importCategories.filter(
      (importCategory) => !categories.some((category) => category.name === importCategory),
    );
  }, [categories, importCategories]);

  const existingCategories = useMemo(() => {
    const existing = importCategories.filter((importCategory) =>
      categories.some((category) => category.name === importCategory),
    );
    existing.forEach((importCategory) => {
      const category = categories.find((category) => category.name === importCategory);
      if (category) {
        setCategoryMappings((prev) => ({
          ...prev,
          [importCategory]: {
            type: 'existing',
            category: category,
          },
        }));
      }
    });
    return existing;
  }, [categories, importCategories]);

  const handleAddNewCategory = (csvCategory: string) => {
    setCategoryMappings((prev) => ({
      ...prev,
      [csvCategory]: {
        type: 'new',
        newCategoryData: {
          name: csvCategory,
          description: '',
          transactionType: 'DEBIT',
        },
      },
    }));
  };

  const handleAssignToExisting = (csvCategory: string, existingCategory: Category) => {
    setCategoryMappings((prev) => ({
      ...prev,
      [csvCategory]: {
        type: 'existing',
        category: existingCategory,
      },
    }));
  };

  const handleUpdateNewCategoryData = (
    csvCategory: string,
    field: 'name' | 'description' | 'transactionType',
    value: string,
  ) => {
    setCategoryMappings((prev) => ({
      ...prev,
      [csvCategory]: {
        ...prev[csvCategory],
        type: 'new',
        newCategoryData: {
          ...(prev[csvCategory]?.newCategoryData || {
            name: csvCategory,
            description: '',
            transactionType: 'DEBIT',
          }),
          [field]: value,
        },
      },
    }));
  };

  const handleCreateCategories = async () => {
    setIsProcessing(true);

    try {
      // Create new categories
      const newCategoriesToCreate = Object.entries(categoryMappings)
        .filter(([, mapping]) => mapping.type === 'new')
        .map(([, mapping]) => ({
          data: mapping.newCategoryData!,
        }));

      const newCategories = await Promise.allSettled(
        newCategoriesToCreate.map(({ data }) => addNewCategory(data)),
      );

      if (newCategories.every((result) => result.status === 'fulfilled')) {
        const processedData = processImportData(newCategories.map((result) => result.value));
        onCategorizationComplete(processedData);
      } else {
        throw new Error('Failed to create categories');
      }

      // Process the import data
    } catch (error) {
      console.error('Error processing categories:', error);
      toast.error('Failed to process categories');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImportData = (newCategories: Category[]): CategorizedImportData[] => {
    // This is a placeholder - you'll need to implement the actual data processing
    // based on your requirements
    const categoryIndex = csvData.headers.indexOf(headerMapping.category);
    const amountIndex = csvData.headers.indexOf(headerMapping.amount);
    const dateIndex = csvData.headers.indexOf(headerMapping.date);
    const nameIndex = csvData.headers.indexOf(headerMapping.name);

    // For now, return the first row as an example
    const processedData = csvData.rows.map((row) => {
      const categoryName = row[categoryIndex];
      const mapping = categoryMappings[categoryName];
      let category: Category;
      if (mapping?.type === 'existing' && mapping.category) {
        category = mapping.category;
      } else if (mapping?.type === 'new' && mapping.newCategoryData) {
        const newCategoryName = mapping.newCategoryData.name;
        category = newCategories.find((c) => c.name === newCategoryName) as Category;
      } else {
        throw new Error('No category found');
      }

      return {
        category,
        amount: getCleanAmount(row[amountIndex]),
        date: row[dateIndex],
        name: row[nameIndex],
      };
    });

    return processedData;
  };

  const isReadyToProcess = () => {
    return missingCategories.every((category) => categoryMappings[category]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Categorize Transactions
        </CardTitle>
        <p className="text-sm text-gray-600">
          Map imported categories to existing categories or create new ones.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Existing Categories */}
          {existingCategories.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-green-700">✅ Existing Categories</h3>
              <p className="text-sm text-gray-600">
                These categories already exist in your database and will be used automatically.
              </p>
              <div className="flex flex-wrap gap-2">
                {existingCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Categories */}
          {missingCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-orange-700">⚠️ Missing Categories</h3>
              <p className="text-sm text-gray-600">
                These categories need to be mapped. You can either create new categories or assign
                them to existing ones.
              </p>

              <div className="space-y-4">
                {missingCategories.map((csvCategory) => {
                  const mapping = categoryMappings[csvCategory];

                  return (
                    <div key={csvCategory} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{csvCategory}</h4>
                        {mapping && (
                          <span className="text-sm text-green-600">
                            {mapping.type === 'new' ? 'New Category' : 'Assigned'}
                          </span>
                        )}
                      </div>

                      {!mapping && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddNewCategory(csvCategory)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Create New Category
                          </Button>
                          <Select
                            onValueChange={(categoryId) => {
                              const existingCategory = categories.find(
                                (c) => c.categoryId.toString() === categoryId,
                              );
                              if (existingCategory) {
                                handleAssignToExisting(csvCategory, existingCategory);
                              }
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign to existing..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.categoryId}
                                  value={category.categoryId.toString()}
                                >
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
                        </div>
                      )}

                      {mapping?.type === 'new' && mapping.newCategoryData && (
                        <div className="space-y-3 bg-blue-50 p-3 rounded">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`name-${csvCategory}`}>Category Name</Label>
                              <Input
                                id={`name-${csvCategory}`}
                                value={mapping.newCategoryData.name}
                                onChange={(e) =>
                                  handleUpdateNewCategoryData(csvCategory, 'name', e.target.value)
                                }
                                placeholder="Category name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`type-${csvCategory}`}>Type</Label>
                              <Select
                                value={mapping.newCategoryData.transactionType}
                                onValueChange={(value: 'DEBIT' | 'CREDIT') =>
                                  handleUpdateNewCategoryData(csvCategory, 'transactionType', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DEBIT">Debit (Expense)</SelectItem>
                                  <SelectItem value="CREDIT">Credit (Income)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`description-${csvCategory}`}>
                              Description (Optional)
                            </Label>
                            <Textarea
                              id={`description-${csvCategory}`}
                              value={mapping.newCategoryData.description}
                              onChange={(e) =>
                                handleUpdateNewCategoryData(
                                  csvCategory,
                                  'description',
                                  e.target.value,
                                )
                              }
                              placeholder="Category description"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {mapping?.type === 'existing' && mapping.category && (
                        <div className="bg-green-50 p-3 rounded">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              Assigned to: <strong>{mapping.category.name}</strong>
                              <span
                                className={`ml-2 text-xs px-2 py-1 rounded ${
                                  mapping.category.type === 'CREDIT'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {mapping.category.type}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleCreateCategories}
              disabled={!isReadyToProcess() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Continue to Import'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportCategorization;
