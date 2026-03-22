import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { UserRole } from "../../types";
import { authService } from "../../services/auth.service";

export const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({
        email,
        password,
        role,
      });

      // Store auth data
      authService.setAuthData(data.token, {
        userId: data.userId,
        email: data.email,
        role: data.role,
      });

      // Role-based redirect
      switch (data.role) {
        case "BUYER":
          navigate("/dashboard/buyer");
          break;
        case "SELLER":
          navigate("/dashboard/seller");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
      
      if (errorMessage.toLowerCase().includes("verify your email")) {
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP code");
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

      // Role-based redirect
      switch (data.role) {
        case "BUYER":
          navigate("/dashboard/buyer");
          break;
        case "SELLER":
          navigate("/dashboard/seller");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setVerificationMessage("");
    setLoading(true);

    try {
      const data = await authService.resendOtp(email);
      setVerificationMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
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
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Enter OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg text-center tracking-widest disabled:bg-gray-100"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <div className="text-center mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400"
              >
                Send a new code
              </button>
            </div>
            
            <div className="text-center mt-4">
               <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setOtp(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
               >
                 Back to Login
               </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome to Ghar Bazar
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Login and select your role to continue
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition
                ${
                  role === r
                    ? "bg-white text-primary-600 shadow"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

