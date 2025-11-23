/**
 * Card Component
 * Container component for content sections
 * Supports glassmorphic styling on dark backgrounds
 */
export function Card({ className, children, glassmorphic = false, ...props }) {
  const baseClasses = glassmorphic 
    ? 'glass-card rounded-xl'
    : 'bg-white rounded-xl border border-gray-200 shadow-sm';
  
  return (
    <div 
      className={`${baseClasses} transition-all duration-200 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={`p-3 sm:p-4 md:p-5 lg:p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={`p-3 sm:p-4 md:p-5 lg:p-6 pt-0 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={`p-3 sm:p-4 md:p-5 lg:p-6 pt-0 flex items-center ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

