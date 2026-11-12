import React, { useState } from 'react';
import { ArrowLeftRight, Search, RotateCcw, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { TripSearchParams, TransportMode } from '../../types';
import { POPULAR_INDIAN_ROUTES } from '../../services/sampleData';

interface TripSearchFormProps {
  onSearch: (params: TripSearchParams) => void;
  initialParams?: TripSearchParams;
}

export const TripSearchForm: React.FC<TripSearchFormProps> = ({
  onSearch,
  initialParams = {},
}) => {
  const [origin, setOrigin] = useState(initialParams.origin || '');
  const [destination, setDestination] = useState(initialParams.destination || '');
  const [date, setDate] = useState(initialParams.date || '');
  const [departureTimeWindow, setDepartureTimeWindow] = useState(initialParams.departureTimeWindow || 'all');
  const [transportMode, setTransportMode] = useState<TransportMode | 'all'>(
    initialParams.transportMode || 'all'
  );
  const [directOnly, setDirectOnly] = useState(initialParams.directOnly || false);
  const [maxCompanions, setMaxCompanions] = useState<number | undefined>(initialParams.maxCompanions);
  const [selectedInterest, setSelectedInterest] = useState<string>(initialParams.interest || 'all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setDepartureTimeWindow('all');
    setTransportMode('all');
    setDirectOnly(false);
    setMaxCompanions(undefined);
    setSelectedInterest('all');
    onSearch({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      date: date || undefined,
      departureTimeWindow: departureTimeWindow !== 'all' ? departureTimeWindow : undefined,
      transportMode: transportMode !== 'all' ? transportMode : undefined,
      directOnly: directOnly || undefined,
      maxCompanions: maxCompanions || undefined,
      interest: selectedInterest !== 'all' ? selectedInterest : undefined,
    });
  };

  const applyPopularRoute = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    onSearch({
      origin: orig,
      destination: dest,
      date: date || undefined,
      transportMode: transportMode !== 'all' ? transportMode : undefined,
    });
  };

  const interestsList = [
    'All Interests',
    'Architecture',
    'Photography',
    'Heritage Walks',
    'Specialty Coffee',
    'Technology',
    'Podcasts',
    'Bookstores',
    'Running',
    'Writing',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Inputs with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-4">
            <Input
              label="Departure City / Station"
              placeholder="e.g. Chennai Central"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
            />
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-500 transition-colors shadow-xs active:scale-95"
              title="Swap Departure and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-4">
            <Input
              label="Arrival City / Station"
              placeholder="e.g. Bengaluru KSR"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="md:col-span-3">
            <Input
              label="Travel Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Transport Mode selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-slate-500 uppercase shrink-0">
              Transit Mode:
            </span>
            {(['all', 'train', 'shared-cab', 'bus', 'flight', 'carpool'] as const).map(mode => (
              <button
                type="button"
                key={mode}
                onClick={() => setTransportMode(mode)}
                className={`text-xs px-3 py-1.5 rounded-xl capitalize font-medium transition ${
                  transportMode === mode
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode === 'all' ? 'All Modes' : mode.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Advanced toggle & Actions */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-teal-50 transition"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isAdvancedOpen ? 'Fewer Filters' : 'More Filters'}</span>
              {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {(origin || destination || date || transportMode !== 'all' || directOnly || isAdvancedOpen) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleReset}
              >
                Reset
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Search Journeys
            </Button>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {isAdvancedOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 animate-fade-in text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Departure Time Window</label>
              <select
                value={departureTimeWindow}
                onChange={e => setDepartureTimeWindow(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-teal-600"
              >
                <option value="all">Any Departure Window</option>
                <option value="Morning">Morning (06:00 - 11:00)</option>
                <option value="Afternoon">Afternoon (11:00 - 16:00)</option>
                <option value="Evening">Evening (16:00 - 21:00)</option>
                <option value="Night">Night (21:00 - 05:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Max Cohort / Companions</label>
              <select
                value={maxCompanions || ''}
                onChange={e => setMaxCompanions(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-teal-600"
              >
                <option value="">Any Companion Count</option>
                <option value="1">1 Companion Needed</option>
                <option value="2">Up to 2 Companions</option>
                <option value="3">3+ Companions</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Filter by Shared Interest</label>
              <select
                value={selectedInterest}
                onChange={e => setSelectedInterest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-teal-600"
              >
                {interestsList.map(item => (
                  <option key={item} value={item === 'All Interests' ? 'all' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={e => setDirectOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
                />
                <span>Direct Route Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Popular Indian Corridors quick pills */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Popular Verified Transit Corridors:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INDIAN_ROUTES.map((route, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPopularRoute(route.origin, route.destination)}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-teal-900 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
              >
                <span className="font-semibold">{route.origin}</span>
                <span className="text-teal-600">→</span>
                <span className="font-semibold">{route.destination}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
