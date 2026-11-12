import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  MessageSquare,
  ShieldCheck,
  User,
  Settings,
  Plus,
} from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onOpenCreateTrip: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateTrip }) => {
  const { unreadCount, requests } = useMessages();
  const { currentUser } = useAuth();

  const pendingRequestsCount = currentUser
    ? requests.filter(r => r.receiverId === currentUser.id && r.status === 'pending').length
    : 0;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'SafeMatch Discover', icon: Compass },
    { to: '/my-trips', label: 'My Trips', icon: MapPin },
    {
      to: '/messages',
      label: 'Secure Messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      to: '/safety',
      label: 'Safety Centre',
      icon: ShieldCheck,
      highlight: true,
    },
    { to: '/profile', label: 'Traveller Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)] p-4 select-none">
      <div className="space-y-6">
        {/* Post trip quick action */}
        <button
          onClick={onOpenCreateTrip}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-teal-800 hover:to-teal-900 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Publish a Journey</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      item.highlight ? 'text-teal-700' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-600 text-white">
                    {item.badge}
                  </span>
                )}
                {item.to === '/messages' && pendingRequestsCount > 0 && !item.badge && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-500"
                    title={`${pendingRequestsCount} pending requests`}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety Protocol Banner in Sidebar */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 space-y-2">
        <div className="flex items-center gap-2 text-teal-900 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Safety Standard Active</span>
        </div>
        <p className="text-[11px] text-teal-800/80 leading-relaxed">
          Always arrange initial meetings in well-lit public transit stations. Never share banking credentials.
        </p>
      </div>
    </aside>
  );
};
