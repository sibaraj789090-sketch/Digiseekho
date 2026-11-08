import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { authService, AUTHORIZED_ADMIN_EMAIL } from '../../lib/authService';
import { cleanAdminAdArtifacts } from '../../lib/adSanitizer';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigateHome }) => {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState<string>(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  useEffect(() => {
    cleanAdminAdArtifacts();
  }, []);

  const isConfiguredEmail = email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  const isPasswordInitialized = authService.isPasswordInitialized();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-check email
    if (!isConfiguredEmail) {
      setError(`Access Denied: Account "${email}" is unauthorized. Access to this Admin Panel is strictly restricted to ${AUTHORIZED_ADMIN_EMAIL}.`);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Authentication rejected.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await authService.loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'Google login failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google OAuth failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div data-admin-panel="true" className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
        
        {/* Brand & Security Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center justify-center">
            <span className="bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-sky-300 bg-clip-text text-transparent">Digi</span>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">Seekho</span>
            <span className="inline-block w-2 h-2 ml-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="ml-2 text-slate-800 dark:text-slate-200 font-semibold text-xl">Admin</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Restricted Super Administrator Access
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized: {AUTHORIZED_ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* First-time setup indicator */}
        {!isPasswordInitialized && (
          <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-relaxed">
              <strong>Admin Password Initialization:</strong> Enter your custom chosen password (min 6 characters) to initialize and lock your administrator credentials for <strong>{AUTHORIZED_ADMIN_EMAIL}</strong>.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Authorized Admin Email
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                Fixed Authorization
              </span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-colors ${
                  !isConfiguredEmail
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-100 focus:ring-2 focus:ring-rose-500'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="rajsiba2005@gmail.com"
              />
            </div>
            {!isConfiguredEmail && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                <span>⚠️ Only {AUTHORIZED_ADMIN_EMAIL} is authorized.</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Admin Password
              </label>
              <span className="text-[10px] text-slate-400">
                {isPasswordInitialized ? 'Enter your password' : 'Create master password'}
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={isPasswordInitialized ? 'Enter admin password' : 'Enter chosen admin password (min 6 chars)'}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isConfiguredEmail}
            className={`w-full py-2.5 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
              !isConfiguredEmail
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Verifying Authorization...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Option (Strictly restricted to rajsiba2005@gmail.com) */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
            Security Rule: Google login will only grant access if logged in as <strong className="text-slate-600 dark:text-slate-300">{AUTHORIZED_ADMIN_EMAIL}</strong>. Any other Google account is strictly denied.
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Strict Security Enforcement Active</span>
          </div>
          <p>
            • Public registration is permanently disabled.<br />
            • Random emails and passwords will be strictly rejected.<br />
            • Sessions are cryptographically signed and verified.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            ← Return to Public DigiSeekho Website
          </button>
        </div>

      </div>
    </div>
  );
};
