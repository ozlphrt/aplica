/**
 * Badge Component
 * For tags, labels, and status indicators
 */
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors backdrop-blur-sm',
  {
    variants: {
      variant: {
        reach: 'bg-reach/50 text-white border border-reach/40 shadow-md', // Neutral gray - ambition, prestige, aspiration
        target: 'bg-cyan-500/50 text-white border border-cyan-400/40 shadow-md', // Teal/Cyan - balance, harmony, realistic fit
        safety: 'bg-safety/50 text-white border border-safety/40 shadow-md', // Cool slate - security, confidence, certainty
        affordable: 'bg-green-500/50 text-white border border-green-400/40 shadow-md', // Green - financial security, positive
        expensive: 'bg-red-500/60 text-white border border-red-400/50 shadow-md', // Red - warning, critical, concern
        neutral: 'bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export function Badge({ variant, className, children, ...props }) {
  return (
    <span className={badgeVariants({ variant, className })} {...props}>
      {children}
    </span>
  );
}

