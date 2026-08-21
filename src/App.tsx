import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CampusBackground } from './components/CampusBackground';
import { Navbar } from './components/Navbar';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { LaunchPage } from './pages/LaunchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { settings } = useTheme();
  const [currentView, setCurrentView] = useState<string>('launch');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // If loading auth state from token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Initializing CivicMind Secure Ledger...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'launch':
        return <LaunchPage setCurrentView={setCurrentView} />;
      case 'login':
        return <LoginPage setCurrentView={setCurrentView} />;
      case 'register':
        return <RegisterPage setCurrentView={setCurrentView} />;
      case 'student-dashboard':
        if (!isAuthenticated) {
          return <LoginPage setCurrentView={setCurrentView} defaultRole="student" accessDeniedMessage="Please sign in to access your Student Dashboard." />;
        }
        return (
          <StudentDashboard
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      case 'submit-complaint':
        if (!isAuthenticated) {
          return <LoginPage setCurrentView={setCurrentView} defaultRole="student" accessDeniedMessage="Please sign in to submit a campus complaint." />;
        }
        return (
          <SubmitComplaintPage
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      case 'track-complaint':
        return (
          <TrackComplaintPage
            selectedComplaintId={selectedComplaintId}
            setSelectedComplaintId={setSelectedComplaintId}
            setCurrentView={setCurrentView}
          />
        );
      case 'my-complaints':
        if (!isAuthenticated) {
          return <LoginPage setCurrentView={setCurrentView} defaultRole="student" accessDeniedMessage="Please sign in to view your complaint records." />;
        }
        return (
          <MyComplaintsPage
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      case 'profile':
        if (!isAuthenticated) {
          return <LoginPage setCurrentView={setCurrentView} defaultRole="student" accessDeniedMessage="Please sign in to access your profile." />;
        }
        return <ProfilePage setCurrentView={setCurrentView} />;
      case 'admin-dashboard':
      case 'admin-complaints':
        // Strict verification: User must be authenticated AND have the 'admin' role
        if (!isAuthenticated || user?.role !== 'admin') {
          return (
            <LoginPage
              setCurrentView={setCurrentView}
              defaultRole="admin"
              accessDeniedMessage="Strict Admin Authorization Required. You must sign in with verified campus administrator credentials to access the Admin Portal."
            />
          );
        }
        return (
          <AdminDashboard
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      default:
        return <LaunchPage setCurrentView={setCurrentView} />;
    }
  };

  const getContainerBgClass = () => {
    if (!settings.isBgEnabled) {
      if (settings.theme === 'light') return 'bg-zinc-100 text-zinc-900';
      if (settings.theme === 'midnight') return 'bg-slate-950 text-slate-100';
      if (settings.theme === 'emerald') return 'bg-[#04140f] text-emerald-100';
      return 'bg-zinc-950 text-zinc-100';
    }
    // When campus background is enabled, allow the blurred image to show through with slight transparency
    if (settings.theme === 'light') return 'bg-zinc-100/70 text-zinc-900';
    return 'bg-zinc-950/70 text-zinc-100';
  };

  return (
    <div className={`min-h-screen relative flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300 ${getContainerBgClass()}`}>
      
      {/* Blurred Campus Background Layer */}
      <CampusBackground />

      {/* Top Hackathon Demo Flow Quick Switcher */}
      <HackathonDemoBar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Navigation Bar with Theme & Background Switcher */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedComplaintId={setSelectedComplaintId}
      />

      {/* Main Page Content */}
      <main className="flex-1 relative z-10">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md py-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-300">CivicMind Campus Node</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">Cloud Firestore Persistent DB</span>
            <span className="text-zinc-600">|</span>
            <span>Gemini AI Triage Engine v2.4</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <span>Built with real-time campus tracking & intelligent SLA resolution</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
