import { useEffect, useRef, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { intersectionApi } from '../../api';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'cyclist_conflict', label: 'Cyclist Conflict' },
  { value: 'pedestrian_conflict', label: 'Pedestrian Conflict' },
  { value: 'aggressive_driver', label: 'Aggressive Driving' },
];

export default function ReportModal({ onReported }) {
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
      setLatlng(e.latlng);
      setOpen(true);
    },
  });

  useEffect(() => {
    if (!open || !modalRef.current) return;
    // Prevent modal interactions from triggering map click handlers.
    L.DomEvent.disableClickPropagation(modalRef.current);
    L.DomEvent.disableScrollPropagation(modalRef.current);
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // NOTE: Intersection backend is usually handled by the intersectionApi.
      await intersectionApi.create({
        location: { type: 'Point', coordinates: [latlng.lng, latlng.lat] },
        reportType,
        severity,
        description,
      });
      toast.success('Report submitted successfully');
      setOpen(false);
      setDescription('');
      setSeverity(3);
      onReported?.();
    } catch {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      className="absolute top-8 left-8 z-[1001] bg-white rounded-[2rem] p-8 shadow-2xl w-80 border border-gray-100 animate-in zoom-in-95 duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Report Incident</h3>
          <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
            {latlng?.lat.toFixed(5)}, {latlng?.lng.toFixed(5)}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm border border-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Category</label>
          <div className="grid grid-cols-1 gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setReportType(t.value)}
                className={`text-[11px] px-4 py-3 rounded-xl text-left transition-all border font-bold ${reportType === t.value
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
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Severity Level</label>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${severity >= 4 ? 'bg-rose-50 text-rose-600' :
              severity >= 3 ? 'bg-amber-50 text-amber-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>{severity} / 5</span>
          </div>
          <div className="flex gap-2 h-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                className={`flex-1 rounded-full transition-all duration-300 ${n <= severity
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
          <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened?..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-2 active:scale-95"
        >
          {submitting ? 'Saving...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
