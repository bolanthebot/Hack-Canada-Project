export default function BikeFilterPanel({ minScore, onMinScoreChange }) {
  return (
    <div className="absolute left-2 right-2 bottom-20 sm:left-auto sm:right-3 sm:bottom-3 z-[1000] bg-[#161a23] rounded-lg shadow-lg w-auto sm:w-56 border border-white/[0.05] px-3 py-3">
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-2.5">
        Bike safety
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-lg font-semibold text-gray-200 tabular-nums">{minScore}</span>
        <span className="text-[11px] text-gray-500">min score</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={minScore}
        onChange={(e) => onMinScoreChange(Number(e.target.value))}
        className="w-full"
      />

      <div className="flex items-center gap-3 mt-2.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-5 h-[3px] rounded-full bg-emerald-400 inline-block" /> safe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-[3px] rounded-full bg-amber-400 inline-block" /> ok
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-[3px] rounded-full bg-red-400 inline-block" /> risky
        </span>
      </div>
    </div>
  );
}
