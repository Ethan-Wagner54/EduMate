import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Image, FileText, Download, Eye } from 'lucide-react';
import messageService from '../../services/messages/messageService';

const FileAttachment = ({ onAttachmentSelect, onAttachmentRemove, attachments = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Create a temporary attachment object while uploading
        const tempAttachment = {
          id: `temp-${Date.now()}-${Math.random()}`,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploading: true,
          progress: 0
        };

        onAttachmentSelect(tempAttachment);

        try {
          // Upload the file
          const uploadResult = await messageService.uploadAttachment(file);
          
          if (uploadResult.success) {
            // Replace temp attachment with real one
            const realAttachment = {
              id: uploadResult.data.id,
              name: uploadResult.data.filename,
              originalName: file.name,
              size: uploadResult.data.size,
              type: uploadResult.data.mimeType,
              url: uploadResult.data.url,
              uploading: false,
              progress: 100
            };

            onAttachmentRemove(tempAttachment.id);
            onAttachmentSelect(realAttachment);
          } else {
            onAttachmentRemove(tempAttachment.id);
            alert(`Failed to upload "${file.name}": ${uploadResult.error}`);
          }
        } catch (error) {
          onAttachmentRemove(tempAttachment.id);
          console.error('Upload error:', error);
          alert(`Failed to upload "${file.name}"`);
        }
      }
    } finally {
      setUploading(false);
    }
  }, [onAttachmentSelect, onAttachmentRemove]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <Image size={16} className="text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText size={16} className="text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText size={16} className="text-blue-600" />;
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileText size={16} className="text-green-600" />;
    } else {
      return <File size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveAttachment = (attachmentId) => {
    onAttachmentRemove(attachmentId);
  };

  const handleViewAttachment = (attachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.originalName || attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="file-attachment-container">
      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-[#6A0DAD] bg-purple-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop files here...'
            : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Max size: 10MB. Supported: Images, PDF, Word, Excel, Text
        </p>
      </div>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center flex-1 min-w-0">
                {getFileIcon(attachment.type)}
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.originalName || attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </p>
                  
                  {/* Upload Progress */}
                  {attachment.uploading && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Uploading...</span>
                        <span>{attachment.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-[#6A0DAD] h-1 rounded-full transition-all duration-300"
                          style={{ width: `${attachment.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center ml-3 space-x-1">
                {/* View Button (for uploaded files) */}
                {attachment.url && !attachment.uploading && (
                  <button
                    onClick={() => handleViewAttachment(attachment)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View file"
                  >
                    <Eye size={16} />
                  </button>
                )}

                {/* Download Button (for uploaded files) */}
                {attachment.url && !attachment.uploading && (
                  <button
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download file"
                  >
                    <Download size={16} />
                  </button>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove attachment"
                  disabled={attachment.uploading}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component to display a single attachment in a message
export const MessageAttachment = ({ attachment }) => {
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText size={20} className="text-blue-600" />;
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileText size={20} className="text-green-600" />;
    } else {
      return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClick = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  // For image attachments, show thumbnail
  if (attachment.type.startsWith('image/')) {
    return (
      <div 
        className="max-w-xs cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
        onClick={handleClick}
      >
        <img 
          src={attachment.url} 
          alt={attachment.originalName || attachment.name}
          className="w-full h-auto max-h-64 object-cover"
        />
        <div className="p-2 bg-gray-100">
          <p className="text-xs text-gray-600 truncate">
            {attachment.originalName || attachment.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
    );
  }

  // For other file types, show file info card
  return (
    <div 
      className="flex items-center p-3 bg-gray-100 rounded-lg max-w-xs cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={handleClick}
    >
      {getFileIcon(attachment.type)}
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {attachment.originalName || attachment.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(attachment.size)}
        </p>
      </div>
      <Download size={16} className="text-gray-400 ml-2" />
    </div>
  );
};

export default FileAttachment;