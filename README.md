# RideAlong — Safety-First Travel Companion Discovery Platform

> **Tagline:** *Travel solo. Connect safely. Go together.*

---

## 📌 Executive Summary
**RideAlong** is a dedicated travel companion matching platform built specifically for solo commuters, long-distance intercity travellers, and weekend explorers on transit corridors across South India (Chennai, Bengaluru, Madurai, Coimbatore, Vijayawada, Hyderabad, and Kochi).

**Strict Distinction:** RideAlong is **not a dating application**. It enforces a zero-tolerance anti-harassment policy, automatic number masking, ID verification tracking, transparent 5-factor explainable compatibility scores, live itinerary broadcast to family, and direct integration with official national transit hotlines (112, 1091, 139, 1033).

---

## 🛡️ Core Features & Verification Architecture

1. **Safety Centre & Emergency Circle**
   - **Trusted Contacts Manager:** Store emergency family contacts who receive automatic trip notices on departure.
   - **Live Itinerary Broadcast:** Generate clean, verified route previews with scheduled stops and verification badges.
   - **Official Hotlines (Zero Pretense):** Direct contact numbers for Police (112), Women Helpline (1091/181), Railway Protection Force (139), Highway Patrol (1033), and Ambulance (108).
   - **Confidential Reporting & Blocking:** Report unwanted solicitations and block travellers in real-time.

2. **Explainable Compatibility Score (SafeMatch)**
   - Mathematical 5-factor weighting:
     - **Route & Schedule Alignment:** 40%
     - **Travel Preferences (Pace & Budget):** 25%
     - **Shared Interests & Hobbies:** 15%
     - **Spoken Languages:** 10%
     - **Group Size / Cohort Capacity:** 10%
   - *Mandatory Safety Clause:* Never presented as a safety guarantee or background check.

3. **Reciprocal Connection & Message Workflow**
   - Request to connect on a specific trip or general corridor.
   - Host receives pending notification to Accept, Decline, or Withdraw.
   - On acceptance, an encrypted direct conversation is initialized automatically.
   - Clear simulated badge (`[Simulated Reply]`) for offline demo interactions.

4. **Authentic Reviews Policy**
   - Reviews are unlocked **strictly after completed journeys**.
   - Pre-trip or fabricated peer ratings are forbidden and rejected by the API.

---

## 🚀 Quickstart & Execution Guide

### Active Workspace Recommendation
To open this project directly in Antigravity or VS Code, open the directory:
```
C:\Users\Karthik\.gemini\antigravity\scratch\ridealong
```

### Installation
Dependencies are already installed in `node_modules`. To reinstall:
```bash
npm install
```

### Running the Application

#### Option A: Running Frontend (Vite) + Backend API (Node/Express/SQLite)
1. **Start the backend server** (Port 3001, Persistent SQLite):
   ```bash
   npm run server
   ```
2. **Start the frontend application** (Port 5173):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

#### Option B: Standalone Frontend Mode with Persistent Fallback Storage
If the backend is not running, RideAlong automatically and seamlessly switches to its resilient local persistence layer (`localStorage`) seeded with demo Indian routes and travellers.

---

## 👤 Preloaded Demo Personas & Credentials

| Name | Role / City | Email | Sample Corridors |
| :--- | :--- | :--- | :--- |
| **Ananya Sharma** *(Default)* | Architectural Researcher, Chennai | `ananya.sharma@demo.ridealong.app` | Chennai → Bengaluru (Train) |
| **Rohan Verma** | Software Engineer, Bengaluru | `rohan.verma@demo.ridealong.app` | Bengaluru → Chennai (Train) |
| **Priya Sundaram** | Content Strategist, Madurai | `priya.sundaram@demo.ridealong.app` | Madurai → Chennai (Train) |
| **Karthik V.** | Finance Analyst, Vijayawada | `karthik.v@demo.ridealong.app` | Vijayawada → Hyderabad (Carpool) |
| **Deepika Raman** | UX Researcher, Coimbatore | `deepika.raman@demo.ridealong.app` | Coimbatore → Bengaluru (Cab) |
| **Siddharth Nair** | Systems Architect, Kochi | `siddharth.nair@demo.ridealong.app` | Kochi → Bengaluru (Flight) |

> *Quick Demo Switcher:* You can switch personas instantly using the demo user selector dropdown in the navbar or via the Settings page. Password for all demo accounts: `SafeTravels2026!`

---

## 🧪 Testing

Run the full automated test suite (Matching algorithm, Indian transit routes, SQLite rules):
```bash
npm test
```

Build production bundle:
```bash
npm run build
```
