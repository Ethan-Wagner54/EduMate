import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config/Config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState(''); // For demo purposes

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/auth/forgot-password`, { email });
      
      setEmailSent(true);
      // For demo purposes, show the reset link
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
      
      toast.success('Password reset instructions have been sent to your email');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send password reset email';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    toast.success('Reset link copied to clipboard');
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-8 transition-colors duration-200">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-6 text-3xl font-bold text-foreground">
                Check Your Email
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                If an account with email <strong className="text-foreground">{email}</strong> exists, we've sent you a password reset link.
              </p>
              
              {/* Demo purposes only - remove in production */}
              {resetLink && (
                <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-2">
                    <strong>Demo Mode:</strong> Here's your reset link:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={resetLink}
                      readOnly
                      className="text-xs bg-background border border-border rounded px-2 py-1 flex-1 text-foreground"
                    />
                    <button
                      onClick={copyResetLink}
                      className="text-xs bg-yellow-600 dark:bg-yellow-700 text-white px-2 py-1 rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={resetLink}
                    className="inline-block mt-2 text-xs text-yellow-800 dark:text-yellow-300 hover:underline"
                  >
                    Click here to reset your password
                  </a>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-card border border-border rounded-xl shadow-2xl p-8 transition-colors duration-200">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
            
            <h2 className="text-center text-3xl font-bold text-foreground">
              Forgot Your Password?
            </h2>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg shadow-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;