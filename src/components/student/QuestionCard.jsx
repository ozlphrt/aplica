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
  
  // Use defaultValue if value is null/undefined and question has defaultValue
  const displayValue = (value === null || value === undefined) && question.defaultValue !== undefined
    ? question.defaultValue
    : value;
  
  // Auto-set default value when question is first shown (for NumberInput and Select)
  useEffect(() => {
    if ((value === null || value === undefined) && question.defaultValue !== undefined && 
        (question.component === 'NumberInput' || question.component === 'Select')) {
      onAnswer(question.id, question.defaultValue);
    }
  }, [question.id, question.defaultValue, question.component, value, onAnswer]);

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

  const renderInput = () => {
    switch (question.component) {
      case 'NumberInput':
        // Special handling for GPA (x.xx format)
        if (question.id === 'gpa') {
          return (
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentVal = displayValue !== null && displayValue !== undefined ? displayValue : (question.defaultValue || 0);
                    const newValue = Math.max(currentVal - (question.step || 0.01), question.validation?.min || 0);
                    handleChange(parseFloat(newValue.toFixed(2)));
                  }}
                  className="h-11 w-11 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={question.validation?.min !== undefined && (displayValue || question.defaultValue || 0) <= question.validation.min}
                >
                  −
                </button>
                <Input
                  type="number"
                  value={displayValue !== null && displayValue !== undefined ? displayValue.toFixed(2) : ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      handleChange(parseFloat(val.toFixed(2)));
                    } else if (e.target.value === '') {
                      handleChange(null);
                    }
                  }}
                  min={question.validation?.min}
                  max={question.validation?.max}
                  step={question.step || 0.01}
                  placeholder={question.placeholder}
                  glassmorphic={true}
                  className="text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentVal = displayValue !== null && displayValue !== undefined ? displayValue : (question.defaultValue || 0);
                    const newValue = Math.min(currentVal + (question.step || 0.01), question.validation?.max || 5.0);
                    handleChange(parseFloat(newValue.toFixed(2)));
                  }}
                  className="h-11 w-11 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={question.validation?.max !== undefined && (displayValue || question.defaultValue || 0) >= question.validation.max}
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
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="flex gap-2">
          {canGoPrevious ? (
            <Button variant="outline" onClick={onPrevious}>
              ← Back
            </Button>
          ) : (
            <div></div>
          )}
          {!question.validation?.required && (
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
        <div>
          {isLastQuestion && canGenerateMatches ? (
            <Button variant="primary" onClick={onFinish}>
              See My Matches
            </Button>
          ) : (
            <Button variant="primary" onClick={handleContinue} disabled={!!error}>
              {isLastQuestion ? 'Finish' : 'Next →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
