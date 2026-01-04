import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Signup: React.FC = () => {
    const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Your Account</h2>
              <p className="mt-2 text-sm text-gray-600">Join Ghar Bazar to buy, sell, or lease properties.</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
               <button onClick={() => setRole('buyer')} className={`flex-1 py-2 px-4 rounded-full border ${role === 'buyer' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>Sign Up as Buyer</button>
               <button onClick={() => setRole('seller')} className={`flex-1 py-2 px-4 rounded-full border ${role === 'seller' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>Sign Up as Seller</button>
            </div>
    
            <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <input type="text" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="John Doe" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                   <input type="email" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="john@example.com" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                   <input type="password" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Create a password" />
                </div>

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Create {role === 'buyer' ? 'Buyer' : 'Seller'} Account
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
