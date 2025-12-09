// hms-frontend/src/components/Alert.jsx
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose 
}) => {
  const typeConfig = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-l-4 border-emerald-500',
      title: 'text-emerald-900',
      message: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      icon: CheckCircleIcon,
      closeColor: 'hover:text-emerald-600 text-emerald-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-l-4 border-red-500',
      title: 'text-red-900',
      message: 'text-red-800',
      iconColor: 'text-red-600',
      icon: XCircleIcon,
      closeColor: 'hover:text-red-600 text-red-500'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-l-4 border-amber-500',
      title: 'text-amber-900',
      message: 'text-amber-800',
      iconColor: 'text-amber-600',
      icon: ExclamationTriangleIcon,
      closeColor: 'hover:text-amber-600 text-amber-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-l-4 border-blue-500',
      title: 'text-blue-900',
      message: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: InformationCircleIcon,
      closeColor: 'hover:text-blue-600 text-blue-500'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.border} ${config.bg} p-4 rounded-lg flex justify-between items-start gap-4 animate-fadeIn`}>
      <div className="flex items-start gap-3 flex-1">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <p className={`${config.title} font-700 mb-1`}>{title}</p>}
          <p className={`${config.message} text-sm`}>{message}</p>
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className={`${config.closeColor} flex-shrink-0 p-1 rounded-md transition-colors hover:bg-black/5`}
          aria-label="Close alert"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
