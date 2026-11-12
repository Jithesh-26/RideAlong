import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  DEMO_USERS,
  INITIAL_TRIPS,
  INITIAL_REQUESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_TRUSTED_CONTACTS,
} from '../src/services/sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database file in server/ridealong.db
const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'ridealong.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      bio TEXT NOT NULL,
      homeCity TEXT NOT NULL,
      languages TEXT NOT NULL, -- JSON array
      interests TEXT NOT NULL, -- JSON array
      preferences TEXT NOT NULL, -- JSON object
      privacy TEXT NOT NULL, -- JSON object
      safetyStatus TEXT NOT NULL, -- JSON object
      joinedDate TEXT NOT NULL,
      completedTripsCount INTEGER DEFAULT 0,
      isDemo INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      creatorId TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      date TEXT NOT NULL,
      departureTimeWindow TEXT NOT NULL,
      transportMode TEXT NOT NULL,
      stops TEXT NOT NULL, -- JSON array
      neededCompanions INTEGER NOT NULL,
      confirmedCompanions TEXT NOT NULL, -- JSON array
      notes TEXT NOT NULL,
      status TEXT NOT NULL, -- 'upcoming', 'completed', 'cancelled'
      budgetShareRule TEXT NOT NULL,
      languagesPreferred TEXT NOT NULL, -- JSON array
      interestsPreferred TEXT NOT NULL, -- JSON array
      createdAt TEXT NOT NULL,
      FOREIGN KEY (creatorId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS connection_requests (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      tripId TEXT,
      status TEXT NOT NULL, -- 'pending', 'accepted', 'declined', 'withdrawn'
      note TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (receiverId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participantIds TEXT NOT NULL, -- JSON array
      tripId TEXT,
      lastMessage TEXT NOT NULL,
      lastMessageTime TEXT NOT NULL,
      unreadCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      tripId TEXT,
      FOREIGN KEY (conversationId) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT NOT NULL,
      notifyOnTripStart INTEGER DEFAULT 1,
      addedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporterId TEXT NOT NULL,
      reportedUserId TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (reporterId) REFERENCES users(id),
      FOREIGN KEY (reportedUserId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS blocked_users (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      blockedUserId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (blockedUserId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      reviewerId TEXT NOT NULL,
      revieweeId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      tags TEXT NOT NULL, -- JSON array
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id),
      FOREIGN KEY (reviewerId) REFERENCES users(id),
      FOREIGN KEY (revieweeId) REFERENCES users(id)
    );
  `);

  // Seed sample data if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, avatar, bio, homeCity, languages, interests, preferences, privacy, safetyStatus, joinedDate, completedTripsCount, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTrip = db.prepare(`
    INSERT INTO trips (id, creatorId, origin, destination, date, departureTimeWindow, transportMode, stops, neededCompanions, confirmedCompanions, notes, status, budgetShareRule, languagesPreferred, interestsPreferred, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRequest = db.prepare(`
    INSERT INTO connection_requests (id, senderId, receiverId, tripId, status, note, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertConv = db.prepare(`
    INSERT INTO conversations (id, participantIds, tripId, lastMessage, lastMessageTime, unreadCount)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMsg = db.prepare(`
    INSERT INTO messages (id, conversationId, senderId, receiverId, content, timestamp, isRead, tripId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertContact = db.prepare(`
    INSERT INTO trusted_contacts (id, userId, name, phone, relationship, notifyOnTripStart, addedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const dummyPasswordHash = '$2b$10$demo_masked_secure_hash_not_plaintext';

  const seedTx = db.transaction(() => {
    for (const u of DEMO_USERS) {
      insertUser.run(
        u.id,
        u.email,
        dummyPasswordHash,
        u.name,
        u.avatar,
        u.bio,
        u.homeCity,
        JSON.stringify(u.languages),
        JSON.stringify(u.interests),
        JSON.stringify(u.preferences),
        JSON.stringify(u.privacy),
        JSON.stringify(u.safetyStatus),
        u.joinedDate,
        u.completedTripsCount,
        u.isDemo ? 1 : 0
      );
    }

    for (const t of INITIAL_TRIPS) {
      insertTrip.run(
        t.id,
        t.creatorId,
        t.origin,
        t.destination,
        t.date,
        t.departureTimeWindow,
        t.transportMode,
        JSON.stringify(t.stops),
        t.neededCompanions,
        JSON.stringify(t.confirmedCompanions),
        t.notes,
        t.status,
        t.budgetShareRule,
        JSON.stringify(t.languagesPreferred),
        JSON.stringify(t.interestsPreferred),
        t.createdAt
      );
    }

    for (const r of INITIAL_REQUESTS) {
      insertRequest.run(
        r.id,
        r.senderId,
        r.receiverId,
        r.tripId || null,
        r.status,
        r.note,
        r.createdAt,
        r.updatedAt
      );
    }

    for (const c of INITIAL_CONVERSATIONS) {
      insertConv.run(
        c.id,
        JSON.stringify(c.participantIds),
        c.tripId || null,
        c.lastMessage,
        c.lastMessageTime,
        c.unreadCount
      );
    }

    for (const m of INITIAL_MESSAGES) {
      insertMsg.run(
        m.id,
        m.conversationId,
        m.senderId,
        m.receiverId,
        m.content,
        m.timestamp,
        m.isRead ? 1 : 0,
        m.tripId || null
      );
    }

    for (const tc of INITIAL_TRUSTED_CONTACTS) {
      insertContact.run(
        tc.id,
        tc.userId,
        tc.name,
        tc.phone,
        tc.relationship,
        tc.notifyOnTripStart ? 1 : 0,
        tc.addedAt
      );
    }
  });

  seedTx();
  console.log('[RideAlong DB] SQLite database initialized and seeded successfully.');
}
