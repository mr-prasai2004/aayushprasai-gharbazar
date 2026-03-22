import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail, AlertCircle, Copy } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.token) {
        const link = `${window.location.origin}/#/reset-password?token=${response.token}`;
        setResetLink(link);
        setResetToken(response.token);
      }
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetPassword = () => {
    navigate(`/reset-password?token=${resetToken}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        {!submitted ? (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100" 
                    placeholder="Enter your email" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-4">
                 <Link to="/login" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-4 w-4 mr-1"/> Back to Login
                 </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your mail</h2>
            <p className="text-sm text-gray-600 mb-4">We have sent a password reset link to your email.</p>
            
            {resetLink && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-gray-600 mb-2">Reset Link (Development Mode):</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={resetLink} 
                    readOnly 
                    className="flex-1 text-xs px-2 py-1 border border-blue-300 rounded bg-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={handleResetPassword}
                  className="mt-3 inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition"
                >
                  Click Here to Reset Password
                </button>
                {copied && <p className="text-xs text-green-600 mt-2">✓ Copied to clipboard</p>}
              </div>
            )}
             
             <Link to="/login" className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Back to Login
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};
