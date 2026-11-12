import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, MapPin, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';

export const MobileNav: React.FC = () => {
  const { unreadCount } = useMessages();

  const items = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/my-trips', label: 'Trips', icon: MapPin },
    {
      to: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { to: '/safety', label: 'Safety', icon: ShieldCheck },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 flex items-center justify-around shadow-lg">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors relative ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-teal-600 text-white text-[9px] font-bold rounded-full min-w-[14px] text-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
