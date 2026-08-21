export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  studentId?: string; // e.g. "23CSE001"
  email: string;
  phone: string;
  department: string;
  year?: string | number; // e.g. "3"
  role: UserRole;
  createdAt: string;
  notificationPreferences?: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    statusChangeAlerts: boolean;
  };
}

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'P1 — Urgent' | 'P1 — Critical' | 'P2 — High' | 'P3 — Normal' | 'P3 — Medium' | 'P4 — Low';

export interface ComplaintLocation {
  block: string;      // e.g. "Block A"
  floor: string;      // e.g. "Ground Floor"
  specificLocation: string; // e.g. "Near Boys Washroom"
}

export interface AIAnalysis {
  category: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  responsibleDepartment: string;
  estimatedActionTime: string;
  estimatedResolutionTime: string;
  aiSummary: string;
  confidenceScore?: number;
  detectedKeywords?: string[];
}

export interface ComplaintHistoryItem {
  id: string;
  complaintId: string;
  previousStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  action: string;
  changedBy: string; // e.g. "Admin (Chief Administrator)" or "Student (Rahul)"
  changedByRole: UserRole | 'system';
  remark?: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  complaintId: string; // e.g. "CIV-2026-000001"
  userId: string;
  studentName: string;
  studentIdNumber?: string;
  studentEmail: string;
  studentPhone: string;
  studentDepartment: string;
  studentYear?: string | number;
  
  // Backwards compatibility alias
  userName?: string;
  userStudentId?: string;

  title: string;
  description: string;
  category: string;
  location: ComplaintLocation;
  imageUrl?: string;
  
  // AI & Admin assigned attributes
  severity: SeverityLevel;
  priority: PriorityLevel;
  department: string;
  estimatedActionTime: string;
  estimatedResolutionTime: string;
  aiSummary?: string;
  aiRawAnalysis?: AIAnalysis;
  
  status: ComplaintStatus;
  assignedTo?: string;
  adminRemarks?: string;
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  history?: ComplaintHistoryItem[];
}

export interface StudentStats {
  totalSubmitted: number;
  resolved: number;
  pending: number;
  inProgress: number;
  resolutionRate: number; // percentage
}

export interface AdminStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  overdueComplaints: number;
  resolutionRate: number;
  departmentBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
  averageResolutionHours: number;
  
  // aliases
  pending?: number;
  inProgress?: number;
  resolved?: number;
  highCritical?: number;
  overdue?: number;
  categoryBreakdown?: Record<string, number>;
}
