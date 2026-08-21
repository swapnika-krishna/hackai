import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import { User, Complaint, ComplaintHistoryItem, StudentStats, AdminStats } from '../src/types';

interface DBData {
  users: (User & { passwordHash: string })[];
  complaints: Complaint[];
  complaintHistory: ComplaintHistoryItem[];
  counters: {
    complaintSeq: number;
    year: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'civicmind_db.json');

function cleanForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

class Database {
  private data: DBData = {
    users: [],
    complaints: [],
    complaintHistory: [],
    counters: {
      complaintSeq: 0,
      year: new Date().getFullYear(),
    },
  };

  private firestoreDb: Firestore | null = null;
  private isFirestoreReady: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    // 1. Load local cache first for instant startup
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.saveLocal();
      }
    } catch (err) {
      console.error('Error reading local cache:', err);
      this.seedInitialData();
      this.saveLocal();
    }

    // 2. Initialize Firebase Firestore Cloud Database
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const app = getApps().length === 0 ? initializeApp(config) : getApp();
        this.firestoreDb = getFirestore(app, config.firestoreDatabaseId);
        this.isFirestoreReady = true;
        console.log(`[Firestore] Connected to Cloud Database: ${config.firestoreDatabaseId}`);

        // Sync from Cloud Firestore
        await this.syncFromFirestore();
      }
    } catch (err) {
      console.warn('[Firestore] Initialization fallback to local store:', err);
    }
  }

  private async syncFromFirestore() {
    if (!this.firestoreDb) return;

    try {
      // Sync users from Firestore
      const usersCol = collection(this.firestoreDb, 'users');
      const usersSnapshot = await getDocs(usersCol);
      if (!usersSnapshot.empty) {
        const remoteUsers: (User & { passwordHash: string })[] = [];
        usersSnapshot.forEach((docSnap) => {
          remoteUsers.push(docSnap.data() as User & { passwordHash: string });
        });
        if (remoteUsers.length > 0) {
          this.data.users = remoteUsers;
        }
      } else {
        // Seed default admin in Firestore
        for (const user of this.data.users) {
          await setDoc(doc(this.firestoreDb, 'users', user.id), cleanForFirestore(user));
        }
      }

      // Sync complaints from Firestore
      const complaintsCol = collection(this.firestoreDb, 'complaints');
      const complaintsSnapshot = await getDocs(complaintsCol);
      if (!complaintsSnapshot.empty) {
        const remoteComplaints: Complaint[] = [];
        complaintsSnapshot.forEach((docSnap) => {
          remoteComplaints.push(docSnap.data() as Complaint);
        });
        if (remoteComplaints.length > 0) {
          // Sort by creation desc
          remoteComplaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.data.complaints = remoteComplaints;
        }
      }

      // Sync counters from Firestore
      const countersCol = collection(this.firestoreDb, 'system');
      const countersSnapshot = await getDocs(countersCol);
      countersSnapshot.forEach((docSnap) => {
        if (docSnap.id === 'counters') {
          this.data.counters = docSnap.data() as { complaintSeq: number; year: number };
        }
      });

      this.saveLocal();
      console.log(`[Firestore] Cloud database synchronization complete (${this.data.complaints.length} complaints, ${this.data.users.length} users).`);
    } catch (err) {
      console.warn('[Firestore] Sync warning (using active cache):', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);

    this.data = {
      users: [
        {
          id: 'usr-admin-01',
          name: 'Campus Administrator',
          email: 'admin@campus.edu',
          phone: '9876543210',
          department: 'Campus Administration',
          role: 'admin',
          passwordHash: adminPasswordHash,
          createdAt: new Date().toISOString(),
          notificationPreferences: {
            emailAlerts: true,
            smsAlerts: true,
            statusChangeAlerts: true,
          },
        },
      ],
      complaints: [],
      complaintHistory: [],
      counters: {
        complaintSeq: 0,
        year: 2026,
      },
    };
  }

  private saveLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private async persistUserToCloud(user: User & { passwordHash: string }) {
    if (!this.firestoreDb) return;
    try {
      await setDoc(doc(this.firestoreDb, 'users', user.id), cleanForFirestore(user));
    } catch (e) {
      console.error('[Firestore] Error persisting user:', e);
    }
  }

  private async persistComplaintToCloud(complaint: Complaint) {
    if (!this.firestoreDb) return;
    try {
      await setDoc(doc(this.firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));
      // Persist sequence counters
      await setDoc(doc(this.firestoreDb, 'system', 'counters'), cleanForFirestore(this.data.counters));
    } catch (e) {
      console.error('[Firestore] Error persisting complaint:', e);
    }
  }

  // Users
  public findUserByEmail(email: string) {
    return this.data.users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByStudentId(studentId: string) {
    return this.data.users.find(
      (u) => u.studentId && u.studentId.toLowerCase().trim() === studentId.toLowerCase().trim()
    );
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);

    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      studentId: userData.studentId,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone,
      department: userData.department,
      year: userData.year,
      role: userData.role || 'student',
      passwordHash,
      createdAt: new Date().toISOString(),
      notificationPreferences: userData.notificationPreferences || {
        emailAlerts: true,
        smsAlerts: true,
        statusChangeAlerts: true,
      },
    };

    this.data.users.push(newUser);
    this.saveLocal();
    this.persistUserToCloud(newUser);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'department' | 'year' | 'notificationPreferences'>>
  ): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.department !== undefined) user.department = updates.department;
    if (updates.year !== undefined) user.year = updates.year;
    if (updates.notificationPreferences !== undefined) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...updates.notificationPreferences,
      };
    }

    this.saveLocal();
    this.persistUserToCloud(user);

    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  }

  public changeUserPassword(userId: string, oldPass: string, newPass: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;

    const isValid = bcrypt.compareSync(oldPass, user.passwordHash);
    if (!isValid) return false;

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPass, salt);
    this.saveLocal();
    this.persistUserToCloud(user);
    return true;
  }

  public verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  // Sequence Generation
  public getNextComplaintId(): string {
    const currentYear = 2026;
    this.data.counters.complaintSeq += 1;
    const seq = this.data.counters.complaintSeq;
    const seqFormatted = String(seq).padStart(6, '0');
    this.saveLocal();
    return `CIV-${currentYear}-${seqFormatted}`;
  }

  // Duplicate Check
  public checkDuplicates(title: string, description: string, locationBlock: string, category: string): Complaint[] {
    const activeComplaints = this.data.complaints.filter(
      (c) => c.status !== 'Resolved'
    );

    const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    return activeComplaints.filter((c) => {
      // Same location and category
      const sameLocation =
        c.location.block.toLowerCase().trim() === locationBlock.toLowerCase().trim();
      const sameCategory =
        c.category.toLowerCase().trim() === category.toLowerCase().trim();

      // Word overlap in title
      const cTitle = c.title.toLowerCase();
      const wordMatch = titleWords.some((w) => cTitle.includes(w));

      return (sameLocation && sameCategory) || (sameLocation && wordMatch);
    });
  }

  // Complaints
  public createComplaint(complaintData: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'updatedAt' | 'history'>): Complaint {
    const complaintId = this.getNextComplaintId();
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      ...complaintData,
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      complaintId,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      history: [],
    };

    // Add initial history
    const initialHistoryItem: ComplaintHistoryItem = {
      id: `hst-${Date.now()}-1`,
      complaintId: newComplaint.complaintId,
      newStatus: 'Submitted',
      action: 'Complaint Submitted',
      changedBy: `Student (${newComplaint.studentName})`,
      changedByRole: 'student',
      remark: 'Complaint registered in campus portal.',
      timestamp: now,
    };

    const aiHistoryItem: ComplaintHistoryItem = {
      id: `hst-${Date.now()}-2`,
      complaintId: newComplaint.complaintId,
      newStatus: 'Submitted',
      action: 'AI Triage & Analysis Completed',
      changedBy: 'CivicMind AI Engine',
      changedByRole: 'system',
      remark: `Assigned Category: ${newComplaint.category} | Severity: ${newComplaint.severity} | Priority: ${newComplaint.priority} | Department: ${newComplaint.department}`,
      timestamp: now,
    };

    newComplaint.history = [initialHistoryItem, aiHistoryItem];
    this.data.complaints.unshift(newComplaint);
    this.data.complaintHistory.push(initialHistoryItem, aiHistoryItem);

    this.saveLocal();
    this.persistComplaintToCloud(newComplaint);

    return newComplaint;
  }

  public getComplaintsByUser(userId: string): Complaint[] {
    return this.data.complaints.filter((c) => c.userId === userId);
  }

  public getAllComplaints(): Complaint[] {
    return this.data.complaints;
  }

  public getComplaintById(idOrComplaintId: string): Complaint | null {
    const match = this.data.complaints.find(
      (c) => c.id === idOrComplaintId || c.complaintId.toLowerCase() === idOrComplaintId.toLowerCase()
    );
    return match || null;
  }

  public updateComplaintStatus(
    complaintId: string,
    updates: {
      status?: Complaint['status'];
      severity?: Complaint['severity'];
      priority?: Complaint['priority'];
      department?: string;
      estimatedActionTime?: string;
      estimatedResolutionTime?: string;
      remark?: string;
      adminName: string;
    }
  ): Complaint | null {
    const complaint = this.data.complaints.find(
      (c) => c.id === complaintId || c.complaintId.toLowerCase() === complaintId.toLowerCase()
    );
    if (!complaint) return null;

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    if (updates.status && updates.status !== previousStatus) {
      complaint.status = updates.status;
      if (updates.status === 'Resolved') {
        complaint.resolvedAt = now;
      } else {
        complaint.resolvedAt = undefined;
      }
    }

    if (updates.severity) complaint.severity = updates.severity;
    if (updates.priority) complaint.priority = updates.priority;
    if (updates.department) complaint.department = updates.department;
    if (updates.estimatedActionTime) complaint.estimatedActionTime = updates.estimatedActionTime;
    if (updates.estimatedResolutionTime) complaint.estimatedResolutionTime = updates.estimatedResolutionTime;
    if (updates.remark) complaint.adminRemarks = updates.remark;

    complaint.updatedAt = now;

    // Log history
    const historyItem: ComplaintHistoryItem = {
      id: `hst-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      complaintId: complaint.complaintId,
      previousStatus: previousStatus,
      newStatus: complaint.status,
      action: updates.status && updates.status !== previousStatus
        ? `Status changed to ${updates.status}`
        : 'Admin Updated Complaint Details',
      changedBy: `Admin (${updates.adminName})`,
      changedByRole: 'admin',
      remark: updates.remark || `Updated details (Dept: ${complaint.department}, Priority: ${complaint.priority})`,
      timestamp: now,
    };

    if (!complaint.history) complaint.history = [];
    complaint.history.push(historyItem);
    this.data.complaintHistory.push(historyItem);

    this.saveLocal();
    this.persistComplaintToCloud(complaint);

    return complaint;
  }

  // Statistics
  public getStudentStats(userId: string): StudentStats {
    const userComplaints = this.getComplaintsByUser(userId);
    const totalSubmitted = userComplaints.length;
    const resolved = userComplaints.filter((c) => c.status === 'Resolved').length;
    const inProgress = userComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
    const pending = userComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
    const resolutionRate = totalSubmitted > 0 ? Math.round((resolved / totalSubmitted) * 100) : 0;

    return {
      totalSubmitted,
      resolved,
      pending,
      inProgress,
      resolutionRate,
    };
  }

  public getAdminStats(): AdminStats {
    const all = this.data.complaints;
    const totalComplaints = all.length;
    const resolved = all.filter((c) => c.status === 'Resolved').length;
    const pending = all.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
    const inProgress = all.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
    const highCritical = all.filter((c) => c.severity === 'High' || c.severity === 'Critical').length;

    // Overdue logic: if not resolved and submission > 24h
    const nowMs = Date.now();
    const overdue = all.filter((c) => {
      if (c.status === 'Resolved') return false;
      const createdMs = new Date(c.createdAt).getTime();
      const hoursAgo = (nowMs - createdMs) / (1000 * 60 * 60);
      return hoursAgo > 24;
    }).length;

    const categoryBreakdown: Record<string, number> = {};
    const departmentBreakdown: Record<string, number> = {};

    all.forEach((c) => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
      departmentBreakdown[c.department] = (departmentBreakdown[c.department] || 0) + 1;
    });

    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;
    const severityBreakdown: Record<string, number> = {
      Critical: all.filter((c) => c.severity === 'Critical').length,
      High: all.filter((c) => c.severity === 'High').length,
      Medium: all.filter((c) => c.severity === 'Medium').length,
      Low: all.filter((c) => c.severity === 'Low').length,
    };

    return {
      totalComplaints,
      resolvedComplaints: resolved,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      overdueComplaints: overdue,
      resolutionRate,
      departmentBreakdown,
      severityBreakdown,
      averageResolutionHours: 18,
      pending,
      inProgress,
      resolved,
      highCritical,
      overdue,
      categoryBreakdown,
    };
  }
}

export const db = new Database();
