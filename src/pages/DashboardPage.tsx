import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { useMessages } from '../context/MessagesContext';
import { useSafety } from '../context/SafetyContext';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Calendar,
  MessageSquare,
  UserCheck,
  ArrowRight,
  Check,
  X,
  PhoneCall,
  Share2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { TripCard } from '../components/trips/TripCard';
import { CreateTripModal } from '../components/trips/CreateTripModal';
import { ConnectModal } from '../components/matches/ConnectModal';
import { Trip, SafeMatchResult } from '../types';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { trips, cancelTrip } = useTrips();
  const { requests, acceptRequest, declineRequest, conversations, setActiveConversation, sendRequest } = useMessages();
  const { trustedContacts } = useSafety();
  const navigate = useNavigate();

  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [connectModalData, setConnectModalData] = useState<{ match: SafeMatchResult } | null>(null);

  if (!currentUser) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Please sign in to access your dashboard.</h2>
        <Link to="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  // Incoming pending requests
  const incomingRequests = requests.filter(
    r => r.receiverId === currentUser.id && r.status === 'pending'
  );

  // My upcoming trips & all upcoming trips
  const myUpcomingTrips = trips.filter(
    t => t.creatorId === currentUser.id && t.status === 'upcoming'
  );

  const otherUpcomingTrips = trips.filter(
    t => t.creatorId !== currentUser.id && t.status === 'upcoming'
  );

  return (
    <div className="space-y-8 text-left">
      {/* Welcome & Safety Health Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/80 text-emerald-300 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Safety Protocol Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
                Ready for your next journey? Discover verified companions traveling along your routes.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="mint"
                size="md"
                leftIcon={<Compass className="w-4 h-4" />}
                onClick={() => navigate('/discover')}
              >
                Find Travel Buddy
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4 text-teal-700" />}
                onClick={() => setIsCreateTripOpen(true)}
              >
                Publish Journey
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-teal-700/60">
            <div className="p-2.5 rounded-xl bg-teal-800/60">
              <p className="text-[11px] text-teal-200">ID Verification</p>
              <p className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                {currentUser.safetyStatus.idVerified ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified</span>
                  </>
                ) : (
                  <span className="text-amber-300">Self-Declared</span>
                )}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-800/60">
              <p className="text-[11px] text-teal-200">Trusted Contacts</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {trustedContacts.length} Linked Contact{trustedContacts.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-800/60">
              <p className="text-[11px] text-teal-200">Completed Journeys</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {currentUser.completedTripsCount} verified trips
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-800/60">
              <p className="text-[11px] text-teal-200">Pending Requests</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {incomingRequests.length} to review
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Connection Requests (High Priority) */}
      {incomingRequests.length > 0 && (
        <section className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700" />
              Incoming Travel Connection Requests ({incomingRequests.length})
            </h2>
            <Link to="/messages" className="text-xs font-semibold text-amber-800 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingRequests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={req.sender?.avatar}
                    name={req.sender?.name || 'Traveller'}
                    size="md"
                    isVerified={req.sender?.safetyStatus.idVerified}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {req.sender?.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {req.sender?.homeCity} • {req.sender?.preferences.pace} pace
                    </p>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg mt-2 italic">
                      "{req.note}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-600 hover:text-slate-900"
                    onClick={() => declineRequest(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => acceptRequest(req.id)}
                  >
                    Accept & Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: Upcoming Trips & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Journeys */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-700" />
              Upcoming Journeys on Popular Corridors
            </h2>
            <Link to="/my-trips" className="text-xs font-semibold text-teal-700 hover:underline">
              Manage my trips
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myUpcomingTrips.length > 0 ? (
              myUpcomingTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isOwner={true}
                  onCancel={id => cancelTrip(id)}
                />
              ))
            ) : null}

            {otherUpcomingTrips.slice(0, 4).map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onConnect={t => {
                  if (t.creator) {
                    setConnectModalData({
                      match: {
                        traveller: t.creator,
                        trip: t,
                        score: {
                          totalScore: 88,
                          routeScheduleScore: 36,
                          preferencesScore: 22,
                          interestsScore: 12,
                          languagesScore: 10,
                          groupSizeScore: 8,
                          routeMatchDetails: 'Exact corridor match',
                          preferencesMatchDetails: 'Moderate pace, mid-range budget',
                          sharedInterests: ['Heritage Walks', 'Photography'],
                          sharedLanguages: ['English', 'Tamil'],
                          groupSizeDetails: '1:1 travel cohort',
                          disclaimer: 'Compatibility scores reflect schedule and preference alignment only.',
                        },
                      },
                    });
                  }
                }}
              />
            ))}
          </div>

          {trips.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No journeys posted yet.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => setIsCreateTripOpen(true)}
              >
                Publish Your First Journey
              </Button>
            </div>
          )}
        </div>

        {/* Right Col: Recent Chats & Safety Circle Quick Access */}
        <div className="space-y-6">
          {/* Active Conversations */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-700" />
                Recent Conversations
              </h3>
              <Link to="/messages" className="text-xs text-teal-700 font-semibold hover:underline">
                Open inbox
              </Link>
            </div>

            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active conversations yet. Connect with a companion to initiate chat.
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 3).map(conv => {
                  const other = conv.participants?.find(p => p.id !== currentUser.id);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        navigate('/messages');
                      }}
                      className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition flex items-center gap-3 border border-slate-100"
                    >
                      <Avatar
                        src={other?.avatar}
                        name={other?.name || 'Companion'}
                        size="sm"
                        isVerified={other?.safetyStatus.idVerified}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {other?.name || 'Companion'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Safety Center Quick Card */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 rounded-3xl border border-teal-200/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <span>Safety Centre Readiness</span>
            </div>
            <p className="text-xs text-teal-900/80 leading-relaxed">
              Ensure your trusted family circle is configured before embarking on long-distance journeys.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-teal-200/50">
              <span className="text-xs font-semibold text-teal-800">
                {trustedContacts.length} contacts linked
              </span>
              <Link to="/safety">
                <Button variant="mint" size="sm">
                  Open Safety Centre
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
      />

      {connectModalData && (
        <ConnectModal
          isOpen={Boolean(connectModalData)}
          onClose={() => setConnectModalData(null)}
          targetTraveller={connectModalData.match.traveller}
          trip={connectModalData.match.trip}
          onSend={sendRequest}
        />
      )}
    </div>
  );
};
