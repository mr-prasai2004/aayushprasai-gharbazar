import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, LogOut, User } from 'lucide-react';

interface UserData {
  email: string;
  role: string;
  loginTime: string;
}

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 animate-slideInDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="shrink-0 flex items-center group">
              <Home className="h-6 w-6 text-primary-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-xl text-primary-600 group-hover:text-primary-700 transition-colors duration-300">Ghar Bazar</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                Home
              </Link>
              {/* Show Buy & Lease only for guests or buyers */}
              {(!user || user.role === 'BUYER') && (
                <>
                  <Link to="/properties" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                    Buy
                  </Link>
                  <Link to="/properties?type=lease" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                    Lease
                  </Link>
                </>
              )}
              {/* Show My Properties for sellers */}
              {user?.role === 'SELLER' && (
                <Link to="/dashboard/listings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                  My Properties
                </Link>
              )}
              {user && (
                <Link to={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer'} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="bg-gray-100 rounded-full py-1 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 animate-slideInRight">
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg transition-all duration-300 hover:bg-primary-100">
                  <User className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                </div>
                <Link to={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer'} className="text-sm px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 font-medium text-sm transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95">Login</Link>
                <Link to="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95">Sign Up</Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</Link>
            {/* Mobile: show Buy/Lease for guests or buyers */}
            {(!user || user.role === 'BUYER') && (
              <>
                <Link to="/properties" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Buy</Link>
                <Link to="/properties?type=lease" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Lease</Link>
              </>
            )}
            {/* Mobile: My Properties for sellers */}
            {user?.role === 'SELLER' && (
              <Link to="/dashboard/listings" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">My Properties</Link>
            )}
            {user ? (
              <>
                <div className="border-t border-gray-200 px-3 py-3">
                  <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <Link to={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer'} className="w-full text-left border-transparent text-gray-700 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left border-transparent text-red-600 hover:bg-red-50 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
