import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';

interface UserData {
   email: string;
   role: 'admin' | 'seller' | 'buyer';
}

import {DashboardSidebar} from './DashboardSidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode; role: 'admin' | 'seller' | 'buyer'; title?: string }> = ({ children, role, title }) => {
   const [user, setUser] = useState<UserData | null>(null);
   const [menuOpen, setMenuOpen] = useState(false);
   const avatarRef = useRef<HTMLDivElement | null>(null);
   const navigate = useNavigate();
   const location = useLocation();

   useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
   }, []);

   useEffect(() => {
      function handleDocumentClick(e: MouseEvent) {
         if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
            setMenuOpen(false);
         }
      }
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
   }, []);

   const getUserInitials = () => {
      if (!user?.email) return 'U';
      return user.email
         .split('@')[0]
         .split('.')
         .map(part => part[0])
         .join('')
         .toUpperCase()
         .slice(0, 2);
   };

   const getAvatarColor = () => {
      const colors = [
         'bg-blue-500',
         'bg-purple-500',
         'bg-pink-500',
         'bg-green-500',
         'bg-indigo-500',
         'bg-red-500',
         'bg-yellow-500',
         'bg-cyan-500',
      ];
      const index = user?.email.charCodeAt(0) || 0;
      return colors[index % colors.length];
   };

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar role={role} activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
           <h1 className="text-xl font-bold text-gray-800">{title || 'Dashboard'}</h1>
           <div className="flex items-center space-x-4">
                     <div className="relative hidden sm:block">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Search..." />
              </div>
                     <div className="relative" ref={avatarRef}>
                        <div
                           role="button"
                           tabIndex={0}
                           onClick={() => setMenuOpen(prev => !prev)}
                           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(prev => !prev); }}
                           className={`h-8 w-8 rounded-full ${getAvatarColor()} flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-110`}
                           title={user?.email}
                        >
                           {user?.email ? (
                              <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                           ) : (
                              <User className="h-4 w-4 text-white" />
                           )}
                        </div>

                        {menuOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                              <div className="px-3 py-2 text-xs text-gray-500 truncate">{user?.email ?? 'Guest'}</div>
                              <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Profile</button>
                              <button onClick={() => { setMenuOpen(false); navigate('/profile/settings'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Settings</button>
                                             {user?.role === 'admin' && (
                                 <button onClick={() => { setMenuOpen(false); navigate('/dashboard/users'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Manage Users</button>
                              )}
                              <div className="border-t my-1" />
                              <button onClick={() => { localStorage.removeItem('currentUser'); setUser(null); setMenuOpen(false); navigate('/'); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                           </div>
                        )}
                     </div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
           {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
