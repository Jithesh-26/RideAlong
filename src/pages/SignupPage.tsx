import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, User, Mail, Lock, MapPin, CheckCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeCity, setHomeCity] = useState('Chennai');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!safetyAgreed) {
      setError('You must agree to the RideAlong Safety Standard and Zero-Dating Policy to join.');
      return;
    }

    setIsLoading(true);
    const res = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      homeCity,
    });
    setIsLoading(false);

    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Join the RideAlong Community
          </h2>
          <p className="text-xs text-slate-500">
            Discover verified travel companions for peaceful, secure transit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Ananya Sharma"
            value={name}
            onChange={e => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. ananya@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Primary Transit Hub / City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={homeCity}
                onChange={e => setHomeCity(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              >
                <option value="Chennai">Chennai (Tamil Nadu)</option>
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Madurai">Madurai (Tamil Nadu)</option>
                <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                <option value="Hyderabad">Hyderabad (Telangana)</option>
                <option value="Vijayawada">Vijayawada (Andhra Pradesh)</option>
                <option value="Kochi">Kochi (Kerala)</option>
                <option value="Pune">Pune (Maharashtra)</option>
              </select>
            </div>
          </div>

          {/* Explicit Safety & Zero-Dating Agreement */}
          <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-teal-950">
              <input
                type="checkbox"
                checked={safetyAgreed}
                onChange={e => setSafetyAgreed(e.target.checked)}
                className="mt-0.5 rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
              />
              <span className="leading-relaxed">
                I solemnly certify that I will use RideAlong <strong>strictly for travel companionship and transit coordination</strong>. I understand dating solicitations, romance scams, or disrespectful behavior result in instant permanent banning.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Create My Traveller Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
