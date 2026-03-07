import { useEffect, useRef, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth0 } from '@auth0/auth0-react';
import { intersectionApi } from '../../api';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'near_miss', label: 'Near Miss Incident' },
  { value: 'cyclist_conflict', label: 'Cyclist Conflict' },
  { value: 'pedestrian_conflict', label: 'Pedestrian Conflict' },
  { value: 'aggressive_driver', label: 'Aggressive Driving' },
];

export default function ReportModal({ onReported }) {
  const { isAuthenticated, loginWithRedirect: login } = useAuth0();
  const [open, setOpen] = useState(false);
  const [latlng, setLatlng] = useState(null);
  const [reportType, setReportType] = useState('near_miss');
  const [severity, setSeverity] = useState(3);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault();
      if (!isAuthenticated) {
        toast('Log in to submit a report');
        return;
      }
      setLatlng(e.latlng);
      setOpen(true);
    },
  });

  useEffect(() => {
    if (!open || !modalRef.current) return;
    L.DomEvent.disableClickPropagation(modalRef.current);
    L.DomEvent.disableScrollPropagation(modalRef.current);
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Authentication required for reporting');
      setOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      await intersectionApi.create({
        location: { type: 'Point', coordinates: [latlng.lng, latlng.lat] },
        reportType,
        severity,
        description,
      });
      toast.success('Grid intelligence updated successfully');
      setOpen(false);
      setDescription('');
      setSeverity(3);
      onReported?.();
    } catch {
      toast.error('Failed to submit report. System offline?');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      className="absolute top-8 left-8 z-[1001] bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[360px] border border-gray-100 animate-in zoom-in-95 duration-300"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">
            Hazard Report
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Intelligence Input</h3>
          <div className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest font-mono">
            {latlng?.lat.toFixed(5)}N / {latlng?.lng.toFixed(5)}W
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all border border-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>
      </div>

      {!isAuthenticated && (
        <div className="mb-8 rounded-3xl bg-blue-50 border border-blue-100 p-6">
          <p className="text-xs font-bold text-blue-800 mb-4 leading-relaxed">
            Authentication is required to log safety incidents into the UrbanFlow grid.
          </p>
          <button
            type="button"
            onClick={() => login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Authorize Access
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Conflict Category</label>
          <div className="grid grid-cols-1 gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setReportType(t.value)}
                className={`text-[11px] px-5 py-3.5 rounded-2xl text-left transition-all border font-black uppercase tracking-wide ${reportType === t.value
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                  : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Severity Index</label>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${severity >= 4 ? 'bg-rose-50 text-rose-600' :
              severity >= 3 ? 'bg-amber-50 text-amber-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>{severity} / 5</span>
          </div>
          <div className="flex gap-2.5 h-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                className={`flex-1 rounded-full transition-all duration-500 ${n <= severity
                  ? severity >= 4 ? 'bg-rose-500 shadow-lg shadow-rose-200' :
                    severity >= 3 ? 'bg-amber-500 shadow-lg shadow-amber-200' :
                      'bg-emerald-500 shadow-lg shadow-emerald-200'
                  : 'bg-gray-100'
                  }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tactical Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context for the grid..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isAuthenticated}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all mt-4 active:scale-95"
        >
          {submitting ? 'Transmitting...' : 'Upload Intelligence →'}
        </button>
      </form>
    </div>
  );
}
