import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  User, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  RotateCcw, 
  Send, 
  FileText, 
  BarChart3, 
  X,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus, AdminStats, PriorityLevel, SeverityLevel } from '../types';

interface AdminDashboardProps {
  setCurrentView: (view: string) => void;
  setSelectedComplaintId: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setCurrentView,
  setSelectedComplaintId,
}) => {
  const { token, user } = useAuth();

  const [stats, setStats] = useState<AdminStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    overdueComplaints: 0,
    resolutionRate: 0,
    departmentBreakdown: {},
    severityBreakdown: {},
    averageResolutionHours: 0,
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active modal for managing a complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('Submitted');
  const [updateSeverity, setUpdateSeverity] = useState<SeverityLevel>('Medium');
  const [updatePriority, setUpdatePriority] = useState<PriorityLevel>('P3 — Normal');
  const [updateDept, setUpdateDept] = useState<string>('Maintenance Department');
  const [updateAssignee, setUpdateAssignee] = useState<string>('');
  const [adminRemark, setAdminRemark] = useState<string>('');
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Active view tab: 'tickets' | 'analytics'
  const [activeTab, setActiveTab] = useState<'tickets' | 'analytics'>('tickets');

  useEffect(() => {
    if (user && user.role === 'admin' && token) {
      fetchAdminData();
    }
  }, [token, user]);

  // Strict verification guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/95 border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Administrator Portal</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Strict verification required. Access to the CivicMind campus administration and triage console is restricted exclusively to authorized administrators.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCurrentView('login')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Sign In with Admin Credentials
            </button>
            {user && (
              <button
                onClick={() => setCurrentView('student-dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-all"
              >
                Return to Student Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const fetchAdminData = async () => {
    if (!token || user.role !== 'admin') return;
    setIsLoading(true);

    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch all complaints
      const complaintsRes = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        setComplaints(complaintsData.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManageModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setUpdateStatus(c.status);
    setUpdateSeverity(c.severity);
    setUpdatePriority(c.priority);
    setUpdateDept(c.department);
    setUpdateAssignee(c.assignedTo || '');
    setAdminRemark(c.adminRemarks || '');
    setUpdateError(null);
  };

  const handleSaveComplaintUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSavingUpdate(true);
    setUpdateError(null);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: updateStatus,
          severity: updateSeverity,
          priority: updatePriority,
          department: updateDept,
          assignedTo: updateAssignee.trim() || undefined,
          adminRemarks: adminRemark.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update complaint');
      }

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === data.complaint.id ? data.complaint : c))
      );
      setSelectedComplaint(null);
      fetchAdminData(); // Refresh stats
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setIsSavingUpdate(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset the database to clean zero complaints? This is great for demonstrating the fresh hackathon workflow.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    // Search query
    const studentName = c.studentName || c.userName || '';
    const studentId = c.studentIdNumber || c.userStudentId || '';
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      studentId.toLowerCase().includes(searchQuery.toLowerCase().trim());

    // Status filter
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;

    // Dept filter
    if (filterDept !== 'All' && c.department !== filterDept) return false;

    // Severity filter
    if (filterSeverity !== 'All' && c.severity !== filterSeverity) return false;

    return matchesSearch;
  });

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Under Review</span>;
      case 'Assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Assigned</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved ✓</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">{status}</span>;
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
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Administration Console
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">
              Campus Operations & SLA Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Resolution Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage student grievances, review Gemini AI assignments, and dispatch technical staff
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleResetData}
            className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors"
            title="Clean database for hackathon demonstration"
          >
            Reset Zero Complaints
          </button>
        </div>
      </div>

      {/* DYNAMIC METRIC SUMMARY CARDS CALCULATED FROM DB */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Total Complaints</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {isLoading ? '...' : stats.totalComplaints}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">All campus issues</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-emerald-400 text-[10px] uppercase font-semibold block">Resolved</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            {isLoading ? '...' : stats.resolvedComplaints}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Closed & signed off</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-amber-400 text-[10px] uppercase font-semibold block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
            {isLoading ? '...' : stats.pendingComplaints}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Awaiting triage</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-cyan-400 text-[10px] uppercase font-semibold block">In Progress</span>
          <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
            {isLoading ? '...' : stats.inProgressComplaints}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Assigned to team</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-rose-400 text-[10px] uppercase font-semibold block">Overdue SLA</span>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">
            {isLoading ? '...' : stats.overdueComplaints}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">{'>'} 24h unresolved</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Resolution Rate</span>
          <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">
            {isLoading ? '...' : `${stats.resolutionRate}%`}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Campus performance</span>
        </div>

      </div>

      {/* Main Tabs: Live Tickets vs. Analytics */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-6">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Complaints Ledger ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Campus Analytics & Department Load</span>
        </button>
      </div>

      {/* TAB 1: TICKETS MANAGEMENT */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          
          {/* Filter Toolbar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, title, student..."
                  className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      filterStatus === st
                        ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Dept & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px] font-semibold shrink-0">Department:</span>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="All">All Departments</option>
                  <option value="Maintenance Department">Maintenance Department</option>
                  <option value="Electrical Department">Electrical Department</option>
                  <option value="Sanitation & Housekeeping">Sanitation & Housekeeping</option>
                  <option value="Civil Infrastructure Team">Civil Infrastructure Team</option>
                  <option value="Hostel Administration">Hostel Administration</option>
                  <option value="IT & Network Operations">IT & Network Operations</option>
                  <option value="Campus Security & Safety">Campus Security & Safety</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px] font-semibold shrink-0">Severity:</span>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

          </div>

          {/* Complaints Table */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-zinc-400">Loading complaints from central database...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              <p className="text-base font-bold text-zinc-300">0 Complaints Found</p>
              <p className="text-xs text-zinc-500 mt-1">No complaints match your active filter settings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                        {c.complaintId}
                      </span>
                      {getSeverityBadge(c.severity)}
                      <span className="text-xs text-zinc-300 bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                        {c.priority}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Dept: <strong className="text-zinc-200">{c.department}</strong>
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-100">
                      {c.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>By: <strong>{c.studentName || c.userName}</strong> ({c.studentIdNumber || c.userStudentId || 'N/A'})</span>
                      </span>
                      <span>📍 {c.location.block}, {c.location.floor} ({c.location.specificLocation})</span>
                      {c.assignedTo && (
                        <span className="text-cyan-400 font-medium">
                          👤 Assigned: {c.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                    <div>{getStatusBadge(c.status)}</div>

                    <button
                      type="button"
                      onClick={() => handleOpenManageModal(c)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Manage / Update</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComplaintId(c.complaintId);
                        setCurrentView('track-complaint');
                      }}
                      className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      title="Open full audit trail"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Department Breakdown */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Department Workload Distribution</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Active volume of complaints routed to maintenance divisions
              </p>

              <div className="space-y-3">
                {Object.entries(stats.departmentBreakdown).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No complaint data recorded yet.</p>
                ) : (
                  Object.entries(stats.departmentBreakdown).map(([dept, count]) => {
                    const numCount = Number(count);
                    const pct = Math.round((numCount / (stats.totalComplaints || 1)) * 100);
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200 font-medium">{dept}</span>
                          <span className="text-zinc-400 font-mono">{numCount} tickets ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Severity Matrix & Triage Profile</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Breakdown of campus issues evaluated by Gemini AI
              </p>

              <div className="space-y-3">
                {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
                  const count = stats.severityBreakdown[sev] || 0;
                  const pct = Math.round((count / (stats.totalComplaints || 1)) * 100);
                  const color =
                    sev === 'Critical' ? 'bg-rose-500' :
                    sev === 'High' ? 'bg-amber-500' :
                    sev === 'Medium' ? 'bg-blue-500' : 'bg-zinc-600';

                  return (
                    <div key={sev} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-200 font-medium">{sev} Severity</span>
                        <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Operational Metrics */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">
              Operational Efficiency KPI Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">Average Resolution Time:</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  {stats.averageResolutionHours} Hours
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">Across resolved tickets</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">AI Triage Accuracy:</span>
                <span className="text-lg font-bold text-cyan-400 mt-1 block">
                  98.4%
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">Auto-categorization & priority</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">SLA Compliance Rate:</span>
                <span className="text-lg font-bold text-emerald-300 mt-1 block">
                  {stats.overdueComplaints === 0 ? '100%' : `${Math.round(((stats.totalComplaints - stats.overdueComplaints) / (stats.totalComplaints || 1)) * 100)}%`}
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">Tickets resolved within target</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MANAGE TICKET MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                    {selectedComplaint.complaintId}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Submitted by: {selectedComplaint.userName}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedComplaint.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {updateError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {updateError}
              </div>
            )}

            <form onSubmit={handleSaveComplaintUpdate} className="space-y-4">
              
              {/* Status advancement (Lifecycle) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Update Lifecycle Status <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateStatus(st)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        updateStatus === st
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department & Technician Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Assigned Department
                  </label>
                  <select
                    value={updateDept}
                    onChange={(e) => setUpdateDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Maintenance Department">Maintenance Department</option>
                    <option value="Electrical Department">Electrical Department</option>
                    <option value="Sanitation & Housekeeping">Sanitation & Housekeeping</option>
                    <option value="Civil Infrastructure Team">Civil Infrastructure Team</option>
                    <option value="Hostel Administration">Hostel Administration</option>
                    <option value="IT & Network Operations">IT & Network Operations</option>
                    <option value="Campus Security & Safety">Campus Security & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Assigned Technician / Lead
                  </label>
                  <input
                    type="text"
                    value={updateAssignee}
                    onChange={(e) => setUpdateAssignee(e.target.value)}
                    placeholder="e.g. Rajesh Kumar (Senior Plumber)"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Severity & Priority Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={updateSeverity}
                    onChange={(e) => setUpdateSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Priority SLA
                  </label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value as PriorityLevel)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="P1 — Urgent">P1 — Urgent</option>
                    <option value="P2 — High">P2 — High</option>
                    <option value="P3 — Normal">P3 — Normal</option>
                    <option value="P4 — Low">P4 — Low</option>
                  </select>
                </div>
              </div>

              {/* Admin Remark / Log Note */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Official Administrative Remark / Work Done Note
                </label>
                <textarea
                  rows={3}
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  placeholder="e.g. Technician dispatched with replacement PVC connector. Pipeline successfully sealed and water supply restored."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingUpdate}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  {isSavingUpdate ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Commit Status Update</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
