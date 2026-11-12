import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Ban,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Check,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, logout, updateProfile, demoUsers, switchDemoUser } = useAuth();
  const { blockedUsers, unblockUser } = useSafety();
  const navigate = useNavigate();

  const [emailAlerts, setEmailAlerts] = useState(currentUser?.privacy.emailNotifications ?? true);
  const [safetyAlerts, setSafetyAlerts] = useState(currentUser?.privacy.safetyAlerts ?? true);
  const [profileVisibility, setProfileVisibility] = useState<'public-members' | 'matches-only'>(
    currentUser?.privacy.profileVisibility || 'public-members'
  );
  const [phoneMasked, setPhoneMasked] = useState(currentUser?.privacy.phoneMasked ?? true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        privacy: {
          ...currentUser.privacy,
          emailNotifications: emailAlerts,
          safetyAlerts,
          profileVisibility,
          phoneMasked,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left pb-12">
      {/* Settings Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account & Application Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure notifications, visibility preferences, demo account switches, and security parameters.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            Preferences updated!
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Card link */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" isVerified={currentUser.safetyStatus.idVerified} />
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                {currentUser.homeCity} • Member since {currentUser.joinedDate}
              </p>
            </div>
          </div>

          <Link to="/profile">
            <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Edit Traveller Profile
            </Button>
          </Link>
        </div>

        {/* Visibility & Privacy Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-700" />
            Discovery & Visibility Preferences
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900">SafeMatch Discoverability</p>
                <p className="text-slate-500 text-[11px]">Control who can find your profile in route matching results.</p>
              </div>
              <select
                value={profileVisibility}
                onChange={e => setProfileVisibility(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="public-members">All Verified Members</option>
                <option value="matches-only">Confirmed Connections Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900">Mask Personal Mobile Number</p>
                <p className="text-slate-500 text-[11px]">Shield your real telephone number; use in-app verified chat only.</p>
              </div>
              <input
                type="checkbox"
                checked={phoneMasked}
                onChange={e => setPhoneMasked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-700" />
            Notification Channels
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900">Email Updates & Connection Requests</p>
                <p className="text-slate-500 text-[11px]">Receive emails when another traveller requests to join your journey.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900">Transit Safety & Check-In Reminders</p>
                <p className="text-slate-500 text-[11px]">Prompt you to share arrival updates with your Trusted Emergency Circle.</p>
              </div>
              <input
                type="checkbox"
                checked={safetyAlerts}
                onChange={e => setSafetyAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
              />
            </div>
          </div>
        </div>

        {/* Blocked Users Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-slate-700" />
              Blocked Travellers ({blockedUsers.length})
            </h3>
            <Link to="/safety" className="text-xs font-semibold text-teal-700 hover:underline">
              View Safety Centre
            </Link>
          </div>

          {blockedUsers.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 rounded-2xl bg-slate-50">
              No blocked members currently.
            </p>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={b.blockedUser?.avatar} name={b.blockedUser?.name || 'User'} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{b.blockedUser?.name || 'Blocked User'}</p>
                      <p className="text-[10px] text-slate-500">Blocked</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => unblockUser(b.blockedUserId)}>
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Account Switcher */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-teal-700" />
            Switch Demo Account (Testing & Evaluation)
          </h3>
          <p className="text-xs text-slate-500">
            Easily toggle between verified demo personas to test reciprocal requests, chat exchanges, and mutual SafeMatch scores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {demoUsers.map(u => (
              <button
                key={u.id}
                onClick={() => switchDemoUser(u.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                  currentUser.id === u.id
                    ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Avatar src={u.avatar} name={u.name} size="sm" isVerified={u.safetyStatus.idVerified} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                    {currentUser.id === u.id && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{u.homeCity} • {u.preferences.pace} pace</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="md"
            className="text-red-600 border-red-200 hover:bg-red-50"
            leftIcon={<LogOut className="w-4 h-4 text-red-600" />}
            onClick={() => setShowLogoutModal(true)}
          >
            Sign Out
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isSaving}
            onClick={handleSaveSettings}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to sign out of RideAlong? You will need to log back in or select a demo account to access your upcoming itineraries and chats.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleLogout}>
              Confirm Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
