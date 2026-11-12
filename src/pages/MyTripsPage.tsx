import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { useMessages } from '../context/MessagesContext';
import { TripCard } from '../components/trips/TripCard';
import { CreateTripModal } from '../components/trips/CreateTripModal';
import { TripShareModal } from '../components/safety/TripShareModal';
import { Button } from '../components/common/Button';
import { Trip } from '../types';
import { PlusCircle, MapPin, Share2, Star, CheckCircle2 } from 'lucide-react';

export const MyTripsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { trips, cancelTrip } = useTrips();
  const { requests } = useMessages();

  const [activeTab, setActiveTab] = useState<
    'all' | 'upcoming' | 'created' | 'joined' | 'pending' | 'completed' | 'cancelled'
  >('upcoming');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shareTrip, setShareTrip] = useState<Trip | null>(null);

  if (!currentUser) return null;

  // Filter trips by categories
  const filteredTrips = trips.filter(trip => {
    const isCreator = trip.creatorId === currentUser.id;
    const isJoined = trip.confirmedCompanions?.includes(currentUser.id);
    const hasPendingRequest = requests.some(
      r => r.tripId === trip.id && r.senderId === currentUser.id && r.status === 'pending'
    );

    if (activeTab === 'all') return isCreator || isJoined;
    if (activeTab === 'upcoming') return (isCreator || isJoined) && trip.status === 'upcoming';
    if (activeTab === 'created') return isCreator;
    if (activeTab === 'joined') return isJoined;
    if (activeTab === 'pending') return hasPendingRequest;
    if (activeTab === 'completed') return (isCreator || isJoined) && trip.status === 'completed';
    if (activeTab === 'cancelled') return (isCreator || isJoined) && trip.status === 'cancelled';
    return true;
  });

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'created', label: 'Created by Me' },
    { id: 'joined', label: 'Joined / Confirmed' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all', label: 'All Trips' },
  ] as const;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Travel Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your published corridors, confirmed travel cohorts, and live safety broadcasts.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Publish a Journey
        </Button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="relative group">
              <TripCard
                trip={trip}
                isOwner={trip.creatorId === currentUser.id}
                onCancel={id => cancelTrip(id)}
              />
              {/* Share Itinerary Button on Trip Card */}
              <div className="mt-2 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  onClick={() => setShareTrip(trip)}
                >
                  Broadcast Live Itinerary
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No journeys found in this category
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to plan your next trip between Chennai, Bengaluru, Madurai, or Hyderabad?
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            Publish New Journey
          </Button>
        </div>
      )}

      {/* Modal */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {shareTrip && (
        <TripShareModal
          isOpen={Boolean(shareTrip)}
          onClose={() => setShareTrip(null)}
          trip={shareTrip}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
