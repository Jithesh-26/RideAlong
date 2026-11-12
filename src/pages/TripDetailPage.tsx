import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { useMessages } from '../context/MessagesContext';
import { api } from '../services/api';
import { Trip, Traveller, TripReview } from '../types';
import { calculateCompatibilityScore } from '../services/matching';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConnectModal } from '../components/matches/ConnectModal';
import { TripShareModal } from '../components/safety/TripShareModal';
import { ScoreBreakdownModal } from '../components/common/ScoreBreakdownModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Train,
  Plane,
  Car,
  Bus,
  ShieldCheck,
  Share2,
  Star,
  MessageSquare,
  AlertCircle,
  PlusCircle,
  Check,
  CheckCircle2,
} from 'lucide-react';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, demoUsers } = useAuth();
  const { trips, cancelTrip } = useTrips();
  const { requests, sendRequest } = useMessages();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [companions, setCompanions] = useState<Traveller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Respectful']);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadTripData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = trips.find(t => t.id === id);
        if (found) {
          setTrip(found);
        } else {
          const all = await api.getTrips();
          const t = all.find(item => item.id === id);
          if (t) setTrip(t);
        }

        const revs = await api.getReviews(id);
        setReviews(revs);
      } catch (err) {
        console.error('Failed to load trip details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTripData();
  }, [id, trips]);

  // Load confirmed companion travellers
  useEffect(() => {
    async function loadCompanions() {
      if (!trip || !trip.confirmedCompanions || trip.confirmedCompanions.length === 0) {
        setCompanions([]);
        return;
      }
      try {
        const users = await Promise.all(
          trip.confirmedCompanions.map(cid => api.getUser(cid))
        );
        setCompanions(users.filter(Boolean) as Traveller[]);
      } catch (err) {
        console.error('Failed to load companions:', err);
      }
    }
    loadCompanions();
  }, [trip]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading trip itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Trip Itinerary Not Found</h2>
        <p className="text-xs text-slate-500">This trip may have expired or was removed by its host.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/discover')}>
          Browse Other Journeys
        </Button>
      </div>
    );
  }

  const isCreator = currentUser?.id === trip.creatorId;
  const isConfirmedCompanion = currentUser && trip.confirmedCompanions?.includes(currentUser.id);
  const hasPendingRequest = currentUser && requests.some(
    r => r.tripId === trip.id && r.senderId === currentUser.id && r.status === 'pending'
  );

  const isCompleted = trip.status === 'completed' || new Date(trip.date).getTime() < Date.now();
  const canReview = isCompleted && (isCreator || isConfirmedCompanion);

  const scoreBreakdown = (currentUser && trip.creator)
    ? calculateCompatibilityScore(currentUser, trip.creator, undefined, trip)
    : null;

  const reviewTagOptions = [
    'Punctual',
    'Respectful',
    'Safe Driver',
    'Clear Communicator',
    'Great Travel Partner',
    'Followed Route Plan',
  ];

  const toggleReviewTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !trip) return;

    setIsSubmittingReview(true);
    try {
      const revieweeId = isCreator
        ? (trip.confirmedCompanions[0] || 'user_rohan')
        : trip.creatorId;

      const newReview = await api.createReview({
        tripId: trip.id,
        reviewerId: currentUser.id,
        revieweeId,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
      });

      setReviews(prev => [newReview, ...prev]);
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
        setComment('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'train': return <Train className="w-4 h-4" />;
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itineraries</span>
        </button>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="teal" icon={getTransportIcon(trip.transportMode)} className="capitalize font-bold text-xs">
              {trip.transportMode}
            </Badge>
            <Badge variant={trip.status === 'upcoming' ? 'mint' : 'slate'} className="text-xs uppercase font-bold">
              {trip.status}
            </Badge>
            <span className="text-xs text-slate-500 font-medium">• {trip.budgetShareRule}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-3.5 h-3.5 text-teal-700" />}
                onClick={() => setShowShareModal(true)}
              >
                Share Itinerary
              </Button>
            )}
            {isCreator && trip.status === 'upcoming' && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this published journey?')) {
                    cancelTrip(trip.id);
                    navigate('/my-trips');
                  }
                }}
              >
                Cancel Trip
              </Button>
            )}
          </div>
        </div>

        {/* Route Big Display */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            <span>{trip.origin}</span>
            <span className="text-teal-600 font-light">→</span>
            <span>{trip.destination}</span>
          </div>

          {trip.stops && trip.stops.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Verified Stops / Waypoints: <strong>{trip.stops.join(' • ')}</strong></span>
            </div>
          )}
        </div>

        {/* Schedule & Seating Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Departure Date</p>
              <p className="text-xs font-bold text-slate-900">{trip.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Time Window</p>
              <p className="text-xs font-bold text-slate-900">{trip.departureTimeWindow}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Required Cohort</p>
              <p className="text-xs font-bold text-slate-900">
                {trip.neededCompanions} Companion{trip.neededCompanions > 1 ? 's' : ''} ({trip.confirmedCompanions?.length || 0} confirmed)
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/70 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-teal-900 uppercase tracking-wide text-[10px]">Trip Details & Notes:</span>
            <p className="italic leading-relaxed">"{trip.notes}"</p>
          </div>
        )}
      </div>

      {/* Host & Compatibility Section */}
      {trip.creator && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Trip Host Profile
            </h3>

            {scoreBreakdown && !isCreator && (
              <button
                onClick={() => setShowScoreModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition"
              >
                <span>Compatibility: {scoreBreakdown.totalScore}%</span>
                <span className="text-[10px] text-teal-600 underline">Breakdown</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link to={`/travellers/${trip.creator.id}`}>
              <Avatar
                src={trip.creator.avatar}
                name={trip.creator.name}
                size="lg"
                isVerified={trip.creator.safetyStatus.idVerified}
              />
            </Link>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/travellers/${trip.creator.id}`}
                  className="text-base font-bold text-slate-900 hover:text-teal-700 transition"
                >
                  {trip.creator.name}
                </Link>
                {trip.creator.safetyStatus.idVerified && (
                  <Badge variant="teal" size="sm" icon={<ShieldCheck className="w-3 h-3 text-teal-600" />}>
                    ID Verified
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500">
                {trip.creator.homeCity} • {trip.creator.completedTripsCount} verified rides • Member since {trip.creator.joinedDate}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {trip.creator.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {trip.creator.languages.map(l => (
                  <span key={l} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Action button if not creator */}
            {!isCreator && trip.status === 'upcoming' && (
              <div className="shrink-0 pt-2 sm:pt-0">
                {hasPendingRequest ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl inline-block">
                    Request Pending
                  </span>
                ) : isConfirmedCompanion ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl inline-block">
                    Confirmed Companion ✓
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect & Join Journey
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmed Cohort Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-700" />
          Confirmed Travel Companions ({companions.length})
        </h3>

        {companions.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 rounded-2xl bg-slate-50">
            No companion has been confirmed yet. Be the first to join this verified route!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companions.map(comp => (
              <Link
                key={comp.id}
                to={`/travellers/${comp.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition"
              >
                <Avatar src={comp.avatar} name={comp.name} size="sm" isVerified={comp.safetyStatus.idVerified} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{comp.name}</p>
                  <p className="text-[11px] text-slate-500">{comp.homeCity} • {comp.completedTripsCount} rides</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Verified Reviews Section (Requirement 15) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Verified Transit Reviews & Community Feedback
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly available for eligible completed journeys. Fabricated reviews are forbidden.
            </p>
          </div>

          {canReview && (
            <Button
              variant="mint"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setShowReviewModal(true)}
            >
              Write a Review
            </Button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              {trip.status === 'upcoming'
                ? 'Reviews unlock once this journey is completed'
                : 'No reviews logged yet for this completed journey'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              RideAlong safeguards community trust by only permitting peer feedback between confirmed travellers after arrival.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={r.reviewer?.avatar} name={r.reviewer?.name || 'Reviewer'} size="sm" />
                    <div>
                      <p className="font-bold text-slate-900">{r.reviewer?.name || 'Verified Traveller'}</p>
                      <p className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-slate-700 italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="Submit Transit Review"
          maxWidth="md"
        >
          {reviewSuccess ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Review Submitted!</h4>
              <p className="text-xs text-slate-500">Thank you for strengthening community safety and trust.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
                <strong>Authentic Review Policy:</strong> Your rating directly reflects your experience on this completed corridor with your travel partner.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transit Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg transition ${
                        rating >= star ? 'text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-500' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Companion Attributes</label>
                <div className="flex flex-wrap gap-2">
                  {reviewTagOptions.map(tag => {
                    const sel = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleReviewTag(tag)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          sel ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tag} {sel && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback & Notes</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Share details on communication, station meeting punctuality, and route coordination..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingReview}>
                  Submit Authentic Review
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Connect Modal */}
      {showConnectModal && trip.creator && (
        <ConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          targetTraveller={trip.creator}
          trip={trip}
          onSend={sendRequest}
        />
      )}

      {/* Share Itinerary Modal */}
      {showShareModal && currentUser && (
        <TripShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          trip={trip}
          currentUser={currentUser}
        />
      )}

      {/* Score Breakdown Modal */}
      {showScoreModal && scoreBreakdown && trip.creator && (
        <ScoreBreakdownModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          score={scoreBreakdown}
          traveller={trip.creator}
        />
      )}
    </div>
  );
};
