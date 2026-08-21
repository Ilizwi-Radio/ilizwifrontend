/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import RequireRole from '@/components/RequireRole';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import PresenterStudio from './PresenterStudio';
import ShowsManagement from './ShowsManagement';
import MusicCrate from './MusicCrate';
import ProfileView from './ProfileView';
import AnalyticsView from './AnalyticsView';
import { ActiveTab } from '@/lib/types';
import { getShows } from '@/lib/api';
import { motion, AnimatePresence } from 'motion/react';

function PresenterAppContent() {
  const { user} = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showsCount, setShowsCount] = useState(0);

  useEffect(() => {
    getShows().then((shows) => setShowsCount(shows.length));
  }, []);

  const handleGoLiveWithShow = (showId: string) => {
    setActiveTab('studio');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'studio':
        return 'Presenter Studio';
      case 'shows':
        return 'Broadcast Schedule & Shows';
      case 'music':
        return 'Music Crate & SFX Soundboard';
      case 'profile':
        return 'Presenter Profile & Hardware';
      case 'analytics':
        return 'Broadcast Analytics & Metrics';
      default:
        return 'Presenter Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'studio':
        return `Live Broadcasting Console • Welcome back, ${user?.full_name || user?.full_name}`;
      case 'shows':
        return 'Manage your allocated show slots and schedule timing';
      case 'music':
        return 'Add music beds, sound effects, and configure voice auto-ducking';
      case 'profile':
        return 'Customize your presenter identity, biography, and station credentials';
      case 'analytics':
        return 'Track your listenership growth, airtime, and audience retention';
      default:
        return `Welcome back, ${user?.full_name}`;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showsCount={showsCount}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Dashboard Header */}
        <DashboardHeader
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'studio' && (
                <PresenterStudio
                  presenterId={user?.id || 'pres-1'}
                  presenterName={user?.full_name || 'Presenter'}
                  onNavigateToShows={() => setActiveTab('shows')}
                  onNavigateToMusic={() => setActiveTab('music')}
                />
              )}

              {activeTab === 'shows' && (
                <ShowsManagement onGoLiveWithShow={handleGoLiveWithShow} />
              )}

              {activeTab === 'music' && (
                <MusicCrate
                  onSelectTrackForStudio={() => setActiveTab('studio')}
                />
              )}

              {activeTab === 'profile' && <ProfileView />}

              {activeTab === 'analytics' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RequireRole role="presenter">
        <PresenterAppContent />
      </RequireRole>
    </AuthProvider>
  );
}
