import React from 'react';

/**
 * Reusable Input Component
 * 
 * @param {string} type - 'text' | 'email' | 'password' | 'number' | 'date'
 * @param {string} label - Label text
 * @param {string} error - Error message
 * @param {boolean} disabled - Disable input
 */
export const Input = React.forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      disabled = false,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`
            w-full px-4 py-2 border rounded-lg
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
