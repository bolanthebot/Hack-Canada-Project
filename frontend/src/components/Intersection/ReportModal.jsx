import { useEffect, useRef, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { intersectionApi } from '../../api';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'near_miss', label: 'Near miss' },
  { value: 'cyclist_conflict', label: 'Cyclist conflict' },
  { value: 'pedestrian_conflict', label: 'Pedestrian conflict' },
  { value: 'aggressive_driver', label: 'Aggressive driving' },
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
      // NOTE: Intersection backend has been deleted.
      await intersectionApi.create({
        location: { type: 'Point', coordinates: [latlng.lng, latlng.lat] },
        reportType,
        severity,
        description,
      });
      toast.success('Report submitted');
      setOpen(false);
      setDescription('');
      setSeverity(3);
      onReported?.();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      className="absolute top-3 left-[280px] z-[1000] bg-[#161a23] rounded-lg p-4 shadow-lg w-72 border border-white/[0.05]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-gray-200">New report</h3>
        <button
          onClick={() => setOpen(false)}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="text-[11px] text-gray-500 mb-3 font-mono">
        {latlng?.lat.toFixed(5)}, {latlng?.lng.toFixed(5)}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 font-medium">Type</label>
          <div className="grid grid-cols-2 gap-1">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setReportType(t.value)}
                className={`text-[11px] px-2 py-1.5 rounded text-left transition-colors ${
                  reportType === t.value
                    ? 'bg-teal-500/15 text-teal-400 font-medium'
                    : 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-gray-400 font-medium">Severity</label>
            <span className="text-[11px] font-mono text-gray-500">{severity}/5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  n <= severity ? 'bg-teal-500' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 font-medium">Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
            rows={2}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-2 text-[12px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/40 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-[12px] font-medium py-2 rounded transition-colors"
        >
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
