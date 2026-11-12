import React from 'react';
import { Trip } from '../../types';
import { Calendar, Clock, MapPin, Users, Train, Plane, Car, Bus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

interface TripCardProps {
  trip: Trip;
  onConnect?: (trip: Trip) => void;
  isOwner?: boolean;
  onCancel?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onConnect,
  isOwner = false,
  onCancel,
}) => {
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'train':
        return <Train className="w-3.5 h-3.5" />;
      case 'flight':
        return <Plane className="w-3.5 h-3.5" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5" />;
      default:
        return <Car className="w-3.5 h-3.5" />;
    }
  };

  const statusColors = {
    upcoming: 'teal',
    completed: 'emerald',
    cancelled: 'rose',
  } as const;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={statusColors[trip.status] || 'teal'}
              icon={getTransportIcon(trip.transportMode)}
              className="capitalize font-semibold"
            >
              {trip.transportMode}
            </Badge>

            <span className="text-xs text-slate-500 font-medium">
              • {trip.budgetShareRule}
            </span>
          </div>

          <Badge variant={trip.status === 'upcoming' ? 'mint' : 'slate'} size="sm">
            {trip.status.toUpperCase()}
          </Badge>
        </div>

        {/* Route Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <span>{trip.origin}</span>
            <ArrowRight className="w-4 h-4 text-teal-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span>{trip.destination}</span>
          </div>

          {trip.stops && trip.stops.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Stops: {trip.stops.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Schedule & Cohort Requirements */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-medium text-slate-800">{trip.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{trip.departureTimeWindow}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-slate-200/50">
            <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>
              Seeking <strong className="text-slate-800">{trip.neededCompanions}</strong> co-traveller
              {trip.neededCompanions > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <p className="text-xs text-slate-600 line-clamp-2 italic mb-4">
            "{trip.notes}"
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {trip.creator && (
          <Link
            to={`/travellers/${trip.creator.id}`}
            className="flex items-center gap-2.5 min-w-0 group/creator"
          >
            <Avatar
              src={trip.creator.avatar}
              name={trip.creator.name}
              size="sm"
              isVerified={trip.creator.safetyStatus.idVerified}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 group-hover/creator:text-teal-700 truncate">
                  {trip.creator.name}
                </span>
                {trip.creator.safetyStatus.idVerified && (
                  <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {trip.creator.completedTripsCount} verified trips
              </p>
            </div>
          </Link>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {isOwner ? (
            trip.status === 'upcoming' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                onClick={() => onCancel(trip.id)}
              >
                Cancel
              </Button>
            )
          ) : (
            onConnect && trip.status === 'upcoming' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConnect(trip)}
                className="text-xs font-semibold"
              >
                Connect
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
