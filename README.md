# RideAlong — Safety-First Travel Companion Discovery Platform

> **Tagline:** *Travel solo. Connect safely. Go together.*

---

## 📌 Executive Summary

**RideAlong** is a dedicated travel companion matching platform built specifically for solo commuters, long-distance intercity travellers, and weekend explorers on transit corridors across South India (Chennai, Bengaluru, Madurai, Coimbatore, Vijayawada, Hyderabad, and Kochi).

**Strict Distinction:** RideAlong is **strictly not a dating application**. It enforces a zero-tolerance anti-harassment policy, automatic number masking, ID verification tracking, transparent 5-factor explainable compatibility scores, live itinerary broadcast to family emergency circles, and direct integration with official national transit hotlines (112, 1091, 139, 1033, 108).

---

## 🛠️ Complete Technology Stack & Tools Used

| Layer | Technology / Library | Version | Purpose & Role in RideAlong |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | **Node.js (LTS)** | `v22.23.5` | JavaScript runtime powering both frontend tooling and backend server |
| **Package Manager** | **npm** | `10.9.9` | Dependency resolution, package scripts, and lifecycle auditing |
| **Frontend Framework** | **React** | `^19.3.1` | Modern declarative UI component hierarchy |
| **Programming Language**| **TypeScript** | `^7.0.2` | End-to-end type safety, interfaces, and shared data contracts |
| **Build Tool & Dev Server**| **Vite** | `^8.3.5` | Ultra-fast HMR dev server, asset bundling, and backend `/api` proxy |
| **Client-Side Routing** | **React Router DOM** | `^7.18.5` | Multi-view SPA navigation, layout wrappers, and deep linking |
| **Styling & Layout** | **Tailwind CSS v4** | `^4.3.3` | Utility-first responsive CSS, modern animations, and accessible styling |
| **Component Icons** | **Lucide React** | `^1.66.0` | Accessible SVG icon suite (Shield, Train, Users, Route, Lock, etc.) |
| **Visual Celebrations** | **Canvas Confetti** | `^1.9.4` | Interactive celebratory confetti when successfully publishing a journey |
| **Class Utilities** | **clsx & tailwind-merge** | `^2.1.1` / `^3.7.0` | Conditional class name joining and conflict-free utility merging |
| **Backend Framework** | **Express** | `^5.3.0` | Fast REST API handling auth, trips, chat, safety, and peer reviews |
| **Database Engine** | **SQLite (better-sqlite3)** | `12.11.1` | High-speed, zero-config persistent relational database in WAL mode |
| **Direct TS Execution** | **tsx** | `^4.21.0` | Direct execution of TypeScript backend scripts without manual compile steps |
| **Automated Testing** | **Node.js Test Runner** | Built-in (`node:test`) | Unit tests and integration assertions with TAP output |
| **UUID Generation** | **uuid (v4)** | `^14.0.3` | Cryptographically unique identifiers for users, trips, and messages |
| **Security & Hashing** | **Node Crypto (SHA-256)**| Built-in | Secure password hashing and sensitive data protection |

---

## 📁 Architectural File & Folder Organization

The codebase is cleanly organized into **Frontend (Client)**, **Backend (Server)**, **Database (Storage)**, and **Root Configs**:

```text
RideAlong/
├── ⚙️ server/                     # BACKEND LAYER (Node.js + Express + SQLite)
│   ├── index.ts                   # Express REST API server (Auth, Trips, Messaging, Safety, Reviews)
│   ├── db.ts                      # SQLite schema definition, table creation & synchronous seeding
│   └── types.d.ts                 # TypeScript type declarations for better-sqlite3
│
├── 🖥️ src/                        # FRONTEND LAYER (React 19 + TypeScript + Tailwind CSS)
│   ├── main.tsx                   # React root entry point with context providers & router
│   ├── App.tsx                    # Core application routing & page layout definitions
│   ├── index.css                  # Tailwind CSS root imports, font declarations & scrollbar styling
│   ├── vite-env.d.ts              # Vite environment type declarations
│   │
│   ├── components/                # Reusable UI Components
│   │   ├── common/                # UI Primitives: Avatar, Badge, Button, Input, Modal, ScoreBreakdownModal
│   │   ├── layout/                # App Shell: AppLayout, Navbar (persona switcher), Sidebar, MobileNav
│   │   ├── matches/               # Matching UI: ConnectModal, TravellerCard
│   │   ├── messages/              # Real-Time Chat: ChatPane (with simulated reply badges), ConversationItem
│   │   ├── safety/                # Safety Hub: EmergencyResources, ReportUserModal, TripShareModal, TrustedContactsList
│   │   └── trips/                 # Itineraries: CreateTripModal, TripCard, TripSearchForm
│   │
│   ├── context/                   # Global State Providers
│   │   ├── AuthContext.tsx        # Active user session, login/signup & instant demo switcher
│   │   ├── TripsContext.tsx       # Live journey store, publishing, updating & cancellations
│   │   ├── MessagesContext.tsx    # Connection requests state & active conversations
│   │   └── SafetyContext.tsx      # Trusted emergency circle, user reports & blocking list
│   │
│   ├── pages/                     # Full-Screen Page Views
│   │   ├── LandingPage.tsx        # Public marketing homepage & corridor search
│   │   ├── DashboardPage.tsx      # Central hub (active upcoming journeys, pending companion requests)
│   │   ├── DiscoverPage.tsx       # SafeMatch companion search by corridor, pace & language
│   │   ├── MyTripsPage.tsx        # Manage created, joined, and upcoming itineraries
│   │   ├── TripDetailPage.tsx     # Route stops, companion slots & budget-sharing guidelines
│   │   ├── TravellerDetailPage.tsx# Verified traveler profile, safety badges & compatibility
│   │   ├── MessagesPage.tsx       # Secure two-way reciprocal chat interface
│   │   ├── SafetyCentrePage.tsx   # Emergency hotline dials, trusted contacts & reporting
│   │   ├── ProfilePage.tsx        # Personal travel preferences, pace & verification status
│   │   ├── SettingsPage.tsx       # Phone masking, profile visibility & alert preferences
│   │   ├── LoginPage.tsx          # Member login & instant one-click demo credentials
│   │   ├── SignupPage.tsx         # New member registration
│   │   └── OnboardingPage.tsx     # First-time travel pace & preference onboarding
│   │
│   ├── services/                  # Business Logic & Data Layer
│   │   ├── api.ts                 # Dual-mode API client (queries Express; seamlessly falls back to localStorage)
│   │   ├── matching.ts            # 5-factor explainable SafeMatch compatibility scoring algorithm
│   │   └── sampleData.ts          # Verified Indian transit corridors & preloaded demo travellers
│   │
│   └── types/
│       └── index.ts               # Shared TypeScript domain models and interfaces
│
├── 💾 data/                       # DATABASE STORAGE LAYER
│   ├── .gitkeep                   # Directory placeholder
│   └── ridealong.db               # Persistent SQLite database file (WAL mode)
│
├── 🧪 test/                       # AUTOMATED TEST SUITE
│   ├── app.test.ts                # Unit tests for 5-factor matching math, ranking, disclaimers & routes
│   └── server.test.ts             # SQLite seeding verification, constraints & review rules
│
├── 🚀 Root Launchers & Configs
│   ├── start-ridealong.bat        # Windows one-click batch launcher for Backend + Frontend
│   ├── run.js                     # Unified concurrent runner script (starts ports 3001 & 5173)
│   ├── index.html                 # HTML web entry point (Inter font & metadata)
│   ├── package.json               # Project manifest, dependencies & scripts
│   ├── package-lock.json          # Deterministic lockfile
│   ├── tsconfig.json              # TypeScript project configuration
│   ├── tsconfig.node.json         # TypeScript Vite configuration
│   ├── vite.config.ts             # Vite configuration with React, Tailwind v4 & /api proxy
│   └── .gitignore                 # Excludes node_modules, SQLite db files, and build dist
```

---

## 🛡️ Core Features & Verification Architecture

### 1. Safety Centre & Emergency Circle
- **Trusted Contacts Manager:** Store emergency family contacts who receive automatic trip notices on departure.
- **Live Itinerary Broadcast:** Generate clean, verified route previews with scheduled stops and verification badges.
- **Official Hotlines (Zero Pretense):** Direct dial shortcuts for:
  - **112** — National Emergency Police, Fire & Medical
  - **1091 / 181** — National Women Transit Safety Helpline
  - **139** — Indian Railways Protection Force (RPF) Security
  - **1033** — National Highway Patrol & Roadside Assistance
  - **108** — Emergency Medical & Ambulance Dispatch
- **Non-Dispatch Disclaimer:** Prominently clarifies that RideAlong is not an emergency dispatch provider and directs users to dial 112 immediately in danger.
- **Confidential Reporting & Blocking:** Report unwanted solicitations and block travellers in real-time.

### 2. Explainable Compatibility Score (SafeMatch)
Mathematical 5-factor weighting (Score 0 to 100%):
- **Route & Schedule Alignment:** 40% (Shared origin/destination, interlocking stops, departure date closeness, transport mode match)
- **Travel Preferences (Pace & Budget):** 25% (Pace alignment, budget tier compatibility)
- **Shared Interests & Hobbies:** 15% (Common topics, books, coffee, tech, photography)
- **Spoken Languages:** 10% (Shared regional languages: Tamil, Telugu, Kannada, Hindi, Malayalam, English)
- **Group Size / Cohort Capacity:** 10% (Companion count limits)
- *Mandatory Safety Clause:* Scores represent schedule and preference alignment only; never presented as a background check or safety guarantee.

### 3. Reciprocal Connection & Message Workflow
- Request to connect on a specific trip or general corridor.
- Host receives pending notification to Accept, Decline, or Withdraw.
- Direct messaging is unlocked **only after mutual acceptance**.
- Clear simulated badge (`[Simulated Reply]`) for offline demo interactions.

### 4. Authentic Reviews Policy
- Reviews are strictly unlocked **only after completed journeys** (trip marked completed or date in the past).
- Pre-trip or fabricated peer ratings are rejected by the API.

### 5. Resilient Dual-Mode Persistence
- Connects to SQLite (`data/ridealong.db`) when the backend server is running.
- If running offline or standalone frontend, seamlessly falls back to persistent `localStorage` seeded with demo routes and travellers.

---

## 🗄️ Database Schema & Tables

The SQLite database (`data/ridealong.db`) defines 9 relational tables:

1. `users`: IDs, emails, hashed passwords, bios, home cities, languages, preferences, safety status, and demo flags.
2. `trips`: Origin, destination, dates, departure windows, transport modes, stops, companion caps, notes, budget rules, and status.
3. `connection_requests`: Sender/receiver IDs, trip IDs, statuses (`pending`, `accepted`, `declined`, `withdrawn`), and notes.
4. `conversations`: Participant pairs, trip associations, last message text, and timestamps.
5. `messages`: Message content, sender/receiver IDs, conversation IDs, read flags, and timestamps.
6. `trusted_contacts`: Emergency contact names, phone numbers, relationships, and trip notification toggles.
7. `reports`: Incident reports, reported users, categorized reasons, and review statuses.
8. `blocked_users`: Mutual block mappings preventing blocked users from seeing trips or profiles.
9. `reviews`: Post-journey ratings (1–5 stars), feedback tags, and comments strictly tied to completed trips.

---

## 🌐 REST API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Health check & SQLite database status |
| **Auth** | `GET` | `/api/auth/demo-users` | Retrieve pre-seeded demo accounts |
| **Auth** | `POST` | `/api/auth/login` | Authenticate with email/password or demo user ID |
| **Auth** | `POST` | `/api/auth/signup` | Register a new traveler profile |
| **Users** | `GET` | `/api/users` | List all registered travellers |
| **Users** | `GET` | `/api/users/:id` | Fetch specific traveller profile |
| **Users** | `PUT` | `/api/users/:id` | Update profile bio, preferences, or privacy |
| **Trips** | `GET` | `/api/trips` | Search trips by origin, destination, date, mode |
| **Trips** | `POST` | `/api/trips` | Publish a new journey itinerary |
| **Trips** | `PUT` | `/api/trips/:id` | Update an existing trip |
| **Trips** | `DELETE`| `/api/trips/:id` | Cancel an upcoming trip |
| **Requests** | `GET` | `/api/requests` | List incoming & outgoing connection requests |
| **Requests** | `POST` | `/api/requests` | Send a new connection request |
| **Requests** | `POST` | `/api/requests/:id/accept` | Accept request & automatically open chat |
| **Requests** | `POST` | `/api/requests/:id/decline` | Decline connection request |
| **Requests** | `POST` | `/api/requests/:id/withdraw` | Withdraw a pending request |
| **Messages** | `GET` | `/api/conversations` | List active conversations for user |
| **Messages** | `GET` | `/api/conversations/:id/messages` | Fetch message history in a conversation |
| **Messages** | `POST` | `/api/conversations/:id/messages` | Send an encrypted message |
| **Safety** | `GET` | `/api/safety/trusted-contacts` | List emergency family contacts |
| **Safety** | `POST` | `/api/safety/trusted-contacts` | Add a new trusted contact |
| **Safety** | `DELETE`| `/api/safety/trusted-contacts/:id`| Remove a trusted contact |
| **Safety** | `POST` | `/api/safety/report` | Submit an incident / harassment report |
| **Safety** | `POST` | `/api/safety/block` | Block a traveller |
| **Safety** | `POST` | `/api/safety/unblock` | Unblock a traveller |
| **Safety** | `GET` | `/api/safety/blocked-users` | List blocked travellers |
| **Reviews** | `GET` | `/api/reviews` | Fetch verified reviews for trip or traveller |
| **Reviews** | `POST` | `/api/reviews` | Submit post-trip review (only for completed trips) |

---

## 👤 Preloaded Demo Personas & Credentials

| Name | Role / City | Email | Sample Corridor | Preferred Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Ananya Sharma** *(Default)* | Architectural Researcher, Chennai | `ananya.sharma@demo.ridealong.app` | Chennai → Bengaluru | Train (Shatabdi/Vande Bharat) |
| **Rohan Verma** | Software Engineer, Bengaluru | `rohan.verma@demo.ridealong.app` | Bengaluru → Chennai | Train |
| **Priya Sundaram** | Content Strategist, Madurai | `priya.sundaram@demo.ridealong.app` | Madurai → Chennai | Train |
| **Karthik V.** | Finance Analyst, Vijayawada | `karthik.v@demo.ridealong.app` | Vijayawada → Hyderabad | Carpool |
| **Deepika Raman** | UX Researcher, Coimbatore | `deepika.raman@demo.ridealong.app` | Coimbatore → Bengaluru | Shared Cab |
| **Siddharth Nair** | Systems Architect, Kochi | `siddharth.nair@demo.ridealong.app` | Kochi → Bengaluru | Flight |

> **Quick Demo Switcher:** Switch personas instantly using the demo dropdown in the top-right navbar.  
> **Universal Demo Password:** `SafeTravels2026!`

---

## 🚀 Quickstart & Execution Guide

### Workspace Location
```text
C:\Users\JITHESH\OneDrive\Desktop\RideAlong
```

### Installation
Dependencies are already installed in `node_modules`. If you ever need a clean reinstall:
```bash
npm install
```

### Running the Application

#### Option A: One-Click Windows Launcher (Easiest)
Double-click **`start-ridealong.bat`** in the project directory. It launches both the backend API and frontend concurrently.

#### Option B: Terminal Command
```bash
npm start
```
* **Frontend Application:** Open `http://localhost:5173` in your browser.
* **Backend API Server:** Running on `http://localhost:3001`.

---

## 🧪 Testing & Verification

Run the full automated test suite (Matching algorithm math, Indian transit routes integrity, and SQLite persistence rules):
```bash
npm test
```
*Result: 11/11 tests passing across 3 test suites.*

Build the optimized production client bundle:
```bash
npm run build
```
*Outputs compiled chunks to `dist/` with vendor chunking.*
