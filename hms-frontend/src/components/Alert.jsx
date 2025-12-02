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
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      iconColor: 'text-green-600',
      icon: CheckCircleIcon
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      iconColor: 'text-red-600',
      icon: XCircleIcon
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconColor: 'text-amber-600',
      icon: ExclamationTriangleIcon
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      iconColor: 'text-blue-600',
      icon: InformationCircleIcon
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`border-l-4 ${config.border} ${config.bg} p-4 rounded-lg flex justify-between items-start ${config.text}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          {title && <p className="font-600 mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-3 p-0.5 hover:bg-white/50 rounded transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
