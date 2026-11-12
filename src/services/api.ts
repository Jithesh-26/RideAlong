import {
  Traveller,
  Trip,
  ConnectionRequest,
  Conversation,
  Message,
  TrustedContact,
  UserReport,
  BlockedUser,
  TripReview,
  TripSearchParams
} from '../types';
import {
  DEMO_USERS,
  INITIAL_TRIPS,
  INITIAL_REQUESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_TRUSTED_CONTACTS
} from './sampleData';

const API_BASE = '/api';

// Local storage keys for resilient fallback
const STORAGE_KEYS = {
  CURRENT_USER: 'ridealong_current_user',
  USERS: 'ridealong_users',
  TRIPS: 'ridealong_trips',
  REQUESTS: 'ridealong_requests',
  CONVERSATIONS: 'ridealong_conversations',
  MESSAGES: 'ridealong_messages',
  CONTACTS: 'ridealong_contacts',
  BLOCKED: 'ridealong_blocked',
  REPORTS: 'ridealong_reports',
  REVIEWS: 'ridealong_reviews',
};

// Initialize fallback storage if empty
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(INITIAL_TRIPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_TRUSTED_CONTACTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOCKED)) {
    localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
  }
}

initializeLocalStorage();

let isBackendAvailable = true;

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackFn?: () => T): Promise<T> {
  if (isBackendAvailable) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        return await res.json();
      } else {
        console.warn(`[RideAlong Service] Backend unreachable or returned ${res.status} at ${url}. Seamlessly using persistent local store.`);
        isBackendAvailable = false;
      }
    } catch {
      console.warn(`[RideAlong Service] Backend unreachable at ${url}. Seamlessly using persistent local store.`);
      isBackendAvailable = false;
    }
  }

  if (fallbackFn) {
    return fallbackFn();
  }
  throw new Error('Service request failed and no fallback available.');
}

export const api = {
  // Auth & Demo
  async getDemoUsers(): Promise<Traveller[]> {
    return fetchWithFallback(
      `${API_BASE}/auth/demo-users`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = stored ? JSON.parse(stored) : DEMO_USERS;
        return users.filter(u => u.isDemo);
      }
    );
  },

  async login(email?: string, password?: string, demoUserId?: string): Promise<{ success: boolean; user: Traveller; token: string }> {
    return fetchWithFallback(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, demoUserId }),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = stored ? JSON.parse(stored) : DEMO_USERS;

        let user: Traveller | undefined;
        if (demoUserId) {
          user = users.find(u => u.id === demoUserId);
        } else if (email) {
          user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        }

        if (!user) {
          user = users[0]; // default to first demo user
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return {
          success: true,
          user,
          token: `demo_token_${user.id}`,
        };
      }
    );
  },

  async signup(data: { name: string; email: string; password: string; homeCity: string }): Promise<{ success: boolean; user: Traveller; token: string }> {
    return fetchWithFallback(
      `${API_BASE}/auth/signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = stored ? JSON.parse(stored) : DEMO_USERS;

        const newId = `user_${Date.now()}`;
        const newUser: Traveller = {
          id: newId,
          email: data.email,
          name: data.name,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
          bio: 'Excited to discover safe, verified travel companions on RideAlong!',
          homeCity: data.homeCity || 'Bengaluru',
          languages: ['English'],
          interests: ['Travel', 'Food'],
          preferences: {
            pace: 'moderate',
            budgetTier: 'mid-range',
            preferredModes: ['train', 'shared-cab', 'carpool'],
            scheduleType: 'flexible',
            communicationStyle: 'conversational',
            safetyPriorities: ['verified-id', 'public-meeting', 'itinerary-sharing'],
          },
          privacy: {
            profileVisibility: 'public-members',
            phoneMasked: true,
            shareContactOnMatch: false,
            emailNotifications: true,
            safetyAlerts: true,
          },
          safetyStatus: {
            idVerified: false,
            emailVerified: true,
            phoneVerified: false,
            trustedContactsCount: 0,
            safetyScoreNote: 'New Member • Complete ID verification in Safety Centre',
          },
          joinedDate: new Date().toISOString().split('T')[0],
          completedTripsCount: 0,
          isDemo: false,
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

        return {
          success: true,
          user: newUser,
          token: `token_${newId}`,
        };
      }
    );
  },

  // Users
  async getUsers(): Promise<Traveller[]> {
    return fetchWithFallback(
      `${API_BASE}/users`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        return stored ? JSON.parse(stored) : DEMO_USERS;
      }
    );
  },

  async getUser(id: string): Promise<Traveller | null> {
    return fetchWithFallback(
      `${API_BASE}/users/${id}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = stored ? JSON.parse(stored) : DEMO_USERS;
        return users.find(u => u.id === id) || null;
      }
    );
  },

  async updateUser(id: string, updates: Partial<Traveller>): Promise<Traveller> {
    return fetchWithFallback(
      `${API_BASE}/users/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = stored ? JSON.parse(stored) : DEMO_USERS;
        const index = users.findIndex(u => u.id === id);
        if (index >= 0) {
          users[index] = { ...users[index], ...updates };
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));
          return users[index];
        }
        throw new Error('User not found');
      }
    );
  },

  // Trips
  async getTrips(params?: TripSearchParams): Promise<Trip[]> {
    const query = new URLSearchParams();
    if (params?.origin) query.append('origin', params.origin);
    if (params?.destination) query.append('destination', params.destination);
    if (params?.date) query.append('date', params.date);
    if (params?.transportMode) query.append('transportMode', params.transportMode);

    return fetchWithFallback(
      `${API_BASE}/trips?${query.toString()}`,
      undefined,
      () => {
        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        let trips: Trip[] = storedTrips ? JSON.parse(storedTrips) : INITIAL_TRIPS;

        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const userMap = new Map(users.map(u => [u.id, u]));

        trips = trips.map(t => ({
          ...t,
          creator: userMap.get(t.creatorId) || DEMO_USERS[0],
        }));

        if (params?.origin && params.origin.trim()) {
          trips = trips.filter(t => t.origin.toLowerCase().includes(params.origin!.toLowerCase().trim()));
        }
        if (params?.destination && params.destination.trim()) {
          trips = trips.filter(t =>
            t.destination.toLowerCase().includes(params.destination!.toLowerCase().trim()) ||
            t.stops?.some(s => s.toLowerCase().includes(params.destination!.toLowerCase().trim()))
          );
        }
        if (params?.date && params.date.trim()) {
          trips = trips.filter(t => t.date === params.date);
        }
        if (params?.transportMode && params.transportMode !== 'all') {
          trips = trips.filter(t => t.transportMode === params.transportMode);
        }

        return trips;
      }
    );
  },

  async createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'confirmedCompanions' | 'status'>): Promise<Trip> {
    return fetchWithFallback(
      `${API_BASE}/trips`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = stored ? JSON.parse(stored) : INITIAL_TRIPS;

        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const creator = users.find(u => u.id === tripData.creatorId) || users[0];

        const newTrip: Trip = {
          ...tripData,
          id: `trip_${Date.now()}`,
          creator,
          confirmedCompanions: [],
          status: 'upcoming',
          createdAt: new Date().toISOString(),
        };

        trips.unshift(newTrip);
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
        return newTrip;
      }
    );
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    return fetchWithFallback(
      `${API_BASE}/trips/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = stored ? JSON.parse(stored) : INITIAL_TRIPS;
        const index = trips.findIndex(t => t.id === id);
        if (index >= 0) {
          trips[index] = { ...trips[index], ...updates };
          localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
          return trips[index];
        }
        throw new Error('Trip not found');
      }
    );
  },

  async cancelTrip(id: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/trips/${id}`,
      { method: 'DELETE' },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = stored ? JSON.parse(stored) : INITIAL_TRIPS;
        const index = trips.findIndex(t => t.id === id);
        if (index >= 0) {
          trips[index].status = 'cancelled';
          localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
          return true;
        }
        return false;
      }
    );
  },

  // Connection Requests
  async getRequests(userId: string): Promise<ConnectionRequest[]> {
    return fetchWithFallback(
      `${API_BASE}/requests?userId=${userId}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        const requests: ConnectionRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;

        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const userMap = new Map(users.map(u => [u.id, u]));

        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = storedTrips ? JSON.parse(storedTrips) : INITIAL_TRIPS;
        const tripMap = new Map(trips.map(t => [t.id, t]));

        return requests
          .filter(r => r.senderId === userId || r.receiverId === userId)
          .map(r => ({
            ...r,
            sender: userMap.get(r.senderId),
            receiver: userMap.get(r.receiverId),
            trip: r.tripId ? tripMap.get(r.tripId) : undefined,
          }));
      }
    );
  },

  async sendRequest(data: { senderId: string; receiverId: string; tripId?: string; note: string }): Promise<ConnectionRequest> {
    return fetchWithFallback(
      `${API_BASE}/requests`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        const requests: ConnectionRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;

        const newReq: ConnectionRequest = {
          id: `req_${Date.now()}`,
          senderId: data.senderId,
          receiverId: data.receiverId,
          tripId: data.tripId,
          status: 'pending',
          note: data.note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        requests.unshift(newReq);
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
        return newReq;
      }
    );
  },

  async acceptRequest(requestId: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/requests/${requestId}/accept`,
      { method: 'POST' },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        const requests: ConnectionRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;
        const req = requests.find(r => r.id === requestId);
        if (req) {
          req.status = 'accepted';
          req.updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

          // Ensure conversation exists
          const convStored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
          const convs: Conversation[] = convStored ? JSON.parse(convStored) : INITIAL_CONVERSATIONS;
          const participants = [req.senderId, req.receiverId].sort();

          const existingConv = convs.find(c => {
            const p = [...c.participantIds].sort();
            return p[0] === participants[0] && p[1] === participants[1];
          });

          if (!existingConv) {
            const newConvId = `conv_${Date.now()}`;
            convs.unshift({
              id: newConvId,
              participantIds: participants,
              tripId: req.tripId,
              lastMessage: 'Connection accepted. You can now chat securely.',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
            });
            localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
          }
          return true;
        }
        return false;
      }
    );
  },

  async declineRequest(requestId: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/requests/${requestId}/decline`,
      { method: 'POST' },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        const requests: ConnectionRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;
        const req = requests.find(r => r.id === requestId);
        if (req) {
          req.status = 'declined';
          req.updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
          return true;
        }
        return false;
      }
    );
  },

  async withdrawRequest(requestId: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/requests/${requestId}/withdraw`,
      { method: 'POST' },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        const requests: ConnectionRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;
        const req = requests.find(r => r.id === requestId);
        if (req) {
          req.status = 'withdrawn';
          req.updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
          return true;
        }
        return false;
      }
    );
  },

  // Conversations & Messages
  async getConversations(userId: string): Promise<Conversation[]> {
    return fetchWithFallback(
      `${API_BASE}/conversations?userId=${userId}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        const convs: Conversation[] = stored ? JSON.parse(stored) : INITIAL_CONVERSATIONS;

        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const userMap = new Map(users.map(u => [u.id, u]));

        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = storedTrips ? JSON.parse(storedTrips) : INITIAL_TRIPS;
        const tripMap = new Map(trips.map(t => [t.id, t]));

        return convs
          .filter(c => c.participantIds.includes(userId))
          .map(c => ({
            ...c,
            participants: c.participantIds.map(pid => userMap.get(pid)).filter(Boolean) as Traveller[],
            trip: c.tripId ? tripMap.get(c.tripId) : undefined,
          }));
      }
    );
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return fetchWithFallback(
      `${API_BASE}/conversations/${conversationId}/messages`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        const messages: Message[] = stored ? JSON.parse(stored) : INITIAL_MESSAGES;
        return messages.filter(m => m.conversationId === conversationId);
      }
    );
  },

  async sendMessage(data: { conversationId: string; senderId: string; receiverId: string; content: string; tripId?: string }): Promise<Message> {
    return fetchWithFallback(
      `${API_BASE}/conversations/${data.conversationId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        const messages: Message[] = stored ? JSON.parse(stored) : INITIAL_MESSAGES;

        const newMsg: Message = {
          id: `msg_${Date.now()}`,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: new Date().toISOString(),
          isRead: true,
          tripId: data.tripId,
        };

        messages.push(newMsg);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

        // Update conversation summary
        const convStored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        const convs: Conversation[] = convStored ? JSON.parse(convStored) : INITIAL_CONVERSATIONS;
        const conv = convs.find(c => c.id === data.conversationId);
        if (conv) {
          conv.lastMessage = data.content;
          conv.lastMessageTime = newMsg.timestamp;
          localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
        }

        return newMsg;
      }
    );
  },

  // Safety
  async getTrustedContacts(userId: string): Promise<TrustedContact[]> {
    return fetchWithFallback(
      `${API_BASE}/safety/trusted-contacts?userId=${userId}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        const contacts: TrustedContact[] = stored ? JSON.parse(stored) : INITIAL_TRUSTED_CONTACTS;
        return contacts.filter(c => c.userId === userId);
      }
    );
  },

  async addTrustedContact(data: Omit<TrustedContact, 'id' | 'addedAt'>): Promise<TrustedContact> {
    return fetchWithFallback(
      `${API_BASE}/safety/trusted-contacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        const contacts: TrustedContact[] = stored ? JSON.parse(stored) : INITIAL_TRUSTED_CONTACTS;

        const newContact: TrustedContact = {
          ...data,
          id: `tc_${Date.now()}`,
          addedAt: new Date().toISOString(),
        };

        contacts.push(newContact);
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
        return newContact;
      }
    );
  },

  async deleteTrustedContact(id: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/safety/trusted-contacts/${id}`,
      { method: 'DELETE' },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        let contacts: TrustedContact[] = stored ? JSON.parse(stored) : INITIAL_TRUSTED_CONTACTS;
        contacts = contacts.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
        return true;
      }
    );
  },

  async reportUser(data: { reporterId: string; reportedUserId: string; reason: string; details: string }): Promise<{ success: boolean; message: string }> {
    return fetchWithFallback(
      `${API_BASE}/safety/report`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
        const reports: UserReport[] = stored ? JSON.parse(stored) : [];
        reports.push({
          id: `rep_${Date.now()}`,
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reason: data.reason as any,
          details: data.details,
          createdAt: new Date().toISOString(),
          status: 'received',
        });
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return {
          success: true,
          message: 'Report logged securely. Our safety team will review the traveller credentials.',
        };
      }
    );
  },

  async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/safety/block`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blockedUserId }),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED);
        const blocked: BlockedUser[] = stored ? JSON.parse(stored) : [];
        if (!blocked.some(b => b.userId === userId && b.blockedUserId === blockedUserId)) {
          blocked.push({
            id: `block_${Date.now()}`,
            userId,
            blockedUserId,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(blocked));
        }
        return true;
      }
    );
  },

  async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    return fetchWithFallback(
      `${API_BASE}/safety/unblock`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blockedUserId }),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED);
        let blocked: BlockedUser[] = stored ? JSON.parse(stored) : [];
        blocked = blocked.filter(b => !(b.userId === userId && b.blockedUserId === blockedUserId));
        localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(blocked));
        return true;
      }
    );
  },

  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    return fetchWithFallback(
      `${API_BASE}/safety/blocked-users?userId=${userId}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED);
        const blocked: BlockedUser[] = stored ? JSON.parse(stored) : [];
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const userMap = new Map(users.map(u => [u.id, u]));

        return blocked
          .filter(b => b.userId === userId)
          .map(b => ({
            ...b,
            blockedUser: userMap.get(b.blockedUserId),
          }));
      }
    );
  },

  // Reviews - Only for eligible completed trips
  async getReviews(tripId?: string, revieweeId?: string): Promise<TripReview[]> {
    const q = new URLSearchParams();
    if (tripId) q.append('tripId', tripId);
    if (revieweeId) q.append('revieweeId', revieweeId);

    return fetchWithFallback(
      `${API_BASE}/reviews?${q.toString()}`,
      undefined,
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        const reviews: TripReview[] = stored ? JSON.parse(stored) : [];
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: Traveller[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;
        const userMap = new Map(users.map(u => [u.id, u]));

        return reviews
          .filter(r => (!tripId || r.tripId === tripId) && (!revieweeId || r.revieweeId === revieweeId))
          .map(r => ({
            ...r,
            reviewer: userMap.get(r.reviewerId),
          }));
      }
    );
  },

  async createReview(data: Omit<TripReview, 'id' | 'createdAt'>): Promise<TripReview> {
    return fetchWithFallback(
      `${API_BASE}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => {
        const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        const reviews: TripReview[] = stored ? JSON.parse(stored) : [];

        // Check if trip is completed or in past
        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const trips: Trip[] = storedTrips ? JSON.parse(storedTrips) : INITIAL_TRIPS;
        const trip = trips.find(t => t.id === data.tripId);
        if (trip && trip.status !== 'completed') {
          const isPast = new Date(trip.date).getTime() < Date.now();
          if (!isPast) {
            throw new Error('Reviews are strictly allowed only after completed trips.');
          }
        }

        const newReview: TripReview = {
          ...data,
          id: `rev_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        reviews.unshift(newReview);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return newReview;
      }
    );
  },

  // Reset Demo Data
  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    initializeLocalStorage();
  }
};
