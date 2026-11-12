import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';

export const LoginPage: React.FC = () => {
  const { login, demoUsers, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleDemoLogin = async (userId: string) => {
    setIsLoading(true);
    await switchDemoUser(userId);
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Welcome to RideAlong
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access verified travel companions and secure messaging.
          </p>
        </div>

        {/* Instant Demo Switcher / Quick Sign In */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span>Instant Demo Account Sign-in</span>
          </div>
          <p className="text-[11px] text-teal-800/80">
            No signup needed. Select any simulated verified traveller to explore all features instantly:
          </p>
          <div className="space-y-2 pt-1">
            {demoUsers.slice(0, 3).map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleDemoLogin(user.id)}
                className="w-full text-left p-2.5 rounded-xl bg-white border border-teal-200/60 hover:border-teal-400 hover:shadow-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={user.avatar} name={user.name} size="sm" isVerified={user.safetyStatus.idVerified} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {user.homeCity} • {user.preferences.pace} pace
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-white px-3 text-slate-400">Or sign in with email</span>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. ananya.sharma@demo.ridealong.app"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to RideAlong?{' '}
          <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800 underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
