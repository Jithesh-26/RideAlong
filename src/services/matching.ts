import { Traveller, Trip, ScoreBreakdown, SafeMatchResult } from '../types';

export const COMPATIBILITY_DISCLAIMER =
  'Compatibility scores reflect schedule and preference alignment only. They are not a background check, identity verification, or a safety guarantee.';

export function calculateCompatibilityScore(
  user: Traveller,
  targetTraveller: Traveller,
  userTrip?: Partial<Trip>,
  targetTrip?: Trip
): ScoreBreakdown {
  // 1. ROUTE & SCHEDULE (max 40)
  let routeScheduleScore = 0;
  let routeDetails = 'Route alignment evaluated.';

  if (userTrip && targetTrip) {
    const originMatch =
      userTrip.origin?.trim().toLowerCase() === targetTrip.origin?.trim().toLowerCase();
    const destMatch =
      userTrip.destination?.trim().toLowerCase() === targetTrip.destination?.trim().toLowerCase();
    const stopoverMatch =
      targetTrip.stops?.some(s => s.toLowerCase() === userTrip.destination?.toLowerCase()) ||
      userTrip.stops?.some(s => s.toLowerCase() === targetTrip.destination?.toLowerCase());

    if (originMatch && destMatch) {
      routeScheduleScore += 25;
      routeDetails = `Exact route match from ${targetTrip.origin} to ${targetTrip.destination}.`;
    } else if (stopoverMatch) {
      routeScheduleScore += 16;
      routeDetails = `Interlocking stopover route connection between ${targetTrip.origin} and ${targetTrip.destination}.`;
    } else if (originMatch) {
      routeScheduleScore += 12;
      routeDetails = `Shared departure point: ${targetTrip.origin}.`;
    } else {
      routeScheduleScore += 6;
      routeDetails = `Nearby corridor travel.`;
    }

    // Schedule / Date match
    if (userTrip.date && targetTrip.date) {
      if (userTrip.date === targetTrip.date) {
        routeScheduleScore += 10;
        routeDetails += ' Same departure date.';
      } else {
        const d1 = new Date(userTrip.date).getTime();
        const d2 = new Date(targetTrip.date).getTime();
        const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          routeScheduleScore += 6;
          routeDetails += ' Departures within 24 hours of each other.';
        } else if (diffDays <= 3) {
          routeScheduleScore += 3;
          routeDetails += ' Departures within same week window.';
        }
      }
    } else {
      routeScheduleScore += 5;
    }

    // Transport Mode match
    if (userTrip.transportMode && targetTrip.transportMode) {
      if (userTrip.transportMode === targetTrip.transportMode) {
        routeScheduleScore += 5;
        routeDetails += ` Both traveling via ${targetTrip.transportMode}.`;
      } else if (
        targetTraveller.preferences.preferredModes.includes(userTrip.transportMode) ||
        user.preferences.preferredModes.includes(targetTrip.transportMode)
      ) {
        routeScheduleScore += 3;
        routeDetails += ` Flexible mode preference match.`;
      }
    } else {
      routeScheduleScore += 3;
    }
  } else {
    // General corridor compatibility based on home city & common routes
    if (user.homeCity.toLowerCase() === targetTraveller.homeCity.toLowerCase()) {
      routeScheduleScore = 28;
      routeDetails = `Same home hub (${user.homeCity}) with shared travel corridors.`;
    } else {
      routeScheduleScore = 20;
      routeDetails = `Regional travel corridor alignment.`;
    }
  }

  // 2. TRAVEL PREFERENCES (max 25)
  let preferencesScore = 0;
  const prefNotes: string[] = [];

  // Pace (7 pts)
  if (user.preferences.pace === targetTraveller.preferences.pace) {
    preferencesScore += 7;
    prefNotes.push(`Identical pace: ${user.preferences.pace}`);
  } else {
    preferencesScore += 4; // adjacent pace
    prefNotes.push(`Compatible pace`);
  }

  // Budget Tier (6 pts)
  if (user.preferences.budgetTier === targetTraveller.preferences.budgetTier) {
    preferencesScore += 6;
    prefNotes.push(`Matched budget: ${user.preferences.budgetTier}`);
  } else if (
    user.preferences.budgetTier === 'flexible' ||
    targetTraveller.preferences.budgetTier === 'flexible'
  ) {
    preferencesScore += 5;
    prefNotes.push('Flexible budget alignment');
  } else {
    preferencesScore += 2;
  }

  // Schedule Type (6 pts)
  if (user.preferences.scheduleType === targetTraveller.preferences.scheduleType) {
    preferencesScore += 6;
    prefNotes.push(`Schedule style: ${user.preferences.scheduleType}`);
  } else if (
    user.preferences.scheduleType === 'flexible' ||
    targetTraveller.preferences.scheduleType === 'flexible'
  ) {
    preferencesScore += 4;
    prefNotes.push('Adaptable timing preference');
  } else {
    preferencesScore += 2;
  }

  // Communication / Safety priorities (6 pts)
  const sharedSafety = user.preferences.safetyPriorities.filter(s =>
    targetTraveller.preferences.safetyPriorities.includes(s)
  );
  if (sharedSafety.length >= 2) {
    preferencesScore += 6;
    prefNotes.push('High mutual safety protocol alignment');
  } else if (sharedSafety.length === 1) {
    preferencesScore += 4;
    prefNotes.push('Key shared safety priority');
  } else {
    preferencesScore += 3;
  }

  // 3. SHARED INTERESTS (max 15)
  const sharedInterests = user.interests.filter(item =>
    targetTraveller.interests.some(t => t.toLowerCase() === item.toLowerCase())
  );
  let interestsScore = 0;
  if (sharedInterests.length >= 3) {
    interestsScore = 15;
  } else if (sharedInterests.length === 2) {
    interestsScore = 11;
  } else if (sharedInterests.length === 1) {
    interestsScore = 7;
  } else {
    interestsScore = 3;
  }

  // 4. LANGUAGES (max 10)
  const sharedLanguages = user.languages.filter(lang =>
    targetTraveller.languages.some(l => l.toLowerCase() === lang.toLowerCase())
  );
  let languagesScore = 0;
  if (sharedLanguages.length >= 2) {
    languagesScore = 10;
  } else if (sharedLanguages.length === 1) {
    languagesScore = 8;
  } else {
    languagesScore = 3;
  }

  // 5. GROUP SIZE & COMPANION COUNT (max 10)
  let groupSizeScore = 8;
  let groupSizeDetails = 'Optimal 1:1 or small cohort match (2-3 travellers).';
  if (targetTrip) {
    if (targetTrip.neededCompanions === 1) {
      groupSizeScore = 10;
      groupSizeDetails = 'Looking for 1 travel companion.';
    } else if (targetTrip.neededCompanions <= 3) {
      groupSizeScore = 9;
      groupSizeDetails = `Seeking small verified cohort of ${targetTrip.neededCompanions} companions.`;
    } else {
      groupSizeScore = 7;
      groupSizeDetails = `Group journey for ${targetTrip.neededCompanions} companions.`;
    }
  }

  const totalScore = Math.min(
    100,
    Math.round(
      routeScheduleScore + preferencesScore + interestsScore + languagesScore + groupSizeScore
    )
  );

  return {
    routeScheduleScore,
    preferencesScore,
    interestsScore,
    languagesScore,
    groupSizeScore,
    totalScore,
    routeMatchDetails: routeDetails,
    preferencesMatchDetails: prefNotes.join(' • '),
    sharedInterests,
    sharedLanguages,
    groupSizeDetails,
    disclaimer: COMPATIBILITY_DISCLAIMER,
  };
}

export function rankMatches(
  currentUser: Traveller,
  travellers: Traveller[],
  trips: Trip[],
  searchParams?: {
    origin?: string;
    destination?: string;
    date?: string;
    transportMode?: string;
    departureTimeWindow?: string;
  }
): SafeMatchResult[] {
  const results: SafeMatchResult[] = [];

  for (const traveller of travellers) {
    if (traveller.id === currentUser.id) continue;

    // Find any trip created by this traveller matching search or upcoming
    const travellerTrips = trips.filter(
      t => t.creatorId === traveller.id && t.status === 'upcoming'
    );

    if (travellerTrips.length > 0) {
      for (const trip of travellerTrips) {
        // If search origin or destination is specified, filter or weight
        if (searchParams?.origin && searchParams.origin.trim() !== '') {
          const originMatch = trip.origin
            .toLowerCase()
            .includes(searchParams.origin.toLowerCase().trim());
          if (!originMatch) continue;
        }

        if (searchParams?.destination && searchParams.destination.trim() !== '') {
          const destMatch =
            trip.destination.toLowerCase().includes(searchParams.destination.toLowerCase().trim()) ||
            trip.stops.some(s =>
              s.toLowerCase().includes(searchParams.destination!.toLowerCase().trim())
            );
          if (!destMatch) continue;
        }

        if (
          searchParams?.transportMode &&
          searchParams.transportMode !== 'all' &&
          trip.transportMode !== searchParams.transportMode
        ) {
          continue;
        }

        const score = calculateCompatibilityScore(
          currentUser,
          traveller,
          {
            origin: searchParams?.origin,
            destination: searchParams?.destination,
            date: searchParams?.date,
            transportMode: searchParams?.transportMode as any,
          },
          trip
        );

        results.push({
          traveller,
          trip,
          score,
        });
      }
    } else {
      // General companion match without a scheduled trip
      if (!searchParams?.origin && !searchParams?.destination) {
        const score = calculateCompatibilityScore(currentUser, traveller);
        results.push({
          traveller,
          score,
        });
      }
    }
  }

  // Sort by highest total score first
  return results.sort((a, b) => b.score.totalScore - a.score.totalScore);
}
