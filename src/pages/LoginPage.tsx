import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemoUser = () => {
    setEmail('john.doe@example.com');
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const fillAdmin = () => {
    setEmail('admin@reserveease.com');
    setPassword('AdminPassword123!');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-panel border border-emerald-500/25 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to ReserveEase
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your bookings or manage appointments
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
          <div className="text-[11px] font-semibold text-emerald-900">Quick Test Credentials:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="py-1.5 px-2 bg-white/90 border border-emerald-900/15 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={fillAdmin}
              className="py-1.5 px-2 bg-white/90 border border-emerald-900/15 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Seeded Admin</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-900 text-xs shadow-xs">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-700/60 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-700/60 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-950/10 text-center text-xs text-slate-500">
          <span>Don&apos;t have an account yet? </span>
          <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
