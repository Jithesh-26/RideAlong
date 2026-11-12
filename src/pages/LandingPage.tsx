import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Compass,
  Users,
  Route,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  Lock,
  PhoneCall,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { POPULAR_INDIAN_ROUTES } from '../services/sampleData';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (origin.trim()) query.append('origin', origin.trim());
    if (destination.trim()) query.append('destination', destination.trim());
    navigate(`/discover?${query.toString()}`);
  };

  const handleRouteClick = (orig: string, dest: string) => {
    navigate(`/discover?origin=${encodeURIComponent(orig)}&destination=${encodeURIComponent(dest)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Safety-First Travel Companion Platform • NOT a Dating App</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Travel solo. <span className="text-teal-700">Connect safely.</span> <br className="hidden sm:block" />
          Go together.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          RideAlong matches solo travellers, long-distance commuters, and weekend explorers on verified Indian transit routes using an explainable compatibility score and zero-tolerance safety guardrails.
        </p>

        {/* Hero Route Search Bar */}
        <div className="max-w-2xl mx-auto bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-lg">
          <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Departure (e.g. Chennai)"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <input
              type="text"
              placeholder="Destination (e.g. Bengaluru)"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Search className="w-4 h-4" />}
              className="sm:w-auto"
            >
              Find Buddy
            </Button>
          </form>

          {/* Quick Route Shortcuts */}
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400">Popular:</span>
            {POPULAR_INDIAN_ROUTES.slice(0, 3).map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRouteClick(r.origin, r.destination)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-800 transition"
              >
                {r.origin} → {r.destination}
              </button>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/discover">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Journeys & Buddies
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Safety Pillars: Why RideAlong is Different */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered from Day One for Safety
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Traditional ridesharing and social apps expose travellers to harassment and ambiguity. RideAlong builds confidence into every interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified ID Badges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Travellers verify corporate or government credentials. Masked phone numbers keep your private contact details secure.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explainable SafeMatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No black-box algorithms. Scores breakdown into Route & Schedule (40%), Preferences (25%), Interests (15%), Languages (10%), and Group size (10%).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Trusted Circles & SOS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically broadcast live itineraries to family. One-tap access to national police (112), Women Helpline (1091), and RPF (139).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero-Dating Policy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strictly prohibited romantic advances. Community-led reporting and swift permanent suspension for misconduct.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto rounded-3xl bg-teal-900 text-white p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">Simple & Safe</span>
          <h2 className="text-2xl sm:text-3xl font-bold">How RideAlong Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-emerald-300 font-bold flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h3 className="text-lg font-bold">Search or Post a Journey</h3>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              Enter your departure hub, destination, transit mode (train, carpool, shared cab, flight), and schedule window.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-emerald-300 font-bold flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h3 className="text-lg font-bold">Review SafeMatch Insights</h3>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              Inspect explainable compatibility scores, verified badges, shared languages, travel pace, and travel habits.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-emerald-300 font-bold flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h3 className="text-lg font-bold">Coordinate & Travel with Peace of Mind</h3>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              Send a connection request. Chat securely, sync your station meetup, and broadcast your live itinerary to family.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-5 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Ready for Your Next Confident Journey?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Join thousands of verified solo travellers across Tamil Nadu, Karnataka, Telangana, and Andhra Pradesh.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Create Free Account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Explore as Demo Persona
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
