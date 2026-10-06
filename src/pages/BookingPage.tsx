import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Service, AvailableSlotsResponse, Booking } from '../types/index.ts';
import { Calendar, Clock, Check, AlertCircle, User, Mail, Phone, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Selected state
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(searchParams.get('serviceId') || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Form details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Availability query state
  const [slotsData, setSlotsData] = useState<AvailableSlotsResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Populate user data once authenticated
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone && user.phone) setCustomerPhone(user.phone || '');
    }
  }, [user]);

  // Fetch all bookable services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.data) {
          const list: Service[] = res.data.data;
          setServices(list);
          if (!selectedServiceId && list.length > 0) {
            setSelectedServiceId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };
    fetchServices();
  }, []);

  // Fetch available slots whenever service or date changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot('');

      try {
        const res = await api.get('/bookings/available-slots', {
          params: { serviceId: selectedServiceId, date: selectedDate },
        });
        if (res.data?.data) {
          setSlotsData(res.data.data);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Could not fetch time slot availability';
        setErrorMessage(msg);
        setSlotsData(null);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedServiceId, selectedDate]);

  const activeService = services.find((s) => s._id === selectedServiceId);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: '/book', search: `?serviceId=${selectedServiceId}` } },
      });
      return;
    }

    if (!selectedServiceId) {
      setErrorMessage('Please choose a service.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Please select an appointment date.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please click on an available time slot.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serviceId: selectedServiceId,
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        notes: notes.trim(),
      };

      const res = await api.post('/bookings', payload);
      if (res.data?.data) {
        setConfirmedBooking(res.data.data);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      if (status === 409) {
        setErrorMessage(
          serverMessage ||
            'Double-Booking Conflict: This slot was just reserved by another client. We have refreshed the open slots.'
        );
        try {
          const fresh = await api.get('/bookings/available-slots', {
            params: { serviceId: selectedServiceId, date: selectedDate },
          });
          setSlotsData(fresh.data?.data);
          setSelectedSlot('');
        } catch {}
      } else {
        setErrorMessage(serverMessage || 'Failed to submit booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If booking is confirmed, show confirmation view
  if (confirmedBooking) {
    const s = typeof confirmedBooking.service === 'object' ? confirmedBooking.service : activeService;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass-panel border border-emerald-500/20 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <Check className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Appointment Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your appointment has been locked in the database. A confirmation has been registered to your dashboard.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 text-left space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/10 text-xs">
              <span className="text-slate-500">Service</span>
              <span className="font-bold text-slate-900">{s?.name || 'Selected Service'}</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/10 text-xs">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800 font-mono tabular-nums">{confirmedBooking.date}</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/10 text-xs">
              <span className="text-slate-500">Time Slot</span>
              <span className="font-bold text-emerald-800 font-mono tabular-nums text-sm">{confirmedBooking.timeSlot}</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/10 text-xs">
              <span className="text-slate-500">Duration</span>
              <span className="font-mono tabular-nums text-slate-800">{s?.duration} minutes</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/10 text-xs">
              <span className="text-slate-500">Price</span>
              <span className="font-bold text-slate-950 font-mono tabular-nums text-sm">${s?.price}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Reference ID</span>
              <span className="font-mono text-slate-600 truncate max-w-[200px]">{confirmedBooking._id}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30"
            >
              <span>View in My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setSelectedSlot('');
              }}
              className="px-5 py-3 border border-emerald-900/15 bg-white/70 hover:bg-emerald-50/70 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
          Reservation Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Book an Appointment
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Pick your service and date to see live open slots.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selection steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Service Selection */}
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">
              Step 1: Choose Service
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-emerald-900/15 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all shadow-xs"
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — ${s.price} ({s.duration} mins)
                </option>
              ))}
            </select>

            {activeService && (
              <div className="mt-4 pt-4 border-t border-emerald-950/10 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-emerald-800">{activeService.category}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono tabular-nums">{activeService.duration} minutes</span>
                <span className="text-slate-300">·</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">${activeService.price}</span>
              </div>
            )}
          </div>

          {/* Step 2: Date Picker */}
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                Step 2: Select Date
              </label>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Min: Today ({todayStr})
              </span>
            </div>

            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-emerald-900/15 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Step 3: Real-Time Available Slots */}
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Step 3: Select Time Slot
                </label>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  Open slots for {selectedDate}
                </p>
              </div>

              {slotsData && (
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                    <span>Available</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                    <span>Booked</span>
                  </span>
                </div>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Calculating live availability...</span>
              </div>
            ) : slotsData && !slotsData.isOperatingDay ? (
              <div className="p-6 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-emerald-900 text-center text-xs">
                <p className="font-semibold">{slotsData.message || 'Service is closed on this day.'}</p>
                <p className="mt-1 text-emerald-700">Please choose another date on the calendar above.</p>
              </div>
            ) : slotsData && slotsData.allSlots.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center text-xs">
                No slots configured for this service.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {slotsData?.allSlots.map((slot) => {
                  const isBooked = slotsData.bookedSlots.includes(slot);
                  const isAvailable = slotsData.availableSlots.includes(slot);
                  const isSelected = selectedSlot === slot;

                  if (isBooked) {
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled
                        className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 text-xs font-mono tabular-nums line-through cursor-not-allowed flex flex-col items-center justify-center"
                        title="Already Booked"
                      >
                        <span>{slot}</span>
                        <span className="text-[10px] no-underline text-slate-400">Booked</span>
                      </button>
                    );
                  }

                  if (!isAvailable) {
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled
                        className="py-2.5 px-3 rounded-xl border border-slate-100 bg-slate-50/70 text-slate-300 text-xs font-mono tabular-nums cursor-not-allowed flex flex-col items-center justify-center"
                        title="Passed"
                      >
                        <span>{slot}</span>
                        <span className="text-[10px]">Passed</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono tabular-nums font-semibold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                          : 'border-emerald-900/15 bg-white/90 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/70 shadow-2xs'
                      }`}
                    >
                      <span>{slot}</span>
                      <span className={`text-[10px] font-sans ${isSelected ? 'text-emerald-100' : 'text-emerald-700'}`}>
                        Open
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking Summary & Customer Information Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleBookingSubmit}
            className="sticky top-24 glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
          >
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-emerald-950/10">
              Reservation Summary
            </h2>

            {/* Selected Summary Card */}
            <div className="space-y-2.5 text-xs text-slate-600 bg-white/70 backdrop-blur-md p-4 rounded-xl border border-emerald-900/10">
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-900 text-right">{activeService?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 font-mono tabular-nums">{selectedDate || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Slot</span>
                <span className="font-bold text-emerald-800 font-mono tabular-nums">
                  {selectedSlot || 'Select an open slot'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-mono tabular-nums">{activeService?.duration} mins</span>
              </div>
              <div className="pt-2 border-t border-emerald-900/10 flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-900">Total Price</span>
                <span className="font-extrabold text-slate-950 font-mono tabular-nums text-base">
                  ${activeService?.price || 0}
                </span>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-700/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700/60 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-700/60 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Notes / Preferences
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any allergies, specific requests, or goals..."
                  className="w-full p-2.5 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Authentication state note */}
            {!isAuthenticated && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
                <span>You must be logged in to confirm. Submitting will redirect to login.</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                submitting || !selectedSlot
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Slot in Database...</span>
                </>
              ) : !selectedSlot ? (
                <span>Choose an Available Time Slot</span>
              ) : !isAuthenticated ? (
                <span>Log In & Confirm Booking</span>
              ) : (
                <span>Confirm & Lock Appointment</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
