/**
 * CSV Export Utility Functions
 * 
 * Provides functions to convert data to CSV format and trigger downloads
 */

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  dateFormat?: 'iso' | 'local' | 'short';
}

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: any[], options: CSVExportOptions = {}): string => {
  if (!data || data.length === 0) {
    return '';
  }

  const { headers, dateFormat = 'short' } = options;
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create CSV data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      let value = item[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      
      // Format dates
      if (value instanceof Date) {
        switch (dateFormat) {
          case 'iso':
            value = value.toISOString();
            break;
          case 'local':
            value = value.toLocaleString();
            break;
          case 'short':
          default:
            value = value.toLocaleDateString();
            break;
        }
      }
      
      // Handle objects/arrays by converting to string
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file to user's computer
 */
export const downloadCSV = (csvContent: string, filename: string = 'export.csv'): void => {
  // Add BOM for proper Excel encoding
  const BOM = '\uFEFF';
  const csvData = BOM + csvContent;
  
  // Create blob
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export data directly to CSV file
 */
export const exportToCSV = (data: any[], options: CSVExportOptions = {}): void => {
  const { filename = 'export.csv' } = options;
  
  if (!data || data.length === 0) {
    return;
  }
  
  const csvContent = convertToCSV(data, options);
  downloadCSV(csvContent, filename);
};

/**
 * Format session history data specifically for CSV export
 */
export const formatSessionHistoryForCSV = (sessions: any[]): any[] => {
  return sessions.map(session => ({
    'Session ID': session.id,
    'Date': session.date,
    'Start Time': session.startTime,
    'End Time': session.endTime,
    'Module Code': session.module?.code || 'N/A',
    'Module Name': session.module?.name || 'N/A', 
    'Tutor Name': session.tutor?.name || 'N/A',
    'Location': session.location || 'N/A',
    'Status': session.status || 'N/A',
    'Rating': session.rating || 'Not Rated',
    'Feedback': session.feedback || 'No Feedback',
    'Attendance': session.attendance || 'N/A'
  }));
};