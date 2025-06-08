import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface LogOptions {
  type: ToastType;
  message: string;
  description?: string;
  shouldLog?: boolean;
}

export const showToast = ({
  type,
  message,
  description,
  shouldLog = true,
}: LogOptions) => {
  // Always show toast
  toast[type](message, {
    description,
    duration: type === 'error' ? 5000 : 3000,
  });

  // Log to console if enabled
  if (shouldLog) {
    const logMessage = `${message}${description ? ` - ${description}` : ''}`;
    switch (type) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warning':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}; 