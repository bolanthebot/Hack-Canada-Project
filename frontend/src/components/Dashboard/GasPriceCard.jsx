import { useState, useEffect } from 'react';

// Mock data as specified in requirements, could be connected to an API later
const GAS_DATA = [
    { city: 'Toronto', price: 1.58, trend: 'down', change: -0.02 },
    { city: 'Mississauga', price: 1.61, trend: 'up', change: 0.01 },
    { city: 'Brampton', price: 1.57, trend: 'stable', change: 0.00 },
];

export default function GasPriceCard() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % GAS_DATA.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const current = GAS_DATA[currentIndex];

    return (
        <div className="glass-panel rounded-2xl p-4 w-60 border-white/10 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Fuel Forecast</div>
                <div className="flex gap-1">
                    {GAS_DATA.map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? 'bg-amber-400 w-3' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-xs font-bold text-gray-400 mb-0.5">{current.city}</div>
                    <div className="text-2xl font-black text-gray-100 tabular-nums">
                        ${current.price.toFixed(2)}<span className="text-[10px] font-bold text-gray-500 ml-1">/L</span>
                    </div>
                </div>

                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${current.trend === 'down' ? 'bg-emerald-500/10 text-emerald-400' :
                        current.trend === 'up' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-gray-500/10 text-gray-400'
                    }`}>
                    {current.trend === 'down' ? '▼' : current.trend === 'up' ? '▲' : '▬'}
                    {current.change !== 0 ? Math.abs(current.change).toFixed(2) : 'STABLE'}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.04]">
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Predicted for Tomorrow</div>
                <div className="text-[11px] font-medium text-amber-400/80 mt-0.5 italic">
                    Expect slight {current.trend} in GTA area.
                </div>
            </div>
        </div>
    );
}
