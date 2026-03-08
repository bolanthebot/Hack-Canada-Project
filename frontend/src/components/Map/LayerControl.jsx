const layers = [
  { id: 'intersections', label: 'Safety Zones', dot: '#f43f5e' },
  { id: 'greenp', label: 'Green P Parking', dot: '#22C55E' },
<<<<<<< HEAD
  { id: 'street_parking', label: 'Street Parking', dot: '#3b82f6' },
  { id: 'bike', label: 'Bike Corridors', dot: '#10b981' },
  { id: 'heatmap', label: 'Risk Heatmap', dot: '#f59e0b' },
=======
  { id: 'bike', label: 'Bike routes', dot: '#34d399' },
  { id: 'heatmap', label: 'Risk heatmap', dot: '#fb923c' },
>>>>>>> parent of ea097f8 (add back street-level parking)
];

export default function LayerControl({ activeLayers, onToggle }) {
  return (
    <div className="glass-panel rounded-2xl p-2.5 shadow-xl min-w-[180px] animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="px-3 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Display Layers
      </div>
      <div className="space-y-0.5">
        {layers.map((layer) => {
          const active = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all ${active
                ? 'text-gray-800 bg-gray-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-125"
                  style={{
                    backgroundColor: layer.dot,
                    opacity: active ? 1 : 0.3,
                  }}
                />
                <span className="truncate">{layer.label}</span>
              </div>

              <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${active
                ? 'border-blue-600 bg-blue-600 shadow-lg shadow-blue-500/20'
                : 'border-gray-200'
                }`}>
                {active && (
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
