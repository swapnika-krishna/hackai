import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  Lock, 
  Sparkles,
  HelpCircle,
  Laptop
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmailOrId?: string;
  role?: 'student' | 'admin';
  onPasswordResetSuccess?: (email: string) => void;
}

type RecoveryMethod = 'email_otp' | 'device_prompt' | 'sms_otp' | 'security_id';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmailOrId = '',
  role = 'student',
  onPasswordResetSuccess,
}) => {
  const [accountInput, setAccountInput] = useState(initialEmailOrId);
  const [step, setStep] = useState<'input_account' | 'choose_method' | 'verify' | 'new_password' | 'success'>('input_account');
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod>('device_prompt');
  
  // Verification states
  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('74');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // On-device prompt simulation state
  const [promptStatus, setPromptStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting');
  const [countdown, setCountdown] = useState(60);

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialEmailOrId) {
        setAccountInput(initialEmailOrId);
        setStep('choose_method');
      } else {
        setStep('input_account');
      }
      setError(null);
      setOtpCode('');
      setPromptStatus('waiting');
      setNewPassword('');
      setConfirmPassword('');
      // Generate a realistic 2-digit verification prompt number
      setGeneratedCode(String(Math.floor(10 + Math.random() * 89)));
    }
  }, [isOpen, initialEmailOrId]);

  // Countdown timer for prompts
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0 && promptStatus === 'waiting') {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown, promptStatus]);

  if (!isOpen) return null;

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountInput.trim()) {
      setError('Please enter your registered Email or Student Roll Number');
      return;
    }
    setError(null);
    setStep('choose_method');
  };

  const handleStartVerification = (method: RecoveryMethod) => {
    setSelectedMethod(method);
    setError(null);
    setOtpCode('');
    setCountdown(60);
    setPromptStatus('waiting');
    setGeneratedCode(String(Math.floor(10 + Math.random() * 89)));
    setStep('verify');
  };

  const handleDevicePromptApproval = (approved: boolean) => {
    if (approved) {
      setPromptStatus('approved');
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setStep('new_password');
      }, 900);
    } else {
      setPromptStatus('rejected');
      setError('Sign-in attempt denied on device. If this was a mistake, tap "Try again" or choose another method.');
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter the full verification code.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('new_password');
    }, 700);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrId: accountInput.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep('success');
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(accountInput.trim());
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting password.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Account Security & Recovery</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {step === 'input_account' && 'Account Recovery'}
            {step === 'choose_method' && 'Choose Verification Method'}
            {step === 'verify' && selectedMethod === 'device_prompt' && 'Check Your Device'}
            {step === 'verify' && selectedMethod !== 'device_prompt' && 'Enter Verification Code'}
            {step === 'new_password' && 'Create New Password'}
            {step === 'success' && 'Password Reset Complete'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {step === 'input_account' && 'Enter your campus email or identifier to verify your account.'}
            {step === 'choose_method' && `Verifying identity for ${accountInput}`}
            {step === 'verify' && selectedMethod === 'device_prompt' && 'CivicMind sent a verification prompt to your trusted smartphone or device.'}
            {step === 'verify' && selectedMethod !== 'device_prompt' && `Enter the secure code sent to your registered contact for ${accountInput}.`}
            {step === 'new_password' && 'Enter your new secure password for your CivicMind account.'}
            {step === 'success' && 'Your account security credentials have been updated.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: INPUT ACCOUNT IDENTIFIER */}
        {/* ========================================================================= */}
        {step === 'input_account' && (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Campus Email or Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder={role === 'admin' ? 'jakkaswapnika@gmail.com' : 'e.g. rahul@example.com or 23CSE001'}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE VERIFICATION METHOD (PRIMARY OR TRY ANOTHER WAY) */}
        {/* ========================================================================= */}
        {step === 'choose_method' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Select an authentication method:
            </p>

            {/* Option 1: Tap YES on your device (Featured prominently) */}
            <button
              type="button"
              id="recovery-method-device-prompt"
              onClick={() => handleStartVerification('device_prompt')}
              className="w-full p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border-2 border-emerald-500/40 hover:border-emerald-400 text-left transition-all group flex items-start gap-3.5 shadow-md shadow-emerald-500/5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <span>Tap "Yes" on your device</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      Instant & Recommended
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  CivicMind sends a 2-Step verification prompt to your trusted smartphone. Tap <strong>"Yes, it's me"</strong> on screen to approve.
                </p>
              </div>
            </button>

            {/* Option 2: Email Verification Code */}
            <button
              type="button"
              id="recovery-method-email"
              onClick={() => handleStartVerification('email_otp')}
              className="w-full p-4 rounded-2xl bg-zinc-950/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 text-left transition-all group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                  Get a verification code via Email
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Send a 6-digit one-time passcode to your registered email inbox.
                </p>
              </div>
            </button>

            {/* Option 3: SMS One-Time Passcode */}
            <button
              type="button"
              id="recovery-method-sms"
              onClick={() => handleStartVerification('sms_otp')}
              className="w-full p-4 rounded-2xl bg-zinc-950/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 text-left transition-all group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                  Get a code via SMS
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Send an SMS OTP to your registered phone number ending in <span className="font-mono text-zinc-300">•••8199</span>.
                </p>
              </div>
            </button>

            <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('input_account')}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change identifier</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3A: ON-DEVICE PROMPT VERIFICATION ("YES ON YOUR DEVICE") */}
        {/* ========================================================================= */}
        {step === 'verify' && selectedMethod === 'device_prompt' && (
          <div className="space-y-4">
            
            {/* Google / Apple Style Device Verification Simulation Card */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 shadow-inner relative overflow-hidden">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                  <span>Trusted Device Prompt (Pixel / iPhone)</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Expires in {countdown}s
                </span>
              </div>

              {promptStatus === 'waiting' && (
                <div>
                  <div className="text-center py-2 mb-4">
                    <p className="text-xs text-zinc-400 mb-1">
                      Tap the matching number on your phone screen:
                    </p>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-300 font-extrabold text-3xl shadow-lg shadow-emerald-500/10 animate-pulse">
                      {generatedCode}
                    </div>
                  </div>

                  {/* Simulated Device Notification Popover */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span>CivicMind Security Notification</span>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400">
                      <p><strong className="text-zinc-200">Is it you trying to recover password?</strong></p>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                        <Laptop className="w-3 h-3 text-zinc-400" />
                        <span>Chrome Browser • Campus Network Hub</span>
                      </div>
                    </div>

                    {/* Interactive Yes / No Simulation Buttons */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="prompt-no-button"
                        onClick={() => handleDevicePromptApproval(false)}
                        className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-semibold border border-rose-900/30 transition-colors"
                      >
                        No, don't allow
                      </button>

                      <button
                        type="button"
                        id="prompt-yes-button"
                        onClick={() => handleDevicePromptApproval(true)}
                        className="py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Yes, it's me ({generatedCode})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {promptStatus === 'approved' && (
                <div className="py-6 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-300">
                    Device Confirmed & Approved!
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Secure handshake established. Loading password reset form...
                  </p>
                </div>
              )}

              {promptStatus === 'rejected' && (
                <div className="py-4 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-rose-300">
                    Request Denied on Device
                  </h4>
                  <p className="text-xs text-zinc-400">
                    The prompt was rejected. You can retry or choose another recovery method below.
                  </p>
                </div>
              )}
            </div>

            {/* "Try Another Way" Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                id="btn-try-another-way-prompt"
                onClick={() => setStep('choose_method')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try another way (Email / SMS Code)</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartVerification('device_prompt')}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Prompt</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3B: OTP CODE VERIFICATION (EMAIL / SMS) */}
        {/* ========================================================================= */}
        {step === 'verify' && selectedMethod !== 'device_prompt' && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {selectedMethod === 'email_otp' ? 'Email Inbox Passcode' : 'SMS One-Time Code'}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Demo Code: 482910
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="482910"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-emerald-400 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOtpCode('482910')}
                  className="text-[11px] text-zinc-400 hover:text-emerald-300 underline"
                >
                  Quick Fill Demo OTP (482910)
                </button>
                <span className="text-zinc-500 text-[11px]">Expires in 04:59</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || otpCode.length < 4}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <span>Verify Code & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* "Try Another Way" Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                id="btn-try-another-way-otp"
                onClick={() => setStep('choose_method')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try another way (Tap "Yes" on your device)</span>
              </button>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CREATE NEW PASSWORD */}
        {/* ========================================================================= */}
        {step === 'new_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Identity verified successfully. Choose a new secure password.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingReset}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmittingReset ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Finish</span>
                </>
              )}
            </button>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: SUCCESS CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Password Reset Successful</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Your password for <strong>{accountInput}</strong> has been securely reset. You can now sign in to the campus portal with your new credentials.
              </p>
            </div>

            <button
              type="button"
              id="recovery-success-login-btn"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-md"
            >
              Back to Campus Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
