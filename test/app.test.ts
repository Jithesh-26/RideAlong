import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCompatibilityScore, rankMatches } from '../src/services/matching.js';
import { DEMO_USERS, INITIAL_TRIPS, POPULAR_INDIAN_ROUTES } from '../src/services/sampleData.js';
import { Trip, Traveller } from '../src/types/index.js';

describe('RideAlong Matching & Compatibility Engine', () => {
  it('should calculate accurate 5-factor compatibility scores within max 100', () => {
    const user1 = DEMO_USERS[0]; // Ananya Sharma (Chennai)
    const user2 = DEMO_USERS[1]; // Rohan Verma (Bengaluru)

    const trip1: Trip = INITIAL_TRIPS[0]; // Chennai to Bengaluru
    const trip2: Trip = INITIAL_TRIPS[1]; // Chennai to Bengaluru (Rohan)

    const score = calculateCompatibilityScore(user1, user2, trip1, trip2);

    assert.ok(score.totalScore > 0 && score.totalScore <= 100, 'Score must be between 1 and 100');
    assert.ok(score.routeScheduleScore <= 40, 'Route & Schedule score must not exceed 40');
    assert.ok(score.preferencesScore <= 25, 'Preferences score must not exceed 25');
    assert.ok(score.interestsScore <= 15, 'Interests score must not exceed 15');
    assert.ok(score.languagesScore <= 10, 'Languages score must not exceed 10');
    assert.ok(score.groupSizeScore <= 10, 'Group size score must not exceed 10');

    // Mathematical sum consistency check
    const sum = score.routeScheduleScore + score.preferencesScore + score.interestsScore + score.languagesScore + score.groupSizeScore;
    assert.strictEqual(score.totalScore, sum, 'Total score must equal sum of component breakdown');

    // Disclaimer check (Safety guarantee prevention)
    assert.ok(score.disclaimer.includes('not a background check'), 'Must include safety disclaimer');
    assert.ok(score.disclaimer.includes('safety guarantee'), 'Must explicitly mention safety guarantee limitation');
  });

  it('should rank matches in descending order of compatibility', () => {
    const currentUser = DEMO_USERS[0];
    const ranked = rankMatches(currentUser, DEMO_USERS, INITIAL_TRIPS);

    assert.ok(ranked.length > 0, 'Ranked matches should not be empty');
    for (let i = 0; i < ranked.length - 1; i++) {
      assert.ok(
        ranked[i].score.totalScore >= ranked[i + 1].score.totalScore,
        'Matches must be sorted in descending order of total score'
      );
    }
  });

  it('should filter matches by route corridor correctly', () => {
    const currentUser = DEMO_USERS[0]; // Ananya (Chennai)
    // Priya has a trip to Chennai
    const ranked = rankMatches(currentUser, DEMO_USERS, INITIAL_TRIPS, {
      destination: 'Chennai',
    });

    assert.ok(ranked.length > 0, 'Should find travellers arriving in Chennai');
    const priyaMatch = ranked.find(m => m.traveller.id === 'user_priya');
    assert.ok(priyaMatch, 'Priya travelling from Madurai to Chennai should be found');
  });

  it('should exclude the current user from matching pool', () => {
    const currentUser = DEMO_USERS[0];
    const ranked = rankMatches(currentUser, DEMO_USERS, INITIAL_TRIPS);
    const selfFound = ranked.find(m => m.traveller.id === currentUser.id);
    assert.strictEqual(selfFound, undefined, 'Current user must not appear in own match list');
  });
});

describe('RideAlong Sample Data & Indian Routes Integrity', () => {
  it('should provide verified Indian corridors', () => {
    const chennaiBlr = POPULAR_INDIAN_ROUTES.find(
      r => r.origin === 'Chennai' && r.destination === 'Bengaluru'
    );
    assert.ok(chennaiBlr, 'Chennai to Bengaluru corridor must exist');

    const maduraiChennai = POPULAR_INDIAN_ROUTES.find(
      r => r.origin === 'Madurai' && r.destination === 'Chennai'
    );
    assert.ok(maduraiChennai, 'Madurai to Chennai corridor must exist');

    const coimbatoreBlr = POPULAR_INDIAN_ROUTES.find(
      r => r.origin === 'Coimbatore' && r.destination === 'Bengaluru'
    );
    assert.ok(coimbatoreBlr, 'Coimbatore to Bengaluru corridor must exist');
  });

  it('should have properly structured demo travellers with safety status', () => {
    assert.ok(DEMO_USERS.length >= 4, 'Should provide at least 4 diverse demo travellers');
    for (const traveller of DEMO_USERS) {
      assert.ok(traveller.id, 'Traveller must have an id');
      assert.ok(traveller.name, 'Traveller must have a name');
      assert.ok(traveller.email, 'Traveller must have an email');
      assert.ok(traveller.languages.length > 0, 'Traveller must speak at least 1 language');
      assert.ok(traveller.interests.length > 0, 'Traveller must have interests');
      assert.ok(traveller.safetyStatus, 'Traveller must have safety status');
      assert.ok(traveller.privacy, 'Traveller must have privacy settings');
    }
  });

  it('should have initial trips with confirmed companions and routes', () => {
    assert.ok(INITIAL_TRIPS.length >= 4, 'Should provide multiple initial trips');
    for (const trip of INITIAL_TRIPS) {
      assert.ok(trip.id, 'Trip must have an ID');
      assert.ok(trip.origin, 'Trip must have an origin');
      assert.ok(trip.destination, 'Trip must have a destination');
      assert.ok(trip.date, 'Trip must have a travel date');
      assert.ok(trip.neededCompanions >= 1, 'Trip must need at least 1 companion');
    }
  });
});
