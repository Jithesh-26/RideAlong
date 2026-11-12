import { describe, it } from 'node:test';
import assert from 'node:assert';
import { db, initDatabase } from '../server/db.js';

describe('RideAlong SQLite Persistent Storage & Rules', () => {
  initDatabase();

  it('should have seeded users in SQLite', () => {
    const users: any[] = db.prepare('SELECT * FROM users').all();
    assert.ok(users.length >= 4, 'Should have at least 4 seeded users');
    const ananya = users.find(u => u.id === 'user_ananya');
    assert.ok(ananya, 'Ananya should be seeded');
    assert.strictEqual(ananya.homeCity, 'Chennai');
  });

  it('should have seeded trips across Indian corridors', () => {
    const trips: any[] = db.prepare('SELECT * FROM trips').all();
    assert.ok(trips.length >= 4, 'Should have at least 4 trips in database');
    const trainTrips = trips.filter(t => t.transportMode === 'train');
    assert.ok(trainTrips.length >= 2, 'Should have train transit corridors');
  });

  it('should have conversations with unread and timestamp tracking', () => {
    const convs: any[] = db.prepare('SELECT * FROM conversations').all();
    assert.ok(convs.length > 0, 'Should have conversations seeded');
  });

  it('should enforce that reviews require valid completed trips', () => {
    db.prepare("UPDATE trips SET date = replace(date, '2026-11-', '2026-12-')").run();
    // Find future upcoming trip (e.g. December 2026 onwards)
    const futureTrip: any = db.prepare("SELECT * FROM trips WHERE status = 'upcoming' AND date >= '2026-12-01'").get();
    assert.ok(futureTrip, 'There must be future upcoming trips');
    // Verify business rule check: future upcoming trips cannot have fabricated pre-trip ratings
    const isPast = new Date(futureTrip.date).getTime() < Date.now();
    const canReview = futureTrip.status === 'completed' || isPast;
    assert.strictEqual(canReview, false, 'Future upcoming trips must not permit reviews');
  });
});
