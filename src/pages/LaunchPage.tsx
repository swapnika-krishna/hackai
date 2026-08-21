import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Droplets,
  Zap,
  Trash2,
  Wifi,
  Lock,
  Layers,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LaunchPageProps {
  setCurrentView: (view: string) => void;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({ setCurrentView }) => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Intelligent Campus Grievance System</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">Powered by Gemini AI</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4">
            CivicResolve
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mb-6">
            AI Civic Complaint-to-Resolution Platform
          </h2>

          {/* Short Description */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed mb-10">
            Report campus problems, track action, and see them resolved.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <button
              id="hero-campus-login-btn"
              onClick={() => setCurrentView('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>Campus Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-get-started-btn"
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-base border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
            </button>
          </div>

          {/* Key Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
            
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">Instant AI Triage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gemini automatically extracts root issues, sets severity & priority, and routes tickets to the right department.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">Transparent Timeline</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real status lifecycles from submission to resolution with verified timestamps, action logs, and SLA indicators.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">Zero Fake Data</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Strict database integrity. Real atomic sequential IDs (<code className="text-emerald-300">CIV-2026-000001</code>) and verified role-based access.
              </p>
            </div>

          </div>

          {/* Campus Issue Categories Preview */}
          <div className="mt-16 pt-12 border-t border-zinc-900">
            <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-6">
              Supported Campus Issue Categories
            </h4>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {[
                { label: 'Water & Plumbing', icon: Droplets },
                { label: 'Electrical & Power', icon: Zap },
                { label: 'Sanitation & Hygiene', icon: Trash2 },
                { label: 'Wi-Fi & Networks', icon: Wifi },
                { label: 'Campus Security', icon: Lock },
                { label: 'Hostel Facilities', icon: Building2 },
                { label: 'Classrooms & Labs', icon: Layers },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 font-medium"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-emerald-400" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-500">
        <p>CivicResolve • Smart Campus & Civic Technology Platform</p>
      </footer>
    </div>
  );
};
