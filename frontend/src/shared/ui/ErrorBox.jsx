import React from 'react';

/**
 * Error Box Component
 * 
 * @param {string} message - Error message
 * @param {array} errors - Array of error messages
 * @param {function} onDismiss - Callback when dismissing error
 * @param {string} variant - 'error' | 'warning' | 'info'
 */
export const ErrorBox = ({ 
  message = 'Something went wrong', 
  errors = [],
  onDismiss,
  variant = 'error'
}) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      button: 'text-red-600 hover:text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-800',
      button: 'text-yellow-600 hover:text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      button: 'text-blue-600 hover:text-blue-800',
    },
  };

  const styles = variantStyles[variant];
  const errorList = Array.isArray(errors) ? errors : [message];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-4`}>
      <div className="flex gap-3">
        <div className={`${styles.icon} flex-shrink-0 text-xl`}>
          {variant === 'error' && '⚠️'}
          {variant === 'warning' && '⚡'}
          {variant === 'info' && 'ℹ️'}
        </div>
        <div className="flex-1">
          {message && (
            <h3 className={`${styles.text} font-semibold mb-1`}>
              {message}
            </h3>
          )}
          {errorList.length > 0 && (
            <ul className={`${styles.text} text-sm space-y-1`}>
              {errorList.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-lg leading-none">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.button} flex-shrink-0 text-2xl leading-none hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
