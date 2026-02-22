import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Button from './Button';

const ContextualActions = ({ 
  analysisComplete = false,
  imageUploaded = false,
  isProcessing = false,
  onNewAnalysis,
  onAnalyzeAnother
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isUploadPage = location?.pathname === '/image-upload';
  const isResultsPage = location?.pathname === '/nutrition-results';

  const handleNewAnalysis = () => {
    if (onNewAnalysis) {
      onNewAnalysis();
    }
    navigate('/image-upload');
  };

  const handleAnalyzeAnother = () => {
    if (onAnalyzeAnother) {
      onAnalyzeAnother();
    }
    navigate('/image-upload');
  };

  if (isUploadPage && !imageUploaded) {
    return null;
  }

  if (isResultsPage && analysisComplete) {
    return (
      <div className="contextual-actions">
        <Button
          variant="outline"
          onClick={handleAnalyzeAnother}
          disabled={isProcessing}
          iconName="Camera"
          iconPosition="left"
          iconSize={20}
        >
          Analyze Another Image
        </Button>
        <Button
          variant="default"
          onClick={handleNewAnalysis}
          disabled={isProcessing}
          iconName="Plus"
          iconPosition="left"
          iconSize={20}
        >
          New Analysis
        </Button>
      </div>
    );
  }

  if (isUploadPage && imageUploaded && !isProcessing) {
    return (
      <div className="contextual-actions">
        <Button
          variant="outline"
          onClick={() => window.location?.reload()}
          iconName="RotateCcw"
          iconPosition="left"
          iconSize={20}
        >
          Reset
        </Button>
      </div>
    );
  }

  return null;
};

export default ContextualActions;