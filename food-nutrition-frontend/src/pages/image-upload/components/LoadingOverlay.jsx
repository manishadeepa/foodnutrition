import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 lg:p-10 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="Sparkles" size={32} color="var(--color-primary)" className="animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">
            Analyzing Your Food
          </h3>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Our AI is processing your image to identify the food and calculate detailed nutritional information. This usually takes just a few seconds.
          </p>

          <div className="w-full space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Eye" size={14} color="var(--color-primary)" />
              </div>
              <span>Identifying food items</span>
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Calculator" size={14} color="var(--color-primary)" />
              </div>
              <span>Calculating nutritional values</span>
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="BarChart3" size={14} color="var(--color-primary)" />
              </div>
              <span>Preparing visual analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;