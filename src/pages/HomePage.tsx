import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.ts';
import { Service } from '../types/index.ts';
import { ArrowRight, CheckCircle2, Calendar, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.data) {
          setServices(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedServices();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Embedded Blurred Ambient Motion */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-emerald-500/20 bg-slate-950 text-white shadow-2xl shadow-emerald-950/20">
        {/* Internal ambient animated blur orbs */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 rounded-full bg-emerald-500/25 blur-[100px] animate-pulse-blur" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 w-[420px] h-[420px] rounded-full bg-emerald-600/20 blur-[120px] animate-float-slow" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-400/15 blur-[80px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center py-20 sm:py-28 px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-medium text-emerald-300 backdrop-blur-md shadow-xs animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Concurrency Safe Scheduling</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Seamless Appointments,{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Guaranteed No Conflicts
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Browse services, inspect live time slot availability in real time, and lock in your appointment with database-level double-booking prevention.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Book Appointment Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-emerald-400/25 font-semibold rounded-xl text-sm transition-all backdrop-blur-md"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Mechanism-to-Outcome 3-Step Section with Glassmorphic Frosted Blur Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            Engineered Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            How The Booking System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Atomic slot validation and instant feedback in three effortless steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 sm:p-7 rounded-2xl flex flex-col items-start transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Select Bookable Service
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore catalog offerings complete with exact duration, pricing, and operating day schedule.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl flex flex-col items-start transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Choose Date & Available Slot
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live slot calculation dynamically hides or marks already-booked hours, preventing scheduling conflicts.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl flex flex-col items-start transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Instant Confirmed Reservation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Locked via unique compound database index. Manage upcoming appointments or cancel anytime on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              Catalog Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Popular Services Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select a service below to check available dates and time slots
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 glass-panel animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <div>
                  <div className="text-xs font-medium text-emerald-800 mb-2.5">
                    <span>{service.category}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="font-mono tabular-nums">{service.duration} mins</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-950/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Session Fee</div>
                    <div className="text-xl font-extrabold text-slate-950 font-mono tabular-nums">
                      ${service.price}
                    </div>
                  </div>
                  <Link
                    to={`/book?serviceId=${service._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shadow-emerald-600/30"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Architecture Overview with Frosted Glass Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-sm border border-emerald-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[11px] font-semibold mb-3 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Engineered for High-Reliability Booking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Traditional booking forms risk double-booking during peak traffic when two clients attempt to confirm the same slot. ReserveEase eliminates race conditions through:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>MongoDB Unique Index</strong>: Database-level constraint on service, date, and active time slot.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Dynamic Slot Computation</strong>: Slots automatically re-open if a booking is cancelled.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Stateless JWT Security</strong>: Fast token verification with bcrypt password protection.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
                <span className="text-xs font-semibold text-slate-900">Database Engine</span>
                <span className="text-xs font-mono text-slate-600">MongoDB + Mongoose</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
                <span className="text-xs font-semibold text-slate-900">Concurrency Safety</span>
                <span className="text-xs font-mono text-emerald-700 font-bold">Index Enforced</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
                <span className="text-xs font-semibold text-slate-900">Slot Calculation</span>
                <span className="text-xs font-mono text-slate-600">30–60 min Dynamic</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Authentication</span>
                <span className="text-xs font-mono text-slate-600">JWT + Role Authorization</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
