import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    // Save user to localStorage
    const userData = {
      email,
      role,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Logic to authenticate
    if (role === "buyer") navigate('/dashboard/buyer');
    else if (role === "admin") navigate('/dashboard/seller');
    else navigate('/dashboard/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to Ghar Bazar</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials and select your role to proceed.</p>
        </div>
        
        <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-lg">
           {["buyer", "seller", "admin"].map((r) => (
             <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-md capitalize ${role === r ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                {r.toLowerCase()}
             </button>
           ))}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  placeholder="your@example.com" 
                />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-gray-400" />
                 </div>
                 <input 
                   type={showPassword ? "text" : "password"} 
                   required 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                   placeholder="••••••••" 
                 />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                 </div>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot Password?</Link>
          </div>

          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Login
          </button>

          <div className="text-center mt-4">
             <span className="text-sm text-gray-600">Don't have an account? </span>
             <Link to="/signup" className="text-sm font-medium text-primary-600 hover:text-primary-500">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
