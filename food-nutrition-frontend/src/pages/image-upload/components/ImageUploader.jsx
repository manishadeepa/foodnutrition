import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageUploader = ({ onImageSelect, selectedImage, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!acceptedFormats?.includes(file?.type)) {
      setError('Please upload a JPG, PNG, or WebP image file');
      return false;
    }
    if (file?.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect({
          file,
          preview: reader?.result,
          name: file?.name,
          size: file?.size
        });
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);

    const files = e?.dataTransfer?.files;
    if (files && files?.length > 0) {
      handleFileSelect(files?.[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e?.target?.files;
    if (files && files?.length > 0) {
      handleFileSelect(files?.[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef?.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 hover:scale-110">
              <Icon
                name="Upload"
                size={32}
                color="var(--color-primary)"
                className="md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
            </div>

            <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-2 md:mb-3 text-center">
              Upload Food Image
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 text-center max-w-md">
              Drag and drop your food image here, or click to browse
            </p>

            <button
              onClick={handleBrowseClick}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="FolderOpen" size={20} />
              <span className="text-sm md:text-base">Browse Files</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />

            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icon name="FileImage" size={16} />
                <span>JPG, PNG, WebP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="HardDrive" size={16} />
                <span>Max 10MB</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={selectedImage?.preview}
                  alt="Selected food image preview showing uploaded meal for nutritional analysis"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="flex items-start gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={24} color="var(--color-success)" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-1 truncate">
                    {selectedImage?.name}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {formatFileSize(selectedImage?.size)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Icon name="Info" size={18} />
                  <span>Image ready for analysis</span>
                </div>

                <button
                  onClick={() => {
                    onImageSelect(null);
                    setError('');
                    if (fileInputRef?.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="Trash2" size={18} />
                  <span>Remove Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm md:text-base text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;