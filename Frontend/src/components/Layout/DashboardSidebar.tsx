import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messagesApi } from '../../services/api';
import { LayoutDashboard, Heart, Calendar, User, Settings, PlusCircle, List, MessageSquare, LogOut, Home } from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  activePath: string;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ role, activePath }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await messagesApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread messages count', error);
      }
    };

    fetchUnread();
    // Poll every 10 seconds to keep sidebar badge updated
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const buyerLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/buyer' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/buyer/messages' },
    { name: 'My Wishlist', icon: Heart, path: '/dashboard/wishlist' },
    { name: 'My Bookings', icon: Calendar, path: '/dashboard/bookings' },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/dashboard/buyer/settings' },
  ];

  const sellerLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/seller' },
    { name: 'Add Property', icon: PlusCircle, path: '/dashboard/add-property' },
    { name: 'My Listings', icon: List, path: '/dashboard/listings' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/dashboard/seller/settings' },
  ];

  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
    { name: 'Manage Users', icon: User, path: '/dashboard/users' },
    { name: 'Manage Properties', icon: List, path: '/dashboard/properties' },
    { name: 'Reviews & Feedback', icon: MessageSquare, path: '/dashboard/reviews' },
    { name: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
  ];

  const links = role === UserRole.BUYER ? buyerLinks : role === UserRole.SELLER ? sellerLinks : adminLinks;

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 bg-white border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <Home className="h-6 w-6 text-primary-600 mr-2" />
          <span className="font-bold text-xl text-primary-600">Ghar Bazar</span>
        </Link>
      </div>
      <div className="flex-1 py-6 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = activePath === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`${isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : 'text-gray-600 hover:bg-gray-100'} group flex items-center px-6 py-3 text-sm font-medium transition-colors justify-between`}
            >
              <div className="flex items-center">
                <Icon className={`${isActive ? 'text-primary-600' : 'text-gray-400'} mr-3 h-5 w-5`} />
                {link.name}
              </div>
              {link.name === 'Messages' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button onClick={() => navigate('/login')} className="flex items-center text-gray-600 hover:text-red-600 transition-colors w-full px-2 py-2 text-sm font-medium">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
