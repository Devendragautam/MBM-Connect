import React from 'react';

/**
 * Loader Component
 * 
 * @param {string} text - Loading text
 * @param {boolean} fullScreen - Full screen loader
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export const Loader = ({ 
  text = 'Loading...', 
  fullScreen = false,
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerSize = sizeMap[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${spinnerSize} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10">
      {loaderContent}
    </div>
  );
};
