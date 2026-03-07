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
    <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-2xl shadow-2xl w-64 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 py-3 pb-2">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
          Smart Parking Forecast
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="input-base w-full h-9 font-mono pr-8 text-[13px]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600 pointer-events-none">h</span>
          </div>
          <button
            onClick={predict}
            disabled={loading}
            className="btn-primary h-9 px-4 text-xs font-bold leading-none"
          >
            {loading ? '...' : 'Check'}
          </button>
        </div>
      </div>

      {prediction && (
        <div className="border-t border-white/[0.06] p-4 pt-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-2xl font-black tracking-tight tabular-nums ${pct > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pct}%
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right">
              Success<br />Probability
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${pct > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
