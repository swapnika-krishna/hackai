import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  setCurrentView: (view: string) => void;
  defaultRole?: UserRole;
  accessDeniedMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  setCurrentView, 
  defaultRole = 'student',
  accessDeniedMessage 
}) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(accessDeniedMessage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrId.trim()) {
      setError(selectedRole === 'student' ? 'Please enter your Student Email or Roll Number' : 'Please enter your Admin Email or ID');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(emailOrId.trim(), password, selectedRole);
    setIsSubmitting(false);

    if (result.success) {
      if (selectedRole === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('student-dashboard');
      }
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickFillAdmin = () => {
    setSelectedRole('admin');
    setEmailOrId('admin@campus.edu');
    setPassword('admin123');
    setError(null);
  };

  const handleQuickFillStudent = () => {
    setSelectedRole('student');
    setEmailOrId('rahul@example.com');
    setPassword('Rahul@123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-emerald-400 mb-3 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Campus Portal Login
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select your role to access the CivicMind resolution platform
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
              
              <button
                type="button"
                id="role-select-student"
                onClick={() => {
                  setSelectedRole('student');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === 'student'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="role-select-admin"
                onClick={() => {
                  setSelectedRole('admin');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>

            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / ID Input */}
            <div>
              <label 
                htmlFor="login-email-input"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                {selectedRole === 'student' ? 'Student Email / Roll Number' : 'Admin Email / ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder={selectedRole === 'student' ? 'e.g. rahul@example.com or 23CSE001' : 'admin@campus.edu'}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="login-password-input"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-zinc-950 transition-all shadow-md flex items-center justify-center gap-2 mt-6 ${
                selectedRole === 'admin'
                  ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Login as {selectedRole === 'student' ? 'Student' : 'Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Student Signup Link */}
          {selectedRole === 'student' && (
            <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
              <p className="text-xs text-zinc-400 mb-2">
                Don't have a registered student account yet?
              </p>
              <button
                id="login-to-register-btn"
                type="button"
                onClick={() => setCurrentView('register')}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Create Student Account</span>
              </button>
            </div>
          )}

          {/* Quick Demo Credentials helper */}
          <div className="mt-5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 font-medium mb-1.5">
              Quick Hackathon Evaluation Fill:
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="text-[11px] px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
              >
                Fill Admin (admin@campus.edu)
              </button>
              <button
                type="button"
                onClick={handleQuickFillStudent}
                className="text-[11px] px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40 transition-colors"
              >
                Fill Student Demo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
