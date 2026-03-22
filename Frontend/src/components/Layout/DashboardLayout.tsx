import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
interface UserData {
   email: string;
   role: string;
   fullName?: string;
   profilePictureUrl?: string;
}

import { UserRole, Notification } from '../../types';
import { notificationsApi } from '../../services/api';
import { DashboardSidebar } from './DashboardSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationCenter } from '../NotificationCenter';

export const DashboardLayout: React.FC<{ children: React.ReactNode; role: UserRole; title?: string }> = ({ children, role, title }) => {
   const [user, setUser] = useState<UserData | null>(null);
   const [menuOpen, setMenuOpen] = useState(false);
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [loadingNotifications, setLoadingNotifications] = useState(true);
   const avatarRef = useRef<HTMLDivElement | null>(null);
   const navigate = useNavigate();

   useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
   }, []);

   useEffect(() => {
      const fetchNotifications = async () => {
         try {
            setLoadingNotifications(true);
            const data = await notificationsApi.getAll();
            setNotifications(Array.isArray(data) ? data : []);
         } catch (err) {
            console.error('Failed to load notifications:', err);
            setNotifications([]);
         } finally {
            setLoadingNotifications(false);
         }
      };

      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
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

   const handleMarkNotificationAsRead = async (notificationId: string) => {
      try {
         await notificationsApi.markAsRead(notificationId);
         setNotifications(prev => prev.map(n =>
            n.notificationId === notificationId ? { ...n, read: true } : n
         ));
      } catch (err) {
         console.error('Failed to mark notification as read:', err);
      }
   };

   const handleMarkAllNotificationsAsRead = async () => {
      try {
         await notificationsApi.markAllAsRead();
         setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
         console.error('Failed to mark all notifications as read:', err);
      }
   };

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
  const location = useLocation();

  const getSettingsPath = () => {
    switch (role) {
      case UserRole.BUYER: return '/dashboard/buyer/settings';
      case UserRole.SELLER: return '/dashboard/seller/settings';
      case UserRole.ADMIN: return '/dashboard/admin/settings';
      default: return '/dashboard/profile';
    }
  };

  return (
    <div className="flex h-screen bg-white md:bg-gray-50 overflow-hidden relative">
      <div className="hidden md:flex">
         <DashboardSidebar role={role} activePath={location.pathname} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
           <h1 className="text-xl font-bold text-gray-800">{title || 'Dashboard'}</h1>
           <div className="flex items-center space-x-4">
                     <div className="relative hidden sm:block">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Search..." />
              </div>
              {!loadingNotifications && (
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                />
              )}
              <div className="relative" ref={avatarRef}>
                        <div
                           role="button"
                           tabIndex={0}
                           onClick={() => setMenuOpen(prev => !prev)}
                           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(prev => !prev); }}
                           className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-110 border-2 border-gray-200"
                           title={user?.email}
                        >
                           {user?.profilePictureUrl ? (
                              <img 
                                 src={user.profilePictureUrl} 
                                 alt={user.fullName || user.email}
                                 className="h-10 w-10 rounded-full object-cover"
                              />
                           ) : user?.email ? (
                              <div className={`h-10 w-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm`}>
                                 {getUserInitials()}
                              </div>
                           ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                 <User className="h-5 w-5 text-white" />
                              </div>
                           )}
                        </div>

                        {menuOpen && (
                           <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                              <div className="px-3 py-3 border-b border-gray-200">
                                 <div className="flex items-center gap-3">
                                    {user?.profilePictureUrl ? (
                                       <img 
                                          src={user.profilePictureUrl} 
                                          alt={user.fullName || user.email}
                                          className="h-10 w-10 rounded-full object-cover"
                                       />
                                    ) : (
                                       <div className={`h-10 w-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                          {getUserInitials()}
                                       </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                                       <p className="text-xs text-gray-500 truncate">{user?.email ?? 'Guest'}</p>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => { setMenuOpen(false); navigate('/dashboard/profile'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Profile</button>
                              <button onClick={() => { setMenuOpen(false); navigate(getSettingsPath()); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Settings</button>
                              {user?.role === 'ADMIN' && (
                                 <button onClick={() => { setMenuOpen(false); navigate('/dashboard/users'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">Manage Users</button>
                              )}
                              <div className="border-t my-1" />
                              <button onClick={() => { localStorage.removeItem('currentUser'); setUser(null); setMenuOpen(false); navigate('/'); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                           </div>
                        )}
                     </div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full md:p-6 pb-20 md:pb-6 bg-gray-50">
           {children}
        </main>
      </div>
      <MobileBottomNav role={role} />
    </div>
  );
};
