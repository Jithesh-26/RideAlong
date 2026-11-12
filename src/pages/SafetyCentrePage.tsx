import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { useTrips } from '../context/TripsContext';
import { TrustedContactsList } from '../components/safety/TrustedContactsList';
import { EmergencyResources } from '../components/safety/EmergencyResources';
import { ReportUserModal } from '../components/safety/ReportUserModal';
import { TripShareModal } from '../components/safety/TripShareModal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Trip, Traveller } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Share2,
  Lock,
  Flag,
  Ban,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

export const SafetyCentrePage: React.FC = () => {
  const { currentUser, demoUsers } = useAuth();
  const { blockedUsers, unblockUser, isBlocked } = useSafety();
  const { trips } = useTrips();

  const [activeTab, setActiveTab] = useState<'protocols' | 'contacts' | 'sharing' | 'blocked' | 'emergency'>('protocols');
  const [shareTrip, setShareTrip] = useState<Trip | null>(null);
  const [reportTarget, setReportTarget] = useState<Traveller | null>(null);
  const [showReportSelector, setShowReportSelector] = useState(false);

  if (!currentUser) return null;

  // Trips eligible for sharing
  const userUpcomingTrips = trips.filter(
    t => (t.creatorId === currentUser.id || t.confirmedCompanions?.includes(currentUser.id)) && t.status === 'upcoming'
  );

  const potentialReportUsers = demoUsers.filter(u => u.id !== currentUser.id);

  return (
    <div className="space-y-8 text-left pb-12">
      {/* Safety Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/80 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Safety-First Travel Charter</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            RideAlong Safety Centre
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Your safety and autonomy are paramount. RideAlong is strictly a companion coordination platform for transit safety — not a dating app. Access verified emergency channels, manage your trusted emergency circle, and control itinerary sharing.
          </p>
        </div>

        {/* Essential Anti-Dating & Verification Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-teal-700/60">
          <div className="flex items-start gap-2.5 bg-teal-800/40 p-3 rounded-2xl border border-teal-700/50">
            <Ban className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Zero-Dating Policy</p>
              <p className="text-[11px] text-teal-200 mt-0.5">Strict prohibition of romantic/dating solicitations. Offending accounts are banned immediately.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-teal-800/40 p-3 rounded-2xl border border-teal-700/50">
            <Lock className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Private By Default</p>
              <p className="text-[11px] text-teal-200 mt-0.5">Phone numbers and precise addresses are hidden until reciprocal confirmation.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-teal-800/40 p-3 rounded-2xl border border-teal-700/50">
            <UserCheck className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Verified Peer Cohort</p>
              <p className="text-[11px] text-teal-200 mt-0.5">Community-led trust checks, active phone validation, and verified trip logs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 no-scrollbar">
        <button
          onClick={() => setActiveTab('protocols')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'protocols'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Safety Protocols & Guidelines
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'contacts'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Trusted Contacts Circle
        </button>

        <button
          onClick={() => setActiveTab('sharing')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'sharing'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Live Itinerary Sharing
        </button>

        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'blocked'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <Ban className="w-4 h-4" />
          Blocked Users ({blockedUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'emergency'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Emergency Hotlines
        </button>
      </div>

      {/* Tab 1: Protocols */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-700" />
                Solo Transit Safety Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory recommendations before boarding trains, buses, shared cabs or carpools.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">Meet at Public Main Concourse</strong>
                    Always rendezvous in broad daylight at official station entrances, railway waiting rooms, or airport passenger lounges. Never in secluded side streets.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">Verify Identity & Booking Confirmation</strong>
                    Confirm your companion’s name, PNR status, bus boarding pass, or flight ticket before commencing shared transit legs.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">Broadcast Live Itinerary to Family</strong>
                    Add at least one Trusted Contact. Tap "Share Itinerary" so your family has route checkpoints and emergency numbers.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">Keep Personal Valuables Secure</strong>
                    Keep emergency cash, power banks, identification, and critical medicines on your person, not in stowed luggage.
                  </div>
                </div>
              </div>
            </div>

            {/* Zero Tolerance & Reporting Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Zero Tolerance Anti-Harassment Policy</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    RideAlong was engineered to provide peace of mind to commuters, especially female solo travellers. We maintain zero tolerance for non-consensual behavior, unsolicited romantic solicitations, or fraudulent impersonation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Notice Something Suspicious?
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    You can report and block any traveller immediately with one tap. Our safety moderation team reviews all flagged logs and coordinates with transit security if necessary.
                  </p>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 font-bold"
                  leftIcon={<Flag className="w-4 h-4 text-rose-600" />}
                  onClick={() => setShowReportSelector(true)}
                >
                  File a Safety Report or Block
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Trusted Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <TrustedContactsList />
        </div>
      )}

      {/* Tab 3: Itinerary Sharing */}
      {activeTab === 'sharing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-teal-700" />
              Live Itinerary Broadcast & Trip Tracking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select one of your confirmed or published journeys below to generate a real-time tracking link and verified itinerary snippet to share with your family or trusted contacts.
            </p>
          </div>

          {userUpcomingTrips.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <p className="text-sm font-semibold text-slate-700">No upcoming trips to share</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you create a journey or join a travel partner's itinerary, you can broadcast your live travel corridor from here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userUpcomingTrips.map(trip => (
                <div
                  key={trip.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full capitalize">
                        {trip.transportMode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{trip.date}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {trip.origin} → {trip.destination}
                    </div>
                    <div className="text-xs text-slate-500">
                      Window: {trip.departureTimeWindow}
                    </div>
                  </div>

                  <Button
                    variant="mint"
                    size="sm"
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                    onClick={() => setShareTrip(trip)}
                    className="w-full"
                  >
                    Share Live Itinerary
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Blocked Users */}
      {activeTab === 'blocked' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-slate-700" />
              Blocked Travellers
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Blocked members cannot see your itineraries, discover your profile in SafeMatch, or send you connection requests.
            </p>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              No blocked users. Your connection experience is clear.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={b.blockedUser?.avatar}
                      name={b.blockedUser?.name || 'Blocked User'}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {b.blockedUser?.name || 'Blocked Traveller'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Blocked on {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unblockUser(b.blockedUserId)}
                    className="text-xs"
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Emergency Hotlines */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <EmergencyResources />
        </div>
      )}

      {/* Report User Picker Modal */}
      {showReportSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-600" />
              Select Traveller to Report
            </h3>
            <p className="text-xs text-slate-500">
              Select a traveller from your recent interactions to log a confidential safety report.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {potentialReportUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setReportTarget(user);
                    setShowReportSelector(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500">{user.homeCity}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowReportSelector(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Active Modals */}
      {shareTrip && (
        <TripShareModal
          isOpen={Boolean(shareTrip)}
          onClose={() => setShareTrip(null)}
          trip={shareTrip}
          currentUser={currentUser}
        />
      )}

      {reportTarget && (
        <ReportUserModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetUser={reportTarget}
        />
      )}
    </div>
  );
};
