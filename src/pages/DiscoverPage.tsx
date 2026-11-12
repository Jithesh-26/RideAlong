import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { useMessages } from '../context/MessagesContext';
import { TripSearchForm } from '../components/trips/TripSearchForm';
import { TravellerCard } from '../components/matches/TravellerCard';
import { ConnectModal } from '../components/matches/ConnectModal';
import { rankMatches } from '../services/matching';
import { DEMO_USERS } from '../services/sampleData';
import { TripSearchParams, SafeMatchResult, Traveller } from '../types';
import { Compass, Sparkles, Filter, ShieldAlert, Users, RotateCcw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, demoUsers } = useAuth();
  const { trips } = useTrips();
  const { sendRequest } = useMessages();

  const [activeParams, setActiveParams] = useState<TripSearchParams>({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    transportMode: (searchParams.get('transportMode') as any) || 'all',
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedPace, setSelectedPace] = useState<string>('all');
  const [connectModalMatch, setConnectModalMatch] = useState<SafeMatchResult | null>(null);

  // Read search params from URL on mount
  useEffect(() => {
    const orig = searchParams.get('origin') || '';
    const dest = searchParams.get('destination') || '';
    const d = searchParams.get('date') || '';
    const mode = (searchParams.get('transportMode') as any) || 'all';

    setActiveParams({
      origin: orig,
      destination: dest,
      date: d,
      transportMode: mode,
    });
  }, [searchParams]);

  const handleSearchSubmit = (newParams: TripSearchParams) => {
    setActiveParams(newParams);
    const q = new URLSearchParams();
    if (newParams.origin) q.append('origin', newParams.origin);
    if (newParams.destination) q.append('destination', newParams.destination);
    if (newParams.date) q.append('date', newParams.date);
    if (newParams.transportMode && newParams.transportMode !== 'all') {
      q.append('transportMode', newParams.transportMode);
    }
    if (newParams.departureTimeWindow && newParams.departureTimeWindow !== 'all') {
      q.append('departureTimeWindow', newParams.departureTimeWindow);
    }
    if (newParams.interest && newParams.interest !== 'all') {
      q.append('interest', newParams.interest);
    }
    setSearchParams(q);
  };

  // Compute matches
  const matchResults = useMemo(() => {
    const userForMatching: Traveller = currentUser || demoUsers[0] || DEMO_USERS[0];
    const poolOfTravellers = demoUsers.length > 0 ? demoUsers : DEMO_USERS;

    let ranked = rankMatches(userForMatching, poolOfTravellers, trips, {
      origin: activeParams.origin,
      destination: activeParams.destination,
      date: activeParams.date,
      transportMode: activeParams.transportMode,
      departureTimeWindow: activeParams.departureTimeWindow,
    });

    // Time window filter
    if (activeParams.departureTimeWindow && activeParams.departureTimeWindow !== 'all') {
      ranked = ranked.filter(m =>
        !m.trip || m.trip.departureTimeWindow.toLowerCase().includes(activeParams.departureTimeWindow!.toLowerCase())
      );
    }

    // Direct only filter
    if (activeParams.directOnly) {
      ranked = ranked.filter(m => !m.trip || !m.trip.stops || m.trip.stops.length === 0);
    }

    // Max companions filter
    if (activeParams.maxCompanions) {
      ranked = ranked.filter(m => !m.trip || m.trip.neededCompanions <= activeParams.maxCompanions!);
    }

    // Interest filter
    if (activeParams.interest && activeParams.interest !== 'all') {
      ranked = ranked.filter(m =>
        m.traveller.interests.some(i => i.toLowerCase().includes(activeParams.interest!.toLowerCase()))
      );
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      ranked = ranked.filter(m =>
        m.traveller.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase())
      );
    }

    // Pace filter
    if (selectedPace !== 'all') {
      ranked = ranked.filter(m => m.traveller.preferences.pace === selectedPace);
    }

    return ranked;
  }, [currentUser, demoUsers, trips, activeParams, selectedLanguage, selectedPace]);

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5 text-teal-700" />
          <span>SafeMatch Discovery Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Verified Travel Companions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
          Explore travellers whose routes, schedules, and travel styles align with yours. All matches feature explainable 5-factor scoring.
        </p>
      </div>

      {/* Trip Search Form */}
      <TripSearchForm
        onSearch={handleSearchSubmit}
        initialParams={activeParams}
      />

      {/* Secondary Quick Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Refine By:</span>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-600 font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:ring-teal-600"
            >
              <option value="all">All Languages</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="Kannada">Kannada</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>

          {/* Pace filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-600 font-medium">Transit Pace:</span>
            <select
              value={selectedPace}
              onChange={e => setSelectedPace(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:ring-teal-600"
            >
              <option value="all">Any Pace</option>
              <option value="relaxed">Relaxed</option>
              <option value="moderate">Moderate</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{matchResults.length}</strong> compatible companions
        </div>
      </div>

      {/* Match Results Grid */}
      {matchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {matchResults.map((match, i) => (
            <TravellerCard
              key={`${match.traveller.id}_${match.trip?.id || i}`}
              match={match}
              onConnect={m => setConnectModalMatch(m)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Direct Matches Found for this Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search corridor or reset filters to see all available verified travel companions across South India.
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              setActiveParams({});
              setSelectedLanguage('all');
              setSelectedPace('all');
              setSearchParams({});
            }}
          >
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Disclaimer strip */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Compatibility scores represent schedule, corridor, and preference alignment only. They are never a safety guarantee. Always follow in-app safety protocols.
        </span>
      </div>

      {/* Connect Modal */}
      {connectModalMatch && (
        <ConnectModal
          isOpen={Boolean(connectModalMatch)}
          onClose={() => setConnectModalMatch(null)}
          targetTraveller={connectModalMatch.traveller}
          trip={connectModalMatch.trip}
          onSend={sendRequest}
        />
      )}
    </div>
  );
};
