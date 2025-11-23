import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  type = 'error',
  onDismiss,
  className,
}: ErrorMessageProps) {
  if (!message) return null;

  const variants = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-700',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-700',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        'rounded-md border p-3 text-sm flex items-start gap-3',
        variant.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', variant.iconColor)} />
      <div className="flex-1">
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
