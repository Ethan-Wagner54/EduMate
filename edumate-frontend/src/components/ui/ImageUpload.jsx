import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, Check } from 'lucide-react';
import { processImageUpload, createAvatarPlaceholder } from '../../utils/imageUtils';

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  userId, 
  userType = 'student',
  userName,
  size = 120,
  showRemove = true,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Generate placeholder if no image
  const placeholderImage = !currentImage && userName ? 
    createAvatarPlaceholder(userName, size) : null;

  const displayImage = currentImage || placeholderImage;

  const handleFileSelect = useCallback(async (file) => {
    if (!file || uploading || disabled) return;

    setUploading(true);
    setUploadError('');
    setUploadMessage('');

    try {
      const result = await processImageUpload(file, userId, userType);
      
      if (result.success) {
        setUploadMessage(result.message);
        onImageChange?.(result.imageUrl);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        setUploadError(result.errors?.[0] || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [userId, userType, onImageChange, uploading, disabled]);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isDragging && !disabled) {
      setIsDragging(true);
    }
  }, [isDragging, disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleRemoveImage = () => {
    if (disabled || uploading) return;
    onImageChange?.(null);
    setUploadMessage('');
    setUploadError('');
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Image Display Area */}
      <div
        className={`relative group cursor-pointer transition-all duration-200 ${
          isDragging ? 'scale-105' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ width: size, height: size }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {/* Main Image/Avatar */}
        <div
          className={`w-full h-full rounded-full border-4 border-border bg-muted overflow-hidden transition-all duration-200 ${
            isDragging ? 'border-primary border-dashed' : ''
          } ${uploading ? 'animate-pulse' : ''}`}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Camera size={size / 3} className="text-primary-foreground opacity-70" />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            uploading ? 'opacity-100' : ''
          } ${disabled ? 'opacity-0' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-white">
              <Upload size={20} className="mb-1" />
              <span className="text-xs font-medium">
                {currentImage ? 'Change' : 'Upload'}
              </span>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {showRemove && currentImage && !uploading && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-colors"
            title="Remove photo"
          >
            <X size={12} />
          </button>
        )}

        {/* Drag Overlay */}
        {isDragging && !disabled && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-primary border-dashed rounded-full flex items-center justify-center">
            <div className="text-primary text-center">
              <Upload size={24} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Drop image here</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Instructions */}
      <div className="mt-3 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          {currentImage ? 'Click to change photo' : 'Click to upload photo'}
        </p>
        <p className="text-xs text-muted-foreground">
          or drag and drop • Max 5MB
        </p>
      </div>

      {/* Status Messages */}
      {uploadMessage && (
        <div className="mt-2 flex items-center text-success text-sm">
          <Check size={14} className="mr-1" />
          {uploadMessage}
        </div>
      )}

      {uploadError && (
        <div className="mt-2 flex items-center text-destructive text-sm">
          <AlertCircle size={14} className="mr-1" />
          {uploadError}
        </div>
      )}
    </div>
  );
}