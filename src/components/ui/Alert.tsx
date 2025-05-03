import React from 'react';
import { cn } from '../../utils/cn';
import { 
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  children, 
  title,
  variant = 'info',
  className,
}) => {
  const variantClasses = {
    info: 'bg-primary-50 text-primary-800 border-primary-200',
    success: 'bg-success-50 text-success-800 border-success-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    error: 'bg-error-50 text-error-800 border-error-200',
  };

  const iconMap = {
    info: <Info className="h-5 w-5 text-primary-400" />,
    success: <CheckCircle className="h-5 w-5 text-success-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-400" />,
    error: <XCircle className="h-5 w-5 text-error-400" />,
  };

  return (
    <div className={cn(
      'rounded-md p-4 border',
      variantClasses[variant],
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          {iconMap[variant]}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={cn("text-sm", title && "mt-2")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;