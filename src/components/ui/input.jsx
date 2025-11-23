/**
 * Input Component
 * Form input with label and error handling
 */
export function Input({ label, error, helpText, className, glassmorphic = false, ...props }) {
  const inputClasses = glassmorphic
    ? `
        w-full px-4 py-2.5 rounded-lg border bg-white/5 backdrop-blur-sm
        ${error ? 'border-error/50 focus:ring-error/50 text-white' : 'border-white/20 focus:ring-white/30 text-white placeholder-white/40'}
        focus:outline-none focus:ring-2
        disabled:bg-white/5 disabled:cursor-not-allowed disabled:text-white/40
      `
    : `
        w-full px-4 py-2.5 rounded-lg border
        ${error ? 'border-error focus:ring-error' : 'border-gray-300 focus:ring-primary-500'}
        focus:outline-none focus:ring-2
        disabled:bg-gray-100 disabled:cursor-not-allowed
      `;

  const labelClasses = glassmorphic
    ? 'block text-sm font-medium text-white/90 mb-1.5'
    : 'block text-sm font-medium text-gray-700 mb-1.5';

  const helpTextClasses = glassmorphic
    ? 'mt-1.5 text-sm text-white/60'
    : 'mt-1.5 text-sm text-gray-500';

  const errorTextClasses = glassmorphic
    ? 'mt-1.5 text-sm text-error'
    : 'mt-1.5 text-sm text-error';

  return (
    <div className="w-full">
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      <input 
        className={`${inputClasses} ${className || ''}`}
        {...props}
      />
      {helpText && !error && (
        <p className={helpTextClasses}>{helpText}</p>
      )}
      {error && (
        <p className={errorTextClasses}>{error}</p>
      )}
    </div>
  );
}

// Currency input
export function CurrencyInput({ value, onChange, ...props }) {
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue ? parseInt(rawValue) : 0);
  };
  
  const displayValue = value ? `$${value.toLocaleString()}` : '';
  
  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}

// Number input with step controls
export function NumberInput({ value, onChange, min, max, step = 1, glassmorphic = false, ...props }) {
  const increment = () => {
    const newValue = (value || 0) + step;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };
  
  const decrement = () => {
    const newValue = (value || 0) - step;
    if (!min || newValue >= min) {
      onChange(newValue);
    }
  };

  const buttonClasses = glassmorphic
    ? 'h-11 w-11 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed'
    : 'h-11 w-11 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed';
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={decrement}
        className={buttonClasses}
        disabled={min !== undefined && (value || 0) <= min}
      >
        −
      </button>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || null)}
        min={min}
        max={max}
        step={step}
        className="text-center"
        glassmorphic={glassmorphic}
        {...props}
      />
      <button
        type="button"
        onClick={increment}
        className={buttonClasses}
        disabled={max !== undefined && (value || 0) >= max}
      >
        +
      </button>
    </div>
  );
}

