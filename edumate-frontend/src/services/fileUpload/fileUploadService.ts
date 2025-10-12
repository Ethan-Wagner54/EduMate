import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';

const API_URL = config.apiUrl;

export interface FileAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    attachments: FileAttachment[];
    message: string;
  };
  error?: string;
}

export interface SendMessageWithAttachmentsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class FileUploadService {
  /**
   * Upload files for chat messages
   */
  async uploadFiles(files: File[], conversationId: number): Promise<UploadResponse> {
    try {
      authService.setAuthHeader();

      // Validate files
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const maxFiles = 5;

      if (files.length > maxFiles) {
        return {
          success: false,
          error: `Maximum ${maxFiles} files allowed`
        };
      }

      for (const file of files) {
        if (file.size > maxFileSize) {
          return {
            success: false,
            error: `File "${file.name}" is too large. Maximum size is 10MB.`
          };
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('conversationId', conversationId.toString());
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        error: 'Upload failed'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.error || 'Upload failed'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Send message with attachments
   */
  async sendMessageWithAttachments(
    conversationId: number,
    content: string,
    attachments: FileAttachment[]
  ): Promise<SendMessageWithAttachmentsResponse> {
    try {
      authService.setAuthHeader();

      const response = await axios.post(
        `${API_URL}/files/conversations/${conversationId}/messages/attachments`,
        {
          content,
          attachments
        }
      );

      if (response.data) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        error: 'Failed to send message with attachments'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.error || 'Failed to send message'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  /**
   * Get file download URL
   */
  getFileUrl(filename: string): string {
    return `${API_URL}/uploads/chat-attachments/${filename}`;
  }

  /**
   * Get file type icon based on mime type
   */
  getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('word')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
      return '📺';
    } else if (mimeType.startsWith('text/')) {
      return '📃';
    }
    return '📁';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file type
   */
  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    return allowedTypes.includes(file.type);
  }
}

// Create singleton instance
const fileUploadService = new FileUploadService();

export default fileUploadService;