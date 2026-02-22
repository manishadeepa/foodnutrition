import React from 'react';
import Icon from '../../../components/AppIcon';

const AnalysisButton = ({ onClick, disabled, isProcessing }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 md:px-8 md:py-5 lg:px-10 lg:py-6 bg-primary text-primary-foreground rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md ${
        disabled || isProcessing
          ? 'opacity-50 cursor-not-allowed' :'hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-95'
      }`}
    >
      {isProcessing ? (
        <>
          <div className="w-5 h-5 md:w-6 md:h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Icon name="Sparkles" size={24} />
          <span>Analyze Food</span>
        </>
      )}
    </button>
  );
};

export default AnalysisButton;