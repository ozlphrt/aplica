/**
 * Progress Bar Component
 * For questionnaire completion and loading states
 */
export function Progress({ value, max = 100, className, showLabel = true }) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={className}>
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-white/10">
        <div 
          className="bg-primary-500/80 backdrop-blur-sm h-full rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-white/70 mt-2 text-center">
          {percentage}% complete
        </p>
      )}
    </div>
  );
}

