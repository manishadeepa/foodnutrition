import React from 'react';
import Icon from '../../../components/AppIcon';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
          <Icon name="AlertTriangle" size={28} color="var(--color-destructive)" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-base md:text-lg font-semibold text-destructive mb-2">
            Analysis Failed
          </h4>
          <p className="text-sm md:text-base text-destructive/90 leading-relaxed">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm md:text-base transition-all duration-300 hover:bg-destructive/90 hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <Icon name="RotateCcw" size={18} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;