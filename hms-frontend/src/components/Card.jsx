// hms-frontend/src/components/Card.jsx

export const Card = ({ 
  title, 
  children, 
  className = '',
  footer = null
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-700 text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};
