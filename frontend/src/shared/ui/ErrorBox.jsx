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
      container: 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
      icon: 'bg-red-100 text-red-600 dark:bg-red-800/50 dark:text-red-300',
      text: 'text-red-800 dark:text-red-200',
      button: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
    },
    warning: {
      container: 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
      icon: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800/50 dark:text-yellow-300',
      text: 'text-yellow-800 dark:text-yellow-200',
      button: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
    },
    info: {
      container: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
      icon: 'bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-200',
      button: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
    },
  };

  const styles = variantStyles[variant];
  const errorList = Array.isArray(errors) ? errors : [message];

  return (
    <div className={`backdrop-blur-md border rounded-xl p-4 mb-4 animate-slideInLeft relative overflow-hidden ${styles.container}`}>
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          {variant === 'error' && <span className="text-xl">⚠️</span>}
          {variant === 'warning' && <span className="text-xl">⚡</span>}
          {variant === 'info' && <span className="text-xl">ℹ️</span>}
        </div>

        <div className="flex-1 pt-1">
          {message && (
            <h3 className={`${styles.text} font-bold mb-1 tracking-tight`}>
              {message}
            </h3>
          )}
          {errorList.length > 0 && (
            <ul className={`${styles.text} text-sm space-y-1 opacity-90`}>
              {errorList.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.button} flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
            aria-label="Dismiss"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  );
};
