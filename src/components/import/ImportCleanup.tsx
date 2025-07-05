import { FC, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { CategorizedImportData, StructuredImportData } from './ImportWalkthrough';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface ImportCleanupProps {
  categorizedData: CategorizedImportData[];
  onCleanupComplete: (data: StructuredImportData[]) => void;
  onBack: () => void;
}

interface DateAnalysis {
  hasMonthNumbers: boolean;
  monthNumbers: number[];
  uniqueMonths: number[];
  sampleDates: string[];
}

interface CleanupData {
  targetMonth: number;
  targetYear: number;
}

const ImportCleanup: FC<ImportCleanupProps> = ({ categorizedData, onCleanupComplete, onBack }) => {
  const [cleanupData, setCleanupData] = useState<CleanupData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Analyze the date field to check for month numbers
  const dateAnalysis = useMemo((): DateAnalysis => {
    const dateValues = categorizedData.map((row) => row.date).filter(Boolean);

    const monthNumbers: number[] = [];
    const uniqueMonths = new Set<number>();
    const sampleDates: string[] = [];

    dateValues.forEach((dateValue, index) => {
      // Check if the value is just a number (1-12)
      const monthNumber = parseInt(dateValue, 10);
      if (monthNumber >= 1 && monthNumber <= 12 && dateValue.length <= 2) {
        monthNumbers.push(monthNumber);
        uniqueMonths.add(monthNumber);
      }

      // Keep track of sample dates for display
      if (index < 5) {
        sampleDates.push(dateValue);
      }
    });

    return {
      hasMonthNumbers: monthNumbers.length > 0,
      monthNumbers,
      uniqueMonths: Array.from(uniqueMonths).sort((a, b) => a - b),
      sampleDates,
    };
  }, [categorizedData]);

  // Get current year and month for defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  const handleMonthSelection = (month: number, year: number) => {
    setCleanupData({
      targetMonth: month,
      targetYear: year,
    });
  };

  const processDataWithTargetDate = (
    targetMonth: number,
    targetYear: number,
  ): StructuredImportData[] => {
    return categorizedData.map((row) => {
      const originalDateValue = row.date;
      const day = parseInt(originalDateValue, 10);
      const newDate = new Date(targetYear, targetMonth - 1, day);

      return {
        ...row,
        date: newDate,
      };
    });
  };

  const handleContinue = () => {
    if (cleanupData) {
      setIsProcessing(true);
      const structuredData = processDataWithTargetDate(
        cleanupData.targetMonth,
        cleanupData.targetYear,
      );
      onCleanupComplete(structuredData);
    }
  };

  const isReadyToContinue = () => {
    return cleanupData !== null;
  };

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate year options (current year ± 2 years)
  const yearOptions = useMemo(() => {
    const options = [];
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      options.push({ value: year, label: year.toString() });
    }
    return options;
  }, [currentYear]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Date Cleanup & Assignment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Review and adjust date assignments for your imported data.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Date Analysis */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Date Field Analysis</h3>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Date Column: date</span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Sample date values: {dateAnalysis.sampleDates.join(', ')}</p>
                </div>

                {dateAnalysis.hasMonthNumbers ? (
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Found {dateAnalysis.monthNumbers.length} month numbers:{' '}
                      {dateAnalysis.uniqueMonths.join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      No month numbers detected - dates appear to be complete
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Month/Year Selection */}
          {dateAnalysis.hasMonthNumbers && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Assign Month Numbers to Target Month</h3>
              <p className="text-sm text-gray-600">
                Choose which month and year to assign to the month numbers found in your data.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-month">Target Month</Label>
                  <Select
                    value={cleanupData?.targetMonth?.toString() || ''}
                    onValueChange={(value) => {
                      const month = parseInt(value, 10);
                      const year = cleanupData?.targetYear || currentYear;
                      handleMonthSelection(month, year);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target-year">Target Year</Label>
                  <Select
                    value={cleanupData?.targetYear?.toString() || ''}
                    onValueChange={(value) => {
                      const year = parseInt(value, 10);
                      const month = cleanupData?.targetMonth || currentMonth;
                      handleMonthSelection(month, year);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year.value} value={year.value.toString()}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {cleanupData && (
                <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Month numbers will be assigned to:{' '}
                      <strong>
                        {monthOptions.find((m) => m.value === cleanupData.targetMonth)?.label}{' '}
                        {cleanupData.targetYear}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Preview */}
          {cleanupData && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Data Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p>Total rows to process: {categorizedData.length}</p>
                  <p>Month numbers found: {dateAnalysis.monthNumbers.length}</p>
                  <p>
                    Target assignment:{' '}
                    {monthOptions.find((m) => m.value === cleanupData.targetMonth)?.label}{' '}
                    {cleanupData.targetYear}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back to Categorization
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!isReadyToContinue() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Complete Import'}
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportCleanup;
