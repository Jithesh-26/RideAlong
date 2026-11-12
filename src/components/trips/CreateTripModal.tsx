import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripsContext';
import { TransportMode } from '../../types';
import confetti from 'canvas-confetti';
import { Train, Plane, Car, Bus, Users, Plus, X } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  defaultOrigin = '',
  defaultDestination = '',
}) => {
  const { currentUser } = useAuth();
  const { createTrip } = useTrips();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState('');
  const [departureTimeWindow, setDepartureTimeWindow] = useState('Morning (06:00 - 10:00)');
  const [transportMode, setTransportMode] = useState<TransportMode>('train');
  const [stops, setStops] = useState<string[]>([]);
  const [stopInput, setStopInput] = useState('');
  const [neededCompanions, setNeededCompanions] = useState(1);
  const [budgetShareRule, setBudgetShareRule] = useState('Individual bookings / split cab upon arrival');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddStop = () => {
    if (stopInput.trim() && !stops.includes(stopInput.trim())) {
      setStops([...stops, stopInput.trim()]);
      setStopInput('');
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');

    if (!origin.trim() || !destination.trim() || !date) {
      setError('Please provide origin, destination, and travel date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTrip({
        creatorId: currentUser.id,
        origin: origin.trim(),
        destination: destination.trim(),
        date,
        departureTimeWindow,
        transportMode,
        stops,
        neededCompanions,
        notes: notes.trim(),
        budgetShareRule,
        languagesPreferred: currentUser.languages,
        interestsPreferred: currentUser.interests,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0F766E', '#10B981', '#34D399', '#D1FAE5'],
      });

      onClose();
      // Reset form
      setOrigin('');
      setDestination('');
      setDate('');
      setStops([]);
      setNotes('');

      // Navigate to My Trips so the user immediately sees their published journey
      navigate('/my-trips');
    } catch (err: any) {
      setError(err.message || 'Failed to publish trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const transportModes: { id: TransportMode; label: string; icon: React.ReactNode }[] = [
    { id: 'train', label: 'Train', icon: <Train className="w-4 h-4" /> },
    { id: 'shared-cab', label: 'Shared Cab', icon: <Car className="w-4 h-4" /> },
    { id: 'bus', label: 'Bus', icon: <Bus className="w-4 h-4" /> },
    { id: 'flight', label: 'Flight', icon: <Plane className="w-4 h-4" /> },
    { id: 'carpool', label: 'Carpool', icon: <Car className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish a Verified Journey" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Departure Origin"
            placeholder="e.g. Chennai Central"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            required
          />
          <Input
            label="Destination"
            placeholder="e.g. Bengaluru KSR"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            required
          />
        </div>

        {/* Date & Time Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Travel Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Departure Window
            </label>
            <select
              value={departureTimeWindow}
              onChange={e => setDepartureTimeWindow(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            >
              <option value="Early Morning (05:00 - 07:00)">Early Morning (05:00 - 07:00)</option>
              <option value="Morning (07:00 - 11:00)">Morning (07:00 - 11:00)</option>
              <option value="Afternoon (11:00 - 16:00)">Afternoon (11:00 - 16:00)</option>
              <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
              <option value="Night (20:00 - 23:59)">Night (20:00 - 23:59)</option>
            </select>
          </div>
        </div>

        {/* Transport Mode Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Transport Mode
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {transportModes.map(mode => (
              <button
                type="button"
                key={mode.id}
                onClick={() => setTransportMode(mode.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  transportMode === mode.id
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-1 ring-teal-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="mb-1">{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Route Stops / Waypoints */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Key Stops / Interchange Points (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Katpadi, Jolarpettai"
              value={stopInput}
              onChange={e => setStopInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStop();
                }
              }}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddStop}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {stops.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {stops.map((stop, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {stop}
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(i)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Companion Count & Cost Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Companions Needed
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setNeededCompanions(num)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition ${
                    neededCompanions === num
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Expense / Booking Policy
            </label>
            <select
              value={budgetShareRule}
              onChange={e => setBudgetShareRule(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-600"
            >
              <option value="Individual bookings / split cab upon arrival">
                Individual bookings / split cab upon arrival
              </option>
              <option value="Split fuel & toll evenly via UPI">
                Split fuel & toll evenly via UPI
              </option>
              <option value="Pre-booked cab: Split fare equally">
                Pre-booked cab: Split fare equally
              </option>
              <option value="Companionship only / No financial exchange">
                Companionship only / No financial exchange
              </option>
            </select>
          </div>
        </div>

        {/* Journey Notes & Safety Intent */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Journey Notes & Co-Traveller Expectations
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Share details such as train name/number, pickup station point, quiet commute vs active discussion, or luggage size limits..."
            className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Publish Journey
          </Button>
        </div>
      </form>
    </Modal>
  );
};
