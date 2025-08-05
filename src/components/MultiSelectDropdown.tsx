import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface MultiSelectOption {
  value: string;
  label: string;
  isAlarmed?: boolean;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  showSelectAll?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search alarmed silos...",
  disabled = false,
  showSelectAll = true
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Filter to show only alarmed silos
  const alarmedOptions = options.filter(option => option.isAlarmed);
  
  const filteredOptions = alarmedOptions.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedValues.length === alarmedOptions.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all alarmed silos
      onSelectionChange(alarmedOptions.map(option => option.value));
    }
  };

  const handleToggleOption = (optionValue: string) => {
    const newSelection = selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue];
    
    onSelectionChange(newSelection);
  };

  const removeSelection = (valueToRemove: string) => {
    onSelectionChange(selectedValues.filter(value => value !== valueToRemove));
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = alarmedOptions.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} silos selected`;
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10"
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 p-2 focus-visible:ring-0"
              />
            </div>
            
            {showSelectAll && alarmedOptions.length > 0 && (
              <div className="border-b p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedValues.length === alarmedOptions.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All Alarmed Silos ({alarmedOptions.length})
                  </label>
                </div>
              </div>
            )}

            <CommandEmpty>No alarmed silos found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleToggleOption(option.value)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                    />
                    <span className="flex-1">{option.label}</span>
                    <Badge variant="destructive" className="text-xs">
                      ALARM
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => {
            const option = alarmedOptions.find(opt => opt.value === value);
            return (
              <Badge key={value} variant="secondary" className="text-xs">
                {option?.label || value}
                <button
                  onClick={() => removeSelection(value)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
