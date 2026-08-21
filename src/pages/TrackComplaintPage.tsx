import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Calendar,
  AlertTriangle,
  History,
  FileText,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus } from '../types';

interface TrackComplaintPageProps {
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string) => void;
  setCurrentView: (view: string) => void;
}

const LIFECYCLE_STEPS: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const TrackComplaintPage: React.FC<TrackComplaintPageProps> = ({
  selectedComplaintId,
  setSelectedComplaintId,
  setCurrentView,
}) => {
  const { token, user } = useAuth();

  const [searchInput, setSearchInput] = useState(selectedComplaintId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedComplaintId) {
      setSearchInput(selectedComplaintId);
      fetchComplaint(selectedComplaintId);
    }
  }, [selectedComplaintId]);

  const fetchComplaint = async (queryId: string) => {
    const trimmed = queryId.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/complaints/track/${encodeURIComponent(trimmed)}`, {
        headers,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `No complaint found with ID: ${trimmed}`);
      }

      const data = await res.json();
      setComplaint(data.complaint);
      setSelectedComplaintId(data.complaint.complaintId);
    } catch (err: any) {
      setError(err.message);
      setComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(searchInput);
  };

  // Helper for time since submission
  const getTimeSince = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Helper for overdue check
  const isOverdue = (complaint: Complaint) => {
    if (complaint.status === 'Resolved') return false;
    const diffHours = (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  const getStatusIndex = (status: ComplaintStatus) => {
    return LIFECYCLE_STEPS.indexOf(status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
          Real-Time Audit Ledger
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Track Campus Complaint
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Enter any complaint tracking ID (e.g. <code className="text-emerald-300 font-mono">CIV-2026-000001</code>) to inspect live SLA stages, admin remarks, and verifiable resolution audit trails.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="track-complaint-id-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Complaint ID (e.g. CIV-2026-000001)"
            className="w-full pl-12 pr-28 py-3.5 bg-zinc-900 border border-zinc-700/80 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-lg font-mono uppercase"
          />
          <button
            id="track-complaint-search-btn"
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="absolute right-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-colors"
          >
            {isLoading ? 'Tracking...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-zinc-400">Querying verified database records...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="max-w-xl mx-auto p-5 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-rose-200">Complaint Not Found</h3>
          <p className="text-xs text-zinc-400 mt-1">{error}</p>
        </div>
      )}

      {/* Complaint Details View */}
      {complaint && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Main Overview Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                    {complaint.complaintId}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    complaint.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    complaint.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    complaint.severity === 'Medium' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-zinc-800 text-zinc-300'
                  }`}>
                    {complaint.severity.toUpperCase()} SEVERITY
                  </span>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {complaint.priority}
                  </span>

                  {isOverdue(complaint) && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700 animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> OVERDUE
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {complaint.title}
                </h2>
              </div>

              {/* Submission Age */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-zinc-400">
                <span className="text-zinc-500">Time Since Submission:</span>
                <span className="font-semibold text-zinc-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {getTimeSince(complaint.createdAt)}
                </span>
              </div>
            </div>

            {/* REAL STATUS LIFECYCLE TIMELINE (MANDATORY REQUIREMENT) */}
            <div className="py-8">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" /> Real Status Lifecycle
              </h3>

              <div className="relative">
                {/* Background Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 z-0" />
                
                {/* Active Progress Line */}
                <div 
                  className="hidden sm:block absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${(getStatusIndex(complaint.status) / (LIFECYCLE_STEPS.length - 1)) * 100}%`
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const currentIdx = getStatusIndex(complaint.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                          isPassed
                            ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>

                        <div>
                          <p className={`text-xs font-semibold ${
                            isCurrent ? 'text-emerald-400 font-bold' : isPassed ? 'text-zinc-200' : 'text-zinc-500'
                          }`}>
                            {step}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-500 font-medium block">
                              Active Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80">
              
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block text-[11px] mb-1 font-semibold uppercase tracking-wider">
                  Responsible Department
                </span>
                <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  {complaint.department}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Category: {complaint.category}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block text-[11px] mb-1 font-semibold uppercase tracking-wider">
                  Location & Placement
                </span>
                <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {complaint.location.block}, {complaint.location.floor}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 truncate">
                  Spot: {complaint.location.specificLocation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block text-[11px] mb-1 font-semibold uppercase tracking-wider">
                  Service Level Target (SLA)
                </span>
                <p className="text-xs font-semibold text-zinc-200">
                  Action: <span className="text-emerald-300">{complaint.estimatedActionTime}</span>
                </p>
                <p className="text-xs font-semibold text-zinc-200 mt-1">
                  Resolution: <span className="text-cyan-300">{complaint.estimatedResolutionTime}</span>
                </p>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  *AI generated SLA estimates based on severity
                </span>
              </div>

            </div>

            {/* Description & Image Section */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Student Problem Description
                </h4>
                <p className="text-sm text-zinc-200 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {complaint.imageUrl && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Attached Evidence Photo
                  </h4>
                  <div className="max-w-md rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint attachment"
                      className="w-full h-auto max-h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              {complaint.adminRemarks && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Latest Administrator Remark
                  </h4>
                  <p className="text-xs text-zinc-200">
                    "{complaint.adminRemarks}"
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* AUDIT TRAIL & HISTORY LOG WITH REAL TIMESTAMPS */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>Verifiable Complaint History Log</span>
            </h3>

            {complaint.history && complaint.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {complaint.history.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-emerald-400 group-hover:bg-emerald-400 transition-colors" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-zinc-100">
                        {item.action}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} • {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400">
                      <span className="text-emerald-400 font-medium">Actor: {item.changedBy}</span>
                      {item.remark && (
                        <p className="text-zinc-300 mt-1 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                          {item.remark}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Initial registration logged. Awaiting first administrator review.
              </p>
            )}
          </div>

          {/* Admin Fast Action Hook if Admin is logged in */}
          {user?.role === 'admin' && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-700/40 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">Logged in as Administrator</span>
                <span className="text-[11px] text-zinc-400">You can advance the status or reassign this ticket from the Admin Console.</span>
              </div>
              <button
                onClick={() => setCurrentView('admin-complaints')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors shrink-0"
              >
                Open in Admin Console
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
