import React, { useState } from 'react';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CAMPUS_DEPARTMENTS_AND_DEGREES } from '../constants/campus';

interface RegisterPageProps {
  setCurrentView: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentView }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering (CSE)',
    year: '3',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.studentId.trim()) {
      setError('Please enter your Student ID / Roll Number');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      name: formData.name.trim(),
      studentId: formData.studentId.trim().toUpperCase(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      year: formData.year,
      password: formData.password,
    });

    setIsSubmitting(false);

    if (result.success) {
      setCurrentView('student-dashboard');
    } else {
      setError(result.error || 'Failed to create student account');
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Rahul Sharma',
      studentId: '23CSE001',
      email: 'rahul@example.com',
      phone: '9876543210',
      department: 'Computer Science (CSE)',
      year: '3',
      password: 'Rahul@123',
      confirmPassword: 'Rahul@123',
    });
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-xl w-full">
        
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Student Registration
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Create your official student account to submit & track campus complaints
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Name & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Student ID / Roll No <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g. 23CSE001"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 uppercase"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Campus / Personal Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Department & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  >
                    {CAMPUS_DEPARTMENTS_AND_DEGREES.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Academic Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  >
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                    <option value="PG">Postgraduate / Research</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  Registering Account...
                </span>
              ) : (
                <>
                  <span>Complete Student Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill & Return */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill Demo Data (Rahul, 23CSE001)
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Already registered? <span className="text-emerald-400 font-semibold">Sign In</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
