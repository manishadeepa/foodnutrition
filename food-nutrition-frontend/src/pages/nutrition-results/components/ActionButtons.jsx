import React from 'react';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ onSaveResults, onAnalyzeAnother, isSaving, isSaved }) => {
  const navigate = useNavigate();

  const handleAnalyzeAnother = () => {
    if (onAnalyzeAnother) onAnalyzeAnother();
    navigate('/image-upload');
  };

  const handleSaveResults = () => {
    if (onSaveResults) onSaveResults();
  };

  return (
    <div
      style={{
        background: 'rgba(22,27,34,0.8)',
        backdropFilter: 'blur(16px)',
        borderRadius: '14px',
        border: '1px solid rgba(48,54,61,0.8)',
        padding: '1.25rem 1.5rem',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h3 style={{ color: '#e6edf3' }} className="text-base md:text-lg font-medium mb-1">
            What would you like to do next?
          </h3>
          <p style={{ color: '#8b949e' }} className="text-sm md:text-base">
            Save these results or analyze another food item
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:flex-shrink-0">
          <Button
            variant="outline"
            size="default"
            onClick={handleSaveResults}
            iconName="Download"
            iconPosition="left"
            iconSize={18}
            className="w-full sm:w-auto"
            disabled={isSaving || isSaved}
          >
            {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save Results'}
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={handleAnalyzeAnother}
            iconName="Camera"
            iconPosition="left"
            iconSize={18}
            className="w-full sm:w-auto"
          >
            Analyze Another
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;