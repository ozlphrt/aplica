/**
 * Warning Banner Component
 * Displays warnings and alerts
 */
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

export default function WarningBanner({ type = 'warning', severity = 'medium', message, action }) {
  const config = {
    critical: {
      bg: 'bg-error-light backdrop-blur-sm',
      border: 'border-error/50',
      text: 'text-error',
      icon: AlertCircle,
    },
    high: {
      bg: 'bg-error-light/80 backdrop-blur-sm',
      border: 'border-error/40',
      text: 'text-error',
      icon: AlertTriangle,
    },
    medium: {
      bg: 'bg-warning-light/60 backdrop-blur-sm',
      border: 'border-warning/30',
      text: 'text-warning',
      icon: AlertTriangle,
    },
    low: {
      bg: 'bg-info-light/50 backdrop-blur-sm',
      border: 'border-info/20',
      text: 'text-info',
      icon: Info,
    },
    success: {
      bg: 'bg-success-light/50 backdrop-blur-sm',
      border: 'border-success/20',
      text: 'text-success',
      icon: CheckCircle,
    },
  };

  const style = config[severity] || config.medium;
  const Icon = style.icon;

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${style.bg} ${style.border} glass`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.text}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        {action && <p className={`text-sm mt-1 ${style.text} opacity-80`}>{action}</p>}
      </div>
    </div>
  );
}

