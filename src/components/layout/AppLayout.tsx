import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CreateTripModal } from '../trips/CreateTripModal';

export const AppLayout: React.FC = () => {
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const location = useLocation();

  // Certain pages like /landing or /login might opt out of the app sidebar
  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar onOpenCreateTrip={() => setIsCreateTripOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!isPublicPage && (
          <div className="hidden md:block">
            <Sidebar onOpenCreateTrip={() => setIsCreateTripOpen(true)} />
          </div>
        )}

        <main className={`flex-1 min-w-0 pb-20 md:pb-8 ${isPublicPage ? 'w-full' : 'p-4 sm:p-6 lg:p-8'}`}>
          <Outlet />
        </main>
      </div>

      {!isPublicPage && <MobileNav />}

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
      />
    </div>
  );
};
