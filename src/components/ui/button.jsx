/**
 * Button Component
 * Reusable button with variants using class-variance-authority
 */
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600/90 backdrop-blur-sm text-white hover:bg-primary-600 hover:shadow-lg focus-visible:ring-primary-500',
        secondary: 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/15 focus-visible:ring-white/30',
        outline: 'border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm focus-visible:ring-white/30',
        ghost: 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm focus-visible:ring-white/30',
        danger: 'bg-error text-white hover:bg-error-dark focus-visible:ring-error shadow-lg', // Critical - more saturated
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ variant, size, className, children, ...props }) {
  return (
    <button 
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

