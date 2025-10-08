import React, { useState } from 'react';
import sessionService from '../services/sessions/session';
import authService from '../services/auth/auth';

export default function AuthDebug() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();
      const token = authService.getToken();
      const userRole = authService.getUserRole();
      const userId = authService.getUserId();
      
      setResult(prev => prev + `\nAuthenticated: ${isAuth}`);
      setResult(prev => prev + `\nToken exists: ${!!token}`);
      setResult(prev => prev + `\nToken length: ${token ? token.length : 0}`);
      setResult(prev => prev + `\nUser Role: ${userRole}`);
      setResult(prev => prev + `\nUser ID: ${userId}`);
      
      // Test API call
      const response = await sessionService.getSessions();
      setResult(prev => prev + `\nAPI Call Success: ${response.success}`);
      if (response.error) {
        setResult(prev => prev + `\nAPI Error: ${response.error}`);
      } else {
        setResult(prev => prev + `\nSessions Count: ${response.data?.length || 0}`);
      }
      
    } catch (error) {
      setResult(prev => prev + `\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const loginResult = await authService.login({
        email: 'student1@edumate.com',
        password: 'StudentPass123!'
      });
      
      setResult(prev => prev + `\nLogin Success: ${loginResult.success}`);
      if (loginResult.error) {
        setResult(prev => prev + `\nLogin Error: ${loginResult.error}`);
      } else {
        setResult(prev => prev + `\nToken received: ${!!loginResult.token}`);
        
        // Test API call after login
        setTimeout(async () => {
          const response = await sessionService.getSessions();
          setResult(prev => prev + `\nPost-login API Success: ${response.success}`);
          if (response.data) {
            setResult(prev => prev + `\nSessions after login: ${response.data.length}`);
          }
        }, 1000);
      }
      
    } catch (error) {
      setResult(prev => prev + `\nLogin Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={testAuth}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Current Auth'}
          </button>
          
          <button 
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded">
            {result || 'Click a button to test...'}
          </pre>
        </div>
      </div>
    </div>
  );
}