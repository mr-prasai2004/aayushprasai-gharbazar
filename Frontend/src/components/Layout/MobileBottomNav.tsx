import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, LayoutDashboard, Heart, Calendar, PlusCircle, List } from 'lucide-react';
import { UserRole } from '../../types';
import { messagesApi } from '../../services/api';

interface MobileBottomNavProps {
  role: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ role }) => {
  const location = useLocation();
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
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const getLinks = () => {
    switch (role) {
      case UserRole.BUYER:
        return [
          { name: 'Home', icon: Home, path: '/' },
          { name: 'Search', icon: Search, path: '/properties' },
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/buyer' },
          { name: 'Messages', icon: MessageSquare, path: '/dashboard/buyer/messages' },
          { name: 'Profile', icon: User, path: '/dashboard/profile' },
        ];
      case UserRole.SELLER:
        return [
          { name: 'Home', icon: Home, path: '/' },
          { name: 'Add', icon: PlusCircle, path: '/dashboard/add-property' },
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/seller' },
          { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
          { name: 'Profile', icon: User, path: '/dashboard/profile' },
        ];
      case UserRole.ADMIN:
        return [
          { name: 'Home', icon: Home, path: '/' },
          { name: 'Users', icon: User, path: '/dashboard/users' },
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
          { name: 'Props', icon: List, path: '/dashboard/properties' },
          { name: 'Profile', icon: User, path: '/dashboard/profile' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  // On exact messaging chat view, hide the navbar
  const isMessageChatView = location.pathname.includes('/messages') && location.search.includes('user='); // We might adapt this depending on how Messages works

  if (isMessageChatView) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 sm:px-4 py-2 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe pt-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex flex-col items-center justify-center w-full py-1 ${
              isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
            } transition-colors`}
          >
            <div className="relative">
              <Icon className={`h-[22px] w-[22px] mb-1 ${isActive ? 'fill-primary-50' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              {link.name === 'Messages' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
};
