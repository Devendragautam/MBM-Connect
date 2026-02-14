import React from 'react';

/**
 * Loader Component
 * 
 * @param {string} text - Loading text
 * @param {boolean} fullScreen - Full screen loader
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 */
export const Loader = ({
  text = 'Loading...',
  fullScreen = false,
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const spinnerSize = sizeMap[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fadeIn">
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${spinnerSize} border-white/20 rounded-full`}></div>
        {/* Spinning Segment */}
        <div className={`absolute top-0 left-0 ${spinnerSize} border-transparent border-t-violet-500 rounded-full animate-spin`}></div>
        {/* Inner Glow */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.4)] animate-pulse"></div>
      </div>
      {text && (
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md z-50 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          {loaderContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10">
      {loaderContent}
    </div>
  );
};
