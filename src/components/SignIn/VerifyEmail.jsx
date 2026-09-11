import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import authService from '../../api/auth';

const VerifyEmail = ({ user, onVerificationSuccess, onRouteChange }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isVerified, setIsVerified] = useState(Boolean(user?.is_email_verified));
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResendMessage('');

    try {
      const emailToVerify = user?.email || authService.getUser()?.email;
      const res = await authService.verifyEmail({
        email: emailToVerify,
        otp: otp.trim(),
      });

      if (res?.is_email_verified) {
        setIsVerified(true);
        const currentUser = authService.getUser();
        const updated = { ...currentUser, is_email_verified: true };
        authService.setUser(updated);
        if (onVerificationSuccess) {
          onVerificationSuccess(updated);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Verification failed. The code may be invalid or expired. Please request a new code.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    const targetEmail = user?.email || authService.getUser()?.email;
    if (!targetEmail) {
      setError('Email address not found. Please log in again.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendMessage('');

    try {
      await authService.resendVerification(targetEmail);
      setResendMessage(`A fresh 6-digit code has been dispatched to ${targetEmail}`);
      setCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code. Please wait a moment and try again.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const userEmail = user?.email || authService.getUser()?.email || 'your email';

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 text-center animate-fadeIn">
        {isVerified ? (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
              <p className="text-sm text-slate-600">
                Your email address <strong>{userEmail}</strong> has been successfully verified. Your account is now fully verified.
              </p>
            </div>

            <button
              onClick={() => onRouteChange('home')}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900">Verify Your Email</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Enter the 6-digit verification code sent to <strong className="text-slate-800">{userEmail}</strong>
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-left rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {resendMessage && (
              <div className="flex items-center gap-2 p-3 text-left rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                <span className="flex-1">{resendMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full py-3 px-4 text-center font-mono text-2xl font-bold tracking-[10px] text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <div className="text-xs text-slate-600">
                Didn't receive the email?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending}
                  className="font-bold text-teal-700 hover:text-teal-800 disabled:text-slate-400 underline cursor-pointer transition-colors"
                >
                  {isResending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRouteChange('home')}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
