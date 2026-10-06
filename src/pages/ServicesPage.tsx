import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.ts';
import { Service } from '../types/index.ts';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDays(days: number[]): string {
  if (!days || days.length === 0) return 'Mon – Sat';
  if (days.length === 7) return 'All Week (Mon – Sun)';
  if (days.length === 6 && !days.includes(0)) return 'Mon – Sat';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Mon – Fri';
  return days.map((d) => dayNames[d]).join(', ');
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.data) {
          const fetched: Service[] = res.data.data;
          setServices(fetched);

          const uniqueCats = Array.from(new Set(fetched.map((s) => s.category).filter(Boolean)));
          setCategories(['All', ...uniqueCats]);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
          Catalog
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Bookable Services
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Select any service below to view live appointment time slots, practitioner availability, and secure your booking.
        </p>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-xl max-w-fit border border-emerald-900/10 shadow-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 glass-panel animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-emerald-900/10">
          <p className="text-sm text-slate-500">No services found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-emerald-500/40"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-emerald-800">{service.category}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800">
                    {service.duration} min session
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="space-y-2 py-3 border-t border-emerald-900/10 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Operating Days</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDays(service.availableDays)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hours</span>
                    </span>
                    <span className="font-medium text-slate-800 font-mono tabular-nums">
                      {service.workingHours?.start || '09:00'} – {service.workingHours?.end || '17:00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-between mt-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Session Fee</div>
                  <div className="text-xl font-extrabold text-slate-950 font-mono tabular-nums">
                    ${service.price}
                  </div>
                </div>

                <Link
                  to={`/book?serviceId=${service._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Select & Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
