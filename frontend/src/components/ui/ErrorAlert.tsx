import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in-down">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
