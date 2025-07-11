import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { CSVData } from './ImportWalkthrough';

interface ImportUploadProps {
  csvData: CSVData | null;
  fileName: string;
  isLoading: boolean;
  currentStep: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

const ImportUpload: React.FC<ImportUploadProps> = ({
  csvData,
  fileName,
  isLoading,
  currentStep,
  onFileUpload,
  onClearData,
}) => {
  return (
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
              onChange={onFileUpload}
              disabled={isLoading}
              className="flex-1"
            />
            {csvData && (
              <Button variant="outline" onClick={onClearData} className="flex items-center gap-2">
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
  );
};

export default ImportUpload;
