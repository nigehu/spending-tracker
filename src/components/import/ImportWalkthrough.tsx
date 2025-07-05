'use client';

import { FC, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Upload, FileText, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ImportTable from '@/src/components/import/ImportTable';
import ImportHeadersForm from '@/src/components/import/ImportHeadersForm';
import { Category } from '@prisma/client';
import ImportCategorization from '@/src/components/import/ImportCategorization';
import ImportCleanup from '@/src/components/import/ImportCleanup';
import ImportReview from '@/src/components/import/ImportReview';

export interface CSVData {
  headers: string[];
  rows: string[][];
}

export interface HeaderMapping {
  category: string;
  amount: string;
  date: string;
  name: string;
}

export interface CategorizedImportData {
  category: Category;
  amount: number;
  date: string;
  name: string;
}

export interface StructuredImportData {
  category: Category;
  amount: number;
  date: Date;
  name: string;
}

const ImportWalkthrough: FC<{ categories: Category[] }> = ({ categories }) => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<
    'upload' | 'preview' | 'mapping' | 'categorization' | 'cleanup' | 'review'
  >('upload');
  // TODO: Use headerMapping for actual import process
  const [headerMapping, setHeaderMapping] = useState<HeaderMapping | null>(null);
  const [categorizedData, setCategorizedData] = useState<CategorizedImportData[]>([]);
  const [structuredData, setStructuredData] = useState<StructuredImportData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);

        if (parsedData) {
          setCsvData(parsedData);
          setCurrentStep('preview');
          toast.success(`Successfully imported ${parsedData.rows.length} rows of data`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse CSV file. Please check the format.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    const addValue = (newValue: string) => {
      if (newValue !== '') {
        values.push(newValue);
      }
    };

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        addValue(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    addValue(current.trim());
    return values;
  };

  const parseCSV = (csvText: string): CSVData | undefined => {
    const lines = csvText.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);

    // Parse rows
    const rows = lines.slice(1).map(parseCSVLine);

    // Check that length of headers and rows are the same
    if (rows.length > 0 && !rows.every((row) => row.length === headers.length)) {
      toast.error(
        'Number of headers and rows do not match, import expects all rows to have the same number of columns',
      );
      return undefined;
    }

    return { headers, rows };
  };

  const clearData = () => {
    setCsvData(null);
    setFileName('');
    setCurrentStep('upload');
    setHeaderMapping(null);
    setCategorizedData([]);
    // Reset file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleMappingComplete = (mapping: HeaderMapping) => {
    setHeaderMapping(mapping);
    setCurrentStep('categorization');
    console.log('Header mapping:', mapping); // TODO: Remove when implementing actual import
    toast.success('Header mapping completed! Ready to import.');
  };

  const handleBackToPreview = () => {
    setCurrentStep('preview');
  };

  const saveCellEdit = (row: number, col: number, value: string) => {
    if (!csvData) return;

    const newData = { ...csvData };

    // Ensure the row has enough columns
    while (newData.rows[row].length <= col) {
      newData.rows[row].push('');
    }

    newData.rows[row][col] = value;
    setCsvData(newData);
    toast.success('Cell updated successfully');
  };

  // Row functions
  const deleteRow = (rowIndex: number) => {
    if (!csvData) return;

    const newData = {
      ...csvData,
      rows: csvData.rows.filter((_, index) => index !== rowIndex),
    };
    setCsvData(newData);
    toast.success('Row deleted successfully');
  };

  const handleCategorizationComplete = (data: CategorizedImportData[]) => {
    setCategorizedData(data);
    setCurrentStep('cleanup');
    console.log('Categorization complete:', data);
  };

  const handleCleanupComplete = (data: StructuredImportData[]) => {
    console.log('Cleanup complete:', data);
    setStructuredData(data);
    setCurrentStep('review');
  };

  const handleBackToCategorization = () => {
    setCurrentStep('categorization');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Import CSV Data</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV file to view and analyze your data in a table format.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="flex-1"
                />
                {csvData && (
                  <Button variant="outline" onClick={clearData} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              {fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                  <FileText className="h-4 w-4" />
                  <span>{fileName}</span>
                  {isLoading && <span className="text-blue-600">(Processing...)</span>}
                </div>
              )}
              {currentStep === 'upload' && (
                <div className="text-sm text-gray-500">
                  <p>• Supported format: CSV files only</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• First row should contain column headers</p>
                  <p>• Click on cells to edit, use buttons to add/delete rows and columns</p>
                  <p>Example CSV file:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {`category,amount,date,name
Grocery,100,2021-01-01,Supermarket
Transport,50,2021-01-02,Bus
Entertainment,15,2021-01-03,Movie
`}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {csvData && currentStep === 'preview' && (
          <>
            <ImportTable
              csvData={csvData}
              fileName={fileName}
              isLoading={isLoading}
              onSaveCellEdit={saveCellEdit}
              onDeleteRow={deleteRow}
            />
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep('mapping')}
                    className="flex items-center gap-2"
                  >
                    Map Headers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {csvData && currentStep === 'mapping' && (
          <ImportHeadersForm
            csvData={csvData}
            onMappingComplete={handleMappingComplete}
            onBack={handleBackToPreview}
          />
        )}

        {csvData && currentStep === 'categorization' && headerMapping && (
          <ImportCategorization
            csvData={csvData}
            headerMapping={headerMapping}
            categories={categories}
            onCategorizationComplete={handleCategorizationComplete}
          />
        )}

        {currentStep === 'cleanup' && categorizedData.length > 0 && (
          <ImportCleanup
            categorizedData={categorizedData}
            onCleanupComplete={handleCleanupComplete}
            onBack={handleBackToCategorization}
          />
        )}

        {currentStep === 'review' && structuredData.length > 0 && (
          <ImportReview structuredData={structuredData} />
        )}
      </div>
    </div>
  );
};

export default ImportWalkthrough;
