export default function BikeFilterPanel({ minScore, onMinScoreChange }) {
  return (
    <div className="glass-panel rounded-[2rem] shadow-xl w-72 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
        Cycling Safety Filter
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl font-black text-emerald-600 tabular-nums tracking-tighter">{minScore}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">Minimum<br />Safety Score</span>
      </div>

      <div className="px-1 mb-8">
        <input
          type="range"
          min="0"
          max="100"
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-[9px] font-black uppercase tracking-widest">
        <div className="flex flex-col gap-2">
          <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
            <div className="h-full w-full bg-emerald-500" />
          </div>
          <span className="text-emerald-600">Premium</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
            <div className="h-full w-full bg-amber-500" />
          </div>
          <span className="text-amber-600">Moderate</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-1.5 rounded-full bg-rose-100 overflow-hidden">
            <div className="h-full w-full bg-rose-500" />
          </div>
          <span className="text-rose-600">Risky</span>
        </div>
      </div>
    </div>
  );
}
