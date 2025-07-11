import { isDate } from 'date-fns';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CSVData, HeaderMapping } from './ImportWalkthrough';
import ImportHeaderDropdown from './ImportHeaderDropdown';
import ImportNavigation from './ImportNavigation';
import { getCleanAmount } from './import.utils';

interface ImportHeadersFormProps {
  csvData: CSVData;
  onMappingComplete: (mapping: HeaderMapping) => void;
  onBack: () => void;
}

const ImportHeadersForm: FC<ImportHeadersFormProps> = ({ csvData, onMappingComplete, onBack }) => {
  // Auto-match headers based on common field names
  const autoMatchHeaders = () => {
    const autoMapping: HeaderMapping = {
      category: '',
      amount: '',
      date: '',
      name: '',
    };

    csvData.headers.forEach((header) => {
      const headerLower = header.toLowerCase().trim();

      // Try exact matches first
      if (headerLower === 'category' || headerLower === 'categories') {
        autoMapping.category = header;
      } else if (headerLower === 'amount' || headerLower === 'value' || headerLower === 'sum') {
        autoMapping.amount = header;
      } else if (headerLower === 'date' || headerLower === 'dates') {
        autoMapping.date = header;
      } else if (
        headerLower === 'name' ||
        headerLower === 'description' ||
        headerLower === 'desc' ||
        headerLower === 'title'
      ) {
        autoMapping.name = header;
      }
      // Try partial matches
      else if (headerLower.includes('category') || headerLower.includes('cat')) {
        autoMapping.category = header;
      } else if (
        headerLower.includes('amount') ||
        headerLower.includes('price') ||
        headerLower.includes('cost') ||
        headerLower.includes('total')
      ) {
        autoMapping.amount = header;
      } else if (headerLower.includes('date') || headerLower.includes('time')) {
        autoMapping.date = header;
      } else if (
        headerLower.includes('name') ||
        headerLower.includes('description') ||
        headerLower.includes('note') ||
        headerLower.includes('memo')
      ) {
        autoMapping.name = header;
      }
    });

    return autoMapping;
  };

  const [mapping, setMapping] = useState<HeaderMapping>(() => autoMatchHeaders());

  const [isValid, setIsValid] = useState(false);

  // Validate mapping whenever it changes
  useEffect(() => {
    validateMapping(mapping);
  }, [mapping]);

  const validateCategoryColumnMapping = (headerIndex: number) => {
    return csvData.rows.every((row) => typeof row[headerIndex] === 'string');
  };

  const validateAmountColumnMapping = (headerIndex: number) => {
    return csvData.rows.every((row) => {
      console.log(row[headerIndex]);

      const amount = getCleanAmount(row[headerIndex]);
      return !isNaN(amount) && amount > 0;
    });
  };

  const validateDateColumnMapping = (headerIndex: number) => {
    return csvData.rows.every(
      (row) =>
        typeof row[headerIndex] === 'string' &&
        (isDate(row[headerIndex]) ||
          (parseInt(row[headerIndex]) > 0 && parseInt(row[headerIndex]) < 32)),
    );
  };

  const validateNameColumnMapping = (headerIndex: number) => {
    return csvData.rows.every((row) => typeof row[headerIndex] === 'string');
  };

  // Check if mapping is valid (all required fields are mapped)
  const validateMapping = (currentMapping: HeaderMapping) => {
    const requiredFields = ['category', 'amount', 'date', 'name'];
    const isValidMapping = requiredFields.every(
      (field) => currentMapping[field as keyof HeaderMapping] !== '',
    );
    setIsValid(isValidMapping);
    return isValidMapping;
  };

  const updateMapping = (field: keyof HeaderMapping, header: string) => {
    const newMapping = { ...mapping, [field]: header };
    setMapping(newMapping);
    validateMapping(newMapping);
  };

  const handleContinue = () => {
    if (isValid) {
      onMappingComplete(mapping);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Map CSV Headers to Fields
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select which CSV column corresponds to each required field for importing transactions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Field Mapping Section */}
          <div className="grid gap-4">
            <ImportHeaderDropdown
              icon="🏷️"
              field="category"
              description="The category name for the transaction"
              value={mapping.category}
              options={csvData.headers}
              isValid={
                mapping.category === '' ||
                validateCategoryColumnMapping(csvData.headers.indexOf(mapping.category))
              }
              onSelect={(value) => updateMapping('category', value)}
            />
            <ImportHeaderDropdown
              icon="💰"
              field="amount"
              description="The transaction amount (e.g. 100.00)"
              value={mapping.amount}
              options={csvData.headers}
              isValid={
                mapping.amount === '' ||
                validateAmountColumnMapping(csvData.headers.indexOf(mapping.amount))
              }
              onSelect={(value) => updateMapping('amount', value)}
            />
            <ImportHeaderDropdown
              icon="📅"
              field="date"
              description="The transaction date (YYYY-MM-DD format or day of the month)"
              value={mapping.date}
              options={csvData.headers}
              isValid={
                mapping.date === '' ||
                validateDateColumnMapping(csvData.headers.indexOf(mapping.date))
              }
              onSelect={(value) => updateMapping('date', value)}
            />
            <ImportHeaderDropdown
              icon="📝"
              field="name"
              description="The transaction description or name"
              value={mapping.name}
              options={csvData.headers}
              isValid={
                mapping.name === '' ||
                validateNameColumnMapping(csvData.headers.indexOf(mapping.name))
              }
              onSelect={(value) => updateMapping('name', value)}
            />
          </div>

          {/* Validation Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            {isValid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">All required fields are mapped</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Please map all required fields to continue
                </span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <ImportNavigation
            onBack={onBack}
            onForward={handleContinue}
            backLabel="Back to Data Preview"
            forwardLabel="Continue to Import"
            isForwardDisabled={!isValid}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportHeadersForm;
