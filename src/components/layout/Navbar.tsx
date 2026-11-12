import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, ChevronDown, LogOut, Settings as SettingsIcon, User, PlusCircle } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface NavbarProps {
  onOpenCreateTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTrip }) => {
  const { currentUser, demoUsers, switchDemoUser, logout } = useAuth();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Ride<span className="text-teal-700">Along</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Safety-First
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Travel solo. Connect safely. Go together.
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Quick Create Trip Button */}
          {currentUser && (
            <Button
              variant="mint"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={onOpenCreateTrip}
              className="hidden sm:inline-flex"
            >
              Post a Trip
            </Button>
          )}

          {/* Demo Account Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-teal-50/80 text-teal-800 border border-teal-200/70 hover:bg-teal-100 transition"
              title="Switch demo account to test reciprocal interactions"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden md:inline">Demo Persona:</span>
              <span className="font-bold">{currentUser?.name.split(' ')[0] || 'Select'}</span>
              <ChevronDown className="w-3 h-3 text-teal-600" />
            </button>

            {showDemoDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowDemoDropdown(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Switch Test Profile</p>
                  <p className="text-[11px] text-slate-500">
                    Switch profiles instantly to test bidirectional requests, chats & score changes.
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {demoUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchDemoUser(user.id);
                        setShowDemoDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-3 hover:bg-teal-50/50 transition ${
                        currentUser?.id === user.id ? 'bg-teal-50/80 font-semibold text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      <Avatar src={user.avatar} name={user.name} size="sm" isVerified={user.safetyStatus.idVerified} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs truncate font-medium text-slate-900">{user.name}</p>
                          <span className="text-[10px] text-teal-700 bg-teal-100/60 px-1 rounded">
                            {user.homeCity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{user.preferences.pace} pace • {user.preferences.budgetTier}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-teal-500/20 transition"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                  isVerified={currentUser.safetyStatus.idVerified}
                />
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-50"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                  >
                    <User className="w-4 h-4" />
                    My Traveller Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings & Privacy
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Join RideAlong
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
