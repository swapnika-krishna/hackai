import React, { useState } from 'react';
import { Sparkles, ChevronRight, CheckCircle2, ArrowRight, ShieldCheck, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DemoBarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const HackathonDemoBar: React.FC<DemoBarProps> = ({ currentView: _currentView, setCurrentView }) => {
  const { user, login } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  const quickLoginAsAdmin = () => {
    if (user?.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  const quickLoginAsStudentDemo = () => {
    if (user?.role === 'student') {
      setCurrentView('student-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900/90 to-cyan-950/80 border-b border-emerald-500/20 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Hackathon Evaluation Flow
          </span>
          <span className="text-zinc-400 hidden sm:inline">|</span>
          <span className="text-zinc-300 hidden md:inline">
            Active Mode: {user ? (user.role === 'admin' ? '🛡️ Campus Admin' : `🎓 Student (${user.name})`) : 'Guest Visitor'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick switchers */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={quickLoginAsAdmin}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                user?.role === 'admin' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800'
              }`}
              title="Sign in as Campus Admin with pre-seeded credentials"
            >
              <ShieldCheck className="w-3 h-3 text-cyan-400" /> Demo Admin
            </button>

            <button
              onClick={quickLoginAsStudentDemo}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                user?.role === 'student' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800'
              }`}
              title="Sign in or Register as a Student"
            >
              <GraduationCap className="w-3 h-3 text-emerald-400" /> Student Flow
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-300 hover:text-white underline text-[11px] flex items-center gap-0.5"
          >
            {isExpanded ? 'Hide Steps' : 'Show 12-Step Demo Guide'}
            <ChevronRight className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5"
            title="Dismiss top bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-zinc-900/90 p-2 rounded border border-zinc-800">
            <span className="font-semibold text-emerald-400">Step 1-3: Student Onboarding</span>
            <p className="text-zinc-400 mt-0.5">Click Campus Login → Student → Create Account. Notice initial stats are strictly <strong>0 Complaints</strong>.</p>
          </div>
          <div className="bg-zinc-900/90 p-2 rounded border border-zinc-800">
            <span className="font-semibold text-teal-400">Step 4-6: AI Triage & ID</span>
            <p className="text-zinc-400 mt-0.5">Submit "Water leakage near A block". Gemini classifies Category, Severity, Department & generates unique <strong>CIV-2026-000001</strong>.</p>
          </div>
          <div className="bg-zinc-900/90 p-2 rounded border border-zinc-800">
            <span className="font-semibold text-cyan-400">Step 7-9: Admin Workflow</span>
            <p className="text-zinc-400 mt-0.5">Log in as Admin (Name: <code>krishna</code>, Email: <code>jakkaswapnika@gmail.com</code>). View real complaint in dashboard. Advance status: Submitted → In Progress.</p>
          </div>
          <div className="bg-zinc-900/90 p-2 rounded border border-zinc-800">
            <span className="font-semibold text-blue-400">Step 10-12: Live Resolution</span>
            <p className="text-zinc-400 mt-0.5">Admin marks Resolved. Student profile automatically recalculates to: Submitted 1, Resolved 1, Pending 0.</p>
          </div>
        </div>
      )}
    </div>
  );
};
