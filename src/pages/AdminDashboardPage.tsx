import React, { useEffect, useState } from 'react';
import api from '../api/client.ts';
import { Booking, Service } from '../types/index.ts';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Layers,
  Check,
} from 'lucide-react';

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  startHour: string;
  endHour: string;
  slotInterval: number;
  availableDays: number[];
}

const initialServiceForm: ServiceFormData = {
  name: '',
  description: '',
  duration: 30,
  price: 50,
  category: 'General',
  isActive: true,
  startHour: '09:00',
  endHour: '17:00',
  slotInterval: 30,
  availableDays: [1, 2, 3, 4, 5, 6],
};

const dayOptions = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>(initialServiceForm);
  const [serviceSaving, setServiceSaving] = useState<boolean>(false);

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/bookings', { params });
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err: any) {
      setErrorNotice(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await api.get('/services?all=true');
      if (res.data?.data) {
        setServices(res.data.data);
      }
    } catch (err: any) {
      setErrorNotice(err.response?.data?.message || 'Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Status modification for bookings
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data?.success) {
        setNotice(`Booking status updated to ${newStatus}`);
        await fetchBookings();
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err: any) {
      setErrorNotice(err.response?.data?.message || 'Error updating status');
    }
  };

  // Service Creation / Edit Modal
  const openCreateServiceModal = () => {
    setEditingServiceId(null);
    setServiceForm(initialServiceForm);
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (s: Service) => {
    setEditingServiceId(s._id);
    setServiceForm({
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      category: s.category || 'General',
      isActive: s.isActive,
      startHour: s.workingHours?.start || '09:00',
      endHour: s.workingHours?.end || '17:00',
      slotInterval: s.workingHours?.slotInterval || 30,
      availableDays: s.availableDays || [1, 2, 3, 4, 5, 6],
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceSaving(true);
    setErrorNotice(null);

    const payload = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      duration: Number(serviceForm.duration),
      price: Number(serviceForm.price),
      category: serviceForm.category.trim(),
      isActive: serviceForm.isActive,
      availableDays: serviceForm.availableDays,
      workingHours: {
        start: serviceForm.startHour,
        end: serviceForm.endHour,
        slotInterval: Number(serviceForm.slotInterval),
      },
    };

    try {
      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
        setNotice('Service updated successfully');
      } else {
        await api.post('/services', payload);
        setNotice('New service created successfully');
      }
      setIsServiceModalOpen(false);
      await fetchServices();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.response?.data?.message || 'Error saving service');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      await api.delete(`/services/${id}`);
      setNotice(`Service "${name}" deleted`);
      await fetchServices();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.response?.data?.message || 'Error deleting service');
    }
  };

  const toggleDay = (dayId: number) => {
    setServiceForm((prev) => {
      const exists = prev.availableDays.includes(dayId);
      const updated = exists
        ? prev.availableDays.filter((d) => d !== dayId)
        : [...prev.availableDays, dayId].sort();
      return { ...prev, availableDays: updated };
    });
  };

  // Metrics
  const totalBookingsCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const activeServicesCount = services.filter((s) => s.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-950/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1">
            <span>Admin Control</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Shield className="w-4 h-4" />
            </div>
            <span>Administrator Console</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' && (
            <button
              onClick={openCreateServiceModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{notice}</div>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="font-medium">{errorNotice}</div>
        </div>
      )}

      {/* KPI Overview Metrics with Glassmorphic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Bookings</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono tabular-nums mt-1">
            {totalBookingsCount}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Confirmed / Active</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
            {confirmedCount}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Completed Sessions</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {completedCount}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Services</div>
          <div className="text-2xl font-extrabold text-emerald-900 font-mono tabular-nums mt-1">
            {activeServicesCount} / {services.length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md rounded-xl max-w-fit border border-emerald-900/10 shadow-xs">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'bookings'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
              : 'text-slate-600 hover:text-emerald-900'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'services'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
              : 'text-slate-600 hover:text-emerald-900'
          }`}
        >
          Manage Services ({services.length})
        </button>
      </div>

      {/* TAB 1: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-emerald-900/10">
          {/* Table Filters Toolbar */}
          <div className="p-4 border-b border-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/40">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer name or email..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/80 border border-emerald-900/15 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white/80 border border-emerald-900/15 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {bookingsLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No bookings match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50/60 border-b border-emerald-950/10 text-emerald-900 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/5">
                  {bookings.map((b) => {
                    const svc = typeof b.service === 'object' ? (b.service as Service) : null;
                    return (
                      <tr key={b._id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 font-mono tabular-nums">{b.date}</div>
                          <div className="text-emerald-800 font-mono tabular-nums font-bold text-[11px]">{b.timeSlot}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{svc?.name || 'Service'}</div>
                          <div className="text-slate-500 text-[11px] font-mono tabular-nums">
                            {svc?.duration}m · ${svc?.price}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{b.customerName}</div>
                          <div className="text-slate-500 text-[11px]">{b.customerEmail}</div>
                          {b.customerPhone && (
                            <div className="text-slate-400 text-[10px]">{b.customerPhone}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {b.status === 'confirmed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-200">
                              Confirmed
                            </span>
                          )}
                          {b.status === 'completed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-950 bg-white border border-emerald-200">
                              Completed
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
                              Cancelled
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'completed')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                                  title="Mark as Completed"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Cancel Booking & Free Slot"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {b.status === 'completed' && (
                              <span className="text-slate-400 text-[11px]">Finished</span>
                            )}
                            {b.status === 'cancelled' && (
                              <span className="text-slate-400 text-[11px]">Released</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE SERVICES */}
      {activeTab === 'services' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-emerald-900/10">
          {servicesLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No services found. Click &quot;Add New Service&quot; above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50/60 border-b border-emerald-950/10 text-emerald-900 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/5">
                  {services.map((s) => (
                    <tr key={s._id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-emerald-800 font-medium">{s.category}</td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                        {s.duration} mins
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                        ${s.price}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono tabular-nums text-[11px]">
                        {s.workingHours?.start}–{s.workingHours?.end} ({s.workingHours?.slotInterval}m)
                      </td>
                      <td className="py-3 px-4">
                        {s.isActive ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditServiceModal(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(s._id, s.name)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Service Modal (Add / Edit) with Frosted Glassmorphism */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel border border-emerald-500/25 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-emerald-950/10">
              {editingServiceId ? 'Edit Service Details' : 'Create New Bookable Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Acupuncture Session"
                  className="w-full px-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe the service procedure and customer value..."
                  className="w-full p-2.5 bg-white/90 border border-emerald-900/15 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={10}
                    max={480}
                    required
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/90 border border-emerald-900/15 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-950/10">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Hour</label>
                  <input
                    type="time"
                    required
                    value={serviceForm.startHour}
                    onChange={(e) => setServiceForm({ ...serviceForm, startHour: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/90 border border-emerald-900/15 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Hour</label>
                  <input
                    type="time"
                    required
                    value={serviceForm.endHour}
                    onChange={(e) => setServiceForm({ ...serviceForm, endHour: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/90 border border-emerald-900/15 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slot Step (min)</label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    step={15}
                    required
                    value={serviceForm.slotInterval}
                    onChange={(e) => setServiceForm({ ...serviceForm, slotInterval: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white/90 border border-emerald-900/15 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Days of week selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Available Operating Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {dayOptions.map((d) => {
                    const selected = serviceForm.availableDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white/80 text-slate-600 hover:bg-emerald-50 border border-emerald-900/10'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={serviceForm.isActive}
                  onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="font-semibold text-slate-800">
                  Service is Active and Available for Public Booking
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-emerald-950/10">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  disabled={serviceSaving}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSaving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs shadow-emerald-600/30"
                >
                  {serviceSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingServiceId ? 'Update Service' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
