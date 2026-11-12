import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';
import { ShieldCheck, ArrowRight, Check, Compass, Languages, Heart, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );
  const [languages, setLanguages] = useState<string[]>(currentUser?.languages || ['English', 'Tamil']);
  const [interests, setInterests] = useState<string[]>(
    currentUser?.interests || ['Heritage Walks', 'Photography', 'Technology']
  );
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'fast'>(
    currentUser?.preferences.pace || 'moderate'
  );
  const [budgetTier, setBudgetTier] = useState<'budget' | 'mid-range' | 'flexible'>(
    currentUser?.preferences.budgetTier || 'mid-range'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLanguages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'];
  const availableInterests = [
    'Photography',
    'Heritage Walks',
    'Architecture',
    'Specialty Coffee',
    'Technology',
    'Podcasts',
    'Hiking',
    'Bookstores',
    'Food & Cafes',
    'Board Games',
    'Writing',
    'Quiet Commuting',
  ];

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  ];

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      if (interests.length > 1) setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFinish = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      await updateProfile({
        avatar: selectedAvatar,
        bio: bio.trim(),
        languages,
        interests,
        preferences: {
          ...currentUser.preferences,
          pace,
          budgetTier,
        },
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F766E', '#10B981', '#34D399'],
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-8 text-left">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Onboarding • Step {step} of 3</span>
            <span>{step === 1 ? 'Persona' : step === 2 ? 'Languages & Interests' : 'Travel Style'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Avatar & Bio */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Choose Your Traveller Avatar & Bio</h2>
              <p className="text-xs text-slate-500 mt-1">
                A clear, friendly profile builds safety confidence among potential co-passengers.
              </p>
            </div>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Select Photo
              </label>
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {presetAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative rounded-full p-1 transition ${
                      selectedAvatar === url ? 'ring-3 ring-teal-600 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Avatar src={url} name={`Option ${i}`} size="lg" />
                    {selectedAvatar === url && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-teal-600 text-white rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Brief Bio / Transit Habits
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="e.g. Freelance designer who travels frequently between Chennai and Bengaluru. Prefer quiet Shatabdi trips, daylight travel, and sharing a cab to Indiranagar."
                className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Languages & Interests
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Languages & Interests */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Languages & Travel Interests</h2>
              <p className="text-xs text-slate-500 mt-1">
                These tags directly feed the explainable matching algorithm (Languages 10%, Interests 15%).
              </p>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-teal-600" />
                Languages Spoken Fluently
              </label>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                      languages.includes(lang)
                        ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-teal-600" />
                Interests & Travel Vibes
              </label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                      interests.includes(interest)
                        ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Travel Style
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Travel Preferences & Pace */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pace & Budget Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ensures you travel with companions who share your transit rhythm (25% match weight).
              </p>
            </div>

            {/* Pace */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Travel Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', title: 'Relaxed', desc: 'No rush, leisurely stops' },
                  { id: 'moderate', title: 'Moderate', desc: 'Balanced, steady commute' },
                  { id: 'fast', title: 'Fast-paced', desc: 'Direct, punctual transit' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPace(p.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      pace === p.id
                        ? 'border-teal-600 bg-teal-50/80 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{p.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Budget Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'budget', title: 'Budget', desc: 'Economic trains & buses' },
                  { id: 'mid-range', title: 'Mid-Range', desc: 'Shatabdi, AC cabs, 3AC' },
                  { id: 'flexible', title: 'Flexible', desc: 'Comfort first, flights & premium cabs' },
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudgetTier(b.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      budgetTier === b.id
                        ? 'border-teal-600 bg-teal-50/80 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{b.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleFinish}
                isLoading={isSubmitting}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Complete Onboarding
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
