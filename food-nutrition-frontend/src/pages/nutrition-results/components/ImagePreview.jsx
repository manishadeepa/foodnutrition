import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ImagePreview = ({ imageUrl, imageAlt, foodName, confidence }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2 truncate">
              {foodName}
            </h2>
            <div className="flex items-center gap-2">
              <Icon name="Target" size={18} className="text-success flex-shrink-0" />
              <span className="text-sm md:text-base text-muted-foreground">
                Confidence: <span className="font-medium text-success">{confidence}%</span>
              </span>
            </div>
          </div>
          
          <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 ${
            confidence >= 90 ? 'bg-success/10' : confidence >= 70 ? 'bg-warning/10' : 'bg-error/10'
          }`}>
            <Icon 
              name={confidence >= 90 ? 'CheckCircle2' : confidence >= 70 ? 'AlertCircle' : 'XCircle'} 
              size={24}
              className={confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-error'}
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ImagePreview;