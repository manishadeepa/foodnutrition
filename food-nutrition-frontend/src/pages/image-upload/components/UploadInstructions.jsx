import React from 'react';
import Icon from '../../../components/AppIcon';

const UploadInstructions = () => {
  const instructions = [
    {
      icon: 'Camera',
      title: 'Take a Clear Photo',
      description: 'Ensure good lighting and the food is clearly visible in the frame'
    },
    {
      icon: 'Focus',
      title: 'Focus on the Food',
      description: 'Center the food item and avoid cluttered backgrounds'
    },
    {
      icon: 'Zap',
      title: 'Get Instant Results',
      description: 'Our AI will analyze and provide detailed nutritional information'
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8 lg:p-10 shadow-sm">
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-6 md:mb-8 flex items-center gap-3">
        <Icon name="Lightbulb" size={24} color="var(--color-accent)" />
        <span>Tips for Best Results</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {instructions?.map((instruction, index) => (
          <div key={index} className="flex flex-col items-start gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name={instruction?.icon} size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">
                {instruction?.title}
              </h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {instruction?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadInstructions;