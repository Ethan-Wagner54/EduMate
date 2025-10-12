import authService from './auth/auth';
import socketService from './websocket/socketService';

/**
 * Initialize services when the app starts
 */
export const initializeServices = () => {
  // Only connect to WebSocket if user is authenticated
  if (authService.isAuthenticated()) {
    console.log('User authenticated, connecting to WebSocket...');
    socketService.connect();
  }
};

/**
 * Cleanup services when user logs out
 */
export const cleanupServices = () => {
  console.log('Cleaning up services...');
  socketService.disconnect();
};

export default {
  initializeServices,
  cleanupServices
};