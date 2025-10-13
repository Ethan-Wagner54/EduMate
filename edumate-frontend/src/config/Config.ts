/**
 * Global Application Configuration
 *
 * Automatically detects environment (development or production)
 * and loads values from environment variables or sensible defaults.
 */

export interface Config {
  apiUrl: string;
  environment: 'development' | 'production';
}

// Detect environment mode from Vite or NODE_ENV
const environment =
  import.meta.env.MODE || import.meta.env.VITE_ENVIRONMENT || 'development';

// Default URLs for each environment
const apiUrl =
  import.meta.env.VITE_API_URL ||
  (environment === 'production'
    ? 'https://edumate-api-group-bsgkdyffhja8dwcb.southafricanorth-01.azurewebsites.net'
    : 'http://localhost:3000');

// Final config object
const config: Config = {
  apiUrl,
  environment: environment as 'development' | 'production',
};

export default config;
