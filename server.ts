import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { analyzeComplaintWithGemini } from './server/gemini.js';
import { UserRole } from './src/types.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'civicresolve-campus-secret-key-2026';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decodedUser;
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with ample limit for image attachments (base64)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CivicResolve API',
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // AUTH ROUTES
  // -------------------------------------------------------------

  // Student Registration
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, studentId, email, phone, department, year, password } = req.body;

      if (!name || !studentId || !email || !password) {
        return res.status(400).json({ error: 'Missing required registration fields' });
      }

      // Check existing email
      const existingEmail = db.findUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      // Check existing student ID
      const existingStudentId = db.findUserByStudentId(studentId);
      if (existingStudentId) {
        return res.status(400).json({ error: 'An account with this Student ID / Roll No already exists.' });
      }

      const user = db.createUser({
        name,
        studentId,
        email,
        phone: phone || '',
        department: department || 'General',
        year: year || '1',
        role: 'student',
        password,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful',
        user,
        token,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // Login (Student or Admin)
  app.post('/api/auth/login', (req, res) => {
    try {
      const { emailOrId, password, selectedRole } = req.body;

      if (!emailOrId || !password) {
        return res.status(400).json({ error: 'Email/ID and password are required' });
      }

      // Find by email or student ID
      let user = db.findUserByEmail(emailOrId);
      if (!user) {
        user = db.findUserByStudentId(emailOrId);
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials. User not found.' });
      }

      // Verify Role
      if (selectedRole && user.role !== selectedRole) {
        return res.status(403).json({
          error: `This account does not have ${selectedRole} privileges. Please switch to the ${user.role} login option.`,
        });
      }

      // Verify Password
      const isValid = db.verifyPassword(password, (user as any).passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...cleanUser } = user as any;

      res.json({
        message: 'Login successful',
        user: cleanUser,
        token,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // Get Current Profile
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    const user = db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...cleanUser } = user as any;
    res.json({ user: cleanUser });
  });

  // Update Profile
  app.patch('/api/auth/profile', authenticateToken, (req: AuthRequest, res) => {
    try {
      const { name, phone, department, year, notificationPreferences } = req.body;
      const updated = db.updateUserProfile(req.user!.id, {
        name,
        phone,
        department,
        year,
        notificationPreferences,
      });

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully', user: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Profile update failed' });
    }
  });

  // Change Password
  app.post('/api/auth/change-password', authenticateToken, (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new passwords are required' });
      }

      const success = db.changeUserPassword(req.user!.id, currentPassword, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      res.json({ message: 'Password updated successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Password update failed' });
    }
  });

  // -------------------------------------------------------------
  // COMPLAINT ROUTES
  // -------------------------------------------------------------

  // Duplicate Complaint Check
  app.post('/api/complaints/check-duplicate', authenticateToken, (req: AuthRequest, res) => {
    try {
      const { title, description, block, category } = req.body;
      if (!title || !block || !category) {
        return res.json({ duplicates: [] });
      }

      const duplicates = db.checkDuplicates(title, description || '', block, category);
      res.json({ duplicates });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Submit Complaint with AI Triage
  app.post('/api/complaints', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { title, description, category, location, imageUrl } = req.body;

      if (!title || !description || !category || !location || !location.block) {
        return res.status(400).json({ error: 'Missing required complaint information' });
      }

      const user = db.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User account not found' });
      }

      // Run Gemini AI Analysis
      const aiAnalysis = await analyzeComplaintWithGemini({
        title,
        description,
        category,
        location,
        imageBase64: imageUrl,
      });

      const newComplaint = db.createComplaint({
        userId: user.id,
        studentName: user.name,
        studentIdNumber: user.studentId,
        studentEmail: user.email,
        studentPhone: user.phone,
        studentDepartment: user.department,
        studentYear: user.year,
        title,
        description,
        category: aiAnalysis.category || category,
        location: {
          block: location.block,
          floor: location.floor || 'Ground Floor',
          specificLocation: location.specificLocation || 'General Area',
        },
        imageUrl: imageUrl || undefined,
        severity: aiAnalysis.severity,
        priority: aiAnalysis.priority,
        department: aiAnalysis.responsibleDepartment,
        estimatedActionTime: aiAnalysis.estimatedActionTime,
        estimatedResolutionTime: aiAnalysis.estimatedResolutionTime,
        aiSummary: aiAnalysis.aiSummary,
        aiRawAnalysis: aiAnalysis,
        status: 'Submitted',
      });

      res.status(201).json({
        message: 'Complaint submitted successfully',
        complaint: newComplaint,
      });
    } catch (err: any) {
      console.error('Complaint submission error:', err);
      res.status(500).json({ error: err.message || 'Failed to submit complaint' });
    }
  });

  // List Complaints (Role-aware: student gets own; admin gets all)
  app.get('/api/complaints', authenticateToken, (req: AuthRequest, res) => {
    try {
      if (req.user!.role === 'admin') {
        const complaints = db.getAllComplaints();
        res.json({ complaints });
      } else {
        const complaints = db.getComplaintsByUser(req.user!.id);
        res.json({ complaints });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Track Complaint by ID / complaintId (Public or Authenticated)
  app.get('/api/complaints/track/:complaintId', (req, res) => {
    try {
      const { complaintId } = req.params;
      const complaint = db.getComplaintById(complaintId);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found with ID: ' + complaintId });
      }

      res.json({ complaint });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Single Complaint Details (Protected)
  app.get('/api/complaints/:id', authenticateToken, (req: AuthRequest, res) => {
    try {
      const complaint = db.getComplaintById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Security check: non-admins can only see their own complaints
      if (req.user!.role !== 'admin' && complaint.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized to view this complaint' });
      }

      res.json({ complaint });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Update Complaint (Status, Department, Severity, Priority, Remarks)
  app.patch('/api/complaints/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
    try {
      const { status, severity, priority, department, estimatedActionTime, estimatedResolutionTime, remark } = req.body;

      const updatedComplaint = db.updateComplaintStatus(req.params.id, {
        status,
        severity,
        priority,
        department,
        estimatedActionTime,
        estimatedResolutionTime,
        remark,
        adminName: req.user!.name || 'Administrator',
      });

      if (!updatedComplaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json({
        message: 'Complaint updated successfully',
        complaint: updatedComplaint,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // STATS ROUTES
  // -------------------------------------------------------------

  // Student Dashboard Stats
  app.get('/api/stats/student', authenticateToken, (req: AuthRequest, res) => {
    try {
      const stats = db.getStudentStats(req.user!.id);
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Dashboard Stats
  app.get('/api/stats/admin', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
    try {
      const stats = db.getAdminStats();
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE & STATIC SERVING
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
