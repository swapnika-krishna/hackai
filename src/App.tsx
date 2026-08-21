import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const [currentView, setCurrentView] = useState<string>('launch');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // If loading auth state from token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Initializing CivicResolve Secure Ledger...</p>
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
        return (
          <StudentDashboard
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      case 'submit-complaint':
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
        return (
          <MyComplaintsPage
            setCurrentView={setCurrentView}
            setSelectedComplaintId={setSelectedComplaintId}
          />
        );
      case 'profile':
        return <ProfilePage setCurrentView={setCurrentView} />;
      case 'admin-dashboard':
      case 'admin-complaints':
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Hackathon Demo Flow Quick Switcher */}
      <HackathonDemoBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedComplaintId={selectedComplaintId}
      />

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedComplaintId={setSelectedComplaintId}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-400">CivicResolve Campus Node</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">Cloud Firestore Persistent DB</span>
            <span className="text-zinc-600">|</span>
            <span>Gemini AI Triage Engine v2.4</span>
          </div>

          <div>
            Built with persistent Cloud Firestore records & real SLA verification
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
