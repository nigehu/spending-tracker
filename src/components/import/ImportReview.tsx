import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Eye, Download, AlertTriangle } from 'lucide-react';
import { StructuredImportData } from './ImportWalkthrough';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { bulkImportTransactions } from '@/src/app/actions';

interface ImportReviewProps {
  structuredData: StructuredImportData[];
}

const ImportReview: FC<ImportReviewProps> = ({ structuredData }) => {
  const [isImporting, setIsImporting] = useState(false);

  // Calculate summary statistics
  const summary = {
    totalTransactions: structuredData.length,
    totalAmount: structuredData.reduce((sum, item) => sum + item.amount, 0),
    creditAmount: structuredData
      .filter((item) => item.category.type === 'CREDIT')
      .reduce((sum, item) => sum + item.amount, 0),
    debitAmount: structuredData
      .filter((item) => item.category.type === 'DEBIT')
      .reduce((sum, item) => sum + item.amount, 0),
    uniqueCategories: new Set(structuredData.map((item) => item.category.name)).size,
    dateRange: {
      min: new Date(Math.min(...structuredData.map((item) => item.date.getTime()))),
      max: new Date(Math.max(...structuredData.map((item) => item.date.getTime()))),
    },
  };

  const handleImport = async () => {
    setIsImporting(true);

    try {
      // Transform structured data to match the bulk import format
      const transactionsToImport = structuredData.map((item) => ({
        name: item.name,
        amount: item.amount,
        date: item.date,
        categoryId: item.category.categoryId,
      }));

      const result = await bulkImportTransactions(transactionsToImport);

      toast.success(`Successfully imported ${result.importedCount} transactions!`);
      // TODO: Navigate to transactions page or show success state
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to import transactions. Please try again.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    console.log(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const exportToCSV = () => {
    const csvContent = [
      'Category,Amount,Date,Name,Type',
      ...structuredData.map(
        (item) =>
          `"${item.category.name}",${item.amount},"${formatDate(item.date)}","${item.name}","${item.category.type}"`,
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imported-transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('CSV exported successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Review Import Data
        </CardTitle>
        <p className="text-sm text-gray-600">
          Review the formatted data before importing as transactions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.totalTransactions}</div>
              <div className="text-sm text-blue-700">Total Transactions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.creditAmount)}
              </div>
              <div className="text-sm text-green-700">Total Credits</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.debitAmount)}
              </div>
              <div className="text-sm text-red-700">Total Debits</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.uniqueCategories}</div>
              <div className="text-sm text-purple-700">Categories</div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Date Range</h3>
            <div className="text-sm text-gray-600">
              {formatDate(summary.dateRange.min)} to {formatDate(summary.dateRange.max)}
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Transaction Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {structuredData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {item.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.category.type === 'CREDIT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.category.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {structuredData.length > 10 && (
                <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Showing first 10 of {structuredData.length} transactions
                </div>
              )}
            </div>
          </div>

          {/* Validation Warnings */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Validation</h3>

            {structuredData.some((item) => item.amount === 0) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {structuredData.filter((item) => item.amount === 0).length} transactions have zero
                  amounts
                </span>
              </div>
            )}

            {structuredData.some((item) => !item.name.trim()) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {structuredData.filter((item) => !item.name.trim()).length} transactions have
                  empty names
                </span>
              </div>
            )}

            {!structuredData.some((item) => item.amount === 0) &&
              !structuredData.some((item) => !item.name.trim()) && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    All transactions are valid and ready for import
                  </span>
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center gap-2"
              size="lg"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Import {structuredData.length} Transactions
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportReview;
