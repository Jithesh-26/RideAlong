import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import {
  User,
  ShieldCheck,
  MapPin,
  Languages,
  Heart,
  Compass,
  Lock,
  Save,
  Check,
  Sparkles,
  Camera,
  Car,
  Train,
  Plane,
  Bus,
} from 'lucide-react';
import { TransportMode, TravelPace, BudgetTier, ScheduleType, CommunicationStyle } from '../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [homeCity, setHomeCity] = useState(currentUser?.homeCity || '');
  const [languages, setLanguages] = useState<string[]>(currentUser?.languages || []);
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);

  // Preferences
  const [pace, setPace] = useState<TravelPace>(currentUser?.preferences.pace || 'moderate');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(currentUser?.preferences.budgetTier || 'mid-range');
  const [scheduleType, setScheduleType] = useState<ScheduleType>(currentUser?.preferences.scheduleType || 'flexible');
  const [commStyle, setCommStyle] = useState<CommunicationStyle>(currentUser?.preferences.communicationStyle || 'adaptable');
  const [preferredModes, setPreferredModes] = useState<TransportMode[]>(
    currentUser?.preferences.preferredModes || ['train', 'shared-cab']
  );

  // Privacy
  const [visibility, setVisibility] = useState<'public-members' | 'matches-only'>(
    currentUser?.privacy.profileVisibility || 'public-members'
  );
  const [phoneMasked, setPhoneMasked] = useState(currentUser?.privacy.phoneMasked ?? true);
  const [shareContactOnMatch, setShareContactOnMatch] = useState(currentUser?.privacy.shareContactOnMatch ?? false);
  const [emailNotifications, setEmailNotifications] = useState(currentUser?.privacy.emailNotifications ?? true);
  const [safetyAlerts, setSafetyAlerts] = useState(currentUser?.privacy.safetyAlerts ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) return null;

  const availableLanguages = [
    'English',
    'Tamil',
    'Hindi',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Bengali',
  ];

  const availableInterests = [
    'Architecture',
    'Photography',
    'Heritage Walks',
    'Bookstores',
    'Specialty Coffee',
    'Technology',
    'Podcasts',
    'Running',
    'Board Games',
    'Productivity',
    'Writing',
    'Vegan Food',
    'Documentaries',
    'Art',
    'Solo Backpacking',
  ];

  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleMode = (mode: TransportMode) => {
    setPreferredModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        avatar,
        bio,
        homeCity,
        languages,
        interests,
        preferences: {
          ...currentUser.preferences,
          pace,
          budgetTier,
          scheduleType,
          communicationStyle: commStyle,
          preferredModes,
        },
        privacy: {
          profileVisibility: visibility,
          phoneMasked,
          shareContactOnMatch,
          emailNotifications,
          safetyAlerts,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Traveller Profile & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep your travel details, corridor habits, and privacy settings up to date.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-700" />
            Basic Personal Information
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            <div className="space-y-2 text-center">
              <Avatar src={avatar} name={name} size="xl" isVerified={currentUser.safetyStatus.idVerified} />
              <p className="text-[11px] text-slate-500 font-medium">Profile Photo</p>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preset Avatars</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {avatarPresets.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(p)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                        avatar === p ? 'border-teal-700 ring-2 ring-teal-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={p} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Home Hub / City"
                  value={homeCity}
                  onChange={e => setHomeCity(e.target.value)}
                  placeholder="e.g. Chennai, Bengaluru"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Traveller Bio
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
                  placeholder="Share your commuting habits, preferred travel days, and what makes a great co-passenger..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Languages & Interests */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Languages className="w-5 h-5 text-teal-700" />
              Languages & Shared Interests
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              SafeMatch uses these to compute your explainable compatibility index.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(lang => {
                  const selected = languages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lang} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Interests & Hobbies</label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map(interest => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {interest} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-700" />
              Transit & Commuting Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tune your style to find peers with similar travel rhythms and comfort zones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Travel Pace</label>
              <div className="grid grid-cols-3 gap-2">
                {(['relaxed', 'moderate', 'fast'] as TravelPace[]).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPace(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      pace === p
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Budget Allocation</label>
              <div className="grid grid-cols-3 gap-2">
                {(['budget', 'mid-range', 'flexible'] as BudgetTier[]).map(b => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBudgetTier(b)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      budgetTier === b
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Schedule Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['early-bird', 'night-owl', 'flexible'] as ScheduleType[]).map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setScheduleType(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      scheduleType === s
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Communication Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['quiet', 'conversational', 'adaptable'] as CommunicationStyle[]).map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCommStyle(c)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      commStyle === c
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Modes of Transit</label>
            <div className="flex flex-wrap gap-2">
              {(['train', 'flight', 'shared-cab', 'bus', 'carpool'] as TransportMode[]).map(mode => {
                const selected = preferredModes.includes(mode);
                return (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => toggleMode(mode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize flex items-center gap-1.5 transition ${
                      selected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mode.replace('-', ' ')} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy & Safety Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-700" />
              Privacy & Contact Visibility Controls
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Control what information is visible to the community and mutual matches.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Profile Visibility</p>
                <p className="text-[11px] text-slate-500">Allow verified members on shared corridors to discover you in SafeMatch.</p>
              </div>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="public-members">All Verified Members</option>
                <option value="matches-only">Confirmed Connections Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Mask Mobile Number</p>
                <p className="text-[11px] text-slate-500">Keep your actual telephone number completely masked during in-app messaging.</p>
              </div>
              <input
                type="checkbox"
                checked={phoneMasked}
                onChange={e => setPhoneMasked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Safety Check-In Notifications</p>
                <p className="text-[11px] text-slate-500">Receive automated alerts to confirm your arrival at major transit halts.</p>
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

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
