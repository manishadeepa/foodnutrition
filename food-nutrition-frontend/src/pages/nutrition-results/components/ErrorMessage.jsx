import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ErrorMessage = ({ message, suggestions }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-error/20 overflow-hidden">
      <div className="p-6 md:p-8 lg:p-10 text-center">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-error/10 flex items-center justify-center">
            <Icon name="AlertTriangle" size={40} className="text-error" />
          </div>
        </div>

        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-3 md:mb-4">
          Unable to Recognize Food
        </h2>
        
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
          {message}
        </p>

        <div className="bg-muted/30 rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left max-w-2xl mx-auto">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="Lightbulb" size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <h3 className="text-base md:text-lg font-medium text-foreground">
              Suggestions for Better Results
            </h3>
          </div>
          
          <ul className="space-y-2 md:space-y-3">
            {suggestions?.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={16} className="text-success flex-shrink-0 mt-1" />
                <span className="text-sm md:text-base text-muted-foreground">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/image-upload')}
            iconName="Camera"
            iconPosition="left"
            iconSize={20}
          >
            Try Another Image
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/image-upload')}
            iconName="RotateCcw"
            iconPosition="left"
            iconSize={20}
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;