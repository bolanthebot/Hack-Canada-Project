const layers = [
  { id: 'intersections', label: 'Safety Zones', dot: '#f43f5e' },
  { id: 'parking', label: 'Smart Parking', dot: '#3b82f6' },
  { id: 'bike', label: 'Bike Corridors', dot: '#10b981' },
  { id: 'heatmap', label: 'Risk Heatmap', dot: '#f59e0b' },
];

export default function LayerControl({ activeLayers, onToggle }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] glass-panel rounded-2xl p-2.5 shadow-2xl min-w-[160px] animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="px-2 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">
        Map Layers
      </div>
      <div className="space-y-0.5">
        {layers.map((layer) => {
          const active = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${active
                  ? 'text-gray-100 bg-white/[0.04]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-125 shadow-sm"
                  style={{
                    backgroundColor: layer.dot,
                    opacity: active ? 1 : 0.3,
                    boxShadow: active ? `0 0 8px ${layer.dot}40` : 'none'
                  }}
                />
                <span className="truncate">{layer.label}</span>
              </div>

              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${active
                  ? 'border-teal-500 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                  : 'border-white/10'
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
