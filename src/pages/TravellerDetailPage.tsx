import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { useMessages } from '../context/MessagesContext';
import { useSafety } from '../context/SafetyContext';
import { api } from '../services/api';
import { Traveller, Trip, ScoreBreakdown } from '../types';
import { calculateCompatibilityScore } from '../services/matching';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConnectModal } from '../components/matches/ConnectModal';
import { ReportUserModal } from '../components/safety/ReportUserModal';
import { ScoreBreakdownModal } from '../components/common/ScoreBreakdownModal';
import { TripCard } from '../components/trips/TripCard';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Languages,
  Heart,
  Compass,
  Lock,
  Flag,
  Ban,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const TravellerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, demoUsers } = useAuth();
  const { trips } = useTrips();
  const { requests, conversations, setActiveConversation, sendRequest } = useMessages();
  const { blockUser, unblockUser, isBlocked } = useSafety();

  const [traveller, setTraveller] = useState<Traveller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);

  useEffect(() => {
    async function loadTraveller() {
      if (!id) return;
      setIsLoading(true);
      try {
        const user = await api.getUser(id);
        setTraveller(user);
      } catch (err) {
        console.error('Failed to load traveller:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTraveller();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Loading traveller profile...</p>
      </div>
    );
  }

  if (!traveller) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Traveller profile not found.</h2>
        <Button variant="secondary" onClick={() => navigate('/discover')}>
          Back to Discover
        </Button>
      </div>
    );
  }

  const isMe = currentUser?.id === traveller.id;
  const userBlocked = isBlocked(traveller.id);

  // Connection & Chat status
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

  // Traveller's upcoming trips
  const travellerTrips = trips.filter(
    t => t.creatorId === traveller.id && t.status === 'upcoming'
  );

  // Score breakdown
  const compatibilityScore: ScoreBreakdown = currentUser
    ? calculateCompatibilityScore(currentUser, traveller)
    : {
        totalScore: 82,
        routeScheduleScore: 32,
        preferencesScore: 22,
        interestsScore: 10,
        languagesScore: 10,
        groupSizeScore: 8,
        routeMatchDetails: 'Corridor match',
        preferencesMatchDetails: 'Moderate pace',
        sharedInterests: traveller.interests.slice(0, 2),
        sharedLanguages: traveller.languages.slice(0, 2),
        groupSizeDetails: '1:1 cohort alignment',
        disclaimer: 'Compatibility scores reflect schedule and preference alignment only.',
      };

  const handleToggleBlock = async () => {
    if (!currentUser) return;
    if (userBlocked) {
      await unblockUser(traveller.id);
    } else {
      await blockUser(traveller.id);
      setBlockSuccess(true);
      setTimeout(() => setBlockSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <Avatar
              src={traveller.avatar}
              name={traveller.name}
              size="xl"
              isVerified={traveller.safetyStatus.idVerified}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {traveller.name}
                </h1>
                {traveller.safetyStatus.idVerified && (
                  <Badge variant="teal" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                    Verified Identity
                  </Badge>
                )}
                {traveller.isDemo && (
                  <Badge variant="slate" size="sm">
                    Simulated Persona
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Home Hub: {traveller.homeCity}</span>
                <span>•</span>
                <span>Member since {traveller.joinedDate}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{traveller.completedTripsCount} verified rides</span>
              </p>

              {/* Masked Contact Info */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone: ••••• ••{traveller.id.slice(-3)} (Masked for privacy)</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          {!isMe && (
            <div className="flex flex-col sm:items-end gap-2.5">
              {/* Score Button */}
              <button
                type="button"
                onClick={() => setShowScoreModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition"
              >
                <span>{compatibilityScore.totalScore}% Compatibility</span>
                <span className="text-[10px] text-teal-600 underline">View Breakdown</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {existingConv ? (
                  <Button
                    variant="mint"
                    size="md"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => {
                      setActiveConversation(existingConv);
                      navigate('/messages');
                    }}
                  >
                    Open Messages
                  </Button>
                ) : existingReq ? (
                  <Badge variant="amber" size="md">
                    Request Pending
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect with Traveller
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            About Me & Transit Habits
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">{traveller.bio}</p>
        </div>

        {/* Preferences & Languages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Languages */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              Languages Spoken
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {traveller.languages.map((l, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-teal-600" />
              Interests
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {traveller.interests.map((interest, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              Travel Preferences
            </h4>
            <p className="text-xs text-slate-700 capitalize font-medium">
              {traveller.preferences.pace} pace • {traveller.preferences.budgetTier} budget
            </p>
            <p className="text-[11px] text-slate-500 capitalize">
              Style: {traveller.preferences.communicationStyle} • {traveller.preferences.scheduleType}
            </p>
          </div>
        </div>

        {/* Safety Actions strip: Report & Block */}
        {!isMe && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report User</span>
              </button>

              <button
                type="button"
                onClick={handleToggleBlock}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{userBlocked ? 'Unblock User' : 'Block User'}</span>
              </button>
            </div>

            {blockSuccess && (
              <span className="text-xs text-emerald-700 font-medium">
                User successfully blocked from contacting you.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scheduled Journeys by this Traveller */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-700" />
          Scheduled Journeys by {traveller.name} ({travellerTrips.length})
        </h2>

        {travellerTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {travellerTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onConnect={() => setShowConnectModal(true)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            {traveller.name} has no scheduled public journeys right now. You can still send a connection request to coordinate upcoming South corridor transit!
          </div>
        )}
      </div>

      {/* Modals */}
      {showConnectModal && (
        <ConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          targetTraveller={traveller}
          trip={travellerTrips[0]}
          onSend={sendRequest}
        />
      )}

      {showReportModal && (
        <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetUser={traveller}
        />
      )}

      {showScoreModal && (
        <ScoreBreakdownModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          traveller={traveller}
          score={compatibilityScore}
        />
      )}
    </div>
  );
};
