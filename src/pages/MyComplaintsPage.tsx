import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Inbox, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus } from '../types';

interface MyComplaintsPageProps {
  setCurrentView: (view: string) => void;
  setSelectedComplaintId: (id: string) => void;
}

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({
  setCurrentView,
  setSelectedComplaintId,
}) => {
  const { token } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchMyComplaints();
  }, [token]);

  const fetchMyComplaints = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching my complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    // Search query
    const matchSearch =
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase().trim());

    // Status filter
    if (filterStatus === 'All') return matchSearch;
    if (filterStatus === 'Pending') {
      return matchSearch && (c.status === 'Submitted' || c.status === 'Under Review');
    }
    if (filterStatus === 'In Progress') {
      return matchSearch && (c.status === 'Assigned' || c.status === 'In Progress');
    }
    if (filterStatus === 'Resolved') {
      return matchSearch && c.status === 'Resolved';
    }

    return matchSearch;
  });

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Under Review</span>;
      case 'Assigned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Assigned</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved ✓</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">{status}</span>;
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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Complaints
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Official record of grievances logged from your student account ({complaints.length} Total)
          </p>
        </div>

        <button
          id="my-complaints-new-ticket-btn"
          onClick={() => setCurrentView('submit-complaint')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* ZERO COMPLAINT STATE CHECK */}
      {!isLoading && complaints.length === 0 ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-400 mb-5 shadow-inner">
            <Inbox className="w-8 h-8 text-zinc-400" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            0 Complaints
          </h2>

          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
            You haven't submitted any complaints yet. When you encounter maintenance, electrical, cleanliness, or hostel issues, log them here for AI-driven triage.
          </p>

          <button
            id="empty-state-submit-first-btn"
            onClick={() => setCurrentView('submit-complaint')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Your First Complaint</span>
          </button>
        </div>
      ) : (
        /* Filters & Search Toolbar */
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 shadow-sm">
            
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterStatus === tab
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or title..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Complaints Table / Card List */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-zinc-400">Loading your complaint ledger...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              <p className="text-sm text-zinc-400">No complaints matching filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaintId(c.complaintId);
                    setCurrentView('track-complaint');
                  }}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Main info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                          {c.complaintId}
                        </span>
                        {getSeverityBadge(c.severity)}
                        <span className="text-xs text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                          {c.category}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                        {c.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
                        <span>📍 {c.location.block}, {c.location.floor} ({c.location.specificLocation})</span>
                        <span>🏢 Dept: <strong className="text-zinc-200">{c.department}</strong></span>
                        <span>⏳ Target SLA: <span className="text-emerald-300">{c.estimatedResolutionTime}</span></span>
                      </div>
                    </div>

                    {/* Status & CTA */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                      <div className="text-right">
                        {getStatusBadge(c.status)}
                        {c.status === 'Resolved' && c.resolvedAt && (
                          <span className="block text-[10px] text-emerald-400 font-mono mt-1">
                            Resolved: {new Date(c.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-300 group-hover:text-emerald-400 group-hover:bg-zinc-700 transition-all"
                        title="Track and view details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
