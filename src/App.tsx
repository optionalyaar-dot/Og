import React, { useMemo, useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { AppTab, Tournament } from './types';
import { AuthGate } from './components/AuthGate';
import { MobileBottomNav, TopNav } from './components/Navigation';
import { MatchAlertSnackbar, NotificationBell, useMatchAlerts } from './components/MatchNotifications';
import { JoinMatchModal, ResultsModal, RoomCredentialsModal } from './components/MatchModals';
import { HomeView } from './views/HomeView';
import { MatchesView } from './views/MatchesView';
import { LeaderboardView } from './views/LeaderboardView';
import { WalletView } from './views/WalletView';
import { StudioView } from './views/StudioView';
import { SettingsView } from './views/SettingsView';
import { OwnerPanelView } from './views/OwnerPanelView';

function AppShell() {
  const { user, authReady, isOwner, myMatches } = useTournament();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [matchesInitialFilter, setMatchesInitialFilter] = useState<'all' | 'my' | 'live' | 'completed'>('all');

  const [joinTarget, setJoinTarget] = useState<Tournament | null>(null);
  const [roomTarget, setRoomTarget] = useState<Tournament | null>(null);
  const [resultsTarget, setResultsTarget] = useState<Tournament | null>(null);

  const { alerts, unreadAlerts, urgentSnackbarAlert, dismissAlert, markAllRead } = useMatchAlerts();

  const joinedSet = useMemo(() => new Set(myMatches.map((m) => m.tournamentId)), [myMatches]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-sm text-slate-400">Loading OG Tournaments...</div>
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return <AuthGate />;
  }

  const handleNavigate = (tab: AppTab, filterMyMatches = false) => {
    if (tab === 'owner' && !isOwner) {
      setActiveTab('home');
      return;
    }
    if (tab === 'matches') {
      setMatchesInitialFilter(filterMyMatches ? 'my' : 'all');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 pb-24 md:pb-12 overflow-x-hidden">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(t) => handleNavigate(t, false)}
        notificationSlot={
          <NotificationBell
            alerts={alerts}
            unreadCount={unreadAlerts.length}
            onDismiss={dismissAlert}
            onMarkAllRead={markAllRead}
            onOpenRoom={(t) => setRoomTarget(t)}
            onNavigate={handleNavigate}
          />
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onJoinClick={(t) => setJoinTarget(t)}
            onRoomClick={(t) => setRoomTarget(t)}
            onResultsClick={(t) => setResultsTarget(t)}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            key={matchesInitialFilter}
            initialFilter={matchesInitialFilter}
            onJoinClick={(t) => setJoinTarget(t)}
            onRoomClick={(t) => setRoomTarget(t)}
            onResultsClick={(t) => setResultsTarget(t)}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'studio' && <StudioView />}
        {activeTab === 'settings' && <SettingsView onNavigate={(t) => handleNavigate(t, false)} />}
        {activeTab === 'owner' && isOwner && <OwnerPanelView />}
      </main>

      {joinTarget && (
        <JoinMatchModal tournament={joinTarget} onClose={() => setJoinTarget(null)} />
      )}
      {roomTarget && (
        <RoomCredentialsModal
          tournament={roomTarget}
          isJoined={joinedSet.has(roomTarget.id)}
          onClose={() => setRoomTarget(null)}
        />
      )}
      {resultsTarget && (
        <ResultsModal tournament={resultsTarget} onClose={() => setResultsTarget(null)} />
      )}

      <MatchAlertSnackbar
        alert={urgentSnackbarAlert}
        onDismiss={dismissAlert}
        onOpenRoom={(t) => setRoomTarget(t)}
      />

      <MobileBottomNav activeTab={activeTab} onSelectTab={(t) => handleNavigate(t, false)} />
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#131E31] border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
            <h2 className="font-display text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-300 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <TournamentProvider>
        <AppShell />
      </TournamentProvider>
    </ErrorBoundary>
  );
}
