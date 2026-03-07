import { useEffect, useState } from 'react';

export default function SafetyScoreGauge({ stats }) {
    const [score, setScore] = useState(0);

    // Heuristic safety score calculation
    const calculatedScore = stats ? Math.max(0, 100 - (stats.totalIntersections * 2)) : 85;

    useEffect(() => {
        const timeout = setTimeout(() => setScore(calculatedScore), 500);
        return () => clearTimeout(timeout);
    }, [calculatedScore]);

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getStatusColor = (s) => {
        if (s > 80) return 'stroke-emerald-500';
        if (s > 60) return 'stroke-amber-500';
        return 'stroke-rose-500';
    };

    const getStatusBg = (s) => {
        if (s > 80) return 'bg-emerald-50 text-emerald-600';
        if (s > 60) return 'bg-amber-50 text-amber-600';
        return 'bg-rose-50 text-rose-600';
    };

    const getStatusText = (s) => {
        if (s > 80) return 'Optimal Safety';
        if (s > 60) return 'Moderate Risk';
        return 'Critical Watch';
    };

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-all duration-1000 ease-out">
            <div className="absolute top-0 right-0 p-8">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-blue-200 transition-colors"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-blue-300 transition-colors"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-blue-400 transition-colors"></div>
                </div>
            </div>

            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 text-center">Urban Safety Index</h3>

            <div className="relative flex items-center justify-center mb-10">
                <svg className="w-56 h-56 transform -rotate-90 scale-x-[-1]">
                    {/* Background Track */}
                    <circle
                        cx="112"
                        cy="112"
                        r={radius}
                        strokeWidth="12"
                        fill="transparent"
                        className="stroke-gray-50"
                    />
                    {/* Progress Bar */}
                    <circle
                        cx="112"
                        cy="112"
                        r={radius}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 1s ease'
                        }}
                        strokeLinecap="round"
                        className={getStatusColor(score)}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                    <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-1">
                        {Math.round(score)}
                    </span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Score</span>
                </div>
            </div>

            <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest ${getStatusBg(score)} transition-colors duration-1000 shadow-sm`}>
                {getStatusText(score)}
            </div>

            <p className="mt-8 text-center text-[11px] font-bold text-gray-400 max-w-[200px] leading-relaxed italic border-t border-gray-50 pt-6">
                Based on real-time pedestrian, cyclist, and vehicle conflict metrics in GTA.
            </p>
        </div>
    );
}
