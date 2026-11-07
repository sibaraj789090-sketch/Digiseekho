import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigateHome }) => {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('admin@digiseekho.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(password || 'admin123');
    if (success) {
      onSuccess();
    } else {
      setError('Invalid login credentials. Enter admin123 or use one-click demo login.');
    }
  };

  const handleDemoLogin = () => {
    loginAdmin('admin123');
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            DigiSeekho Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Secure Editorial Publishing & Content Management System
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password (e.g. admin123)"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Button */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>One-Click Admin Demo Login</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Default credentials: <span className="font-mono text-slate-600 dark:text-slate-300">admin@digiseekho.com / admin123</span>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onNavigateHome}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Return to Public DigiSeekho Website
          </button>
        </div>

      </div>
    </div>
  );
};
