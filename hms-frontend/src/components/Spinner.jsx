// hms-frontend/src/components/Spinner.jsx

export const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-600 font-500">{text}</p>}
    </div>
  );
};
