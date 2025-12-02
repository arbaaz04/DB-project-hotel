// hms-frontend/src/components/FormInput.jsx

export const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  required = false,
  placeholder,
  options, // For select inputs
  error,
  disabled = false
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-600 text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-400 focus:outline-none transition-all ${
            error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value="">Select {label?.toLowerCase()}</option>
          {options?.map((opt) => (
            <option key={opt.id || opt.value} value={opt.id || opt.value}>
              {opt.name || opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows="4"
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-400 focus:outline-none transition-all ${
            error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-400 focus:outline-none transition-all ${
            error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      )}
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
