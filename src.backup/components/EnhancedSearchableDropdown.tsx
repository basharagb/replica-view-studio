import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, X, Check, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  id: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface EnhancedSearchableDropdownProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiSelect?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  maxHeight?: number;
  showSelectAll?: boolean;
  showClearAll?: boolean;
  groupBy?: boolean;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export const EnhancedSearchableDropdown: React.FC<EnhancedSearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  multiSelect = false,
  disabled = false,
  loading = false,
  error,
  maxHeight = 300,
  showSelectAll = false,
  showClearAll = false,
  groupBy = false,
  className = "",
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filter and group options
  const filteredOptions = React.useMemo(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (groupBy) {
      const grouped = filtered.reduce((acc, option) => {
        const group = option.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
      }, {} as Record<string, DropdownOption[]>);
      
      return Object.entries(grouped).map(([group, items]) => ({
        group,
        items
      }));
    }

    return [{ group: '', items: filtered }];
  }, [options, searchTerm, groupBy]);

  // Get flat list of options for keyboard navigation
  const flatOptions = React.useMemo(() => {
    return filteredOptions.flatMap(group => group.items);
  }, [filteredOptions]);

  // Get selected values as array
  const selectedValues = React.useMemo(() => {
    if (multiSelect) {
      return Array.isArray(value) ? value : (value !== undefined ? [value] : []);
    }
    return value !== undefined ? [value] : [];
  }, [value, multiSelect]);

  // Get display text
  const displayText = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    
    if (multiSelect) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.id === selectedValues[0]);
        return option?.label || '';
      }
      return `${selectedValues.length} selected`;
    }
    
    const option = options.find(opt => opt.id === selectedValues[0]);
    return option?.label || '';
  }, [selectedValues, options, placeholder, multiSelect]);

  // Handle option selection
  const handleOptionSelect = useCallback((optionId: string | number) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : (value !== undefined ? [value] : []);
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter(v => v !== optionId)
        : [...currentValues, optionId];
      onChange(newValues);
    } else {
      onChange(optionId);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [value, onChange, multiSelect]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (!multiSelect) return;
    const allIds = flatOptions.filter(opt => !opt.disabled).map(opt => opt.id);
    onChange(allIds);
  }, [flatOptions, onChange, multiSelect]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onChange(multiSelect ? [] : '');
  }, [onChange, multiSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
          const option = flatOptions[highlightedIndex];
          if (!option.disabled) {
            handleOptionSelect(option.id);
          }
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const nextIndex = Math.min(highlightedIndex + 1, flatOptions.length - 1);
          setHighlightedIndex(nextIndex);
          scrollToOption(nextIndex);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const prevIndex = Math.max(highlightedIndex - 1, 0);
          setHighlightedIndex(prevIndex);
          scrollToOption(prevIndex);
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm('');
        }
        break;

      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  }, [disabled, isOpen, highlightedIndex, flatOptions, handleOptionSelect]);

  // Scroll to highlighted option
  const scrollToOption = useCallback((index: number) => {
    if (optionsRef.current && index >= 0) {
      const optionElements = optionsRef.current.querySelectorAll('[data-option-index]');
      const targetElement = optionElements[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full ${className}`}
      data-testid={testId}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          w-full min-h-[44px] px-4 py-2 text-left bg-white border rounded-lg
          flex items-center justify-between gap-2 transition-all duration-200
          ${disabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' 
            : 'hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 border-gray-300'
          }
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}
        `}
      >
        <span className={`flex-1 truncate ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {displayText}
        </span>
        
        {loading ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{ maxHeight: maxHeight + 100 }}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Select All / Clear All */}
            {multiSelect && (showSelectAll || showClearAll) && (
              <div className="p-2 border-b border-gray-100 flex gap-2">
                {showSelectAll && (
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Select All
                  </button>
                )}
                {showClearAll && (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div
              ref={optionsRef}
              className="overflow-y-auto"
              style={{ maxHeight }}
              role="listbox"
              aria-multiselectable={multiSelect}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((group, groupIndex) => (
                  <div key={group.group || groupIndex}>
                    {/* Group Header */}
                    {groupBy && group.group && (
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        {group.group}
                      </div>
                    )}

                    {/* Options */}
                    {group.items.map((option, optionIndex) => {
                      const globalIndex = filteredOptions
                        .slice(0, groupIndex)
                        .reduce((acc, g) => acc + g.items.length, 0) + optionIndex;
                      
                      const isSelected = selectedValues.includes(option.id);
                      const isHighlighted = highlightedIndex === globalIndex;

                      return (
                        <motion.div
                          key={option.id}
                          data-option-index={globalIndex}
                          whileHover={{ backgroundColor: '#f3f4f6' }}
                          className={`
                            px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors
                            ${isHighlighted ? 'bg-blue-50' : ''}
                            ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                          `}
                          onClick={() => !option.disabled && handleOptionSelect(option.id)}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {/* Multi-select checkbox */}
                          {multiSelect && (
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          )}

                          {/* Single-select checkmark */}
                          {!multiSelect && isSelected && (
                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}

                          {/* Option content */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-sm text-gray-500 truncate">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchableDropdown;
