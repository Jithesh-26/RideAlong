import React, { useState } from 'react';
import { SafeMatchResult } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScoreBreakdownModal } from '../common/ScoreBreakdownModal';
import { ShieldCheck, Info, MapPin, Compass, ArrowRight, MessageSquare, Check, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';

interface TravellerCardProps {
  match: SafeMatchResult;
  onConnect: (match: SafeMatchResult) => void;
}

export const TravellerCard: React.FC<TravellerCardProps> = ({ match, onConnect }) => {
  const { traveller, trip, score } = match;
  const [showScoreModal, setShowScoreModal] = useState(false);
  const { requests, conversations, setActiveConversation } = useMessages();
  const { currentUser } = useAuth();

  // Check connection status
  const existingReq = currentUser
    ? requests.find(
        r =>
          (r.senderId === currentUser.id && r.receiverId === traveller.id) ||
          (r.receiverId === currentUser.id && r.senderId === traveller.id)
      )
    : undefined;

  const existingConv = currentUser
    ? conversations.find(
        c => c.participantIds.includes(currentUser.id) && c.participantIds.includes(traveller.id)
      )
    : undefined;

  const getScoreBadgeColor = (total: number) => {
    if (total >= 85) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (total >= 70) return 'bg-teal-50 text-teal-800 border-teal-300';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Header: Avatar, Name, Score Button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link to={`/travellers/${traveller.id}`} className="flex items-center gap-3.5 group/traveller">
            <Avatar
              src={traveller.avatar}
              name={traveller.name}
              size="lg"
              isVerified={traveller.safetyStatus.idVerified}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover/traveller:text-teal-700 transition-colors">
                  {traveller.name}
                </h3>
                {traveller.safetyStatus.idVerified && (
                  <span title="Identity Verified">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {traveller.homeCity} • {traveller.completedTripsCount} completed rides
              </p>
            </div>
          </Link>

          {/* Explainable Compatibility Score Badge */}
          <button
            type="button"
            onClick={() => setShowScoreModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all ${getScoreBadgeColor(
              score.totalScore
            )}`}
            title="Click to view explainable 5-factor compatibility breakdown"
          >
            <span>{score.totalScore}% Match</span>
            <Info className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {traveller.bio}
        </p>

        {/* Travel Corridors / Active Trip Context */}
        {trip ? (
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100/90 mb-4">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-700" />
                Scheduled Route:
              </span>
              <span className="capitalize text-teal-700">{trip.transportMode}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>{trip.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
              <span>{trip.destination}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {trip.date} • {trip.departureTimeWindow}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Travel Style:</span>
            <span className="capitalize text-slate-800 font-semibold">
              {traveller.preferences.pace} pace • {traveller.preferences.budgetTier}
            </span>
          </div>
        )}

        {/* Interests & Languages Tags */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {traveller.interests.slice(0, 3).map((interest, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
              >
                {interest}
              </span>
            ))}
            {traveller.languages.slice(0, 2).map((lang, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-100/60"
              >
                🗣 {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link to={`/travellers/${traveller.id}`} className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline underline-offset-4">
          View Profile
        </Link>

        <div>
          {existingConv ? (
            <Link to="/messages" onClick={() => setActiveConversation(existingConv)}>
              <Button
                variant="mint"
                size="sm"
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Message
              </Button>
            </Link>
          ) : existingReq ? (
            existingReq.status === 'pending' ? (
              <Badge variant="amber" size="md">
                Request Pending
              </Badge>
            ) : existingReq.status === 'accepted' ? (
              <Badge variant="mint" size="md" icon={<Check className="w-3 h-3" />}>
                Connected
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConnect(match)}
              >
                Re-request
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => onConnect(match)}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Score Modal */}
      <ScoreBreakdownModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        traveller={traveller}
        score={score}
      />
    </div>
  );
};
