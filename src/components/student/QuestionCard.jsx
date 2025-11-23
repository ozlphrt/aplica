/**
 * Question Card Component
 * Displays individual questions in the questionnaire
 */
import { useState, useEffect } from 'react';
import { Input, NumberInput, CurrencyInput } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

export default function QuestionCard({ 
  question, 
  value, 
  onAnswer, 
  onNext, 
  onPrevious, 
  onSkip,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  canGenerateMatches,
  onFinish,
}) {
  const [error, setError] = useState(null);
  // Drag state for GPA input (only used when question.id === 'gpa')
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  
  // Use defaultValue as placeholder/suggestion, but don't auto-set it
  // This ensures progress only counts when user explicitly provides an answer
  const displayValue = value;

  if (!question) {
    return <div>No question available</div>;
  }

  const validate = (val) => {
    if (!question.validation) return true;

    const { required, min, max, errorMessage } = question.validation;

    // If field is not required and value is empty/null, it's valid
    if (!required && (val === null || val === undefined || val === '')) {
      setError(null);
      return true;
    }

    if (required && (val === null || val === undefined || val === '')) {
      setError(errorMessage || 'This field is required');
      return false;
    }

    if (val !== null && val !== undefined && val !== '') {
      if (min !== undefined && val < min) {
        setError(errorMessage || `Value must be at least ${min}`);
        return false;
      }
      if (max !== undefined && val > max) {
        setError(errorMessage || `Value must be at most ${max}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleChange = (newValue) => {
    // Always allow clearing non-required fields
    if (!question.validation?.required && (newValue === null || newValue === undefined || newValue === '')) {
      setError(null);
      onAnswer(question.id, newValue);
      return;
    }
    
    // Validate and update if valid
    if (validate(newValue)) {
      onAnswer(question.id, newValue);
    } else {
      // For non-required fields, still save the value even if invalid (user can correct later)
      // This allows them to clear invalid values
      if (!question.validation?.required) {
        onAnswer(question.id, newValue);
      }
    }
  };

  const handleContinue = () => {
    // For non-required fields, allow proceeding even with validation errors (user can skip)
    if (!question.validation?.required && error) {
      // If there's a validation error on a non-required field, clear it and allow proceeding
      setError(null);
      onNext();
      return;
    }

    if (question.validation?.required && (value === null || value === undefined || value === '')) {
      setError(question.validation.errorMessage || 'This field is required');
      return;
    }
    
    // Only block if there's an error on a required field
    if (error && question.validation?.required) return;
    
    onNext();
  };

  // Add global event listeners for drag (GPA, SAT, ACT scores)
  useEffect(() => {
    if (!isDragging || !question) return;
    const isDraggable = question.id === 'gpa' || question.id === 'sat_score' || question.id === 'act_score';
    if (!isDraggable) return;
    
    const min = question.validation?.min || 0;
    const max = question.validation?.max || (question.id === 'sat_score' ? 1600 : question.id === 'act_score' ? 36 : 6.0);
    const step = question.step || (question.id === 'gpa' ? 0.01 : question.id === 'sat_score' ? 10 : 1);
    
    const touchMoveHandler = (e) => {
      const deltaY = dragStartY - e.touches[0].clientY;
      const pixelsPerStep = 10;
      const steps = Math.round(deltaY / pixelsPerStep);
      const newValue = Math.max(min, Math.min(max, dragStartValue + (steps * step)));
      if (question.id === 'gpa') {
        handleChange(parseFloat(newValue.toFixed(2)));
      } else {
        handleChange(Math.round(newValue));
      }
      e.preventDefault();
    };
    
    const mouseMoveHandler = (e) => {
      const deltaY = dragStartY - e.clientY;
      const pixelsPerStep = 10;
      const steps = Math.round(deltaY / pixelsPerStep);
      const newValue = Math.max(min, Math.min(max, dragStartValue + (steps * step)));
      if (question.id === 'gpa') {
        handleChange(parseFloat(newValue.toFixed(2)));
      } else {
        handleChange(Math.round(newValue));
      }
    };
    
    const endHandler = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', endHandler);
    
    return () => {
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', endHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', endHandler);
    };
  }, [isDragging, dragStartY, dragStartValue, question, handleChange]);

  const renderInput = () => {
    switch (question.component) {
      case 'NumberInput':
        // Special handling for GPA, SAT, and ACT scores with touch/drag on value
        if (question.id === 'gpa' || question.id === 'sat_score' || question.id === 'act_score') {
          const min = question.validation?.min || 0;
          const max = question.validation?.max || (question.id === 'sat_score' ? 1600 : question.id === 'act_score' ? 36 : 6.0);
          const step = question.step || (question.id === 'gpa' ? 0.01 : question.id === 'sat_score' ? 10 : 1);
          const currentValue = displayValue !== null && displayValue !== undefined ? displayValue : (question.defaultValue || min);
          
          // Format value based on question type
          const formatValue = (val) => {
            if (val === null || val === undefined) return '';
            if (question.id === 'gpa') {
              return val.toFixed(2);
            } else {
              return Math.round(val).toString();
            }
          };
          
          const handleTouchStart = (e) => {
            setIsDragging(true);
            setDragStartY(e.touches[0].clientY);
            setDragStartValue(currentValue);
            e.preventDefault();
          };
          
          const handleMouseDown = (e) => {
            setIsDragging(true);
            setDragStartY(e.clientY);
            setDragStartValue(currentValue);
            e.preventDefault();
          };
          
          const handleIncrement = () => {
            const newValue = Math.min(currentValue + step, max);
            if (question.id === 'gpa') {
              handleChange(parseFloat(newValue.toFixed(2)));
            } else {
              handleChange(Math.round(newValue));
            }
          };
          
          const handleDecrement = () => {
            const newValue = Math.max(currentValue - step, min);
            if (question.id === 'gpa') {
              handleChange(parseFloat(newValue.toFixed(2)));
            } else {
              handleChange(Math.round(newValue));
            }
          };
          
          return (
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="h-11 w-11 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  disabled={currentValue <= min}
                >
                  −
                </button>
                <div
                  className="flex-1 relative"
                  onTouchStart={handleTouchStart}
                  onMouseDown={handleMouseDown}
                >
                  <Input
                    type="number"
                    value={formatValue(displayValue)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        const clampedVal = Math.max(min, Math.min(max, val));
                        if (question.id === 'gpa') {
                          handleChange(parseFloat(clampedVal.toFixed(2)));
                        } else {
                          handleChange(Math.round(clampedVal));
                        }
                      } else if (e.target.value === '') {
                        handleChange(null);
                      }
                    }}
                    min={min}
                    max={max}
                    step={step}
                    placeholder={question.placeholder}
                    glassmorphic={true}
                    className={`text-center ${isDragging ? 'cursor-ns-resize select-none' : 'cursor-ns-resize'}`}
                    readOnly={isDragging}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="h-11 w-11 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  disabled={currentValue >= max}
                >
                  +
                </button>
              </div>
              {question.helpText && !error && (
                <p className="mt-1.5 text-sm text-white/60">{question.helpText}</p>
              )}
              {error && (
                <p className="mt-1.5 text-sm text-error">{error}</p>
              )}
            </div>
          );
        }
        
        return (
          <div>
            <NumberInput
              value={value}
              onChange={handleChange}
              min={question.validation?.min}
              max={question.validation?.max}
              step={question.step || 1}
              placeholder={question.placeholder}
              glassmorphic={true}
            />
            {question.helpText && !error && (
              <p className="mt-1.5 text-sm text-white/60">{question.helpText}</p>
            )}
            {error && (
              <p className="mt-1.5 text-sm text-error">{error}</p>
            )}
          </div>
        );

      case 'CurrencyInput':
        return (
          <div>
            <CurrencyInput
              value={value}
              onChange={handleChange}
              min={question.validation?.min}
              max={question.validation?.max}
              placeholder={question.placeholder}
              glassmorphic={true}
            />
            {question.helpText && !error && (
              <p className="mt-1.5 text-sm text-white/60">{question.helpText}</p>
            )}
            {error && (
              <p className="mt-1.5 text-sm text-error">{error}</p>
            )}
            {question.presetOptions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.presetOptions.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleChange(preset.value)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'Select':
        return (
          <div>
            <Select
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              options={question.options || []}
              placeholder="Select an option..."
              glassmorphic={true}
              error={error}
              helpText={question.helpText}
            />
          </div>
        );

      case 'RadioGroup':
        return (
          <div className="space-y-3">
            {question.options?.map(opt => (
              <label
                key={opt.value}
                className="flex items-center p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}
                  className="mr-3"
                />
                <span className="text-white">{opt.label}</span>
              </label>
            ))}
            {question.helpText && !error && (
              <p className="mt-1.5 text-sm text-white/60">{question.helpText}</p>
            )}
            {error && (
              <p className="mt-1.5 text-sm text-error">{error}</p>
            )}
          </div>
        );

      case 'MultiSelect':
        const selectedValues = Array.isArray(displayValue) ? displayValue : (Array.isArray(value) ? value : []);
        const handleMultiSelect = (optionValue) => {
          if (optionValue === 'undecided') {
            handleChange(['undecided']);
          } else {
            const maxSelections = question.validation?.maxSelections || 3;
            const newValues = selectedValues.includes(optionValue)
              ? selectedValues.filter(v => v !== optionValue)
              : [...selectedValues.filter(v => v !== 'undecided'), optionValue].slice(0, maxSelections);
            handleChange(newValues.length > 0 ? newValues : null);
          }
        };

        return (
          <div className="space-y-2">
            {question.options?.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedValues.includes(opt.value)
                    ? 'border-primary-400 bg-primary-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={() => handleMultiSelect(opt.value)}
                  className="mr-3"
                />
                <span className="text-white">{opt.label}</span>
              </label>
            ))}
            {question.helpText && !error && (
              <p className="mt-1.5 text-sm text-white/60">{question.helpText}</p>
            )}
            {error && (
              <p className="mt-1.5 text-sm text-error">{error}</p>
            )}
            {selectedValues.length > 0 && (
              <p className="text-xs text-white/60 mt-2">
                Selected: {selectedValues.length} {question.validation?.maxSelections ? `(max ${question.validation.maxSelections})` : ''}
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder}
            glassmorphic={true}
            error={error}
            helpText={question.helpText}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2 break-words">{question.question}</h2>
        {question.helpText && question.component !== 'NumberInput' && question.component !== 'CurrencyInput' && question.component !== 'Select' && (
          <p className="text-white/70 mb-4">{question.helpText}</p>
        )}
      </div>

      {/* Input */}
      <div>
        {renderInput()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10 gap-2">
        <div className="flex gap-2 flex-shrink-0">
          {canGoPrevious ? (
            <button
              onClick={onPrevious}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/15 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Back</span>
            </button>
          ) : null}
          {!question.validation?.required && (
            <button
              onClick={onSkip}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
            >
              Skip
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          {isLastQuestion && canGenerateMatches ? (
            <button
              onClick={onFinish}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <span className="whitespace-nowrap hidden sm:inline">See My Matches</span>
              <span className="whitespace-nowrap sm:hidden">Matches</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleContinue}
              disabled={!!error}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600"
            >
              <span>{isLastQuestion ? 'Finish' : 'Next'}</span>
              {!isLastQuestion && (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
