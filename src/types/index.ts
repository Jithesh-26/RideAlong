export type TransportMode = 'train' | 'flight' | 'shared-cab' | 'bus' | 'carpool';
export type TravelPace = 'relaxed' | 'moderate' | 'fast';
export type BudgetTier = 'budget' | 'mid-range' | 'flexible';
export type ScheduleType = 'early-bird' | 'night-owl' | 'flexible';
export type CommunicationStyle = 'quiet' | 'conversational' | 'adaptable';

export interface TravelPreferences {
  pace: TravelPace;
  budgetTier: BudgetTier;
  preferredModes: TransportMode[];
  scheduleType: ScheduleType;
  communicationStyle: CommunicationStyle;
  safetyPriorities: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public-members' | 'matches-only';
  phoneMasked: boolean;
  shareContactOnMatch: boolean;
  emailNotifications: boolean;
  safetyAlerts: boolean;
}

export interface SafetyStatus {
  idVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  trustedContactsCount: number;
  safetyScoreNote: string;
}

export interface Traveller {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  homeCity: string;
  languages: string[];
  interests: string[];
  preferences: TravelPreferences;
  privacy: PrivacySettings;
  safetyStatus: SafetyStatus;
  joinedDate: string;
  completedTripsCount: number;
  isDemo?: boolean;
}

export interface Trip {
  id: string;
  creatorId: string;
  creator?: Traveller;
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  departureTimeWindow: string; // e.g. "Morning (06:00 - 10:00)"
  transportMode: TransportMode;
  stops: string[];
  neededCompanions: number;
  confirmedCompanions: string[]; // user IDs
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  budgetShareRule: string;
  languagesPreferred: string[];
  interestsPreferred: string[];
  createdAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  tripId?: string;
  sender?: Traveller;
  receiver?: Traveller;
  trip?: Trip;
  status: RequestStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  tripId?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: Traveller[];
  tripId?: string;
  trip?: Trip;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnTripStart: boolean;
  addedAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'inappropriate_behavior' | 'unsolicited_advances' | 'impersonation' | 'safety_concern' | 'spam' | 'other';
  details: string;
  createdAt: string;
  status: 'received' | 'under_review' | 'resolved';
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUser?: Traveller;
  createdAt: string;
}

export interface TripReview {
  id: string;
  tripId: string;
  reviewerId: string;
  reviewer?: Traveller;
  revieweeId: string;
  rating: number; // 1-5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  routeScheduleScore: number; // max 40
  preferencesScore: number;   // max 25
  interestsScore: number;     // max 15
  languagesScore: number;     // max 10
  groupSizeScore: number;     // max 10
  totalScore: number;         // max 100
  routeMatchDetails: string;
  preferencesMatchDetails: string;
  sharedInterests: string[];
  sharedLanguages: string[];
  groupSizeDetails: string;
  disclaimer: string;
}

export interface SafeMatchResult {
  traveller: Traveller;
  trip?: Trip;
  score: ScoreBreakdown;
}

export interface TripSearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  departureTimeWindow?: string;
  transportMode?: TransportMode | 'all';
  language?: string;
  interest?: string;
  maxCompanions?: number;
  directOnly?: boolean;
}
