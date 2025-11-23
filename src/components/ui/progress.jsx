/**
 * Progress Bar Component
 * For questionnaire completion and loading states
 */
export function Progress({ value, max = 100, className, showLabel = true, showDot = false }) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={className}>
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-visible border border-white/10 relative">
        <div 
          className="bg-primary-500/80 backdrop-blur-sm h-full rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
        {showDot && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-400 rounded-full shadow-lg transition-all duration-300 ease-out"
            style={{ 
              left: `calc(${Math.max(percentage, 0)}% - 8px)`,
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.8), 0 0 24px rgba(99, 102, 241, 0.4)'
            }}
          >
            <div className="w-full h-full bg-primary-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      {showLabel && (
        <p className="text-sm text-white/70 mt-2 text-center">
          {percentage}% complete
        </p>
      )}
    </div>
  );
}

