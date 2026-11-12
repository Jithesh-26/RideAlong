import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { TravellerDetailPage } from './pages/TravellerDetailPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SafetyCentrePage } from './pages/SafetyCentrePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* App Shell wraps all standard views */}
      <Route element={<AppLayout />}>
        {/* Public landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Authenticated Core Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/travellers/:id" element={<TravellerDetailPage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/safety" element={<SafetyCentrePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
