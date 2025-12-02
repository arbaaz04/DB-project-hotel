// hms-frontend/src/components/Modal.jsx
import { XMarkIcon } from '@heroicons/react/24/outline';

export const Modal = ({ 
  isOpen, 
  title, 
  children, 
  onClose, 
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className={`${sizes[size]} w-full mx-4 bg-white rounded-xl shadow-lg border border-gray-200 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <h2 className="text-lg font-700 text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        
        {footer && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
