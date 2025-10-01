/**
 * Application Configuration
 * 
 * This module provides centralized configuration values that can be set
 * via environment variables during build or runtime.
 */

interface Config {
  apiUrl: string;
  environment: string;
}

// Default values for local development
const defaultConfig: Config = {
  apiUrl: 'http://localhost:3000',
  environment: 'development'
};

/**
 * Load configuration from environment variables when available
 * For Vite, environment variables must be prefixed with VITE_
 */
const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || defaultConfig.apiUrl,
  environment: import.meta.env.VITE_ENVIRONMENT || defaultConfig.environment
};

export default config;