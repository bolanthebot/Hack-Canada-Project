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
      className="absolute top-4 left-[340px] z-[1001] glass-panel rounded-2xl p-5 shadow-2xl w-80 border-white/10 animate-in zoom-in-95 duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-100 tracking-tight">Report Incident</h3>
          <div className="text-[10px] font-mono text-gray-500 mt-0.5">
            {latlng?.lat.toFixed(5)}, {latlng?.lng.toFixed(5)}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setReportType(t.value)}
                className={`text-[11px] px-2.5 py-2 rounded-xl text-left transition-all border ${reportType === t.value
                    ? 'bg-teal-500/20 border-teal-500/30 text-teal-400 font-bold shadow-sm'
                    : 'bg-white/[0.02] border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Severity Level</label>
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm ${severity >= 4 ? 'bg-rose-500/20 text-rose-400' :
                severity >= 3 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
              }`}>{severity} / 5</span>
          </div>
          <div className="flex gap-1.5 h-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                className={`flex-1 rounded-full transition-all duration-300 ${n <= severity
                    ? severity >= 4 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                      severity >= 3 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                        'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'bg-white/[0.06]'
                  }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Detailed Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident..."
            rows={3}
            className="input-base w-full resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full h-11"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : 'Submit Incident Report'}
        </button>
      </form>
    </div>
  );
}
