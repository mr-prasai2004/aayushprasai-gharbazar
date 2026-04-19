import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { UserRole } from '../../types';
import { useToast } from '../../components/Toast';

export const Signup: React.FC = () => {
    const toast = useToast();
    const [role, setRole] = useState<UserRole>(UserRole.BUYER);
    const [fullName, setFullName] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!fullName.trim() || !userName.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const data = await authService.signup({
                userName: userName,
                full_name: fullName,
                email: email,
                password: password,
                role: role,
            });

            setVerificationMessage(data.message);
            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!otp.trim() || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP code');
            return;
        }

        setLoading(true);

        try {
            const data = await authService.verifyOtp(email, otp);

            // Store auth data
            authService.setAuthData(data.token, {
                userId: data.userId,
                email: data.email,
                role: data.role,
            });

            toast.success('Email verified — welcome to Ghar Bazar! 🎉');

            // Navigate to appropriate dashboard
            if (data.role === UserRole.BUYER) navigate('/dashboard/buyer');
            else navigate('/dashboard/seller');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
            console.error('OTP verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setVerificationMessage('');
        setLoading(true);
        
        try {
            const data = await authService.resendOtp(email);
            setVerificationMessage(data.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We've sent a 6-digit verification code to <strong>{email}</strong>
                        </p>
                    </div>

                    {verificationMessage && (
                        <div className="rounded-md bg-blue-50 p-4 border border-blue-200 text-center mb-4">
                            <p className="text-sm font-medium text-blue-800">{verificationMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <form className="mt-8 space-y-4" onSubmit={handleVerifyOtp}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Enter OTP</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                disabled={loading}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg text-center tracking-widest disabled:bg-gray-100"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>

                        <div className="text-center mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400">
                                Send a new code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Your Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join Ghar Bazar to buy, sell, or lease properties.</p>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setRole(UserRole.BUYER)}
                        className={`flex-1 py-2 px-4 rounded-full border ${role === UserRole.BUYER ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                        Sign Up as Buyer
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole(UserRole.SELLER)}
                        className={`flex-1 py-2 px-4 rounded-full border ${role === UserRole.SELLER ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                        Sign Up as Seller
                    </button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSignup}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={loading}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={loading}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Email Address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Create a password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {loading ? 'Creating Account...' : `Create ${role === 'BUYER' ? 'Buyer' : 'Seller'} Account`}
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-600">Already have an account? </span>
                        <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">Log In</Link>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-4">By signing up, you agree to our <a href="#" className="text-primary-600">Terms of Service</a> and <a href="#" className="text-primary-600">Privacy Policy</a>.</p>
                </form>
            </div>
        </div>
    );
}
