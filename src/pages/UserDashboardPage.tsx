import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking, Service } from '../types/index.ts';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Search and date filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Cancel dialog state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setErrorMessage(err.response?.data?.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Combined Filtering: Status tab + Text search (Service Name / Category / Notes / Slot) + Exact Date filter
  const filteredBookings = bookings.filter((b) => {
    // 1. Tab Status Filter
    if (activeTab === 'cancelled' && b.status !== 'cancelled') return false;
    if (activeTab === 'completed' && b.status !== 'completed') return false;
    if (activeTab === 'upcoming' && !(b.status === 'confirmed' && b.date >= todayStr)) return false;

    // 2. Date Filter
    if (dateFilter && b.date !== dateFilter) return false;

    // 3. Search Query Filter (Matches Service Name, Category, Date, Time Slot, or Notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const service = typeof b.service === 'object' ? (b.service as Service) : null;
      const serviceName = service?.name?.toLowerCase() || '';
      const serviceCategory = service?.category?.toLowerCase() || '';
      const notes = b.notes?.toLowerCase() || '';
      const date = b.date?.toLowerCase() || '';
      const timeSlot = b.timeSlot?.toLowerCase() || '';

      const isMatch =
        serviceName.includes(q) ||
        serviceCategory.includes(q) ||
        notes.includes(q) ||
        date.includes(q) ||
        timeSlot.includes(q);

      if (!isMatch) return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(searchQuery.trim() || dateFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.patch(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: cancelReason.trim() || 'Cancelled by client',
      });

      if (res.data?.success) {
        setSuccessNotice('Booking cancelled successfully. The time slot is now open and available again for other clients.');
        setCancellingBooking(null);
        setCancelReason('');
        await fetchMyBookings();
        setTimeout(() => setSuccessNotice(null), 6000);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-950/10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            Personal Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Client Appointments Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shadow-emerald-600/30 self-start sm:self-auto"
        >
          <span>Book New Appointment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{successNotice}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Control Toolbar: Status Tabs + Search & Date Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md rounded-xl border border-emerald-900/10 shadow-xs max-w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'cancelled'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Results count pill */}
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900 font-mono tabular-nums">{filteredBookings.length}</span> of{' '}
            <span className="font-bold text-slate-900 font-mono tabular-nums">{bookings.length}</span> appointments
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          {/* Service Name / Text Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-800/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service name, category, or time slot..."
              className="w-full pl-9.5 pr-8 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Input */}
          <div className="relative w-full sm:w-56">
            <Calendar className="w-4 h-4 text-emerald-800/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
              title="Filter by appointment date"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                title="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear Filters Button (When active) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-xl transition-colors border border-emerald-300/80 shrink-0 shadow-2xs w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-emerald-900/15 text-slate-800 font-medium shadow-2xs">
                <span>Keyword: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-emerald-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-emerald-900/15 text-slate-800 font-medium font-mono tabular-nums shadow-2xs">
                <span>Date: {dateFilter}</span>
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="hover:text-emerald-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 glass-panel animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-emerald-900/10">
          <Calendar className="w-10 h-10 text-emerald-600/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {hasActiveFilters
              ? 'No matching appointments found'
              : `No ${activeTab !== 'all' ? activeTab : ''} appointments found`}
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No appointments matched your search query or selected date. Try modifying your filter criteria or reset to view all.'
              : 'You currently have no recorded reservations matching this view. Check other tabs or schedule a new service.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 rounded-xl transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            ) : (
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shadow-emerald-600/30"
              >
                <span>Book an Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const service = typeof b.service === 'object' ? (b.service as Service) : null;

            return (
              <div
                key={b._id}
                className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {service?.name || 'Service Appointment'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-800 font-medium">{service?.category || 'General'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono tabular-nums text-slate-600">{service?.duration} mins</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">${service?.price}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono tabular-nums text-slate-900 font-semibold">{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono tabular-nums text-emerald-800 font-bold">{b.timeSlot}</span>
                    </div>
                  </div>

                  {b.notes && (
                    <div className="text-xs text-slate-500 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-900/10 max-w-xl">
                      <span className="font-medium text-slate-700">Notes:</span> {b.notes}
                    </div>
                  )}

                  {b.status === 'cancelled' && b.cancellationReason && (
                    <div className="text-xs text-slate-500 italic">
                      Reason for cancellation: {b.cancellationReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-emerald-950/10 justify-between md:justify-end">
                  {/* Status Indicator with Emerald scheme */}
                  <div>
                    {b.status === 'confirmed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Confirmed</span>
                      </span>
                    )}
                    {b.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-300">
                        <span>Completed</span>
                      </span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setCancellingBooking(b);
                        setCancelReason('');
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-emerald-50/80 border border-emerald-900/15 rounded-lg transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal with Frosted Glass */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="glass-panel border border-emerald-500/25 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel This Appointment?
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Cancelling will immediately release the{' '}
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {cancellingBooking.timeSlot}
                  </span>{' '}
                  slot on{' '}
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {cancellingBooking.date}
                  </span>{' '}
                  back into the pool of available bookings.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling unwell..."
                className="w-full p-2.5 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-950/10">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {cancelLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Cancel & Free Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
