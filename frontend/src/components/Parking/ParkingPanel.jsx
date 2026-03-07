import { useState } from 'react';
import { parkingApi } from '../../api';

export default function ParkingPanel() {
  const [hour, setHour] = useState(new Date().getHours());
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    try {
      // NOTE: ML backend for parking has been deleted.
      const res = await parkingApi.predict({
        hour,
        day_of_week: new Date().getDay(),
        lat: 43.6532,
        lng: -79.3832,
      });
      setPrediction(res.data);
    } catch {
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const pct = prediction ? Math.round(prediction.probability * 100) : null;

  return (
    <div className="absolute bottom-3 left-3 z-[1000] bg-[#161a23] rounded-lg shadow-lg w-60 border border-white/[0.05] overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-2">
          Parking forecast
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded px-2 py-1.5 text-[13px] text-gray-200 focus:outline-none focus:border-teal-500/40 font-mono"
            />
            <div className="text-[10px] text-gray-600 mt-0.5">Hour (0-23)</div>
          </div>
          <button
            onClick={predict}
            disabled={loading}
            className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-[12px] text-gray-300 font-medium rounded transition-colors"
          >
            {loading ? '...' : 'Check'}
          </button>
        </div>
      </div>

      {prediction && (
        <div className="border-t border-white/[0.04] px-3 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-2xl font-semibold tabular-nums ${pct > 50 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pct}%
            </span>
            <span className="text-[11px] text-gray-500">
              chance of open spot
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
