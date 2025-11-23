/**
 * Custom Select Component
 * Glassmorphic dropdown with consistent styling across all browsers
 */
import { useState, useRef, useEffect, useCallback } from 'react';

export function Select({ 
  value, 
  onChange,
  onValueChange,
  options = [], 
  placeholder = 'Select an option...',
  glassmorphic = false,
  error,
  helpText,
  className = '',
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSelect = useCallback((optionValue) => {
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(optionValue);
    } else if (onChange && typeof onChange === 'function') {
      const syntheticEvent = { target: { value: optionValue } };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange, onValueChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < (Array.isArray(options) ? options.length - 1 : -1) ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && focusedIndex >= 0 && Array.isArray(options) && options[focusedIndex]) {
        e.preventDefault();
        handleSelect(options[focusedIndex].value);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, options, handleSelect]);

  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const optionElement = dropdownRef.current.children[focusedIndex];
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const selectedOption = Array.isArray(options) ? options.find(opt => opt && opt.value === value) : null;
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const baseClasses = glassmorphic
    ? 'w-full px-4 py-2.5 rounded-lg border backdrop-blur-sm border-white/20 focus:ring-2 focus:ring-white/30 text-white cursor-pointer'
    : 'w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 text-gray-900 cursor-pointer';

  const dropdownClasses = glassmorphic
    ? 'absolute z-50 w-full mt-1 rounded-lg border border-white/20 backdrop-blur-sm shadow-lg max-h-60 overflow-auto'
    : 'absolute z-50 w-full mt-1 rounded-lg border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto';

  const optionClasses = glassmorphic
    ? 'px-4 py-2 text-sm text-white cursor-pointer transition-colors'
    : 'px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors';

  const selectedOptionClasses = glassmorphic
    ? `${optionClasses}`
    : `${optionClasses} bg-gray-100`;

  return (
    <div className={`w-full relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseClasses} ${error ? (glassmorphic ? 'border-error/50' : 'border-error') : ''} flex items-center justify-between ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={glassmorphic ? {
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } : {}}
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? '' : (glassmorphic ? 'text-white/60' : 'text-gray-500')}>
          {displayValue}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${glassmorphic ? 'text-white/60' : 'text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={dropdownClasses} 
          ref={dropdownRef} 
          role="listbox"
          style={glassmorphic ? {
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          } : {}}
        >
          {Array.isArray(options) && options.map((option, index) => {
            if (!option || option.value === undefined) return null;
            return (
              <div
                key={option.value || index}
                onClick={() => handleSelect(option.value)}
                className={index === focusedIndex || value === option.value 
                  ? selectedOptionClasses 
                  : optionClasses
                }
                style={glassmorphic ? {
                  backgroundColor: index === focusedIndex || value === option.value 
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'transparent',
                } : {}}
                onMouseEnter={(e) => {
                  if (glassmorphic && index !== focusedIndex && value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (glassmorphic && index !== focusedIndex && value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}

      {helpText && !error && (
        <p className={glassmorphic ? 'mt-1.5 text-sm text-white/60' : 'mt-1.5 text-sm text-gray-500'}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
