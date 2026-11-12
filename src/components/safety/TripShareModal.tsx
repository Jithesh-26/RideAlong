import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Trip, Traveller } from '../../types';
import { Share2, Copy, Check, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

interface TripShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  currentUser: Traveller;
}

export const TripShareModal: React.FC<TripShareModalProps> = ({
  isOpen,
  onClose,
  trip,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🛡️ RideAlong Verified Travel Itinerary:
Traveller: ${currentUser.name} (Verified ID: ${currentUser.safetyStatus.idVerified ? 'YES' : 'Pending'})
Route: ${trip.origin} → ${trip.destination}
Date: ${trip.date} (${trip.departureTimeWindow})
Transport: ${trip.transportMode.toUpperCase()}
Tracking Link: https://ridealong.app/track/tr_${trip.id}
Verified via RideAlong Safety Centre.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Live Travel Itinerary" maxWidth="md">
      <div className="space-y-5 text-left">
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-950 space-y-1">
            <p className="font-bold">Trip Sharing Security Protocol</p>
            <p className="leading-relaxed">
              Sharing your live itinerary with trusted family or friends lets them see your scheduled
              transit window, vehicle details, and confirm your safe arrival.
            </p>
          </div>
        </div>

        {/* Itinerary Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Live Itinerary Card</span>
            <span className="text-emerald-700 font-bold">● Active Route</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{trip.origin} → {trip.destination}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {trip.departureTimeWindow}
              </span>
            </div>
          </div>
        </div>

        {/* Share Text Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Formatted Broadcast Text
          </label>
          <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap select-all">
            {shareText}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Send via WhatsApp, Telegram, or SMS.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Itinerary'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
