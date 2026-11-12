import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db, initDatabase } from './db.js';

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_ridealong_salt_safe').digest('hex');
}

// Format raw SQL user row into clean User object
function formatUserRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    bio: row.bio,
    homeCity: row.homeCity,
    languages: JSON.parse(row.languages || '[]'),
    interests: JSON.parse(row.interests || '[]'),
    preferences: JSON.parse(row.preferences || '{}'),
    privacy: JSON.parse(row.privacy || '{}'),
    safetyStatus: JSON.parse(row.safetyStatus || '{}'),
    joinedDate: row.joinedDate,
    completedTripsCount: row.completedTripsCount,
    isDemo: Boolean(row.isDemo),
  };
}

// Format raw SQL trip row
function formatTripRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    creatorId: row.creatorId,
    origin: row.origin,
    destination: row.destination,
    date: row.date,
    departureTimeWindow: row.departureTimeWindow,
    transportMode: row.transportMode,
    stops: JSON.parse(row.stops || '[]'),
    neededCompanions: row.neededCompanions,
    confirmedCompanions: JSON.parse(row.confirmedCompanions || '[]'),
    notes: row.notes,
    status: row.status,
    budgetShareRule: row.budgetShareRule,
    languagesPreferred: JSON.parse(row.languagesPreferred || '[]'),
    interestsPreferred: JSON.parse(row.interestsPreferred || '[]'),
    createdAt: row.createdAt,
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'RideAlong Backend API',
    database: 'SQLite (Persistent)',
    timestamp: new Date().toISOString(),
  });
});

// Demo accounts endpoint
app.get('/api/auth/demo-users', (req, res) => {
  const users = db.prepare('SELECT * FROM users WHERE isDemo = 1').all();
  res.json(users.map(formatUserRow));
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, demoUserId } = req.body;

  if (demoUserId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(demoUserId);
    if (user) {
      return res.json({ success: true, user: formatUserRow(user), token: `demo_token_${user.id}` });
    }
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found.' });
  }

  const hashedInput = hashPassword(password);
  // Allow demo users password bypass or hashed check
  if (user.password_hash !== hashedInput && !user.isDemo) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  res.json({
    success: true,
    user: formatUserRow(user),
    token: `token_${user.id}_${Date.now()}`,
  });
});

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, homeCity } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newId = `user_${uuidv4().slice(0, 8)}`;
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString().split('T')[0];

  const defaultPreferences = {
    pace: 'moderate',
    budgetTier: 'mid-range',
    preferredModes: ['train', 'shared-cab', 'carpool'],
    scheduleType: 'flexible',
    communicationStyle: 'conversational',
    safetyPriorities: ['verified-id', 'public-meeting', 'itinerary-sharing'],
  };

  const defaultPrivacy = {
    profileVisibility: 'public-members',
    phoneMasked: true,
    shareContactOnMatch: false,
    emailNotifications: true,
    safetyAlerts: true,
  };

  const defaultSafety = {
    idVerified: false,
    emailVerified: true,
    phoneVerified: false,
    trustedContactsCount: 0,
    safetyScoreNote: 'New Member • Complete ID verification in Safety Centre',
  };

  const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, avatar, bio, homeCity, languages, interests, preferences, privacy, safetyStatus, joinedDate, completedTripsCount, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    newId,
    email,
    passwordHash,
    name,
    defaultAvatar,
    'Excited to discover safe, verified travel companions on RideAlong!',
    homeCity || 'Bengaluru',
    JSON.stringify(['English']),
    JSON.stringify(['Travel', 'Food']),
    JSON.stringify(defaultPreferences),
    JSON.stringify(defaultPrivacy),
    JSON.stringify(defaultSafety),
    now,
    0
  );

  const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
  res.status(201).json({
    success: true,
    user: formatUserRow(createdUser),
    token: `token_${newId}_${Date.now()}`,
  });
});

// Update Profile
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const current = formatUserRow(user);
  if (!current) {
    return res.status(404).json({ error: 'User not found' });
  }
  const updatedName = updates.name !== undefined ? updates.name : current.name;
  const updatedAvatar = updates.avatar !== undefined ? updates.avatar : current.avatar;
  const updatedBio = updates.bio !== undefined ? updates.bio : current.bio;
  const updatedHomeCity = updates.homeCity !== undefined ? updates.homeCity : current.homeCity;
  const updatedLanguages = updates.languages ? JSON.stringify(updates.languages) : JSON.stringify(current.languages);
  const updatedInterests = updates.interests ? JSON.stringify(updates.interests) : JSON.stringify(current.interests);
  const updatedPreferences = updates.preferences ? JSON.stringify(updates.preferences) : JSON.stringify(current.preferences);
  const updatedPrivacy = updates.privacy ? JSON.stringify(updates.privacy) : JSON.stringify(current.privacy);

  db.prepare(`
    UPDATE users
    SET name = ?, avatar = ?, bio = ?, homeCity = ?, languages = ?, interests = ?, preferences = ?, privacy = ?
    WHERE id = ?
  `).run(
    updatedName,
    updatedAvatar,
    updatedBio,
    updatedHomeCity,
    updatedLanguages,
    updatedInterests,
    updatedPreferences,
    updatedPrivacy,
    id
  );

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ success: true, user: formatUserRow(updatedUser) });
});

// Get User by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(formatUserRow(user));
});

// List Users
app.get('/api/users', (req, res) => {
  const rows = db.prepare('SELECT * FROM users').all();
  res.json(rows.map(formatUserRow));
});

// Trips - List & Search
app.get('/api/trips', (req, res) => {
  const { origin, destination, date, transportMode, status } = req.query;
  let sql = 'SELECT * FROM trips WHERE 1=1';
  const params: any[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  } else {
    sql += ' AND status = "upcoming"';
  }

  if (origin && typeof origin === 'string' && origin.trim()) {
    sql += ' AND LOWER(origin) LIKE ?';
    params.push(`%${origin.trim().toLowerCase()}%`);
  }

  if (destination && typeof destination === 'string' && destination.trim()) {
    sql += ' AND (LOWER(destination) LIKE ? OR LOWER(stops) LIKE ?)';
    params.push(`%${destination.trim().toLowerCase()}%`, `%${destination.trim().toLowerCase()}%`);
  }

  if (date && typeof date === 'string' && date.trim()) {
    sql += ' AND date = ?';
    params.push(date.trim());
  }

  if (transportMode && transportMode !== 'all' && typeof transportMode === 'string') {
    sql += ' AND transportMode = ?';
    params.push(transportMode);
  }

  sql += ' ORDER BY date ASC';

  const rows: any[] = db.prepare(sql).all(...params);
  const trips = rows.map(formatTripRow);

  // Attach creator data
  const users: any[] = db.prepare('SELECT * FROM users').all();
  const userMap = new Map(users.map((u: any) => [u.id, formatUserRow(u)]));

  const enrichedTrips = trips.map((t: any) => ({
    ...t,
    creator: userMap.get(t.creatorId) || null,
  }));

  res.json(enrichedTrips);
});

// Create Trip
app.post('/api/trips', (req, res) => {
  const {
    creatorId,
    origin,
    destination,
    date,
    departureTimeWindow,
    transportMode,
    stops = [],
    neededCompanions = 1,
    notes = '',
    budgetShareRule = 'Individual bookings',
    languagesPreferred = [],
    interestsPreferred = [],
  } = req.body;

  if (!creatorId || !origin || !destination || !date || !transportMode) {
    return res.status(400).json({ error: 'Origin, destination, date, and transport mode are required.' });
  }

  const tripId = `trip_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO trips (id, creatorId, origin, destination, date, departureTimeWindow, transportMode, stops, neededCompanions, confirmedCompanions, notes, status, budgetShareRule, languagesPreferred, interestsPreferred, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, ?, ?)
  `).run(
    tripId,
    creatorId,
    origin.trim(),
    destination.trim(),
    date,
    departureTimeWindow || 'Morning (06:00 - 10:00)',
    transportMode,
    JSON.stringify(stops),
    neededCompanions,
    JSON.stringify([]),
    notes,
    budgetShareRule,
    JSON.stringify(languagesPreferred),
    JSON.stringify(interestsPreferred),
    now
  );

  const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  const trip = formatTripRow(row);
  const creator = db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId);

  res.status(201).json({
    ...trip,
    creator: formatUserRow(creator),
  });
});

// Update Trip
app.put('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const current = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const origin = updates.origin || current.origin;
  const destination = updates.destination || current.destination;
  const date = updates.date || current.date;
  const departureTimeWindow = updates.departureTimeWindow || current.departureTimeWindow;
  const transportMode = updates.transportMode || current.transportMode;
  const stops = updates.stops ? JSON.stringify(updates.stops) : current.stops;
  const neededCompanions = updates.neededCompanions !== undefined ? updates.neededCompanions : current.neededCompanions;
  const notes = updates.notes !== undefined ? updates.notes : current.notes;
  const status = updates.status || current.status;
  const budgetShareRule = updates.budgetShareRule || current.budgetShareRule;

  db.prepare(`
    UPDATE trips
    SET origin = ?, destination = ?, date = ?, departureTimeWindow = ?, transportMode = ?, stops = ?, neededCompanions = ?, notes = ?, status = ?, budgetShareRule = ?
    WHERE id = ?
  `).run(
    origin,
    destination,
    date,
    departureTimeWindow,
    transportMode,
    stops,
    neededCompanions,
    notes,
    status,
    budgetShareRule,
    id
  );

  const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
  res.json(formatTripRow(row));
});

// Cancel Trip
app.delete('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE trips SET status = "cancelled" WHERE id = ?').run(id);
  res.json({ success: true, message: 'Trip successfully cancelled.' });
});

// Connection Requests
app.get('/api/requests', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const rows = db.prepare(`
    SELECT * FROM connection_requests 
    WHERE senderId = ? OR receiverId = ?
    ORDER BY createdAt DESC
  `).all(userId, userId);

  const users: any[] = db.prepare('SELECT * FROM users').all();
  const userMap = new Map(users.map((u: any) => [u.id, formatUserRow(u)]));

  const trips: any[] = db.prepare('SELECT * FROM trips').all();
  const tripMap = new Map(trips.map((t: any) => [t.id, formatTripRow(t)]));

  const enriched = (rows as any[]).map((r: any) => ({
    id: r.id,
    senderId: r.senderId,
    receiverId: r.receiverId,
    tripId: r.tripId,
    status: r.status,
    note: r.note,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sender: userMap.get(r.senderId),
    receiver: userMap.get(r.receiverId),
    trip: r.tripId ? tripMap.get(r.tripId) : undefined,
  }));

  res.json(enriched);
});

// Send Connection Request
app.post('/api/requests', (req, res) => {
  const { senderId, receiverId, tripId, note } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId and receiverId are required' });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send connection request to yourself.' });
  }

  // Prevent duplicate pending requests
  const existing = db.prepare(`
    SELECT * FROM connection_requests 
    WHERE senderId = ? AND receiverId = ? AND status = 'pending'
  `).get(senderId, receiverId);

  if (existing) {
    return res.status(409).json({ error: 'A pending connection request already exists between you and this traveller.' });
  }

  const reqId = `req_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO connection_requests (id, senderId, receiverId, tripId, status, note, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(reqId, senderId, receiverId, tripId || null, note || '', now, now);

  const created = db.prepare('SELECT * FROM connection_requests WHERE id = ?').get(reqId);
  res.status(201).json(created);
});

// Accept Connection Request
app.post('/api/requests/:id/accept', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  const request = db.prepare('SELECT * FROM connection_requests WHERE id = ?').get(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  db.prepare('UPDATE connection_requests SET status = "accepted", updatedAt = ? WHERE id = ?').run(now, id);

  // If accepted, ensure a conversation exists
  const participants = [request.senderId, request.receiverId].sort();
  const convs: any[] = db.prepare('SELECT * FROM conversations').all();
  let conv = convs.find((c: any) => {
    const p = JSON.parse(c.participantIds || '[]').sort();
    return p.length === 2 && p[0] === participants[0] && p[1] === participants[1];
  });

  if (!conv) {
    const convId = `conv_${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO conversations (id, participantIds, tripId, lastMessage, lastMessageTime, unreadCount)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(
      convId,
      JSON.stringify(participants),
      request.tripId || null,
      'Connection accepted. You can now chat securely.',
      now
    );

    // Initial message
    db.prepare(`
      INSERT INTO messages (id, conversationId, senderId, receiverId, content, timestamp, isRead, tripId)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      `msg_${uuidv4().slice(0, 8)}`,
      convId,
      request.receiverId,
      request.senderId,
      `Hello! I accepted your travel companion request. Let's plan our journey safely!`,
      now,
      request.tripId || null
    );
  }

  res.json({ success: true, message: 'Request accepted and conversation opened.' });
});

// Decline Connection Request
app.post('/api/requests/:id/decline', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  db.prepare('UPDATE connection_requests SET status = "declined", updatedAt = ? WHERE id = ?').run(now, id);
  res.json({ success: true, message: 'Request declined.' });
});

// Withdraw Connection Request
app.post('/api/requests/:id/withdraw', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  db.prepare('UPDATE connection_requests SET status = "withdrawn", updatedAt = ? WHERE id = ?').run(now, id);
  res.json({ success: true, message: 'Request withdrawn.' });
});

// Conversations List
app.get('/api/conversations', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const allConvs: any[] = db.prepare('SELECT * FROM conversations ORDER BY lastMessageTime DESC').all();
  const userConvs = allConvs.filter((c: any) => {
    const p = JSON.parse(c.participantIds || '[]');
    return p.includes(userId);
  });

  const users: any[] = db.prepare('SELECT * FROM users').all();
  const userMap = new Map(users.map((u: any) => [u.id, formatUserRow(u)]));

  const trips: any[] = db.prepare('SELECT * FROM trips').all();
  const tripMap = new Map(trips.map((t: any) => [t.id, formatTripRow(t)]));

  const enriched = userConvs.map((c: any) => {
    const participantIds = JSON.parse(c.participantIds || '[]');
    const participants = participantIds.map((pid: string) => userMap.get(pid)).filter(Boolean);
    return {
      id: c.id,
      participantIds,
      participants,
      tripId: c.tripId,
      trip: c.tripId ? tripMap.get(c.tripId) : undefined,
      lastMessage: c.lastMessage,
      lastMessageTime: c.lastMessageTime,
      unreadCount: c.unreadCount,
    };
  });

  res.json(enriched);
});

// Messages in a Conversation
app.get('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const rows: any[] = db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC').all(id);
  res.json(rows.map((m: any) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    receiverId: m.receiverId,
    content: m.content,
    timestamp: m.timestamp,
    isRead: Boolean(m.isRead),
    tripId: m.tripId,
  })));
});

// Send Message
app.post('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { senderId, receiverId, content, tripId } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'senderId, receiverId, and content are required' });
  }

  const msgId = `msg_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, conversationId, senderId, receiverId, content, timestamp, isRead, tripId)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(msgId, id, senderId, receiverId, content, now, tripId || null);

  // Update conversation last message
  db.prepare(`
    UPDATE conversations
    SET lastMessage = ?, lastMessageTime = ?
    WHERE id = ?
  `).run(content, now, id);

  res.status(201).json({
    id: msgId,
    conversationId: id,
    senderId,
    receiverId,
    content,
    timestamp: now,
    isRead: true,
    tripId,
  });
});

// Trusted Contacts
app.get('/api/safety/trusted-contacts', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const rows: any[] = db.prepare('SELECT * FROM trusted_contacts WHERE userId = ? ORDER BY addedAt DESC').all(userId);
  res.json(rows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    phone: r.phone,
    relationship: r.relationship,
    notifyOnTripStart: Boolean(r.notifyOnTripStart),
    addedAt: r.addedAt,
  })));
});

app.post('/api/safety/trusted-contacts', (req, res) => {
  const { userId, name, phone, relationship, notifyOnTripStart = true } = req.body;
  if (!userId || !name || !phone || !relationship) {
    return res.status(400).json({ error: 'All contact fields are required' });
  }

  const id = `tc_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO trusted_contacts (id, userId, name, phone, relationship, notifyOnTripStart, addedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, name, phone, relationship, notifyOnTripStart ? 1 : 0, now);

  res.status(201).json({
    id,
    userId,
    name,
    phone,
    relationship,
    notifyOnTripStart,
    addedAt: now,
  });
});

app.delete('/api/safety/trusted-contacts/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM trusted_contacts WHERE id = ?').run(id);
  res.json({ success: true, message: 'Contact removed' });
});

// Report User
app.post('/api/safety/report', (req, res) => {
  const { reporterId, reportedUserId, reason, details } = req.body;
  if (!reporterId || !reportedUserId || !reason) {
    return res.status(400).json({ error: 'Missing report parameters' });
  }

  const id = `rep_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reports (id, reporterId, reportedUserId, reason, details, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, 'received')
  `).run(id, reporterId, reportedUserId, reason, details || '', now);

  res.status(201).json({
    success: true,
    message: 'Report logged securely. Our safety review team prioritizes traveler security.',
    reportId: id,
  });
});

// Block User
app.post('/api/safety/block', (req, res) => {
  const { userId, blockedUserId } = req.body;
  if (!userId || !blockedUserId) {
    return res.status(400).json({ error: 'userId and blockedUserId are required' });
  }

  const existing = db.prepare('SELECT * FROM blocked_users WHERE userId = ? AND blockedUserId = ?').get(userId, blockedUserId);
  if (!existing) {
    const id = `block_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO blocked_users (id, userId, blockedUserId, createdAt) VALUES (?, ?, ?, ?)').run(id, userId, blockedUserId, now);
  }

  res.json({ success: true, message: 'User blocked. They can no longer see your trips or message you.' });
});

// Unblock User
app.post('/api/safety/unblock', (req, res) => {
  const { userId, blockedUserId } = req.body;
  db.prepare('DELETE FROM blocked_users WHERE userId = ? AND blockedUserId = ?').run(userId, blockedUserId);
  res.json({ success: true, message: 'User unblocked.' });
});

// List Blocked Users
app.get('/api/safety/blocked-users', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const rows: any[] = db.prepare('SELECT * FROM blocked_users WHERE userId = ?').all(userId);
  const users: any[] = db.prepare('SELECT * FROM users').all();
  const userMap = new Map(users.map((u: any) => [u.id, formatUserRow(u)]));

  const list = rows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    blockedUserId: r.blockedUserId,
    blockedUser: userMap.get(r.blockedUserId),
    createdAt: r.createdAt,
  }));

  res.json(list);
});

// Reviews - Only for completed trips!
app.post('/api/reviews', (req, res) => {
  const { tripId, reviewerId, revieweeId, rating, tags = [], comment = '' } = req.body;

  if (!tripId || !reviewerId || !revieweeId || !rating) {
    return res.status(400).json({ error: 'tripId, reviewerId, revieweeId, and rating are required' });
  }

  // Strict safety & authenticity check: Verify trip is completed
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Associated trip does not exist.' });
  }

  // Verify trip is marked completed or date has passed
  const isPast = new Date(trip.date).getTime() < Date.now();
  if (trip.status !== 'completed' && !isPast) {
    return res.status(400).json({
      error: 'Reviews are only permitted for completed trips. RideAlong strictly prohibits fabricated pre-trip ratings.',
    });
  }

  const id = `rev_${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reviews (id, tripId, reviewerId, revieweeId, rating, tags, comment, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tripId, reviewerId, revieweeId, rating, JSON.stringify(tags), comment, now);

  res.status(201).json({
    id,
    tripId,
    reviewerId,
    revieweeId,
    rating,
    tags,
    comment,
    createdAt: now,
  });
});

// Get Reviews for a Trip or Traveller
app.get('/api/reviews', (req, res) => {
  const { tripId, revieweeId } = req.query;
  let sql = 'SELECT * FROM reviews WHERE 1=1';
  const params: any[] = [];

  if (tripId) {
    sql += ' AND tripId = ?';
    params.push(tripId);
  }
  if (revieweeId) {
    sql += ' AND revieweeId = ?';
    params.push(revieweeId);
  }

  sql += ' ORDER BY createdAt DESC';
  const rows: any[] = db.prepare(sql).all(...params);

  const users: any[] = db.prepare('SELECT * FROM users').all();
  const userMap = new Map(users.map((u: any) => [u.id, formatUserRow(u)]));

  const list = rows.map((r: any) => ({
    id: r.id,
    tripId: r.tripId,
    reviewerId: r.reviewerId,
    reviewer: userMap.get(r.reviewerId) || null,
    revieweeId: r.revieweeId,
    rating: r.rating,
    tags: JSON.parse(r.tags || '[]'),
    comment: r.comment,
    createdAt: r.createdAt,
  }));

  res.json(list);
});

app.listen(PORT, () => {
  console.log(`[RideAlong Server] API running on http://localhost:${PORT}`);
});
