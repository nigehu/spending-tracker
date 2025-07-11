import { Check, Edit, Trash2, X } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import ImportNavigation from './ImportNavigation';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface ImportTableProps {
  csvData: CSVData;
  fileName: string;
  isLoading: boolean;
  previewMode?: boolean;
  onSaveCellEdit: (row: number, col: number, value: string) => void;
  onDeleteRow: (row: number) => void;
  onBack?: () => void;
  onForward?: () => void;
  backLabel?: string;
  forwardLabel?: string;
  isForwardDisabled?: boolean;
  isForwardLoading?: boolean;
}

const ImportTable: FC<ImportTableProps> = ({
  csvData,
  previewMode = true,
  onSaveCellEdit,
  onDeleteRow,
  onBack,
  onForward,
  backLabel,
  forwardLabel,
  isForwardDisabled,
  isForwardLoading,
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Cell editing functions
  const startEditing = (row: number, col: number, value: string) => {
    setEditingCell({ row, col });
    setEditValue(value);
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveCellEdit = () => {
    if (!csvData || !editingCell) return;

    onSaveCellEdit(editingCell.row, editingCell.col, editValue);
    cancelCellEdit();
  };

  const limit = previewMode ? 4 : csvData.rows.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Showing {csvData.rows.length} rows with {csvData.headers.length} columns
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-center font-medium text-gray-700 w-12">#</th>
                {csvData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 text-left font-medium text-gray-700 relative group"
                  >
                    <p className="flex items-center justify-between">{header}</p>
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-medium text-gray-700 w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {csvData.rows.slice(0, limit).map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-2 text-center text-sm text-gray-500">{rowIndex + 1}</td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 relative group">
                      {editingCell?.row === rowIndex && editingCell?.col === cellIndex ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCellEdit();
                              if (e.key === 'Escape') cancelCellEdit();
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={saveCellEdit}
                            className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelCellEdit}
                            className="h-6 w-6 p-0 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span
                            className="flex-1 cursor-pointer hover:bg-blue-50 px-1 py-1 rounded"
                            onClick={() => startEditing(rowIndex, cellIndex, cell)}
                          >
                            {cell || '-'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(rowIndex, cellIndex, cell)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRow(rowIndex)}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {csvData.rows.length > limit && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing first {limit} rows of {csvData.rows.length} total rows
            </div>
          )}
        </div>

        {/* Navigation */}
        {(onBack || onForward) && (
          <ImportNavigation
            onBack={onBack}
            onForward={onForward}
            backLabel={backLabel}
            forwardLabel={forwardLabel}
            isForwardDisabled={isForwardDisabled}
            isForwardLoading={isForwardLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ImportTable;
