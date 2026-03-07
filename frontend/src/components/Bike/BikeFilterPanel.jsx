export default function BikeFilterPanel({ minScore, onMinScoreChange }) {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] glass-panel rounded-2xl shadow-2xl w-64 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
        Cycling Safety Filter
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-black text-emerald-400 tabular-nums tracking-tighter">{minScore}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum<br />Safety Score</span>
      </div>

      <div className="px-1 mb-5">
        <input
          type="range"
          min="0"
          max="100"
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase tracking-widest">
        <div className="flex flex-col gap-1.5">
          <div className="h-1 rounded-full bg-emerald-500/30 overflow-hidden">
            <div className="h-full w-full bg-emerald-500" />
          </div>
          <span className="text-emerald-500/80">Premium</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1 rounded-full bg-amber-500/30 overflow-hidden">
            <div className="h-full w-full bg-amber-500" />
          </div>
          <span className="text-amber-500/80">Moderate</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1 rounded-full bg-rose-500/30 overflow-hidden">
            <div className="h-full w-full bg-rose-500" />
          </div>
          <span className="text-rose-500/80">Risky</span>
        </div>
      </div>
    </div>
  );
}
