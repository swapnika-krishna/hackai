import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  FileText, 
  Search, 
  User as UserIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Inbox,
  Activity,
  Layers,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, StudentStats } from '../types';

interface StudentDashboardProps {
  setCurrentView: (view: string) => void;
  setSelectedComplaintId: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  setCurrentView, 
  setSelectedComplaintId 
}) => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalSubmitted: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    resolutionRate: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      // Fetch dynamic stats from database
      const statsRes = await fetch('/api/stats/student', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch user's complaints
      const complaintsRes = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        setRecentComplaints(complaintsData.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">Submitted</span>;
      case 'Under Review':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Under Review</span>;
      case 'Assigned':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Assigned</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved ✓</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">{status}</span>;
    }
  };

  const getSeverityBadge = (sev: Complaint['severity']) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-700/40 text-zinc-300 border border-zinc-600/40">LOW</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Student Portal
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              Roll No: {user?.studentId || 'N/A'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Department: {user?.department || 'CSE'} | Year: {user?.year || '3'}
          </p>
        </div>

        {/* Quick Main Action */}
        <button
          id="student-dash-submit-btn"
          onClick={() => setCurrentView('submit-complaint')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Complaint</span>
        </button>
      </div>

      {/* Dynamic Summary Cards calculated from actual DB */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        {/* Total Complaints Submitted */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Complaints Submitted
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {isLoading ? '...' : stats.totalSubmitted}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Total campus issues logged by you
          </p>
        </div>

        {/* Complaints Resolved */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Complaints Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {isLoading ? '...' : stats.resolved}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Successfully closed & verified
          </p>
        </div>

        {/* Complaints Pending */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Complaints Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {isLoading ? '...' : stats.pending + stats.inProgress}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            {stats.inProgress} In Progress • {stats.pending} In Review
          </p>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <button
          id="dash-nav-submit"
          onClick={() => setCurrentView('submit-complaint')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100">Submit Complaint</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Report a new campus issue</p>
        </button>

        <button
          id="dash-nav-my-complaints"
          onClick={() => setCurrentView('my-complaints')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100">My Complaints</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">View your ticket history</p>
        </button>

        <button
          id="dash-nav-track"
          onClick={() => setCurrentView('track-complaint')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
            <Search className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100">Track Complaint</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Check real-time status</p>
        </button>

        <button
          id="dash-nav-profile"
          onClick={() => setCurrentView('profile')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-2 group-hover:scale-110 transition-transform">
            <UserIcon className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100">Profile & Stats</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Account & metrics</p>
        </button>
      </div>

      {/* Complaints Section */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>My Recent Complaints</span>
              {recentComplaints.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
                  {recentComplaints.length} Total
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live complaint status updates from the campus resolution desk
            </p>
          </div>

          {recentComplaints.length > 0 && (
            <button
              onClick={() => setCurrentView('my-complaints')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ZERO COMPLAINT STATE (MANDATORY REQUIREMENT) */}
        {recentComplaints.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 mb-4">
              <Inbox className="w-8 h-8 text-zinc-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-zinc-100 mb-1">
              0 Complaints
            </h3>
            
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
              You haven't submitted any complaints yet. All campus problems you report will appear here.
            </p>

            <button
              id="zero-state-submit-first-btn"
              onClick={() => setCurrentView('submit-complaint')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Your First Complaint</span>
            </button>
          </div>
        ) : (
          /* Actual Real Complaints List */
          <div className="space-y-3">
            {recentComplaints.slice(0, 5).map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => {
                  setSelectedComplaintId(complaint.complaintId);
                  setCurrentView('track-complaint');
                }}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {complaint.complaintId}
                    </span>
                    {getSeverityBadge(complaint.severity)}
                    <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {complaint.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors truncate">
                    {complaint.title}
                  </h4>

                  <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>📍 {complaint.location.block}, {complaint.location.floor}</span>
                    <span>🏢 Dept: {complaint.department}</span>
                    <span>⏳ {complaint.estimatedActionTime}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <div>{getStatusBadge(complaint.status)}</div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
