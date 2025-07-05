import { ArrowRight, CheckCircle, X } from 'lucide-react';
import { FC } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ImportHeaderDropdownProps {
  icon: string;
  field: string;
  description: string;
  value: string;
  options: string[];
  isValid: boolean;
  onSelect: (value: string) => void;
}

const ImportHeaderDropdown: FC<ImportHeaderDropdownProps> = ({
  icon,
  field,
  description,
  value,
  options,
  isValid,
  onSelect,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg justify-between">
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="font-medium capitalize">{field}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 text-gray-400" />

      <div className="flex items-center gap-2 w-[250px]">
        <Select value={value} onValueChange={(value) => onSelect(value)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select CSV column..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((header, index) => (
              <SelectItem key={index} value={header}>
                <div className="flex items-center gap-2">
                  <span>{header}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Column {index + 1}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && isValid && <CheckCircle className="h-5 w-5 text-green-600" />}
        {!isValid && <X className="h-5 w-5 text-red-600" />}
      </div>
    </div>
  );
};

export default ImportHeaderDropdown;
