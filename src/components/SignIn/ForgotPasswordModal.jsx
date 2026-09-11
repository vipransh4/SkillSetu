import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X, ArrowLeft } from 'lucide-react';
import authService from '../../api/auth';

const ForgotPasswordModal = ({ isOpen, onClose, onResetSuccess, initialEmail = '' }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialEmail) {
        setEmail(initialEmail);
      }
      setStep(1);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message || `Verification code dispatched to ${email}.`);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to send verification code. Please check your email.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: otp.trim(),
        new_password: newPassword,
      });
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check the code and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-2">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password</h2>
              <p className="text-xs text-slate-500">
                Enter your registered email address to receive a 6-digit security code.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setStep(1); setError(''); }}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Enter Verification Code</h2>
                <p className="text-xs text-slate-500">Sent to <span className="font-semibold text-slate-700">{email}</span></p>
              </div>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs font-semibold text-teal-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* 6-Digit OTP */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 text-center text-xl font-mono font-bold tracking-[8px] text-slate-900 placeholder-slate-300 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Password Reset Complete!</h2>
              <p className="text-xs text-slate-500">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
            </div>
            <button
              onClick={() => {
                handleClose();
                if (onResetSuccess) onResetSuccess();
              }}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
