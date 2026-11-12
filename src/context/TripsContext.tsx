import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trip, TripSearchParams } from '../types';
import { api } from '../services/api';

interface TripsContextType {
  trips: Trip[];
  isLoading: boolean;
  refreshTrips: () => Promise<void>;
  searchTrips: (params?: TripSearchParams) => Promise<Trip[]>;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'confirmedCompanions' | 'status'>) => Promise<Trip>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<Trip>;
  cancelTrip: (id: string) => Promise<boolean>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  const searchTrips = async (params?: TripSearchParams): Promise<Trip[]> => {
    return await api.getTrips(params);
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'confirmedCompanions' | 'status'>): Promise<Trip> => {
    const created = await api.createTrip(tripData);
    await refreshTrips();
    return created;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>): Promise<Trip> => {
    const updated = await api.updateTrip(id, updates);
    await refreshTrips();
    return updated;
  };

  const cancelTrip = async (id: string): Promise<boolean> => {
    const success = await api.cancelTrip(id);
    if (success) {
      await refreshTrips();
    }
    return success;
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        isLoading,
        refreshTrips,
        searchTrips,
        createTrip,
        updateTrip,
        cancelTrip,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
