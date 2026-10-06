import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-emerald-900/10 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Zone with Emerald accent dot */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs shadow-emerald-500/50"></span>
            <span>ReserveEase</span>
          </Link>

          {/* Zone 2: 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              to="/services"
              className={`transition-colors py-1 ${
                isActive('/services')
                  ? 'text-emerald-950 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Services
            </Link>
            <Link
              to="/book"
              className={`transition-colors py-1 ${
                isActive('/book')
                  ? 'text-emerald-950 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Book Appointment
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`transition-colors py-1 ${
                  isActive('/dashboard')
                    ? 'text-emerald-950 border-b-2 border-emerald-600 font-semibold'
                    : 'text-slate-600 hover:text-emerald-900'
                }`}
              >
                My Bookings
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`transition-colors py-1 flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-emerald-900 border-b-2 border-emerald-600 font-semibold'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions with Emerald Theme */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 pl-2">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-800 truncate max-w-[140px]">{user?.name}</span>
                  <span className="text-slate-300">·</span>
                  <span className="capitalize text-emerald-700 font-medium">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-md transition-colors"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs shadow-emerald-600/30 hover:shadow-emerald-600/40"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-emerald-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer with frosted blur */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-emerald-900/10 bg-white/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 rounded-md"
          >
            Services
          </Link>
          <Link
            to="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 rounded-md"
          >
            Book Appointment
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 rounded-md"
            >
              My Bookings
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-emerald-800 bg-emerald-50/80 rounded-md"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">{user?.name}</div>
                  <div className="text-slate-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 text-xs font-medium text-slate-700 bg-emerald-50/60 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
