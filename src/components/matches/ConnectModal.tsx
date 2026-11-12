import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Traveller, Trip } from '../../types';
import { Avatar } from '../common/Avatar';
import { ShieldCheck, Send, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTraveller: Traveller | null;
  trip?: Trip;
  onSend: (receiverId: string, tripId?: string, note?: string) => Promise<{ success: boolean; error?: string }>;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  targetTraveller,
  trip,
  onSend,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!targetTraveller) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await onSend(
      targetTraveller.id,
      trip?.id,
      note.trim() || `Hi ${targetTraveller.name}! I would like to connect as verified travel companions on RideAlong.`
    );

    setIsSubmitting(false);

    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0F766E', '#10B981', '#6EE7B7'],
      });
      setNote('');
      onClose();
    } else {
      setError(res.error || 'Failed to send connection request.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Travel Connection" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Recipient preview */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <Avatar
            src={targetTraveller.avatar}
            name={targetTraveller.name}
            size="md"
            isVerified={targetTraveller.safetyStatus.idVerified}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {targetTraveller.name}
              </h4>
              {targetTraveller.safetyStatus.idVerified && (
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {targetTraveller.homeCity} • {targetTraveller.completedTripsCount} verified rides
            </p>
          </div>
        </div>

        {/* Journey context if linked to a specific trip */}
        {trip && (
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
            <span className="font-semibold">Associated Journey:</span> {trip.origin} → {trip.destination} on{' '}
            {trip.date} ({trip.transportMode})
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        {/* Customized message input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Introduction & Travel Schedule Note
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`Hi ${targetTraveller.name}, I am traveling on this route and looking to coordinate travel companionship...`}
            className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Safety Guidelines Reminder */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            RideAlong is strictly a safety-first travel platform. Requests with inappropriate or dating-oriented content will result in immediate suspension.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
