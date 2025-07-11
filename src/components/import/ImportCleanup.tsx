import React, { FC, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { CategorizedImportData, StructuredImportData } from './ImportWalkthrough';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import ImportNavigation from './ImportNavigation';

interface ImportCleanupProps {
  categorizedData: CategorizedImportData[];
  onCleanupComplete: (data: StructuredImportData[]) => void;
  onBack: () => void;
  csvFileName?: string;
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

const ImportCleanup: FC<ImportCleanupProps> = ({
  categorizedData,
  onCleanupComplete,
  onBack,
  csvFileName,
}) => {
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

  // Parse filename for month and year
  const parseFilenameForDate = useMemo(() => {
    if (!csvFileName) return null;

    const filename = csvFileName.toLowerCase();

    // Common patterns: YYYY-MM, YYYY_MM, MM-YYYY, MM_YYYY, month-YYYY, month_YYYY
    const patterns = [
      // YYYY-MM or YYYY_MM
      /(\d{4})[-_](\d{1,2})/,
      // MM-YYYY or MM_YYYY
      /(\d{1,2})[-_](\d{4})/,
      // Month name patterns
      /(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|october|oct|november|nov|december|dec)[-_](\d{4})/i,
      /(\d{4})[-_](january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|october|oct|november|nov|december|dec)/i,
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        const monthNames: { [key: string]: number } = {
          january: 1,
          jan: 1,
          february: 2,
          feb: 2,
          march: 3,
          mar: 3,
          april: 4,
          apr: 4,
          may: 5,
          june: 6,
          jun: 6,
          july: 7,
          jul: 7,
          august: 8,
          aug: 8,
          september: 9,
          sep: 9,
          october: 10,
          oct: 10,
          november: 11,
          nov: 11,
          december: 12,
          dec: 12,
        };

        let year: number, month: number;

        if (pattern.source.includes('january|jan|february')) {
          // Month name pattern
          const monthStr = match[1].toLowerCase();
          const yearStr = match[2];

          if (monthNames[monthStr]) {
            month = monthNames[monthStr];
            year = parseInt(yearStr, 10);
          } else {
            month = monthNames[match[2].toLowerCase()];
            year = parseInt(match[1], 10);
          }
        } else {
          // Numeric pattern
          const first = parseInt(match[1], 10);
          const second = parseInt(match[2], 10);

          if (first > 12) {
            // First is year, second is month
            year = first;
            month = second;
          } else {
            // First is month, second is year
            month = first;
            year = second;
          }
        }

        if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
          return { year, month };
        }
      }
    }

    return null;
  }, [csvFileName]);

  // Get current year and month for defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Initialize with parsed filename data if available
  React.useEffect(() => {
    if (parseFilenameForDate && !cleanupData) {
      setCleanupData({
        targetMonth: parseFilenameForDate.month,
        targetYear: parseFilenameForDate.year,
      });
    }
  }, [parseFilenameForDate, cleanupData]);

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
          {/* Filename Analysis */}
          {csvFileName && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Filename Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">File: {csvFileName}</span>
                  </div>

                  {parseFilenameForDate ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Detected date from filename:{' '}
                        {monthOptions.find((m) => m.value === parseFilenameForDate.month)?.label}{' '}
                        {parseFilenameForDate.year}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">No date pattern detected in filename</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                      const year =
                        cleanupData?.targetYear || parseFilenameForDate?.year || currentYear;
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
                      const month =
                        cleanupData?.targetMonth || parseFilenameForDate?.month || currentMonth;
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

          {/* Action Buttons */}
          <ImportNavigation
            onBack={onBack}
            onForward={handleContinue}
            backLabel="Back to Categorization"
            forwardLabel={isProcessing ? 'Processing...' : 'Complete Import'}
            isForwardDisabled={!isReadyToContinue() || isProcessing}
            isForwardLoading={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportCleanup;
