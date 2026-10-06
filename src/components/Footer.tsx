import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white/70 backdrop-blur-xl border-t border-emerald-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 block mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs shadow-emerald-500/50"></span>
              <span>ReserveEase</span>
            </span>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed mb-4">
              Modern full-stack appointment scheduling platform. Built with MongoDB, Express, React, and Node.js with database-level double-booking prevention.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span className="text-emerald-800 font-medium">Booking Engine Operational</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Express + Mongoose</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/services" className="hover:text-emerald-900 transition-colors">
                  Services Directory
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-emerald-900 transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-900 transition-colors">
                  Client Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">Admin & Demo</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/admin" className="hover:text-emerald-900 transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-900 transition-colors">
                  Staff Login
                </Link>
              </li>
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-900 transition-colors"
                >
                  API Health Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-950/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ReserveEase Systems. All rights reserved.</p>
          <div className="flex items-center gap-4 text-emerald-900/60 font-medium">
            <span>Client & Server Separation</span>
            <span aria-hidden="true">·</span>
            <span>Single-Color Emerald Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
