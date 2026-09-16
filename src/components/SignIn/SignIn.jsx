import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import RightHeroPanel from './RightHeroPanel';
import ForgotPasswordModal from './ForgotPasswordModal';
import authService from '../../api/auth';

const SignIn = ({ onRouteChange, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Please enter your email or username';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'This field is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        onRouteChange('home');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to connect to Skill Setu backend server. Please verify Django is running.'
          : 'Invalid credentials. Please check your email/username and password.');
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative overflow-x-hidden">
      <RightHeroPanel
        title="Bridge the Gap Between"
        titleHighlight="Academia & Industry"
        subtitle="Skill mapping, internships, and placements — all in one unified portal."
        stats={[
          { number: '10K+', label: 'Students' },
          { number: '500+', label: 'Companies' },
          { number: '200+', label: 'Institutions' },
        ]}
      />

      <div className="flex w-full min-h-screen flex-col justify-between p-6 sm:p-12 lg:w-1/2 xl:p-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-8 my-auto py-8">
          <Logo />

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to continue your journey on Skill Setu
            </p>
          </div>

          {generalError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your email or username"
                  className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors ${
                    errors.username
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-base sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors ${
                    errors.password
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-slate-50 px-3 text-xs font-medium text-slate-400">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-slate-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onRouteChange('register')}
              className="font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
            >
              Register
            </button>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={formData.username.includes('@') ? formData.username.trim() : ''}
        onResetSuccess={() => {
          setIsForgotPasswordOpen(false);
          setGeneralError('');
        }}
      />
    </div>
  );
};

export default SignIn;