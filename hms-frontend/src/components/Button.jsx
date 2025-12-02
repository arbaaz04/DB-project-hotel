// hms-frontend/src/components/Button.jsx

export const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = ''
}) => {
  const baseStyles = 'font-500 rounded-lg transition-all duration-150 cursor-pointer focus:outline-none inline-flex items-center justify-center active:scale-95';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-600',
    md: 'px-4 py-2 text-sm font-600',
    lg: 'px-6 py-3 text-base font-600'
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};
