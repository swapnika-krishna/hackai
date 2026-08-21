import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  FileText, 
  Search, 
  User as UserIcon, 
  ShieldAlert, 
  LogOut, 
  LayoutDashboard,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            id="nav-brand-logo"
            onClick={() => setCurrentView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard') : 'launch')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                  CivicResolve
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI Campus
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Complaint-to-Resolution Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user ? (
            <nav className="flex items-center gap-1 sm:gap-2">
              {user.role === 'student' ? (
                <>
                  <button
                    id="nav-btn-student-dashboard"
                    onClick={() => setCurrentView('student-dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'student-dashboard'
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </button>

                  <button
                    id="nav-btn-submit-complaint"
                    onClick={() => setCurrentView('submit-complaint')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'submit-complaint'
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-semibold'
                        : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Complaint</span>
                  </button>

                  <button
                    id="nav-btn-my-complaints"
                    onClick={() => setCurrentView('my-complaints')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'my-complaints'
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden md:inline">My Complaints</span>
                  </button>

                  <button
                    id="nav-btn-track-complaint"
                    onClick={() => setCurrentView('track-complaint')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'track-complaint'
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Track Status</span>
                  </button>

                  <button
                    id="nav-btn-profile"
                    onClick={() => setCurrentView('profile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'profile'
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden lg:inline">Profile</span>
                  </button>
                </>
              ) : (
                /* Admin Navigation */
                <>
                  <button
                    id="nav-btn-admin-dashboard"
                    onClick={() => setCurrentView('admin-dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'admin-dashboard'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden md:inline">Admin Overview</span>
                  </button>

                  <button
                    id="nav-btn-admin-complaints"
                    onClick={() => setCurrentView('admin-complaints')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'admin-complaints'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Manage Complaints</span>
                  </button>

                  <button
                    id="nav-btn-admin-track"
                    onClick={() => setCurrentView('track-complaint')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'track-complaint'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Audit Tracker</span>
                  </button>
                </>
              )}

              {/* User badge & Logout */}
              <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-zinc-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-200 truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center justify-end gap-1">
                    {user.role === 'admin' ? (
                      <span className="text-cyan-400 font-mono flex items-center">
                        <ShieldAlert className="w-2.5 h-2.5 mr-0.5 inline" /> Admin
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-mono">
                        {user.studentId || 'Student'}
                      </span>
                    )}
                  </span>
                </div>

                <button
                  id="nav-btn-logout"
                  onClick={() => {
                    logout();
                    setCurrentView('launch');
                  }}
                  title="Log out"
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>
          ) : (
            /* Logged Out Navigation */
            <div className="flex items-center gap-3">
              <button
                id="nav-btn-guest-track"
                onClick={() => setCurrentView('track-complaint')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Track By ID</span>
              </button>

              <button
                id="nav-btn-campus-login"
                onClick={() => setCurrentView('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all font-semibold shadow-md shadow-emerald-500/20"
              >
                Campus Login
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
